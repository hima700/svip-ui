import {ComponentFixture, TestBed} from '@angular/core/testing';
import {EventTypes} from '../../models/event-types';
import {ToasterComponent} from './toaster.component';

describe('ToasterComponent', () => {
  let component: ToasterComponent;
  let fixture: ComponentFixture<ToasterComponent>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ToasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should remove toasts on dispose', () => {

    component.currentToasts = [
      {
        type: EventTypes.Info,
        title: 'info',
        message: 'info',
      },
    ];

    component.dispose(0);

    expect(component.currentToasts).toEqual([]);
  });
});
