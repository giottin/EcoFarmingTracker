import {effect, Injectable} from '@angular/core';
import {Crop} from '../model/crop';
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

const crop = (id: string, name: string, regenerates: boolean, iconName: string, nutrientConsumption: Nutrients) =>
  new Crop(id, name, regenerates, regenerates ? regrowableDuration : baseDuration, iconName, nutrientConsumption);

// Values from ECO's installed AutoGen/Plant ResourceConstraints (MaxResourceContent),
// expressed as the soil-sampler percentage consumed by one plant.
const ALL_CROPS: Crop[] = [
  crop('agave', 'Agave', false, 'AgaveLeavesItem', {nitrogen: 0, phosphorus: .2, potassium: 0}),
  crop('beans', 'Beans', false, 'BeansItem', {nitrogen: .1, phosphorus: .2, potassium: .2}),
  crop('beets', 'Beets', false, 'BeetItem', {nitrogen: .2, phosphorus: .3, potassium: .4}),
  crop('bolete', 'Bolete Mushrooms', false, 'BoleteMushroomsItem', {nitrogen: .1, phosphorus: .2, potassium: .2}),
  crop('camas', 'Camas Bulbs', false, 'CamasBulbItem', {nitrogen: .2, phosphorus: .1, potassium: .4}),
  crop('cookeina', 'Cookeina Mushrooms', false, 'CookeinaMushroomsItem', {nitrogen: .1, phosphorus: .2, potassium: .2}),
  crop('corn', 'Corn', false, 'CornItem', {nitrogen: .4, phosphorus: .4, potassium: .1}),
  crop('cotton', 'Cotton', true, 'CottonBollItem', {nitrogen: .1, phosphorus: .15, potassium: .2}),
  crop('crimini', 'Crimini Mushrooms', false, 'CriminiMushroomsItem', {nitrogen: 0, phosphorus: 0, potassium: .2}),
  crop('fiddleheads', 'Fiddleheads', false, 'FiddleheadsItem', {nitrogen: .1, phosphorus: .02, potassium: .04}),
  crop('fireweed', 'Fireweed Shoots', false, 'FireweedShootsItem', {nitrogen: .2, phosphorus: .3, potassium: .2}),
  crop('flax', 'Flax', false, 'FlaxStemItem', {nitrogen: .1, phosphorus: .08, potassium: .12}),
  crop('huckleberries', 'Huckleberries', true, 'HuckleberriesItem', {nitrogen: .1, phosphorus: .15, potassium: .2}),
  crop('papayas', 'Papayas', true, 'PapayaItem', {nitrogen: .1, phosphorus: .02, potassium: .04}),
  crop('pineapples', 'Pineapples', true, 'PineappleItem', {nitrogen: .1, phosphorus: .02, potassium: .04}),
  crop('pears', 'Prickly Pears', true, 'PricklyPearFruitItem', {nitrogen: .5, phosphorus: .2, potassium: .3}),
  crop('pumpkins', 'Pumpkins', false, 'PumpkinItem', {nitrogen: 0, phosphorus: .2, potassium: 0}),
  crop('rice', 'Rice', false, 'RiceItem', {nitrogen: .1, phosphorus: 0, potassium: 0}),
  crop('sunflowers', 'Sunflowers', false, 'SunflowerItem', {nitrogen: .4, phosphorus: .4, potassium: .1}),
  crop('taro', 'Taro Roots', false, 'TaroRootItem', {nitrogen: .1, phosphorus: .02, potassium: .04}),
  crop('tomatoes', 'Tomatoes', true, 'TomatoItem', {nitrogen: .2, phosphorus: .2, potassium: .2}),
  crop('wheat', 'Wheat', false, 'WheatItem', {nitrogen: .3, phosphorus: .1, potassium: .1})
];
