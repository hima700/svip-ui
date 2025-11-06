import {Component, Input, Output, EventEmitter} from '@angular/core';
import {RoutingService} from '../../services/routing.service';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
  standalone: false
})
export class ViewerComponent {
  @Input() title: string = '';
  @Input() subTitle: string = '';
  @Input() options: string[] = [];
  
  private _selectedOption: string = '';
  @Input() 
  get selectedOption(): string {
    return this._selectedOption;
  }
  set selectedOption(value: string) {
    this._selectedOption = value;
    this.selectedOptionChange.emit(value);
  }
  
  @Output() selectedOptionChange = new EventEmitter<string>();

  constructor(private routingService: RoutingService) {
  }

  close() {
    return this.routingService.SetPage(0);
  }
}
