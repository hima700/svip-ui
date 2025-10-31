/**
 * Vulnerability Dashboard Component
 * @author Ibrahim Matar
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { RoutingService, PAGES } from '../../shared/services/routing.service';

interface VulnerabilityAlert {
  id: number;
  sbomId: number;
  projectName: string;
  sbomName: string;
  severity: string;
  vulnCount: number;
  message: string;
  acknowledged: boolean;
  createdAt: string | null;
}

interface ProjectSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface VulnerabilityHistory {
  id: number;
  projectName: string;
  scanDate: string;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

@Component({
  selector: 'app-vulnerabilities',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './vulnerabilities.component.html',
  styleUrls: ['./vulnerabilities.component.css']
})
export class VulnerabilitiesComponent implements OnInit, OnDestroy {
  
  alerts: VulnerabilityAlert[] = [];
  stats: ProjectSummary = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  projects: string[] = [];
  selectedProject: string = '';
  trendData: VulnerabilityHistory[] = [];
  trendDays: number = 30;
  private allAlerts: VulnerabilityAlert[] = [];
  private refreshSubscription?: Subscription;
  
  private readonly API_BASE = 'http://localhost:8080/svip/vulnerabilities';
  
  constructor(
    private http: HttpClient,
    private routing: RoutingService
  ) {}
  
  ngOnInit(): void {
    this.loadAlerts();
    this.loadProjects();

    this.refreshSubscription = interval(60000)
      .subscribe(() => {
        this.loadAlerts(false);
        // keep project list synchronized with backend
        this.loadProjects();
        if (this.selectedProject) {
          this.loadTrend();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }
  
  loadAlerts(resetSelection: boolean = false): void {
    this.http.get<VulnerabilityAlert[]>(`${this.API_BASE}/alerts/unacknowledged`)
      .subscribe({
        next: (alerts) => {
          console.log('Loaded alerts:', alerts);
          this.allAlerts = alerts;
          if (resetSelection) {
            this.selectedProject = '';
            this.trendData = [];
            this.resetSummary();
          }
          this.updateVisibleAlerts();
        },
        error: (err) => {
          console.error('Failed to load alerts:', err);
          this.alerts = [];
          this.allAlerts = [];
          this.resetSummary();
        }
      });
  }
  
  loadProjects(): void {
    // cache-bust to avoid any stale responses from electron/webview caches
    const ts = Date.now();
    this.http.get<string[]>(`${this.API_BASE}/history/projects?_=${ts}`)
      .subscribe(projects => {
        this.projects = projects;
      });
  }
  
  loadTrend(): void {
    if (!this.selectedProject) {
      this.trendData = [];
      this.resetSummary();
      return;
    }

    this.http.get<VulnerabilityHistory[]>(
      `${this.API_BASE}/history/${this.selectedProject}?days=${this.trendDays}`
    ).subscribe({
      next: (history) => {
        this.trendData = history;
        this.updateSummaryFromHistory(history);
      },
      error: (err) => {
        console.error('Failed to load trend data:', err);
        this.trendData = [];
        this.resetSummary();
      }
    });
  }
  
  onProjectChange(project: string): void {
    this.selectedProject = project;
    if (!this.selectedProject) {
      this.trendData = [];
      this.resetSummary();
    }
    this.updateVisibleAlerts();
    this.loadTrend();
  }
  
  onDaysChange(days: number | string): void {
    this.trendDays = typeof days === 'string' ? parseInt(days, 10) : days;
    this.loadTrend();
  }
  
  acknowledgeAlert(alertId: number): void {
    console.log('Acknowledging alert:', alertId);
    this.http.post(`${this.API_BASE}/alerts/${alertId}/acknowledge?acknowledgedBy=user`, {})
      .subscribe(() => {
        console.log('Alert acknowledged successfully');
        this.loadAlerts();
        if (this.selectedProject) {
          this.loadTrend();
        }
      });
  }
  
  viewAlertDetails(alertData: VulnerabilityAlert): void {
    console.log('Viewing alert details for SBOM ID:', alertData.sbomId);
    // Navigate to vulnerability details page
    this.routing.SetPage(PAGES.VULNERABILITY_DETAILS);
    this.routing.data = { 
      sbomId: alertData.sbomId,
      projectName: alertData.projectName
    };
  }
  
  getSeverityClass(severity: string): string {
    return severity === 'CRITICAL' ? 'severity-critical' : 'severity-high';
  }

  getPrettySbomName(sbomName: string | null | undefined, projectName: string): string {
    if (!sbomName) return '';
    const base = sbomName.replace(/.*[\\\/]/g, '');
    // Hide auto-generated names like 1818859295.CDX14
    if (/^\d+\.(CDX14|SPDX23|JSON|XML|spdx|json|xml)$/i.test(base)) return '';
    return base;
  }

  formatAlertMessage(alert: VulnerabilityAlert): string {
    const count = alert.vulnCount ?? 0;
    const sev = (alert.severity || '').toUpperCase();
    const sevText = sev === 'CRITICAL' ? 'critical' : sev === 'HIGH' ? 'high severity' : sev.toLowerCase();
    const target = alert.projectName || 'this project';
    const plural = count === 1 ? '' : 's';
    return `${count} ${sevText} vulnerability${plural} found in ${target}`;
  }

  private updateVisibleAlerts(): void {
    if (this.selectedProject) {
      this.alerts = this.allAlerts.filter(alert => alert.projectName === this.selectedProject);
      console.log(`Filtered alerts for project "${this.selectedProject}":`, this.alerts);
    } else {
      this.alerts = [];
    }
  }

  clearProjectSelection(): void {
    this.selectedProject = '';
    this.trendData = [];
    this.resetSummary();
    this.updateVisibleAlerts();
  }

  private resetSummary(): void {
    this.stats = { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
  }

  private updateSummaryFromHistory(history: VulnerabilityHistory[]): void {
    if (!history || history.length === 0) {
      this.resetSummary();
      return;
    }

    const latest = history[0];
    this.stats = {
      total: latest.totalVulnerabilities,
      critical: latest.criticalCount,
      high: latest.highCount,
      medium: latest.mediumCount,
      low: latest.lowCount
    };
  }
}

