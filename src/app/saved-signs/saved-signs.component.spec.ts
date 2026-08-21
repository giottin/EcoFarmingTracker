import {DomSanitizer} from '@angular/platform-browser';
import {TestBed} from '@angular/core/testing';
import {SavedSignsComponent} from './saved-signs.component';
import {SavedSign, SavedSignFolder, SavedSignsService} from '../service/saved-signs.service';
import {signal} from '@angular/core';

describe('SavedSignsComponent', () => {
  it('renders multiline ECO styles and keeps unsupported commands visible', () => {
    TestBed.configureTestingModule({});
    const component = new SavedSignsComponent(
      {} as SavedSignsService,
      TestBed.inject(DomSanitizer)
    );
    const content = '<b><#4CAF50>Coopérative Agricole</color></b><br>'
      + '<size=4><#FF525200>Pollution interdite</color></size> '
      + "<icon name='StoneItem'>";

    const rendered = component['renderPreview'](content);

    expect(rendered).toContain('<strong>');
    expect(rendered).toContain('<br>');
    expect(rendered).toContain('color:#4caf50');
    expect(rendered).toContain('color:rgba(255,82,82,0.34)');
    expect(rendered).toContain('font-size:1.75em');
    expect(rendered).toContain('Pollution interdite');
    expect(rendered).toContain('&lt;icon name=&#039;StoneItem&#039;&gt;');
  });

  it('copies the complete original command rather than the preview markup', async () => {
    TestBed.configureTestingModule({});
    const component = new SavedSignsComponent({} as SavedSignsService, TestBed.inject(DomSanitizer));
    const sign = {id: 1, content: '<b>Texte original</b><br><#FF0000>Ligne 2</color>', createdAt: new Date(), folderId: null} satisfies SavedSign;
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}});

    try {
      await component.copy(sign);
      expect(writeText).toHaveBeenCalledOnceWith(sign.content);
      expect(component.copiedId()).toBe(sign.id);
    } finally {
      if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
      else delete (navigator as {clipboard?: Clipboard}).clipboard;
    }
  });

  it('stops the card click before deleting only the selected sign', async () => {
    TestBed.configureTestingModule({});
    const savedSigns = jasmine.createSpyObj<SavedSignsService>('SavedSignsService', ['remove']);
    savedSigns.remove.and.resolveTo(true);
    const component = new SavedSignsComponent(savedSigns, TestBed.inject(DomSanitizer));
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);
    const sign = {id: 7, content: 'À supprimer', createdAt: new Date(), folderId: null} satisfies SavedSign;

    await component.remove(event, sign);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(savedSigns.remove).toHaveBeenCalledOnceWith(sign.id);
  });

  it('moves a dragged card to a folder without copying its command', async () => {
    TestBed.configureTestingModule({});
    const moveToFolder = jasmine.createSpy('moveToFolder').and.resolveTo(true);
    const sign = {id: 8, content: 'Au bon pain', createdAt: new Date(), folderId: null} satisfies SavedSign;
    const savedSigns = {signs: signal([sign]), folders: signal<SavedSignFolder[]>([]), moveToFolder} as unknown as SavedSignsService;
    const component = new SavedSignsComponent(savedSigns, TestBed.inject(DomSanitizer));
    const dataTransfer = jasmine.createSpyObj<DataTransfer>('DataTransfer', ['setData']);
    const start = {dataTransfer} as unknown as DragEvent;
    const drop = jasmine.createSpyObj<DragEvent>('DragEvent', ['preventDefault', 'stopPropagation']);
    const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    Object.defineProperty(navigator, 'clipboard', {configurable: true, value: {writeText}});

    try {
      component.dragStart(start, sign);
      await component.drop(drop, 3);
      await component.copy(sign);

      expect(moveToFolder).toHaveBeenCalledOnceWith(sign.id, 3);
      expect(dataTransfer.setData).toHaveBeenCalledWith('text/plain', String(sign.id));
      expect(component.isDropTarget(3)).toBeFalse();
      expect(writeText).not.toHaveBeenCalled();
    } finally {
      if (clipboardDescriptor) Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
      else delete (navigator as {clipboard?: Clipboard}).clipboard;
    }
  });

  it('offers the same move action to touch users through the compact selector', async () => {
    TestBed.configureTestingModule({});
    const moveToFolder = jasmine.createSpy('moveToFolder').and.resolveTo(true);
    const sign = {id: 9, content: 'Mairie', createdAt: new Date(), folderId: 1} satisfies SavedSign;
    const savedSigns = {signs: signal([sign]), folders: signal<SavedSignFolder[]>([]), moveToFolder} as unknown as SavedSignsService;
    const component = new SavedSignsComponent(savedSigns, TestBed.inject(DomSanitizer));
    const event = {target: {value: ''}, stopPropagation: jasmine.createSpy('stopPropagation')} as unknown as Event;

    await component.moveFromSelect(event, sign);

    expect(moveToFolder).toHaveBeenCalledOnceWith(sign.id, null);
  });

  it('renames a folder through the folder service without changing its cards', async () => {
    TestBed.configureTestingModule({});
    const renameFolder = jasmine.createSpy('renameFolder').and.resolveTo(true);
    const folder = {id: 4, name: 'Divers', collapsed: false, createdAt: new Date()} satisfies SavedSignFolder;
    const savedSigns = {renameFolder} as unknown as SavedSignsService;
    const component = new SavedSignsComponent(savedSigns, TestBed.inject(DomSanitizer));
    const prompt = spyOn(window, 'prompt').and.returnValue('Mairie');
    const event = jasmine.createSpyObj<MouseEvent>('MouseEvent', ['stopPropagation']);

    await component.renameFolder(event, folder);

    expect(prompt).toHaveBeenCalledWith('Nouveau nom du dossier', 'Divers');
    expect(renameFolder).toHaveBeenCalledOnceWith(folder.id, 'Mairie');
  });
});
