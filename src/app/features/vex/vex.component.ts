import { Component, ElementRef, ViewChild } from '@angular/core';
import { VexResponse } from 'src/app/shared/models/vex';
import { SVIPService } from 'src/app/shared/services/SVIP.service';
import { DownloadService } from 'src/app/shared/services/download.service';
import { RoutingService } from 'src/app/shared/services/routing.service';
import { SbomService } from 'src/app/shared/services/sbom.service';

@Component({
  selector: 'app-vex',
  templateUrl: './vex.component.html',
  styleUrls: ['./vex.component.css'],
  standalone: false
})
export class VexComponent {
  protected vex: VexResponse | undefined;
  protected loading: boolean = false;
  protected selectedTab: string = 'SETTINGS';
  protected expandedStatements: Set<number> = new Set();
  protected generatedTime: string = '';
  @ViewChild('findingsSection') findingsSection!: ElementRef<HTMLDivElement>;

  constructor(
    private client: SVIPService,
    private routing: RoutingService,
    private sbomService: SbomService,
    private downloadService: DownloadService
    ) {}
  protected vexOptions = {
    databases: ['OSV', 'NVD'],
    formats: ['CycloneDX', 'CSAF'],
    requiresAPIKey: ['NVD'],
    selectedDatabase: '',
    selectedFormat: '',
    apiKey: '',
  }

  protected vexObjectList = ['status', 'products', 'vulnerability', 'vexstatements'];

  protected castAsAny(value: unknown): any {
    return value as any;
  }

  protected formatValue(input: any): string {
    if (Array.isArray(input)) {
      const formattedString = input.map(obj =>
        Object.entries(obj)
          .map(([key, value]) => (value ? `${key}: ${value}` : ''))
          .filter(str => str !== '')
          .join('<br>')
      ).join('<br>');
      return formattedString;
    } else if (typeof input === 'object' && input !== null) {
      const formattedString = Object.entries(input)
        .map(([key, value]) => (value ? `${key}: ${value}` : ''))
        .filter(str => str !== '')
        .join('<br>');
      return formattedString;
    } else {
      return input.toString();
    }
  }

  protected removeStatements(value: any) {
    const copy = { ...value };
    delete copy.vexstatements;
    return [copy];
  }

  GenerateData() {

    this.vex = undefined;
    this.loading = true;
    this.selectedTab = 'REPORT';
    this.expandedStatements.clear();

    if(this.vexOptions.selectedDatabase === '' || this.vexOptions.selectedFormat === '')
      return;

    if(this.vexOptions.requiresAPIKey.includes(this.vexOptions.selectedDatabase) && this.vexOptions.apiKey === '')
      return;

    this.client.getVex(this.routing.data.id, this.vexOptions.selectedFormat, this.vexOptions.selectedDatabase).subscribe((result) => {
      if(result) {
        this.vex = result;
        this.generatedTime = new Date().toLocaleString();
        console.log('VEX Data:', result);
        console.log('VEX Statements:', result.vex?.vexstatements);
        console.log('Is Array?', Array.isArray(result.vex?.vexstatements));
        console.log('Statements Count:', this.getStatementsCount());
      }

      this.loading = false;
      // After rendering, scroll to findings
      setTimeout(() => this.scrollToFindings(), 50);
    })
  }


  downloadVex() {
    const fileName = 'vex.json';
    const vexData = this.vex;
    const vexJson = JSON.stringify(vexData, null, 2);
    this.downloadService.Download(fileName, new Blob([vexJson], { type: 'application/json' }));
  }

  getCurrentTime(): string {
    return this.generatedTime;
  }

  getStatementsCount(): number {
    if (!this.vex?.vex?.vexstatements) return 0;
    if (Array.isArray(this.vex.vex.vexstatements)) {
      return this.vex.vex.vexstatements.length;
    }
    return Object.keys(this.vex.vex.vexstatements).length;
  }

  getStatusBadgeClass(status: any): string {
    if (!status) return 'badge-info';
    
    // Handle if status is an object with vulnStatus property
    let statusStr = '';
    if (typeof status === 'object' && status.vulnStatus) {
      statusStr = status.vulnStatus;
    } else if (typeof status === 'string') {
      statusStr = status;
    } else {
      return 'badge-info';
    }
    
    const statusLower = statusStr.toLowerCase();
    if (statusLower.includes('affected') || statusLower.includes('vulnerable')) {
      return 'badge-critical';
    }
    if (statusLower.includes('fixed') || statusLower.includes('not_affected')) {
      return 'badge-success';
    }
    if (statusLower.includes('under_investigation')) {
      return 'badge-warning';
    }
    return 'badge-info';
  }

  getStatusText(status: any): string {
    if (!status) return 'Unknown';
    if (typeof status === 'object' && status.vulnStatus) {
      return status.vulnStatus;
    }
    return String(status);
  }

  asString(value: any): string {
    return String(value);
  }

  toggleStatement(index: number): void {
    if (this.expandedStatements.has(index)) {
      this.expandedStatements.delete(index);
    } else {
      this.expandedStatements.add(index);
      console.log('Expanded statement', index, ':', this.vex?.vex?.vexstatements);
    }
  }

  isStatementExpanded(index: number): boolean {
    return this.expandedStatements.has(index);
  }

  scrollToFindings(): void {
    // Smooth scroll to the findings/table section
    try {
      this.findingsSection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch {}
  }

  getSeverity(item: any): string {
    // Try to extract severity from vulnerability data
    const vuln = item.vulnerability;
    if (vuln?.severity) return vuln.severity;
    if (vuln?.cvssScore) {
      const score = parseFloat(vuln.cvssScore);
      if (score >= 9.0) return 'Critical';
      if (score >= 7.0) return 'High';
      if (score >= 4.0) return 'Medium';
      return 'Low';
    }
    // Default to Critical for affected vulnerabilities
    return 'Critical';
  }

  getSeverityBadgeClass(item: any): string {
    const severity = this.getSeverity(item).toLowerCase();
    if (severity.includes('critical')) return 'badge-critical';
    if (severity.includes('high')) return 'badge-high';
    if (severity.includes('medium')) return 'badge-medium';
    if (severity.includes('low')) return 'badge-low';
    return 'badge-critical';
  }

  formatProductName(product: any): string {
    if (!product) return 'Unknown';
    if (typeof product === 'string') return product;
    if (typeof product === 'object') {
      // Parse CycloneDX product object structure
      const parts = [];
      
      if (product.productID) {
        parts.push(product.productID);
      }
      
      if (product.supplier) {
        parts.push(`(${product.supplier})`);
      }
      
      // If we have parts, join them
      if (parts.length > 0) {
        return parts.join(' ');
      }
      
      // Try other common properties
      if (product.name && product.version) {
        return `${product.name} v${product.version}`;
      }
      if (product.name) return product.name;
      if (product.id) return product.id;
      
      // Last resort: show key properties
      const keys = Object.keys(product);
      if (keys.length > 0) {
        return keys.map(k => `${k}: ${product[k]}`).join(', ');
      }
      
      return 'Unknown Product';
    }
    return String(product);
  }
}
