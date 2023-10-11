import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Tag } from 'src/app/services/data/search-result';
import { SearchService } from 'src/app/services/data/search.service';

@Component({
  selector: 'sk-page-type-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-type-filters.component.html',
  styleUrls: ['./page-type-filters.component.scss']
})
export class PageTypeFiltersComponent {

	categoryFilters$ = this.ss.selectedCategoryFilters$;
	
	
	selectedPageTypeFilter$ = this.ss.selectedPageTypeFilters$;
	pageFiltersWithCounts$ = this.ss.pageFiltersWithCounts$;

	categoryFilteredSearchResults$ = this.ss.categoryFilteredSearchResults$; //After category filters are applied. The X in "showing aa of XX counts"
	filteredSearchResults$ = this.ss.filteredSearchResults$; //this represents the unpaginated results
	searchTerm$ = this.ss.searchTerm$;
	searchResults$ = this.ss.searchResults$;


	toggleMenu(){
		this.ss.OpenMenuToggle();
	}
	
	tagClicked(cat: Tag) {
		this.ss.TagClicked(cat);		
	}

	clearTags() {
		this.ss.SetCategoryFilters([]);
	}

	isTagSelected(cat: Tag): boolean {
		return this.ss.IsTagSelected(cat);
	}

	setPageTypeFilter(filters: string[]) {
		this.ss.SetPageTypeFilter(filters);
	}

	comparePageTypeFilters(selected: string[], compareTo: string[]) {
		return selected && selected.length > 0 && JSON.stringify(selected) === JSON.stringify(compareTo);
	}

	constructor(private ss: SearchService){}
}
