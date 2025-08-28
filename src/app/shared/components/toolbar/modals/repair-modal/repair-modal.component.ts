import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SVIPService} from 'src/app/shared/services/SVIP.service';
import {PAGES, RoutingService} from 'src/app/shared/services/routing.service';
import {SbomService} from 'src/app/shared/services/sbom.service';

@Component({
  selector: 'app-repair-modal',
  templateUrl: './repair-modal.component.html',
  styleUrls: ['./repair-modal.component.css'],
  standalone: false
})
export class RepairModalComponent {

  @Input() sbomID: number = 0;
  @Input() opened!: boolean;
  @Output() close: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Input() error: any = {};
  selectedFix: any = {};

  constructor(private svipService: SVIPService, private routing: RoutingService, private sbomService: SbomService) {
  }

  Close() {
    this.close.emit(false);
  }

  Repair() {
    let fix: { [id: number]: any[] } = {};

    fix[this.error.id] = this.error.fixes.filter((x: any) => x.newString === this.selectedFix);
    delete fix[this.error.id][0].new;
    delete fix[this.error.id][0].newString;
    this.svipService.repairSBOM(this.sbomID, fix).then((data: any) => {
      this.close.emit(false);

      if (data && !isNaN(data)) {
        this.sbomService.addSBOMbyID(data);
        this.routing.Clear();

        setTimeout(() => {
          this.routing.SetPage(PAGES.METRICS);
          this.routing.data = this.sbomService.GetSBOMInfo(data);
        }, 50)

      }
    })

  }

}
