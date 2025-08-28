/** @Author Justin Jantzi */

import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
  standalone: false
})

export class ModalComponent {
  @Input() opened: boolean = false;
  @Output() close = new EventEmitter<Boolean>();

  /**
   * Closes the modal
   */
  Close() {
    this.close.emit(true);
  }
}
