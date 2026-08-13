import {DomSanitizer} from '@angular/platform-browser';
import {TestBed} from '@angular/core/testing';
import {SavedSignsComponent} from './saved-signs.component';
import {SavedSign, SavedSignsService} from '../service/saved-signs.service';

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
    const sign = {id: 1, content: '<b>Texte original</b><br><#FF0000>Ligne 2</color>', createdAt: new Date()} satisfies SavedSign;
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
    const sign = {id: 7, content: 'À supprimer', createdAt: new Date()} satisfies SavedSign;

    await component.remove(event, sign);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(savedSigns.remove).toHaveBeenCalledOnceWith(sign.id);
  });
});
