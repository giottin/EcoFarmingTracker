import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SavedSignsService} from '../service/saved-signs.service';
import type {EcoIconCatalogEntry} from './eco-icon-catalog';

type Alignment = '' | 'left' | 'center' | 'right';

@Component({
  selector: 'app-sign-generator',
  imports: [FormsModule],
  templateUrl: './sign-generator.component.html',
  styleUrl: './sign-generator.component.scss'
})
export class SignGeneratorComponent implements OnInit {
  @ViewChild('editor') private editor?: ElementRef<HTMLTextAreaElement>;
  private readonly storageKey = 'eco-sign-generator-v2';

  text = '';
  color = '#00CACA';
  opacity = 100;
  hue = 180;
  saturation = 100;
  lightness = 40;
  selectedSize = '';
  selectedAlignment: Alignment = '';
  iconName = '';
  iconNoBackground = false;
  iconLibraryOpen = false;
  iconCatalogLoading = false;
  iconSearch = '';
  selectedIconCategory = 'Tout';
  copied = false;
  saved = false;
  saving = false;
  readonly palette = ['#FFFFFF', '#FF5252', '#FF9800', '#FFEB3B', '#4CAF50', '#00BCD4', '#2196F3', '#9C27B0', '#E91E63', '#795548'];
  iconCatalog: readonly EcoIconCatalogEntry[] = [];
  private readonly unavailableImages = new Set<string>();

  constructor(private readonly savedSigns: SavedSignsService) {}

  ngOnInit() { this.restore(); }

  format(open: string, close: string) { this.wrapSelection(open, close); }
  addLineBreak() { this.insertAtCursor('<br>'); }
  addNoWrap() { this.wrapSelection('<nobr>', '</nobr>'); }

  applyColor() {
    const alpha = Math.round(this.opacity * 2.55).toString(16).padStart(2, '0').toUpperCase();
    const code = `${this.color.toUpperCase()}${this.opacity < 100 ? alpha : ''}`;
    this.wrapSelection(`<${code}>`, '</color>');
  }

  applySize() {
    if (this.selectedSize) this.wrapSelection(`<size=${this.selectedSize}>`, '</size>');
  }

  applyAlignment() {
    if (this.selectedAlignment) this.wrapSelection(`<align=${this.selectedAlignment}>`, '</align>');
  }

  insertIcon(iconName = this.iconName) {
    const name = iconName.trim().replace(/[^a-zA-Z0-9_-]/g, '');
    if (!name) return;
    this.insertAtCursor(`<icon name='${name}'${this.iconNoBackground ? ' type="nobg"' : ''}>`);
  }

  async openIconLibrary() {
    this.iconLibraryOpen = true;
    if (this.iconCatalog.length || this.iconCatalogLoading) return;
    this.iconCatalogLoading = true;
    const {ECO_ICON_CATALOG} = await import('./eco-icon-catalog');
    this.iconCatalog = ECO_ICON_CATALOG;
    this.iconCatalogLoading = false;
  }
  closeIconLibrary() { this.iconLibraryOpen = false; }
  selectIconCategory(category: string) { this.selectedIconCategory = category; }
  selectCatalogIcon(icon: EcoIconCatalogEntry) {
    this.iconName = icon.iconName;
    this.insertIcon(icon.iconName);
    this.closeIconLibrary();
  }
  isIconImageUnavailable(icon: EcoIconCatalogEntry): boolean { return this.unavailableImages.has(icon.id); }
  markIconImageUnavailable(icon: EcoIconCatalogEntry) { this.unavailableImages.add(icon.id); }
  iconCommand(icon: EcoIconCatalogEntry): string { return `<icon name='${icon.iconName}'>`; }
  iconImageUrl(icon: EcoIconCatalogEntry): string { return 'https://wiki.play.eco/en/Special:Redirect/file/' + encodeURIComponent(icon.iconName + '_Icon.png'); }
  get iconCategories(): string[] { return ['Tout', ...new Set(this.iconCatalog.map(icon => icon.category))]; }
  get filteredIconCatalog(): EcoIconCatalogEntry[] {
    const query = this.normalize(this.iconSearch);
    return this.iconCatalog.filter(icon => {
      const inCategory = this.selectedIconCategory === 'Tout' || icon.category === this.selectedIconCategory;
      if (!inCategory) return false;
      if (!query) return true;
      return this.normalize([icon.name, icon.nameFr, icon.iconName, icon.category, ...icon.keywords].join(' ')).includes(query);
    });
  }

