import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DiffFiltersComponent} from './diff-filters.component';

describe('DiffFiltersComponent', () => {
  let component: DiffFiltersComponent;
  let fixture: ComponentFixture<DiffFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DiffFiltersComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DiffFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
