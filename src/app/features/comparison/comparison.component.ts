import {Component} from '@angular/core';
import {SbomService} from 'src/app/shared/services/sbom.service';
import filter from '../metrics/models/filters';
import palettes, {PALETTE, resultStatus} from '../metrics/models/palette';
import {DownloadService} from 'src/app/shared/services/download.service';

@Component({
  selector: 'app-comparison',
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.css'],
  standalone: false
})
export class ComparisonComponent {
  attributes: filter = {};
  palettes = palettes;
  mismatchColor = '#FFA600';
  missingColor = 'var(--warn)';

  constructor(public sbomService: SbomService, public downloadService: DownloadService) {
  }

  private _palette = PALETTE.DEFAULT;

  get palette() {
    return this._palette;
  }

  set palette(value: PALETTE) {
    this._palette = value;
    this.setColor();
    if (this._palette !== PALETTE.DEFAULT) {
      this.resultStatus['MISMATCH'].color = 'GRAY';
      this.resultStatus['MISSING'].color = 'BLACK';
    } else {
      this.resultStatus['MISMATCH'].color = this.mismatchColor;
      this.resultStatus['MISSING'].color = this.missingColor;
    }
  }

  _resultStatus: resultStatus = {
    MISMATCH: {shown: true, color: this.mismatchColor},
    MISSING: {shown: true, color: this.missingColor},
  };

  get resultStatus() {
    return this._resultStatus;
  }

  set resultStatus(value: resultStatus) {
    this.resultStatus = this.resultStatus;
  }

  GetComparison() {
    return this.sbomService.comparison;
  }

  getFilterType(string: string): boolean {
    if (string.toLowerCase().includes('mismatch')) {
      return this.resultStatus['MISMATCH'].shown;
    } else if (string.toLowerCase().includes('missing')) {
      return this.resultStatus['MISSING'].shown;
    } else {
      return false;
    }
  }

  setColor() {
    Object.keys(this.attributes).forEach((attr, index) => {
      this.attributes[attr].color = this.palettes[this.palette][index];
    });
  }

  downloadReport() {
    const fileName = 'report.json';
    const reportData = this.GetComparison();
    const reportJson = JSON.stringify(reportData, null, 2);
    this.downloadService.Download(fileName, new Blob([reportJson], {type: 'application/json'}));
  }

  /**
   * Get SBOM filename
   */
  getAlias(sbom: string) {
    return this.sbomService.getSBOMAliasByID(sbom);
  }

  protected castToString(value: unknown): string {
    return value as string;
  }

  protected formatValue(value: any): string {
    const formattedValue = JSON.stringify(value, null, 2);
    const replacedValue = formattedValue.replace(/[[\]{},"]/g, '');

    const capitalizeFirstLetter = (word: string) => {
      return word.replace(/(\w*)'(\w*)/g, (_, beforeApostrophe, afterApostrophe) => {
        return beforeApostrophe.toLowerCase() + "'" + afterApostrophe.toLowerCase();
      });
    };

    const modifiedValue = replacedValue.replace(/_/g, ' ').replace(/\b\w+\b/g, capitalizeFirstLetter);

    return modifiedValue + '\n';
  }

  protected castAsAny(value: unknown): any {
    return value as any;
  }

  protected removeComment(value: any): any {
    const valueWithoutComment = {...value};
    delete valueWithoutComment.message;
    return valueWithoutComment;
  }
}
