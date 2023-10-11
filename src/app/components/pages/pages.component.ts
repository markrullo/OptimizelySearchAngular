import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { PageDetails } from './pageDetails';

@Component({
	selector: 'sk-pages',
	templateUrl: './pages.component.html',
	styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnChanges {
	@Input() items!: Array<any>;
	@Output() changePage = new EventEmitter<PageDetails>(true);
	@Input() initialPage = 1;
	@Input() pageSize = 10;
	@Input() maxPages = 10;

	pager: any = {};

	ngOnInit() {
		// set page if items array isn't empty
		if (this.items && this.items.length) {
			this.setPage(this.initialPage);
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		// reset page if items array has changed
		if (changes.items.currentValue !== changes.items.previousValue) {
			this.setPage(this.initialPage);
		}

	}

	setPage(page: number, forceScroll: boolean = false) {
		// get new pager object for specified page

		this.pager = this.paginate(this.items.length, page, this.pageSize, this.maxPages);

		// get new page of items from items array
		//var pageOfItems = this.items.slice(this.pager.startIndex, this.pager.endIndex + 1);

		// call change page function in parent component
		this.changePage.emit(this.pager);

		// if (this.elRef?.nativeElement?.scrollTop !== null) {
		// 	console.log(`Scroll position = `, this.elRef.nativeElement.offsetTop - document.body.scrollTop);
		// }

		// get the scrollTop of the #CatFilters element and set the scroll position to that
		const selectedFiltersEl = document.getElementById('SelectedFilters');
		const siteHeaderEl = document.getElementById('site-header');
		if (selectedFiltersEl && forceScroll) {
			let position = selectedFiltersEl.getBoundingClientRect();
			//console.log("Scroll position = ", position, siteHeaderEl);

			let headerOffsetHeight = siteHeaderEl?.offsetHeight || 0;
			window.scrollBy(0, position.top - headerOffsetHeight);
			//selectedFiltersEl.scrollIntoView({ behavior: 'smooth' });
		}


	}

	paginate(
		totalItems: number,
		currentPage: number = 1,
		pageSize: number = 10,
		maxPages: number = 10
	): PageDetails {
		// calculate total pages
		let totalPages = Math.ceil(totalItems / pageSize);

		// ensure current page isn't out of range
		if (currentPage < 1) {
			currentPage = 1;
		} else if (currentPage > totalPages) {
			currentPage = totalPages;
		}

		let startPage: number, endPage: number;
		if (totalPages <= maxPages) {
			// total pages less than max so show all pages
			startPage = 1;
			endPage = totalPages;
		} else {
			// total pages more than max so calculate start and end pages
			let maxPagesBeforeCurrentPage = Math.floor(maxPages / 2);
			let maxPagesAfterCurrentPage = Math.ceil(maxPages / 2) - 1;
			if (currentPage <= maxPagesBeforeCurrentPage) {
				// current page near the start
				startPage = 1;
				endPage = maxPages;
			} else if (currentPage + maxPagesAfterCurrentPage >= totalPages) {
				// current page near the end
				startPage = totalPages - maxPages + 1;
				endPage = totalPages;
			} else {
				// current page somewhere in the middle
				startPage = currentPage - maxPagesBeforeCurrentPage;
				endPage = currentPage + maxPagesAfterCurrentPage;
			}
		}

		// calculate start and end item indexes
		let startIndex = (currentPage - 1) * pageSize;
		let endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

		// create an array of pages to ng-repeat in the pager control
		let pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

		// return object with all pager properties required by the view
		return {
			totalItems: totalItems,
			currentPage: currentPage,
			pageSize: pageSize,
			totalPages: totalPages,
			startPage: startPage,
			endPage: endPage,
			startIndex: startIndex,
			endIndex: endIndex,
			currentScrollPosition: this.elRef.nativeElement.scrollTop,
			pages: pages
		};
	}

	constructor(private elRef: ElementRef) {
		// console.log(this.elRef.nativeElement);

		// if (this.elRef?.nativeElement?.scrollTop !== null) {
		// 	console.log(`Scroll position = ${this.elRef.nativeElement.scrollTop}`);
		// }
	}

}