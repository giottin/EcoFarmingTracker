import {Component, OnInit, signal} from '@angular/core';
import {SavedSign, SavedSignsService} from '../service/saved-signs.service';

@Component({
  selector: 'app-saved-signs',
  templateUrl: './saved-signs.component.html',
  styleUrl: './saved-signs.component.scss'
})
export class SavedSignsComponent implements OnInit {
  readonly copiedId = signal<number | null>(null);

  constructor(readonly savedSigns: SavedSignsService) {}

  ngOnInit() { void this.savedSigns.load(); }

  preview(content: string): string {
    return content
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<icon\b[^>]*>/gi, '◈ Icône')
      .replace(/<[^>]+>/g, '')
      .trim() || 'Panneau sans texte visible';
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
}
