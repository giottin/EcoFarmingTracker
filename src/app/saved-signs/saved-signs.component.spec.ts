import {DomSanitizer} from '@angular/platform-browser';
import {TestBed} from '@angular/core/testing';
import {SavedSignsComponent} from './saved-signs.component';
import {SavedSignsService} from '../service/saved-signs.service';

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
});
