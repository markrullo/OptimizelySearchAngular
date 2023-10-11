import { Component, Input } from "@angular/core";
import { Category } from "./services/data/search-result";

@Component({
	selector: 'category',
	template: `
		<div *ngFor="let cat of category?.categories">
			<ul *ngIf="cat.indent && cat.indent > 1">				
				<li>
					{{cat.name}}
					<category [category]="cat" *ngIf="cat.categories"></category>
				</li>
			</ul>			
			<category [category]="cat" *ngIf="cat.indent && cat.indent === 1"></category>
		</div>
	`
})
export class CategoryComponent {
	@Input() category!: Category | null;
}