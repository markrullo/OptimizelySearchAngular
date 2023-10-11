import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageTypeFiltersComponent } from './page-type-filters.component';

describe('PageTypeFiltersComponent', () => {
  let component: PageTypeFiltersComponent;
  let fixture: ComponentFixture<PageTypeFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageTypeFiltersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageTypeFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
