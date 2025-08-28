import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  standalone: false
})
export class SpinnerComponent {
  @Input() height = '';
  @Input() width = '';
}
