import {effect, Injectable} from '@angular/core';
import {Crop} from '../model/crop';
import {SettingsService} from './settings.service';
import {Duration} from '../model/duration';

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
  new Crop('agave', 'Agave', false, baseDuration),
  new Crop('beans', 'Beans', false, baseDuration),
  new Crop('beets', 'Beets', false, baseDuration),
  new Crop('bolete', 'Bolete Mushrooms', false, baseDuration),
  new Crop('camas', 'Camas Bulbs', false, baseDuration),
  new Crop('cookeina', 'Cookeina Mushrooms', false, baseDuration),
  new Crop('corn', 'Corn', false, baseDuration),
  new Crop('cotton', 'Cotton', true, regrowableDuration),
  new Crop('crimini', 'Crimini Mushrooms', false, baseDuration),
  new Crop('fiddleheads', 'Fiddleheads', false, baseDuration),
  new Crop('fireweed', 'Fireweed Shoots', false, baseDuration),
  new Crop('flax', 'Flax', false, baseDuration),
  new Crop('huckleberries', 'Huckleberries', true, regrowableDuration),
  new Crop('papayas', 'Papayas', true, regrowableDuration),
  new Crop('pineapples', 'Pineapples', true, regrowableDuration),
  new Crop('pears', 'Prickly Pears', true, regrowableDuration),
  new Crop('pumpkins', 'Pumpkins', false, baseDuration),
  new Crop('rice', 'Rice', false, baseDuration),
  new Crop('sunflowers', 'Sunflowers', false, baseDuration),
  new Crop('taro', 'Taro Roots', false, baseDuration),
  new Crop('tomatoes', 'Tomatoes', true, regrowableDuration),
  new Crop('wheat', 'Wheat', false, baseDuration)
]
