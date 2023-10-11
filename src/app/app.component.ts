import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { SearchService } from './services/data/search.service';
import { AutoCompleteResult, SearchResult, SpellCheckResult, Tag } from './services/data/search-result';
import { EMPTY, Subscription } from 'rxjs';

import { HttpParams } from '@angular/common/http';
import { Location } from '@angular/common';
import { PageDetails } from './components/pages/pageDetails';
import { LoadingIndicatorService } from './services/data/loading-indicator.service';

@Component({
	selector: 'sk-search',
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
	private _subscriptions = new Subscription();

	//log = console.log;

	autoCompleteResult: AutoCompleteResult | null = null;
	spellCheckResult: SpellCheckResult | null = null;

	//TODO: Make this into an observable
	spellCheckSub: Subscription | null = null;

	boxHasFocus = false;
	searchBox: string = "";

	isCatMenuShowing = false;

	searchTerm$ = this.ss.searchTerm$;

	blockDetailsWithFinalCounts$ = this.ss.blockDetailsWithFinalCounts$;

	filteredSearchResults$ = this.ss.filteredSearchResults$; //this represents the unpaginated results
	searchResults$ = this.ss.searchResults$;
	
	error$ = this.ss.error$;

	loading$ = this.load.loading$;

	constructor(private ss: SearchService, private elRef: ElementRef, private loc: Location, private load: LoadingIndicatorService, private cdr: ChangeDetectorRef) {
		// Get caller native element
		let rootElement = elRef.nativeElement;

		// Get element's attribute
		const searchRoot = rootElement.getAttribute('searchRoot');
		ss.updateSearchRoot(searchRoot);

		ss.SetBlockId(+rootElement.getAttribute('blockContentId'));

		//Listen for URL changes and update the results.
		this._subscriptions.add(this.loc.subscribe((value) => {
			console.log("Location changed", value)
			this.onURLChange();
		}));
	}

	ngOnDestroy(): void {
		this._subscriptions.unsubscribe();
	}

	ngOnInit() {
		this.onURLChange();

		//let sub = this.ss.linkTracking$.subscribe();
		//this._subscriptions.add(sub);

		//This is the implementation for AutoComplete
		//let searchBoxElement = document.getElementById('SearchBox') as HTMLInputElement;		
		// if (searchBoxElement != null) {
		// 	this.srSub = fromEvent(searchBoxElement, 'keyup').pipe(
		// 		debounceTime(500),
		// 		map((e: any) => e.target.value),
		// 		//tap(() => this.result = []),
		// 		filter(text => text.length > 2),
		// 		distinctUntilChanged(),
		// 		switchMap(searchTerm => this.ss.GetAutoComplete(searchTerm))
		// 	).subscribe((result: AutoCompleteResult) => {
		// 		//console.log("GetAutoComplete got the list", result);
		// 		this.autoCompleteResult = result;
		// 	});
		// }
	}

	onURLChange(){
		var url = new URL(window.document.location.href);
		const searchFromQueryString = url.searchParams.get("q");

		if (searchFromQueryString) {
			this.searchBox = searchFromQueryString;
			this.onNewSearchTermSubmit(searchFromQueryString);			
		}
	}

	onNewSearchTermSubmitEvent(event: any, searchFor: string) {


		//Perform the search
		this.onNewSearchTermSubmit(searchFor);
		event.preventDefault();
	}

	onNewSearchTermSubmit(searchFor: string) {
		//Clear the filters		
		this.ss.SetCategoryFilters([]);

		this.ss.SearchTermSubmit(searchFor);
		if (this.loc) {
			//Persist the query in the url params without navigating.
			const params = new HttpParams().appendAll({
				q: this.searchBox
			});

			this.loc.go(location.pathname, params.toString());
			//this.loc.replaceState(location.pathname, params.toString());
		}
	}


	setPageTypeFilter(filters: string[]) {
		this.ss.SetPageTypeFilter(filters);
	}

	comparePageTypeFilters(selected: string[], compareTo: string[]) {
		return selected && selected.length > 0 && JSON.stringify(selected) === JSON.stringify(compareTo);
	}
	

	getSpellcheck() {
		if (this.searchBox != null) {
			this.spellCheckSub = this.ss.GetSpellCheck(this.searchBox)
				.subscribe((result: SpellCheckResult) => {
					//console.log("GetCategories got the list", result);
					this.spellCheckResult = result;
				});
		}
	}


	tagClicked(cat: Tag) {

		let selectedCats = this.ss.GetCurrentCategoryFilters();

		if (selectedCats) {
			const foundAtIndex = selectedCats.findIndex(c => c.id == cat.id);
			if (foundAtIndex >= 0) {
				//the array has this item, get rid of it
				selectedCats.splice(foundAtIndex, 1);
			}
			else {
				selectedCats.push(cat);
			}
			this.ss.SetCategoryFilters(selectedCats);
		}
	}

	toggleMenu() {		
		this.ss.OpenMenuToggle();
	}

	clearTags() {
		this.ss.SetCategoryFilters([]);
	}

	isTagSelected(cat: Tag): boolean {
		let selectedCats = this.ss.GetCurrentCategoryFilters();
		if (selectedCats) {
			return selectedCats.filter(sc => sc.id === cat.id).length > 0;
		}
		return false;
	}

	boxFocus(hasFocus: boolean) {
		if (hasFocus) {
			this.boxHasFocus = true;
		}
		else {
			setTimeout(() => {
				this.boxHasFocus = false;
			}, 500);
		}
	}
}

/*

['People','DirBioPage']
['News','ArticlePage']
['Clinics','DirClinicPage']
['Departments','DirDeptPage']
*/