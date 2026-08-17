import {SignGeneratorComponent} from './sign-generator.component';

describe('SignGeneratorComponent icon library', () => {
  const createComponent = () => new SignGeneratorComponent({add: async () => true} as never);

  it('contains the documented Gathering icon ID', () => {
    const component = createComponent();
    const gathering = component.iconCatalog.find(icon => icon.iconName === 'GatheringSkill');

    expect(gathering).toBeDefined();
    component.selectCatalogIcon(gathering!);
    expect(component.text).toBe("<icon name='GatheringSkill'>");
  });

  it('searches both French and English names without accent sensitivity', () => {
    const component = createComponent();
    component.iconSearch = 'recolte';
    expect(component.filteredIconCatalog.some(icon => icon.iconName === 'GatheringSkill')).toBeTrue();

    component.iconSearch = 'gathering';
    expect(component.filteredIconCatalog.some(icon => icon.iconName === 'GatheringSkill')).toBeTrue();
  });

  it('filters the catalog by category', () => {
    const component = createComponent();
    component.selectIconCategory('Machines');

    expect(component.filteredIconCatalog.length).toBeGreaterThan(1);
    expect(component.filteredIconCatalog.every(icon => icon.category === 'Machines')).toBeTrue();
  });

  it('preserves the no-background option when selecting from the library', () => {
    const component = createComponent();
    component.iconNoBackground = true;
    const arrow = component.iconCatalog.find(icon => icon.iconName === 'ArrowItem');

    component.selectCatalogIcon(arrow!);
    expect(component.text).toBe("<icon name='ArrowItem' type=\"nobg\">");
  });
});
