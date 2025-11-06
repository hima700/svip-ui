import {Component, OnInit} from '@angular/core';
import {SVIPService} from 'src/app/shared/services/SVIP.service';
import {RoutingService} from 'src/app/shared/services/routing.service';
import {SbomService} from 'src/app/shared/services/sbom.service';
import palettes, {PALETTE, resultStatus} from '../models/palette';
import filter from '../models/filters';
import {DownloadService} from 'src/app/shared/services/download.service';

@Component({
  selector: 'app-metrics',
  templateUrl: './metrics.component.html',
  styleUrls: ['./metrics.component.css'],
  standalone: false
})
export class MetricsComponent implements OnInit {
  qa: any = null;
  components: { [componentName: string]: testResult[] } = {};
  attributes: filter = {};
  name: string = '';
  sbomID: number = 0;
  palettes = palettes;
  selectedError: any = {};
  public repairModal: boolean = false;
  passColor = 'var(--success)';
  failColor = 'var(--warn)';

  constructor(
    private routing: RoutingService,
    private SVIP: SVIPService,
    private sbomService: SbomService,
    private downloadService: DownloadService
  ) {
    routing.data$.subscribe((data) => {
      if (data) {
        const sbom = data;

        this.name = data.fileName;
        this.sbomID = sbom.id;
        SVIP.gradeSBOM(sbom.id).subscribe((qa) => {
          if (qa) {
            this.qa = qa;
            this.getKeys();
          }
        });
      }
    });
  }

  private _palette = PALETTE.DEFAULT;

  get palette() {
    return this._palette;
  }

  set palette(value: PALETTE) {
    this._palette = value;
    this.setColor();
    if (this._palette !== PALETTE.DEFAULT) {
      this.resultStatus['PASS'].color = 'GRAY';
      this.resultStatus['FAIL'].color = 'BLACK';
    } else {
      this.resultStatus['PASS'].color = this.passColor;
      this.resultStatus['FAIL'].color = this.failColor;
    }
  }

  _resultStatus: resultStatus = {
    PASS: {shown: true, color: this.passColor},
    FAIL: {shown: true, color: this.failColor},
  };

  get resultStatus() {
    return this._resultStatus;
  }

  set resultStatus(value: resultStatus) {
    this.resultStatus = this.resultStatus;
  }

  ngOnInit() {
  }

  getKeys() {
    // Components
    Object.keys(this.qa.results).forEach((component) => {
      this.components[component] = [];

      this.qa.results[component].forEach((testResult: any) => {
        this.components[component].push(testResult);
        if (testResult.status !== 'ERROR') {
          const processors = testResult.attributes as string[];
          // Processors/Attributes
          processors.forEach((processor: string) => {
            this.attributes[processor] = {shown: true, color: ''};
          });
        }
      });
    });
    this.setColor();
  }

  getTestResults(component: string): any[] {
    return this.components[component]
      .filter((result) => this.isFiltered(result))
      .sort((a, b) => (a.status > b.status ? 1 : -1));
  }

  isFiltered(testResult: any) {
    return (
      this.resultStatus[testResult.status].shown &&
      testResult.attributes.filter(
        (attr: string) => this.attributes[attr].shown
      ).length
    );
  }

  setColor() {
    Object.keys(this.attributes).forEach((attr, index) => {
      this.attributes[attr].color = this.palettes[this.palette][index];
    });
  }

  /**
   * Get SBOM filename
   */
  getAlias(sbom: string) {
    return this.sbomService.getSBOMAliasByPath(sbom);
  }

  downloadReport() {
    const fileName = 'report.json';
    const reportData = this.qa;
    const reportJson = JSON.stringify(reportData, null, 2);
    this.downloadService.Download(fileName, new Blob([reportJson], {type: 'application/json'}));
  }

  openRepairModal(test: any, id: string) {
    this.selectedError = test;
    this.selectedError.id = id;
    this.repairModal = true;
  }

  selectedTest() {
    return this.selectedError;
  }
}

interface testResult {
  attributes: string[];
  test: string;
  message: string;
  details: string;
  status: string;
  fixes: fix<Object>[];
}

interface fix<T> {
  old: T;
  new: T;
  type: any;
}
