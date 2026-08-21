import {Component, computed, OnInit, signal} from '@angular/core';
import {NgTemplateOutlet} from '@angular/common';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {SavedSign, SavedSignFolder, SavedSignsService} from '../service/saved-signs.service';

@Component({
  selector: 'app-saved-signs',
  imports: [NgTemplateOutlet],
  templateUrl: './saved-signs.component.html',
  styleUrl: './saved-signs.component.scss'
})
export class SavedSignsComponent implements OnInit {
  readonly copiedId = signal<number | null>(null);
  readonly draggedId = signal<number | null>(null);
  readonly dropTargetFolderId = signal<number | null | undefined>(undefined);
  readonly unfiledSigns = computed(() => this.savedSigns.signs().filter(sign => sign.folderId === null));
  private readonly previewCache = new Map<string, SafeHtml>();
  private suppressCopyUntil = 0;

  constructor(readonly savedSigns: SavedSignsService, private readonly sanitizer: DomSanitizer) {}

  ngOnInit() { void this.savedSigns.load(); }

  signsForFolder(folderId: number): SavedSign[] {
    return this.savedSigns.signs().filter(sign => sign.folderId === folderId);
  }

  preview(content: string): SafeHtml {
    const cached = this.previewCache.get(content);
    if (cached) return cached;
    const rendered = this.sanitizer.bypassSecurityTrustHtml(this.renderPreview(content));
    this.previewCache.set(content, rendered);
    return rendered;
  }

  async copy(sign: SavedSign) {
    if (Date.now() < this.suppressCopyUntil) return;
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

  async newFolder() {
    const name = window.prompt('Nom du nouveau dossier');
    if (name !== null) await this.savedSigns.addFolder(name);
  }

  async renameFolder(event: MouseEvent, folder: SavedSignFolder) {
    event.stopPropagation();
    const name = window.prompt('Nouveau nom du dossier', folder.name);
    if (name !== null) await this.savedSigns.renameFolder(folder.id, name);
  }

  async removeFolder(event: MouseEvent, folder: SavedSignFolder) {
    event.stopPropagation();
    if (!window.confirm(`Supprimer le dossier « ${folder.name} » ? Ses panneaux resteront dans « Sans dossier ».`)) return;
    await this.savedSigns.removeFolder(folder.id);
  }

  async toggleFolder(folder: SavedSignFolder) {
    await this.savedSigns.setFolderCollapsed(folder.id, !folder.collapsed);
  }

  dragStart(event: DragEvent, sign: SavedSign) {
    this.draggedId.set(sign.id);
    this.dropTargetFolderId.set(undefined);
    event.dataTransfer?.setData('text/plain', String(sign.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  dragOver(event: DragEvent, folderId: number | null) {
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTargetFolderId.set(folderId);
  }

  dragLeave(event: DragEvent, folderId: number | null) {
    const current = event.currentTarget as HTMLElement;
    const related = event.relatedTarget;
    if (!related || !current.contains(related as Node)) {
      if (this.dropTargetFolderId() === folderId) this.dropTargetFolderId.set(undefined);
    }
  }

  async drop(event: DragEvent, folderId: number | null) {
    event.preventDefault();
    event.stopPropagation();
    const signId = this.draggedId();
    const sign = signId === null ? undefined : this.savedSigns.signs().find(current => current.id === signId);
    if (sign && sign.folderId !== folderId) await this.savedSigns.moveToFolder(sign.id, folderId);
    this.finishDrag();
  }

  dragEnd() { this.finishDrag(); }

  async moveFromSelect(event: Event, sign: SavedSign) {
    event.stopPropagation();
    const value = (event.target as HTMLSelectElement).value;
    const folderId = value === '' ? null : Number(value);
    if (folderId === null && sign.folderId !== null) await this.savedSigns.moveToFolder(sign.id, null);
    if (Number.isInteger(folderId) && sign.folderId !== folderId) await this.savedSigns.moveToFolder(sign.id, folderId);
  }

  isDropTarget(folderId: number | null): boolean {
    return this.draggedId() !== null && this.dropTargetFolderId() === folderId;
  }

  private finishDrag() {
    this.draggedId.set(null);
    this.dropTargetFolderId.set(undefined);
    // Browsers can emit a click immediately after dragend. Ignore only that
    // short trailing click; a normal click keeps copying the exact command.
    this.suppressCopyUntil = Date.now() + 350;
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
      const fontSize = (0.75 + level * 0.25).toFixed(2);
      return `<span style="font-size:${fontSize}em;line-height:1.18">`;
    }

    const alignment = normalized.match(/^<align\s*=\s*["']?(left|center|right)["']?\s*>$/);
    if (alignment) return `<span style="display:block;text-align:${alignment[1]}">`;

    const shortColor = normalized.match(/^<#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})>$/);
    if (shortColor) return `<span style="color:${this.previewColor(shortColor[1])}">`;

    const namedColor = normalized.match(/^<color\s*=\s*["']?(#[0-9a-f]{3}|#[0-9a-f]{6}|#[0-9a-f]{8}|[a-z]+)["']?\s*>$/);
    if (namedColor) {
      const value = namedColor[1];
      return `<span style="color:${value.startsWith('#') ? this.previewColor(value.slice(1)) : value}">`;
    }

    return `<code style="display:inline-block;margin:.08rem .15rem;padding:.08rem .28rem;border-radius:.25rem;color:#b2dfdb;background:rgba(128,203,196,.12);font-size:.72em">${this.escape(tag)}</code>`;
  }

  private escape(value: string): string {
    return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  private previewColor(hex: string): string {
    if (hex.length !== 8) return `#${hex}`;
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    const alpha = Number.parseInt(hex.slice(6, 8), 16) / 255;

    const previewAlpha = Math.max(0.34, alpha).toFixed(2);
    return `rgba(${red},${green},${blue},${previewAlpha})`;
  }
}
