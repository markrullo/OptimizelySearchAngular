export class PageDetails {
	totalItems: number = 300;
	currentPage: number = 0;
	pageSize: number = 10;
	totalPages: number = 30;
	startPage: number = 0;
	endPage: number = 30;
	startIndex: number = 0;
	endIndex: number = 10;
	currentScrollPosition: number = 0;
	pages: number[] = [];
}