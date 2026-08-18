export type FertilizerDefinition = {
  key: string;
  label: string;
  nameFr: string;
  nameEn: string;
  iconName: string;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
};

// IDs come from the official ECO ItemData module. Keeping this mapping locally
// makes every fertilizer view use the same stable image and identifier.
export const FERTILIZER_DEFINITIONS: readonly FertilizerDefinition[] = [
  {key: 'berries', label: 'Baies', nameFr: "Engrais à l’extrait de baies", nameEn: 'Berry Extract Fertilizer', iconName: 'BerryExtractFertilizerItem', nitrogen: 4, phosphorus: 12, potassium: 19.2},
  {key: 'hide', label: 'Peau', nameFr: 'Engrais à base de cendres de peaux', nameEn: 'Hide Ash Fertilizer', iconName: 'HideAshFertilizerItem', nitrogen: 20, phosphorus: 2, potassium: 2},
  {key: 'pelt', label: 'Fourrure', nameFr: 'Engrais de fourrure', nameEn: 'Pelt Fertilizer', iconName: 'PeltFertilizerItem', nitrogen: 16, phosphorus: 8, potassium: 8},
  {key: 'phosphate', label: 'Phosphate', nameFr: 'Engrais à base de phosphate', nameEn: 'Phosphate Fertilizer', iconName: 'PhosphateFertilizerItem', nitrogen: 2, phosphorus: 16, potassium: 2},
  {key: 'compost', label: 'Compost', nameFr: 'Engrais de compost', nameEn: 'Compost Fertilizer', iconName: 'CompostFertilizerItem', nitrogen: 8, phosphorus: 4, potassium: 14.8},
  {key: 'blood', label: 'Sang', nameFr: 'Engrais à base de farine de sang', nameEn: 'Blood Meal Fertilizer', iconName: 'BloodMealFertilizerItem', nitrogen: 12, phosphorus: 1.6, potassium: 1.6},
  {key: 'camas', label: 'Camassia', nameFr: 'Engrais à la cendre de camassia', nameEn: 'Camas Ash Fertilizer', iconName: 'CamasAshFertilizerItem', nitrogen: 1.2, phosphorus: 2.8, potassium: 8}
];

export const fertilizerImageUrl = (iconName: string): string =>
  `https://wiki.play.eco/en/Special:Redirect/file/${encodeURIComponent(`${iconName}_Icon.png`)}`;
