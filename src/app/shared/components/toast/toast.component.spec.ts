import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ToastComponent} from './toast.component';
import {EventTypes} from '../../models/event-types';
import {DebugElement} from '@angular/core';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let debugElement: DebugElement;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ToastComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  it('should create an error toast that does not disappear', () => {

    component.type = EventTypes.Error;
    component.title = 'error';
    component.message = 'error';


    fixture.detectChanges();
    spyOn(component.toast, 'dispose');


    expect(component).toBeTruthy();
    expect(component.toast.dispose).not.toHaveBeenCalled();
  });

  it('should emit dispose event on close button click', () => {

    component.type = EventTypes.Info;
    component.title = 'info';
    component.message = 'info';
    spyOn(component.disposeEvent, 'emit');
    const button = debugElement.nativeElement.querySelector('button[class="btn-close"]');


    fixture.detectChanges();
    spyOn(component.toast, 'dispose');
    button.click();
    fixture.detectChanges();

    expect(component.disposeEvent.emit).toHaveBeenCalledTimes(1);
    expect(component.toast.dispose).toHaveBeenCalledTimes(1);
  });
});
