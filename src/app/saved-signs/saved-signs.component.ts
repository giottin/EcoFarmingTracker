import {Component, OnInit, signal} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {SavedSign, SavedSignsService} from '../service/saved-signs.service';

@Component({
  selector: 'app-saved-signs',
  templateUrl: './saved-signs.component.html',
  styleUrl: './saved-signs.component.scss'
})
export class SavedSignsComponent implements OnInit {
  readonly copiedId = signal<number | null>(null);
  private readonly previewCache = new Map<string, SafeHtml>();

  constructor(readonly savedSigns: SavedSignsService, private readonly sanitizer: DomSanitizer) {}

  ngOnInit() { void this.savedSigns.load(); }

  preview(content: string): SafeHtml {
    const cached = this.previewCache.get(content);
    if (cached) return cached;
    const rendered = this.sanitizer.bypassSecurityTrustHtml(this.renderPreview(content));
    this.previewCache.set(content, rendered);
    return rendered;
  }

  async copy(sign: SavedSign) {
    try {
      await navigator.clipboard.writeText(sign.content);
      this.copiedId.set(sign.id);
      window.setTimeout(() => this.copiedId.set(null), 1800);
    } catch { this.copiedId.set(null); }
  }

  async remove(event: MouseEvent, sign: SavedSign) {
    event.stopPropagation();
    await this.savedSigns.remove(sign.id);
  }

  private renderPreview(content: string): string {
    const tagPattern = /<[^>]*>/g;
    let html = '';
    let cursor = 0;
    for (const match of content.matchAll(tagPattern)) {
      const index = match.index ?? cursor;
      html += this.escape(content.slice(cursor, index));
      html += this.renderTag(match[0]);
      cursor = index + match[0].length;
    }
    html += this.escape(content.slice(cursor));
    return html.trim() || '<span style="opacity:.6">Panneau sans texte visible</span>';
  }

  private renderTag(tag: string): string {
    const normalized = tag.toLowerCase().replace(/\s+/g, ' ').trim();
    const simpleTags: Record<string, string> = {
      '<b>': '<strong>', '</b>': '</strong>',
      '<i>': '<em>', '</i>': '</em>',
      '<u>': '<u>', '</u>': '</u>',
      '<s>': '<s>', '</s>': '</s>',
      '<sub>': '<sub>', '</sub>': '</sub>',
      '<sup>': '<sup>', '</sup>': '</sup>',
      '<nobr>': '<span style="white-space:nowrap">', '</nobr>': '</span>',
      '</size>': '</span>', '</align>': '</span>', '</color>': '</span>'
    };
    if (simpleTags[normalized]) return simpleTags[normalized];
    if (/^<br\s*\/?>$/i.test(tag)) return '<br>';

    const size = normalized.match(/^<size\s*=\s*["']?(\d+)["']?\s*>$/);
    if (size) {
      const level = Math.min(10, Math.max(1, Number(size[1])));
      const fontSize = (0.78 + level * 0.18).toFixed(2);
      return `<span style="font-size:${fontSize}em;line-height:1.25">`;
    }

    const alignment = normalized.match(/^<align\s*=\s*["']?(left|center|right)["']?\s*>$/);
    if (alignment) return `<span style="display:block;text-align:${alignment[1]}">`;

    const shortColor = normalized.match(/^<#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})>$/);
    if (shortColor) return `<span style="color:#${shortColor[1]}">`;

    const namedColor = normalized.match(/^<color\s*=\s*["']?(#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{8}|[a-z]+)["']?\s*>$/);
    if (namedColor) return `<span style="color:${namedColor[1]}">`;

    return `<code style="display:inline-block;margin:.08rem .15rem;padding:.08rem .28rem;border-radius:.25rem;color:#b2dfdb;background:rgba(128,203,196,.12);font-size:.72em">${this.escape(tag)}</code>`;
  }

  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
}
