import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RoutingService} from 'src/app/shared/services/routing.service';
import {SbomService} from 'src/app/shared/services/sbom.service';

@Component({
  selector: 'app-convert-modal',
  templateUrl: './convert-modal.component.html',
  styleUrls: ['./convert-modal.component.css'],
  standalone: false
})
export class ConvertModalComponent {
  public convertOptions: {
    schema: string;
    format: string;
    overwrite: boolean;
  } = {
    schema: '',
    format: '',
    overwrite: true,
  };
  @Input() choices!: { [key: string]: string[] };
  @Input() opened: boolean = false;
  @Output() close = new EventEmitter<Boolean>();

  constructor(private sbomService: SbomService, public routing: RoutingService) {
  }

  GetSelected() {
    const checkboxes = document.querySelectorAll('.sbom-checkbox');
    let selected: string[] = [];

    for (let i = 0; i < checkboxes.length; i++) {
      const checkbox = checkboxes[i] as HTMLInputElement;
      if (checkbox.checked && !checkbox.disabled && checkbox.value != 'null') {
        selected.push(checkbox.value);
      }
    }

    return selected;
  }

  ConvertSelected() {
    if (this.convertOptions.schema === '' || this.convertOptions.format === '')
      return;

    this.GetSelected().forEach((file) => {
      this.sbomService.ConvertSBOM(
        file,
        this.convertOptions.schema,
        this.convertOptions.format,
        this.convertOptions.overwrite
      );
    });

    this.Close();
  }


  Close() {
    this.close.emit(true);
  }

}
