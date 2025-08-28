import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-circle-toggle',
  templateUrl: './circle-toggle.component.html',
  styleUrls: ['../components.css'],
  standalone: false
})
export class CircleToggleComponent implements OnInit {
  @Input() color = 'red';
  @Input() toggle = true;

  constructor() {
  }

  ngOnInit() {
  }

  toggleStyle() {
    let style: { [key: string]: any } = {};
    style['background-color'] = this.toggle ? this.color : 'transparent'
    style['border'] = `2px solid ${this.color}`;
    return style;
  }
}
