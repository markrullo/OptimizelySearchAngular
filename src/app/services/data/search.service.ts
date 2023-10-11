import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AutoCompleteResult, BlockDetails, SearchResult, SearchWithTracking, SpellCheckResult, Tag } from './search-result';
import { environment } from '../../../environments/environment'
import { BehaviorSubject, combineLatest, EMPTY, fromEvent, Observable, ReplaySubject, Subject, Subscription, throwError } from 'rxjs';
import { catchError, concatMap, debounceTime, map, shareReplay, tap } from 'rxjs/operators';
import { PageDetails } from 'src/app/components/pages/pageDetails';


@Injectable({
	providedIn: 'root'
})
export class SearchService implements OnDestroy {
	private _subscriptions = new Subscription();

	private apiBase = window.location.origin + environment.apiRoot;
	private findBase = window.location.origin + environment.findRoot;

	//searchResults$ = this.http.get<SearchWithTracking>(this.apiBase + 'GetSearchResults/?searchFor=Clinical');

	//begin product selection
	private searchQuerySubject = new BehaviorSubject<string>("");
	searchQueryAction$ = this.searchQuerySubject.asObservable();


	//Stores the blockId once it's retreived from the top level tag.
	blockIdSubject$ = new ReplaySubject<number>(1);

	//Stream of the currently selected category/tag filters selected
	private selectedCategoryFiltersSubject = new BehaviorSubject<Tag[]>([]);
	selectedCategoryFilters$ = this.selectedCategoryFiltersSubject.asObservable();

	//Stream of the currently selected page type filters
	private selectedPageTypeFiltersSubject = new BehaviorSubject<string[]>([]);
	selectedPageTypeFilters$ = this.selectedPageTypeFiltersSubject.asObservable();

	//Stream of the currently selected pageDetails to facilitate paging
	private paginationSubject = new BehaviorSubject<PageDetails>(new PageDetails());
	pagination$ = this.paginationSubject.asObservable();

	//Stream of the current error
	private errorSubject = new BehaviorSubject<string>("");
	error$ = this.errorSubject.asObservable().pipe(
		shareReplay(1)
	);

	private openMenuSubject = new BehaviorSubject<boolean>(false);
	openMenu$ = this.openMenuSubject.asObservable().pipe(
		//tap(x => console.log(`Open state ${x}`)),
		shareReplay(1)
	);
	
	//Retreives the blockDetails from the API by passing a contentId retreived from the root app tag
	blockDetails$ = this.blockIdSubject$.pipe(
		concatMap(blockId => {
			const params: HttpParams = new HttpParams()
				.append("contentId", blockId);

			var httpUrl = `${this.apiBase}/BlockDetails`;
			//console.log(httpUrl, { params });

			return this.http.get<BlockDetails>(httpUrl, { params });
		}),
		//Doing this because the HTTP get doesn't run the constructor or hydrate any of the methods.
		map(bd => new BlockDetails(bd as BlockDetails)),
		shareReplay(1) //This caches the result and doesn't require re-calling
	);

	private searchTermSubject = new ReplaySubject<string>();
	searchTerm$ = this.searchTermSubject.asObservable();

	//This simply looks for changes in the search term and refreshes the HTTP get.
	searchHttp$ = combineLatest([this.searchTermSubject, this.blockDetails$]).pipe(
		concatMap(([searchTerm, blockDetails]) => {
			if (searchTerm && searchTerm.length >= 2) {
				const params: HttpParams = new HttpParams()
					.append("blockId", blockDetails.blockId)
					.append("searchFor", searchTerm);

				var httpUrl = `${this.apiBase}/GetUnifiedSearch`;
				//console.log(httpUrl, { params });

				this.NewError("");
				return this.http.get<SearchWithTracking>(httpUrl, { params });

			}
			else {
				this.NewError("Please enter a longer search term.");
				return EMPTY;
			}
		}),
		// map(response => {
		// 	if(response instanceof HttpErrorResponse){
		// 		this.NewError("Error connecting to search. Please try again later.");
		// 	}
		// 	console.log("Response", response);
		// 	return response;
		// }),
		catchError(err => {
			this.NewError("Error connecting to search. Please try again later.");
			console.log(err);
			return EMPTY;
		}),
		shareReplay(1) //This caches the result and doesn't require re-calling
	);

