import {Component, EventEmitter, Input, Output} from '@angular/core';
import filter from '../../metrics/models/filters';
import palettes, {PALETTE} from '../../metrics/models/palette';


@Component({
  selector: 'app-diff-filters',
  templateUrl: './diff-filters.component.html',
  styleUrls: ['./diff-filters.component.css'],
  standalone: false
})
export class DiffFiltersComponent {
  palettes = palettes;
  @Input() attributes!: filter;
  @Output() attributesChange = new EventEmitter<filter>();
  accessibilityModal = false;
  selectedPalette!: PALETTE;
  @Input() palette!: PALETTE;
  @Output() paletteChange = new EventEmitter<PALETTE>();

  @Input() resultStatus!: filter;
  @Output() resultStatusChange = new EventEmitter<filter>();


  constructor() {
  }

  ngOnInit() {
    this.selectedPalette = this.palette;
  }

  selectPalette(palette: string) {
    const _palette = palette as unknown as PALETTE;
    this.selectedPalette = _palette;
  }

  setPalette() {
    this.palette = this.selectedPalette;
    this.paletteChange.emit(this.palette);
  }
}
