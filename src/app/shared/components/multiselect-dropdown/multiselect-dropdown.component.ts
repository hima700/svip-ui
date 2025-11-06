import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.css'],
  standalone: false
})
export class MultiselectDropdownComponent {
  @Input() title: string = 'Select Options';
  @Input() options: { [name: string]: boolean } = {};
  @Output() checkboxChange: EventEmitter<{ name: string, value: boolean }> = new EventEmitter();

  opened: boolean = false;

  GetOptions() {
    return this.options;
  }

  AddOption(name: string, value: boolean = false) {
    this.options[name] = value;
  }

  RemoveOption(name: string) {
    delete this.options[name];
  }

  SetOpened(value: boolean) {
    this.opened = value;
  }

  onCheckboxChange(event: any, value: string) {
    // Get the checkbox value
    const checkboxValue = event.target.checked;

    this.checkboxChange.emit({name: value, value: checkboxValue});
  }
}
