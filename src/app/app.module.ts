import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
//import { RouterModule } from '@angular/router';
import { CategoryComponent } from './category.component';
import { PagesComponent } from './components/pages/pages.component';
import { LoaderComponent } from './components/loader/loader.component';
import { NetworkInterceptor } from './interceptors/network.interceptor';
import { CategoryFiltersComponent } from './components/category-filters/category-filters.component';
import { PageTypeFiltersComponent } from './components/page-type-filters/page-type-filters.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

@NgModule({
	declarations: [
		AppComponent,
		CategoryComponent,
		PagesComponent,
		LoaderComponent,
  CategoryFiltersComponent,
  PageTypeFiltersComponent,
  SearchResultsComponent
	],
	imports: [
		HttpClientModule,
		BrowserModule,
		FormsModule,
		//RouterModule.forRoot([])
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: NetworkInterceptor,
			multi: true,
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