	//This is filtered based on the selected categories/tags
	categoryFilteredSearchResults$ = combineLatest([this.searchHttp$, this.selectedCategoryFilters$]).pipe(
		map(([searchResults, categoryFilters]) => {
			let hits = searchResults.hits;
			let selectedCatCount = categoryFilters.length;

			if (categoryFilters.length > 0) {
				//filter the hits for the selected tags
				hits = hits.filter(hit => {
					var foundCount = 0;
					for (let selectedTag of categoryFilters) {
						if (hit.tags.findIndex(t => t.id === selectedTag.id) >= 0) {
							//look at all the tags on this hit and determine if there is a match
							foundCount++;
						}
					}
					return selectedCatCount === foundCount;
				});
			}
			return hits;
		})
	);

	//Filtered Counts calculated after the selected category/tag filters
	pageFiltersWithCounts$ = combineLatest([this.categoryFilteredSearchResults$, this.blockDetails$]).pipe(
		map(([searchResults, blockDetails]) => {
			if (blockDetails.pageTypeFiltersFormatted) {
				blockDetails.pageTypeFiltersFormatted.forEach(filter => {
					filter.hitCount = searchResults.filter(hit => filter.filterValue.includes(hit.hitType)).length;					
				});
				return blockDetails.pageTypeFiltersFormatted;
			}
			return [];
		})
	);

	//A list of search results that is filtered by category selections and page type selections
	filteredSearchResults$ = combineLatest([this.categoryFilteredSearchResults$, this.selectedPageTypeFilters$]).pipe(
		map(([searchResults, pageTypeFilters]) => {
			if (pageTypeFilters && pageTypeFilters.length > 0) {
				//Does the page type match the filters?
				return searchResults.filter(hit => pageTypeFilters.includes(hit.hitType));
			}
			return searchResults;
		})
	);

	//These are the paged results, and the final state of what is to be displayed
	searchResults$ = combineLatest([this.filteredSearchResults$, this.pagination$]).pipe(
		map(([searchResults, pagination]) => {
			if (pagination) {
				//filter the results to be displayed based on the passed in page data.
				return searchResults.slice(pagination.startIndex, pagination.endIndex + 1);
			}
			return searchResults;
		})
	);

	//Updates the block details with the latest counts from the filtered results stream
	blockDetailsWithFinalCounts$ = combineLatest([this.filteredSearchResults$, this.blockDetails$]).pipe(
		map(([searchResults, blockDetails]) => {
			//Loop through the search results, count the tags, update the blockDetails
			blockDetails.groups.forEach(group => {
				group.cats.forEach(cat => {
					const catCount = searchResults.filter(hit => hit.tags.map(tag => tag.id).includes(cat.id))?.length;
					cat.count = catCount ? catCount : 0;
				});
				group.cats = group.cats.sort((a, b) => b.count - a.count);
			});
			return blockDetails;
		})
	);

	OpenMenuToggle() {
		//Toggle the current value
		const currentValue = this.openMenuSubject.value;
		this.openMenuSubject.next(!currentValue);
	}

	SetCategoryFilters(catFilters: Tag[]) {
		this.selectedCategoryFiltersSubject.next(catFilters);
	}

	NewError(errorMessage: string) {
		this.errorSubject.next(errorMessage);
	}

	SetPageTypeFilter(pageTypeFilter: string[]) {
		this.selectedPageTypeFiltersSubject.next(pageTypeFilter);
	}

	SetPagination(pagination: PageDetails) {
		this.paginationSubject.next(pagination);
	}

	GetCurrentCategoryFilters(): Tag[] {
		const filters = this.selectedCategoryFiltersSubject.value;
		return filters ? filters : [];
	}
	SearchTermSubmit(searchFor: string) {
		this.searchTermSubject.next(searchFor);
	}

