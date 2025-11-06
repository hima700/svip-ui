import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import palettes, {PALETTE} from '../models/palette';
import filter from '../models/filters';

@Component({
  selector: 'app-qa-filters',
  templateUrl: './qa-filters.component.html',
  styleUrls: ['./qa-filters.component.css'],
  standalone: false
})
export class QaFiltersComponent implements OnInit {
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
