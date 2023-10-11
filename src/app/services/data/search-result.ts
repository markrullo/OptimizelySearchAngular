export interface SearchWithTracking {
	trackingStats: TrackingStats,
	searchedFor: string,
	categories: CategoryCount[]
	hits: SearchResult[]
}

export interface CategoryCount {
	id: number,
	name: string,
	count: number
}

export interface SearchResult {
	guid: number,
	hitNumber: number,
	isBestBet: boolean,
	hasBestBetStyle: boolean;
	name: string,
	excerpt: string,
	searchText: string,
	teaserTitle: string,
	teaserText: string,
	callToAction: string,
	link: string,
	tags: Tag[],
	hitId: string,
	hitType: string,
	publishDate: Date,
	updateDate: Date
}

export interface TrackingStats {
	track_id: string,
	track_uuid: string,
	trackSessionId: string
}

export interface TrackClickResponse {
	success: string,
	msg: string
}

export interface Tag {
	id: number,
	name: string,
	description: string,
	count: number
}

export interface Category {

	id: number,
	name: string,
	sortOrder: number,
	indent: number,
	available: boolean,
	categories: Category[]
}

export interface AutoCompleteResult {
	hits: AutoCompleteHit[];
	status: string;
}

export interface AutoCompleteHit {
	query: string;
	type: string;
}

export interface SpellCheckResult {
	hits: SpellCheckHit[];
	status: string;
}

export interface SpellCheckHit {
	suggestion: string;
	type: string;
	distance: number;
}

export class BlockDetails {
	blockId: string = "";
	name: string = "";

	groups:BlockDetailGroup[] = [];

	group1Name: string = "";
	group1Cats: Tag[] = [];
	group1Expand = false;

	group2Name: string = "";
	group2Cats: Tag[] = [];
	group2Expand = false;

	group3Name: string = "";
	group3Cats: Tag[] = [];
	group3Expand = false;

	pageTypeFilters: string[] = [];

	pageTypeFiltersFormatted: PageTypeFilter[] = [];

	constructor(bd:BlockDetails){
		this.blockId = bd.blockId;
		this.name = bd.name;

		if(bd.group1Name !== "" && bd.group1Cats.length > 0){
			this.groups.push(new BlockDetailGroup(bd.group1Name, bd.group1Cats));
		}
		
		if(bd.group2Name !== "" && bd.group2Cats.length > 0){
			this.groups.push(new BlockDetailGroup(bd.group2Name, bd.group2Cats));
		}

		if(bd.group3Name !== "" && bd.group3Cats.length > 0){
			this.groups.push(new BlockDetailGroup(bd.group3Name, bd.group3Cats));
		}

		this.pageTypeFilters = bd.pageTypeFilters;
		
		if(this.pageTypeFilters && this.pageTypeFilters.length > 0){
			this.pageTypeFilters.forEach(filterString => {
				let filter = new PageTypeFilter(filterString);
				if(filter.displayName != "" && filter.filterValue.length > 0){
					this.pageTypeFiltersFormatted.push(filter);
					//console.log("pageTypeFiltersFormatted", filter);
				}
			});
		}
		

		this.group1Name = bd.group1Name;
		this.group1Cats = bd.group1Cats;
		this.group2Name = bd.group2Name;
		this.group2Cats = bd.group2Cats;
		this.group3Name = bd.group3Name;
		this.group3Cats = bd.group3Cats;
		
	}
}

export class PageTypeFilter{
	displayName = "";
	filterValue:string[] = [];
	hitCount = 0;

	constructor(rawString:string){
		if(rawString.length > 0){
			try {
				let filterArray = eval(rawString) as string[];
				if(filterArray && filterArray.length > 1){
					this.displayName = filterArray[0];
					this.filterValue = filterArray.splice(1);
				}
			} catch (error) {
				console.log(`Page Type Filter not configured properly '${rawString}'`, error );
			}
		}
	}
}

export class PageTypeFilters {
	people = ["DirBioPage"];
	news = ["ArticlePage"];
	clinics = ["DirClinicPage"];
}

export class BlockDetailGroup{	
	resultsToShow = 5;
	id: string = "";
	name: string = "";
	cats: Tag[] = [];
	expand = false;

	constructor(name:string, cats:Tag[]){
		this.id = Math.floor(Math.random() * 1000000).toString();
		this.name = name;
		this.cats = cats;
		this.expand = false;		
	}

	hasGroup(){
		return this.name !== "" && this.cats.length > 0 && this.cats.filter(cat => cat.count > 0).length > 0;
	}

	howManyResultsToShow(){		
		if(this.expand){
			return 9999;
		}
		return this.resultsToShow;
	}

	nonZeroCategoryCount():number{
		return this.cats.filter(cat => cat.count > 0).length;
	}
}