import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

type Alignment = 'left' | 'center' | 'right';

interface SavedSign {
  text: string; color: string; opacity: number; size: number; alignment: Alignment;
  bold: boolean; italic: boolean; underline: boolean; strike: boolean;
  subscript: boolean; superscript: boolean; noWrap: boolean;
  iconName: string; iconNoBackground: boolean;
}

@Component({
  selector: 'app-sign-generator',
  imports: [FormsModule],
  templateUrl: './sign-generator.component.html',
  styleUrl: './sign-generator.component.scss'
})
export class SignGeneratorComponent implements OnInit {
  private readonly storageKey = 'eco-sign-generator';
  text = 'Bienvenue dans notre ville !';
  color = '#80CBC4';
  opacity = 100;
  size = 3;
  alignment: Alignment = 'center';
  bold = false; italic = false; underline = false; strike = false;
  subscript = false; superscript = false; noWrap = false;
  iconName = ''; iconNoBackground = false; copied = false;

  ngOnInit() { this.restore(); }

  get generatedCode(): string {
    let content = this.escapeText(this.text).replace(/\r?\n/g, '<br>');
    const icon = this.safeIconName;
    if (icon) {
      const iconCode = `<icon name='${icon}'${this.iconNoBackground ? ' type="nobg"' : ''}>`;
      content = content ? `${iconCode} ${content}` : iconCode;
    }
    if (this.bold) content = `<b>${content}</b>`;
    if (this.italic) content = `<i>${content}</i>`;
    if (this.underline) content = `<u>${content}</u>`;
    if (this.strike) content = `<s>${content}</s>`;
    if (this.subscript) content = `<sub>${content}</sub>`;
    if (this.superscript) content = `<sup>${content}</sup>`;
    content = `<${this.colorCode}>${content}</color>`;
    content = `<size=${this.size}>${content}</size>`;
    if (this.noWrap) content = `<nobr>${content}</nobr>`;
    return `<align=${this.alignment}>${content}</align>`;
  }

  get previewColor(): string {
    const value = this.normalizedColor.slice(1);
    return `rgba(${parseInt(value.slice(0, 2), 16)}, ${parseInt(value.slice(2, 4), 16)}, ${parseInt(value.slice(4, 6), 16)}, ${this.opacity / 100})`;
  }
  get previewSize(): string { return `${0.8 + this.size * 0.34}rem`; }
  get textDecoration(): string {
    return [this.underline ? 'underline' : '', this.strike ? 'line-through' : ''].filter(Boolean).join(' ') || 'none';
  }
  get safeIconName(): string { return this.iconName.trim().replace(/[^a-zA-Z0-9_-]/g, ''); }

  update() {
    this.color = this.normalizedColor;
    this.opacity = Math.min(100, Math.max(0, Number(this.opacity) || 0));
    this.size = Math.min(7, Math.max(1, Math.round(Number(this.size) || 1)));
    this.save(); this.copied = false;
  }
  setAlignment(alignment: Alignment) { this.alignment = alignment; this.update(); }
  setSubscript() { this.subscript = !this.subscript; if (this.subscript) this.superscript = false; this.update(); }
  setSuperscript() { this.superscript = !this.superscript; if (this.superscript) this.subscript = false; this.update(); }
  addLineBreak() { this.text += this.text ? '\n' : ''; this.update(); }
  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.generatedCode);
      this.copied = true;
      window.setTimeout(() => this.copied = false, 2500);
    } catch { this.copied = false; }
  }
  reset() {
    this.text = ''; this.color = '#80CBC4'; this.opacity = 100; this.size = 3; this.alignment = 'center';
    this.bold = false; this.italic = false; this.underline = false; this.strike = false;
    this.subscript = false; this.superscript = false; this.noWrap = false;
    this.iconName = ''; this.iconNoBackground = false; this.update();
  }

  private get normalizedColor(): string {
    const value = this.color.trim().toUpperCase();
    if (/^#[0-9A-F]{6}$/.test(value)) return value;
    if (/^#[0-9A-F]{3}$/.test(value)) return `#${value.slice(1).split('').map(character => character + character).join('')}`;
    return '#80CBC4';
  }
  private get colorCode(): string {
    const alpha = Math.round(this.opacity * 2.55).toString(16).padStart(2, '0').toUpperCase();
    return `${this.normalizedColor}${this.opacity < 100 ? alpha : ''}`;
  }
  private escapeText(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  private save() {
    const state: SavedSign = {
      text: this.text, color: this.color, opacity: this.opacity, size: this.size, alignment: this.alignment,
      bold: this.bold, italic: this.italic, underline: this.underline, strike: this.strike,
      subscript: this.subscript, superscript: this.superscript, noWrap: this.noWrap,
      iconName: this.iconName, iconNoBackground: this.iconNoBackground
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }
  private restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null') as Partial<SavedSign> | null;
      if (!saved) return;
      this.text = typeof saved.text === 'string' ? saved.text : this.text;
      this.color = typeof saved.color === 'string' ? saved.color : this.color;
      this.opacity = Number(saved.opacity ?? this.opacity); this.size = Number(saved.size ?? this.size);
      this.alignment = ['left', 'center', 'right'].includes(saved.alignment ?? '') ? saved.alignment as Alignment : 'center';
      this.bold = Boolean(saved.bold); this.italic = Boolean(saved.italic); this.underline = Boolean(saved.underline);
      this.strike = Boolean(saved.strike); this.subscript = Boolean(saved.subscript); this.superscript = Boolean(saved.superscript);
      this.noWrap = Boolean(saved.noWrap); this.iconName = typeof saved.iconName === 'string' ? saved.iconName : '';
      this.iconNoBackground = Boolean(saved.iconNoBackground); this.update();
    } catch { localStorage.removeItem(this.storageKey); }
  }
}
