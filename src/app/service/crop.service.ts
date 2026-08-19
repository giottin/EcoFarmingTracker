import {effect, Injectable} from '@angular/core';
import {Crop} from '../model/crop';
import {SettingsService} from './settings.service';
import {Duration} from '../model/duration';
import {ecoItemImageUrl} from '../eco-data/eco-item-image';

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

const ALL_CROPS: Crop[] = [
  new Crop('agave', 'Agave', false, baseDuration, 'AgaveItem'),
  new Crop('beans', 'Beans', false, baseDuration, 'BeansItem'),
  new Crop('beets', 'Beets', false, baseDuration, 'BeetItem'),
  new Crop('bolete', 'Bolete Mushrooms', false, baseDuration, 'BoleteMushroomsItem'),
  new Crop('camas', 'Camas Bulbs', false, baseDuration, 'CamasBulbItem'),
  new Crop('cookeina', 'Cookeina Mushrooms', false, baseDuration, 'CookeinaMushroomsItem'),
  new Crop('corn', 'Corn', false, baseDuration, 'CornItem'),
  new Crop('cotton', 'Cotton', true, regrowableDuration, 'CottonItem'),
  new Crop('crimini', 'Crimini Mushrooms', false, baseDuration, 'CriminiMushroomsItem'),
  new Crop('fiddleheads', 'Fiddleheads', false, baseDuration, 'FiddleheadsItem'),
  new Crop('fireweed', 'Fireweed Shoots', false, baseDuration, 'FireweedShootsItem'),
  new Crop('flax', 'Flax', false, baseDuration, 'FlaxItem'),
  new Crop('huckleberries', 'Huckleberries', true, regrowableDuration, 'HuckleberriesItem'),
  new Crop('papayas', 'Papayas', true, regrowableDuration, 'PapayaItem'),
  new Crop('pineapples', 'Pineapples', true, regrowableDuration, 'PineappleItem'),
  new Crop('pears', 'Prickly Pears', true, regrowableDuration, 'PricklyPearFruitItem'),
  new Crop('pumpkins', 'Pumpkins', false, baseDuration, 'PumpkinItem'),
  new Crop('rice', 'Rice', false, baseDuration, 'RiceItem'),
  new Crop('sunflowers', 'Sunflowers', false, baseDuration, 'SunflowerItem'),
  new Crop('taro', 'Taro Roots', false, baseDuration, 'TaroRootItem'),
  new Crop('tomatoes', 'Tomatoes', true, regrowableDuration, 'TomatoItem'),
  new Crop('wheat', 'Wheat', false, baseDuration, 'WheatItem')
]
