import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PAGES, RoutingService} from 'src/app/shared/services/routing.service';
import {SbomService} from 'src/app/shared/services/sbom.service';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css'],
  standalone: false
})
export class DeleteModalComponent {
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

  /**
   * Removes file from uploaded files
   * @param file file to remove
   */
  RemoveFile(file: string) {
    if (this.routing.GetPage() === PAGES.VIEW && this.routing.data === file) {
      this.routing.SetPage(PAGES.NONE);
      this.routing.data = undefined;
    }

    this.sbomService.deleteFile(file);
  }

  DeleteSelected() {
    this.GetSelected().forEach((file) => {
      this.RemoveFile(file);
    });

    this.Close();
  }


  Close() {
    this.close.emit(true);
  }
}
