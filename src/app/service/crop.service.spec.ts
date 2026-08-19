import {TestBed} from '@angular/core/testing';

import {CropService} from './crop.service';

describe('CropService', () => {
  let service: CropService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should expose every crop with its French display name without changing its id', () => {
    const expectedNames: Record<string, string> = {
      agave: 'Agave', beans: 'Haricots', beets: 'Betteraves', bolete: 'Cèpes de Bordeaux',
      camas: 'Bulbes de camassia', cookeina: 'Cookeina', corn: 'Maïs', cotton: 'Coton',
      crimini: 'Champignons de Paris', fiddleheads: 'Fougères', fireweed: 'Pousses d’épilobe',
      flax: 'Lin', huckleberries: 'Myrtilles', papayas: 'Papayes', pineapples: 'Ananas',
      pears: 'Figues de Barbarie', pumpkins: 'Citrouilles', rice: 'Riz', sunflowers: 'Tournesols',
      taro: 'Racines de taro', tomatoes: 'Tomates', wheat: 'Blé'
    };

    expect(service.allCrops.length).toBe(Object.keys(expectedNames).length);
    for (const crop of service.allCrops) {
      expect(service.getDisplayName(crop)).withContext(crop.id()).toBe(expectedNames[crop.id()]);
    }
  });

  it('uses the actual harvested-item icons for agave, cotton and flax', () => {
    expect(service.getCropById('agave')?.iconName).toBe('AgaveLeavesItem');
    expect(service.getCropById('cotton')?.iconName).toBe('CottonBollItem');
    expect(service.getCropById('flax')?.iconName).toBe('FlaxStemItem');
  });
});
