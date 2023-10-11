import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SearchService } from 'src/app/services/data/search.service';
import { PageDetails } from '../pages/pageDetails';

@Component({
  selector: 'sk-search-results',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent {
	filteredSearchResults$ = this.ss.filteredSearchResults$; //this represents the unpaginated results
	searchResults$ = this.ss.searchResults$;

	onChangePage(pageDetails: PageDetails) {
		this.ss.SetPagination(pageDetails);
		//console.log("onChangePage", pageDetails);
	}
	
	constructor(private ss: SearchService){}
}