  @HostListener('document:keydown.escape')
  onEscape() { if (this.iconLibraryOpen) this.closeIconLibrary(); }

  updateFromHsl() {
    this.color = this.hslToHex(this.hue, this.saturation, this.lightness);
    this.save();
  }

  selectColor(color: string) {
    this.color = color.toUpperCase();
    this.updateHslFromHex();
  }

  updateFromHex() {
    const value = this.color.trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(value)) {
      this.color = value;
      this.updateHslFromHex();
    }
  }

  onTextChange() { this.save(); this.copied = false; }

  async copyText() {
    try {
      await navigator.clipboard.writeText(this.text);
      this.copied = true;
      window.setTimeout(() => this.copied = false, 2500);
    } catch { this.copied = false; }
  }

  async saveSign() {
    if (!this.text.trim() || this.saving) return;
    this.saving = true;
    this.saved = await this.savedSigns.add(this.text);
    this.saving = false;
    if (this.saved) window.setTimeout(() => this.saved = false, 2500);
  }

  reset() {
    this.text = '';
    this.selectedSize = '';
    this.selectedAlignment = '';
    this.iconName = '';
    this.iconNoBackground = false;
    this.iconSearch = '';
    this.closeIconLibrary();
    this.save();
    this.focusEditor(0);
  }

  private wrapSelection(open: string, close: string) {
    const field = this.editor?.nativeElement;
    const start = field?.selectionStart ?? this.text.length;
    const end = field?.selectionEnd ?? start;
    const selected = this.text.slice(start, end);
    this.text = `${this.text.slice(0, start)}${open}${selected}${close}${this.text.slice(end)}`;
    this.save();
    this.focusEditor(selected ? start + open.length + selected.length + close.length : start + open.length);
  }

  private insertAtCursor(code: string) {
    const field = this.editor?.nativeElement;
    const start = field?.selectionStart ?? this.text.length;
    const end = field?.selectionEnd ?? start;
    this.text = `${this.text.slice(0, start)}${code}${this.text.slice(end)}`;
    this.save();
    this.focusEditor(start + code.length);
  }

  private focusEditor(position: number) {
    window.setTimeout(() => {
      const field = this.editor?.nativeElement;
      field?.focus();
      field?.setSelectionRange(position, position);
    });
  }

  private updateHslFromHex() {
    const red = parseInt(this.color.slice(1, 3), 16) / 255;
    const green = parseInt(this.color.slice(3, 5), 16) / 255;
    const blue = parseInt(this.color.slice(5, 7), 16) / 255;
    const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
    const delta = max - min;
    let hue = 0;
    if (delta) {
      if (max === red) hue = 60 * (((green - blue) / delta) % 6);
      else if (max === green) hue = 60 * ((blue - red) / delta + 2);
      else hue = 60 * ((red - green) / delta + 4);
    }
    const lightness = (max + min) / 2;
    const saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
    this.hue = Math.round(hue < 0 ? hue + 360 : hue);
    this.saturation = Math.round(saturation * 100);
    this.lightness = Math.round(lightness * 100);
    this.save();
  }

  private hslToHex(hue: number, saturation: number, lightness: number): string {
    const s = saturation / 100, l = lightness / 100;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const x = chroma * (1 - Math.abs((hue / 60) % 2 - 1));
    const m = l - chroma / 2;
    let red = 0, green = 0, blue = 0;
    if (hue < 60) [red, green] = [chroma, x];
    else if (hue < 120) [red, green] = [x, chroma];
    else if (hue < 180) [green, blue] = [chroma, x];
    else if (hue < 240) [green, blue] = [x, chroma];
    else if (hue < 300) [red, blue] = [x, chroma];
    else [red, blue] = [chroma, x];
    return `#${[red, green, blue].map(value => Math.round((value + m) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify({text: this.text, color: this.color, opacity: this.opacity}));
  }

  private restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      if (!saved) return;
      this.text = typeof saved.text === 'string' ? saved.text : '';
      this.color = /^#[0-9A-Fa-f]{6}$/.test(saved.color) ? saved.color.toUpperCase() : this.color;
      this.opacity = Math.min(100, Math.max(0, Number(saved.opacity) || 100));
      this.updateHslFromHex();
    } catch { localStorage.removeItem(this.storageKey); }
  }
}
