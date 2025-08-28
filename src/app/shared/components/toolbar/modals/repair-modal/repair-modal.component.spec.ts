import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RepairModalComponent} from './repair-modal.component';

describe('RepairModalComponent', () => {
  let component: RepairModalComponent;
  let fixture: ComponentFixture<RepairModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RepairModalComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RepairModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
