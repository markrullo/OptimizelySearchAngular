import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Tag } from 'src/app/services/data/search-result';
import { SearchService } from 'src/app/services/data/search.service';

@Component({
  selector: 'sk-category-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-filters.component.html',
  styleUrls: ['./category-filters.component.scss']
})
export class CategoryFiltersComponent {


	openMenu$ = this.ss.openMenu$;	
	blockDetails$ = this.ss.blockDetailsWithFinalCounts$;
	searchTerm$ = this.ss.searchTerm$;

	constructor(private ss:SearchService){

	}
	
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
}