	TagClicked(cat: Tag) {
		let selectedCats = this.GetCurrentCategoryFilters();

		if (selectedCats) {
			const foundAtIndex = selectedCats.findIndex(c => c.id == cat.id);
			if (foundAtIndex >= 0) {
				//the array has this item, get rid of it
				selectedCats.splice(foundAtIndex, 1);
			}
			else {
				selectedCats.push(cat);
			}
			this.SetCategoryFilters(selectedCats);
		}
	}

	
	IsTagSelected(cat: Tag): boolean {
		let selectedCats = this.GetCurrentCategoryFilters();
		if (selectedCats) {
			return selectedCats.filter(sc => sc.id === cat.id).length > 0;
		}
		return false;
	}

	SetBlockId(blockId: number) {
		this.blockIdSubject$.next(blockId);
	}

	GetAutoComplete(searchTerm: string): Observable<AutoCompleteResult> {
		const params: HttpParams = new HttpParams()
			.append("prefix", searchTerm)
			.append("size", 10);

		var httpUrl = `${this.findBase}/_autocomplete`;
		console.log(httpUrl, { params });
		return this.http.get<AutoCompleteResult>(httpUrl, { params });
	}

	GetSpellCheck(searchTerm: string): Observable<SpellCheckResult> {
		const params: HttpParams = new HttpParams()
			.append("query", searchTerm)
			.append("size", 1);

		var httpUrl = `${this.findBase}/_spellcheck`;
		console.log(httpUrl, { params });
		return this.http.get<SpellCheckResult>(httpUrl, { params });
	}

	queryChanged(searchString: string): void {
		this.searchQuerySubject.next(searchString);
	}

	/*
	Querystring breakdown
	\_t_id – TrackId, returned from client.Statistics().TrackQuery(...).
	\_t_q – The search query string.
	\_t_tags – Tags for categorization of the collected data. Normally contain site and language tags.
	\_t_hit.id – The expected format for a hit id. (hitId argument to StatisticsClient.TrackHit) is the type name used in the index, and the ID of the document in the index separated by a slash. Example: EPiServer_Templates_Alloy_Models_Pages_ProductPage/_cb1b190b-ec66-4426-83fb24546e24136c_en
	*/

	//TODO:This is no longer necessary.  The default solution will handle this after the page is loaded
	trackLinkClick(linkClicked: string) { //query: string, hitId: string, trackId: string,
		//Take the query and pull out the parameters from it.

		//const queryString = new URLSearchParams(linkClicked);
		//const trackId = queryString.get('_t_id');
		// const query = queryString.get('_t_hit.id');
		// const hitId = queryString.get('_t_q');

		// const hitPosition = queryString.get('_t_hit.pos');

		//console.log(`Link Click Tracked ${linkClicked}`);

		if (linkClicked.indexOf("_t_id") >= 0) {
			//Only call tracking if the parameters are in the link.  They'll be missing if the DNT:1 header was sent from the browser.
			const params: HttpParams = new HttpParams()
				.append("linkClicked", linkClicked);
			// .append("hitId", hitId)
			// .append("trackId", trackId)
			// .append("hitPosition", );

			let sub = this.http.get<SearchWithTracking>(this.apiBase + '/Track', { params })
				.subscribe(response => {
					//console.log(`Link Click Response ${linkClicked}`, response);
					window.location.href = linkClicked;
				});

			this._subscriptions.add(sub);
		}
	}

	updateSearchRoot(searchRoot: string) {
		if (searchRoot && searchRoot.length > 0) {
			this.apiBase = searchRoot + environment.apiRoot;
			this.findBase = searchRoot + environment.findRoot;
		}
	}


	private handleError(err: HttpErrorResponse): Observable<never> {
		// in a real world app, we may send the server to some remote logging infrastructure
		// instead of just logging it to the console
		let errorMessage: string;
		if (err.error instanceof ErrorEvent) {
			// A client-side or network error occurred. Handle it accordingly.
			errorMessage = `An error occurred: ${err.error.message}`;
		} else {
			// The backend returned an unsuccessful response code.
			// The response body may contain clues as to what went wrong,
			errorMessage = `Backend returned code ${err.status}: ${err.message}`;
		}
		console.error(err);
		return throwError(() => errorMessage);
	}

	constructor(private http: HttpClient) {
		//console.log(window.location.origin);
	}

	ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
	}
}
