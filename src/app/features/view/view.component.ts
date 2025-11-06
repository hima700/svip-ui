import {Component, Input} from '@angular/core';
import {PAGES, RoutingService} from '../../shared/services/routing.service';
import {SbomService} from '../../shared/services/sbom.service';
import File from 'src/app/shared/models/file';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
  standalone: false
})
export class ViewComponent {
  files: File[] = [];
  pretty: boolean = true;
  data: any;
  raw: string = '';
  @Input() components: any[] | undefined;

  constructor(
    private routing: RoutingService,
    public sbomService: SbomService,
  ) {
    routing.data$.subscribe((data: File) => {
      if (routing.GetPage() !== PAGES.VIEW) return;
      if (!data) return;
      this.data = data;
    });
  }

  /**
   * Get SBOM filename
   */
  getAlias() {
    return this.sbomService.getSBOMAliasByID(this.data.id);
  }

  isObjectType(value: any): boolean {
    return typeof value === 'object' && !Array.isArray(value);
  }

  isStringOrArray(value: any): boolean {
    return (
      typeof value === 'string' ||
      Array.isArray(value) ||
      (typeof value === 'object' && value !== null)
    );
  }

  convertToString(value: any): string {
    if (typeof value === 'string') {
      return value;
    } else if (Array.isArray(value)) {
      return value.join(', ');
    } else {
      return '';
    }
  }

  formatValue(value: any): string {
    const formattedValue = JSON.stringify(value, null, 2);
    return formattedValue.replace(/[[\]{},"]/g, '') + '\n';
  }

  getContents() {
    return this.data.contents;
  }
}
