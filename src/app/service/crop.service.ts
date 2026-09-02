import {effect, Injectable} from '@angular/core';
import {Crop, type CropNutrientConstraints} from '../model/crop';
import {SettingsService} from './settings.service';
import {Duration} from '../model/duration';
import {ecoItemImageUrl} from '../eco-data/eco-item-image';
import type {Nutrients} from '../agriculture/soil-nutrients';

@Injectable({
  providedIn: 'root'
})
export class CropService {

  readonly allCrops = ALL_CROPS;

  constructor(private settingsService: SettingsService) {
    effect(() => {
      const growthTimeModifier = this.settingsService.growthTimeModifier();
      this.allCrops.forEach(crop => {
        let duration: Duration;
        crop.regenerates() ? duration = regrowableDuration : duration = baseDuration;
        crop.growthTime.set(Duration.multiplyDuration(duration, 1 / growthTimeModifier));
      });
    });
  }

  getRandomCrop(): Crop {
    return this.allCrops[Math.floor(Math.random() * this.allCrops.length)];
  }

  getCropById(id: string): Crop | undefined {
    return this.allCrops.find(crop => crop.id() === id);
  }

  getDisplayName(crop: Crop): string {
    return CROP_NAMES_FR[crop.id()] ?? crop.name();
  }

  getIconUrl(crop: Crop): string {
    return ecoItemImageUrl(crop.iconName);
  }
}

const CROP_NAMES_FR: Readonly<Record<string, string>> = {
  agave: 'Agave',
  beans: 'Haricots',
  beets: 'Betteraves',
  bolete: 'Cèpes de Bordeaux',
  camas: 'Bulbes de camassia',
  cookeina: 'Cookeina',
  corn: 'Maïs',
  cotton: 'Coton',
  crimini: 'Champignons de Paris',
  fiddleheads: 'Fougères',
  fireweed: 'Pousses d’épilobe',
  flax: 'Lin',
  huckleberries: 'Myrtilles',
  papayas: 'Papayes',
  pineapples: 'Ananas',
  pears: 'Figues de Barbarie',
  pumpkins: 'Citrouilles',
  rice: 'Riz',
  sunflowers: 'Tournesols',
  taro: 'Racines de taro',
  tomatoes: 'Tomates',
  wheat: 'Blé'
};

//Duration for all crops that don't automatically regrow
const baseDuration = new Duration(19, 12);

//Duration for crops that regrow (Cotton, Huckleberries, etc.)
const regrowableDuration = new Duration(28, 48);

const constraints = (halfSpeedConcentration: Nutrients, maxResourceContent: Nutrients): CropNutrientConstraints => ({
  halfSpeedConcentration,
  maxResourceContent
});

const crop = (id: string, name: string, regenerates: boolean, iconName: string, nutrientConstraints: CropNutrientConstraints) =>
  new Crop(id, name, regenerates, regenerates ? regrowableDuration : baseDuration, iconName, nutrientConstraints);

// Values from ECO's installed AutoGen/Plant ResourceConstraints.
// Each pair is HalfSpeedConcentration then MaxResourceContent: they must not be
// treated as interchangeable values or as a confirmed per-plant withdrawal.
export const ALL_CROPS: Crop[] = [
  crop('agave', 'Agave', false, 'AgaveLeavesItem', constraints({nitrogen: 0, phosphorus: .1, potassium: 0}, {nitrogen: 0, phosphorus: .2, potassium: 0})),
  crop('beans', 'Beans', false, 'BeansItem', constraints({nitrogen: .2, phosphorus: .2, potassium: .2}, {nitrogen: .1, phosphorus: .2, potassium: .2})),
  crop('beets', 'Beets', false, 'BeetItem', constraints({nitrogen: .2, phosphorus: .2, potassium: .3}, {nitrogen: .2, phosphorus: .3, potassium: .4})),
  crop('bolete', 'Bolete Mushrooms', false, 'BoleteMushroomsItem', constraints({nitrogen: .2, phosphorus: .2, potassium: .2}, {nitrogen: .1, phosphorus: .2, potassium: .2})),
  crop('camas', 'Camas Bulbs', false, 'CamasBulbItem', constraints({nitrogen: .2, phosphorus: .1, potassium: .4}, {nitrogen: .2, phosphorus: .1, potassium: .4})),
  crop('cookeina', 'Cookeina Mushrooms', false, 'CookeinaMushroomsItem', constraints({nitrogen: .2, phosphorus: .2, potassium: .2}, {nitrogen: .1, phosphorus: .2, potassium: .2})),
  crop('corn', 'Corn', false, 'CornItem', constraints({nitrogen: .4, phosphorus: .4, potassium: .1}, {nitrogen: .4, phosphorus: .4, potassium: .1})),
  crop('cotton', 'Cotton', true, 'CottonBollItem', constraints({nitrogen: .1, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .15, potassium: .2})),
  crop('crimini', 'Crimini Mushrooms', false, 'CriminiMushroomsItem', constraints({nitrogen: 0, phosphorus: 0, potassium: .1}, {nitrogen: 0, phosphorus: 0, potassium: .2})),
  crop('fiddleheads', 'Fiddleheads', false, 'FiddleheadsItem', constraints({nitrogen: .2, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .02, potassium: .04})),
  crop('fireweed', 'Fireweed Shoots', false, 'FireweedShootsItem', constraints({nitrogen: .1, phosphorus: .15, potassium: .1}, {nitrogen: .2, phosphorus: .3, potassium: .2})),
  crop('flax', 'Flax', false, 'FlaxStemItem', constraints({nitrogen: .2, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .08, potassium: .12})),
  crop('huckleberries', 'Huckleberries', true, 'HuckleberriesItem', constraints({nitrogen: .1, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .15, potassium: .2})),
  crop('papayas', 'Papayas', true, 'PapayaItem', constraints({nitrogen: .2, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .02, potassium: .04})),
  crop('pineapples', 'Pineapples', true, 'PineappleItem', constraints({nitrogen: .2, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .02, potassium: .04})),
  crop('pears', 'Prickly Pears', true, 'PricklyPearFruitItem', constraints({nitrogen: .3, phosphorus: .1, potassium: .2}, {nitrogen: .5, phosphorus: .2, potassium: .3})),
  crop('pumpkins', 'Pumpkins', false, 'PumpkinItem', constraints({nitrogen: 0, phosphorus: .1, potassium: 0}, {nitrogen: 0, phosphorus: .2, potassium: 0})),
  crop('rice', 'Rice', false, 'RiceItem', constraints({nitrogen: .1, phosphorus: 0, potassium: 0}, {nitrogen: .1, phosphorus: 0, potassium: 0})),
  crop('sunflowers', 'Sunflowers', false, 'SunflowerItem', constraints({nitrogen: .4, phosphorus: .4, potassium: .1}, {nitrogen: .4, phosphorus: .4, potassium: .1})),
  crop('taro', 'Taro Roots', false, 'TaroRootItem', constraints({nitrogen: .2, phosphorus: .1, potassium: .2}, {nitrogen: .1, phosphorus: .02, potassium: .04})),
  crop('tomatoes', 'Tomatoes', true, 'TomatoItem', constraints({nitrogen: .1, phosphorus: .1, potassium: .1}, {nitrogen: .2, phosphorus: .2, potassium: .2})),
  crop('wheat', 'Wheat', false, 'WheatItem', constraints({nitrogen: .3, phosphorus: .2, potassium: .1}, {nitrogen: .3, phosphorus: .1, potassium: .1}))
];
