export type EcoIconCategory =
  | 'Spécialités'
  | 'Ressources'
  | 'Agriculture'
  | 'Nourriture'
  | 'Matériaux'
  | 'Machines'
  | 'Véhicules'
  | 'Outils';

export interface EcoIconCatalogEntry {
  id: string;
  name: string;
  nameFr: string;
  iconName: string;
  category: EcoIconCategory;
  keywords: readonly string[];
}

type IconSeed = readonly [name: string, nameFr: string, iconName: string, category: EcoIconCategory, ...keywords: string[]];

const entry = ([name, nameFr, iconName, category, ...keywords]: IconSeed): EcoIconCatalogEntry => ({
  id: iconName,
  name,
  nameFr,
  iconName,
  category,
  keywords
});

// This local catalog deliberately contains the display names, translations and exact ECO icon IDs.
// Images use the wiki's stable file redirect; pages are never scraped by the application at runtime.
const ICON_SEEDS: readonly IconSeed[] = [
  ['Gathering', 'Récolte', 'GatheringSkill', 'Spécialités', 'gathering', 'harvest', 'récolte'],
  ['Farming', 'Agriculture', 'FarmingSkill', 'Spécialités', 'farming', 'farmer', 'ferme'],
  ['Fertilizers', 'Engrais', 'FertilizersSkill', 'Spécialités', 'fertilizer', 'fertilisers', 'engrais'],
  ['Logging', 'Bûcheronnage', 'LoggingSkill', 'Spécialités', 'logging', 'wood', 'bois'],
  ['Mining', 'Extraction minière', 'MiningSkill', 'Spécialités', 'mining', 'mine', 'minerai'],
  ['Hunting', 'Chasse', 'HuntingSkill', 'Spécialités', 'hunting', 'chasse'],
  ['Butchery', 'Boucherie', 'ButcherySkill', 'Spécialités', 'butcher', 'boucherie'],
  ['Cooking', 'Cuisine', 'CookingSkill', 'Spécialités', 'cooking', 'chef', 'cuisine'],
  ['Baking', 'Boulangerie', 'BakingSkill', 'Spécialités', 'baking', 'boulangerie'],
  ['Campfire Cooking', 'Cuisine au feu de camp', 'CampfireCookingSkill', 'Spécialités', 'campfire', 'cooking', 'feu'],
  ['Advanced Cooking', 'Cuisine avancée', 'AdvancedCookingSkill', 'Spécialités', 'advanced', 'cooking', 'cuisine'],
  ['Milling', 'Meunerie', 'MillingSkill', 'Spécialités', 'milling', 'moulin'],
  ['Carpentry', 'Menuiserie', 'CarpentrySkill', 'Spécialités', 'carpentry', 'woodworking', 'menuiserie'],
  ['Composites', 'Composites', 'CompositesSkill', 'Spécialités', 'composites'],
  ['Masonry', 'Maçonnerie', 'MasonrySkill', 'Spécialités', 'masonry', 'stone', 'maçonnerie'],
  ['Advanced Masonry', 'Maçonnerie avancée', 'AdvancedMasonrySkill', 'Spécialités', 'advanced', 'masonry'],
  ['Smelting', 'Fonderie', 'SmeltingSkill', 'Spécialités', 'smelting', 'metal', 'fonderie'],
  ['Advanced Smelting', 'Fonderie avancée', 'AdvancedSmeltingSkill', 'Spécialités', 'advanced', 'smelting'],
  ['Mechanics', 'Mécanique', 'MechanicsSkill', 'Spécialités', 'mechanics', 'mécanique'],
  ['Industry', 'Industrie', 'IndustrySkill', 'Spécialités', 'industry', 'industrie'],
  ['Electronics', 'Électronique', 'ElectronicsSkill', 'Spécialités', 'electronics', 'électronique'],
  ['Oil Drilling', 'Forage pétrolier', 'OilDrillingSkill', 'Spécialités', 'oil', 'drilling', 'pétrole'],
  ['Glassworking', 'Verrerie', 'GlassworkingSkill', 'Spécialités', 'glass', 'verre'],
  ['Pottery', 'Poterie', 'PotterySkill', 'Spécialités', 'pottery', 'poterie'],
  ['Tailoring', 'Couture', 'TailoringSkill', 'Spécialités', 'tailor', 'couture'],
  ['Painting', 'Peinture', 'PaintingSkill', 'Spécialités', 'painting', 'peinture'],
  ['Paper Milling', 'Papeterie', 'PaperMillingSkill', 'Spécialités', 'paper', 'papeterie'],
  ['Shipwright', 'Construction navale', 'ShipwrightSkill', 'Spécialités', 'ship', 'bateau', 'naval'],
  ['Stone', 'Pierre', 'StoneItem', 'Ressources', 'stone', 'rock', 'pierre'],
  ['Dirt', 'Terre', 'DirtItem', 'Ressources', 'dirt', 'soil', 'terre', 'sol'],
  ['Sand', 'Sable', 'SandItem', 'Ressources', 'sand', 'sable'],
  ['Clay', 'Argile', 'ClayItem', 'Ressources', 'clay', 'argile'],
  ['Coal', 'Charbon', 'CoalItem', 'Ressources', 'coal', 'charbon'],
  ['Iron Ore', 'Minerai de fer', 'IronOreItem', 'Ressources', 'iron', 'ore', 'fer', 'minerai'],
  ['Copper Ore', 'Minerai de cuivre', 'CopperOreItem', 'Ressources', 'copper', 'ore', 'cuivre', 'minerai'],
  ['Gold Ore', 'Minerai d’or', 'GoldOreItem', 'Ressources', 'gold', 'ore', 'or', 'minerai'],
  ['Limestone', 'Calcaire', 'LimestoneItem', 'Ressources', 'limestone', 'calcaire'],
  ['Granite', 'Granite', 'GraniteItem', 'Ressources', 'granite'],
  ['Basalt', 'Basalte', 'BasaltItem', 'Ressources', 'basalt', 'basalte'],
  ['Shale', 'Schiste', 'ShaleItem', 'Ressources', 'shale', 'schiste'],
  ['Log', 'Bûche', 'LogItem', 'Ressources', 'log', 'wood', 'bûche', 'bois'],
  ['Plant Fibers', 'Fibres végétales', 'PlantFibersItem', 'Ressources', 'fiber', 'fibres', 'plante'],
  ['Fur', 'Fourrure', 'FurItem', 'Ressources', 'fur', 'fourrure'],
  ['Raw Meat', 'Viande crue', 'RawMeatItem', 'Ressources', 'meat', 'viande'],
  ['Wheat', 'Blé', 'WheatItem', 'Agriculture', 'wheat', 'blé', 'crop', 'récolte'],
  ['Corn', 'Maïs', 'CornItem', 'Agriculture', 'corn', 'maïs', 'crop', 'récolte'],
  ['Beans', 'Haricots', 'BeansItem', 'Agriculture', 'beans', 'haricots', 'crop'],
  ['Beet', 'Betterave', 'BeetItem', 'Agriculture', 'beet', 'betterave', 'crop'],
  ['Tomato', 'Tomate', 'TomatoItem', 'Agriculture', 'tomato', 'tomate', 'crop'],
  ['Pumpkin', 'Citrouille', 'PumpkinItem', 'Agriculture', 'pumpkin', 'citrouille', 'crop'],
  ['Rice', 'Riz', 'RiceItem', 'Agriculture', 'rice', 'riz', 'crop'],
  ['Flax', 'Lin', 'FlaxItem', 'Agriculture', 'flax', 'lin', 'crop'],
  ['Cotton', 'Coton', 'CottonItem', 'Agriculture', 'cotton', 'coton', 'crop'],
  ['Sunflower', 'Tournesol', 'SunflowerItem', 'Agriculture', 'sunflower', 'tournesol', 'crop'],
  ['Huckleberries', 'Myrtilles', 'HuckleberriesItem', 'Agriculture', 'huckleberry', 'myrtilles', 'berries'],
  ['Pineapple', 'Ananas', 'PineappleItem', 'Agriculture', 'pineapple', 'ananas'],
  ['Papaya', 'Papaye', 'PapayaItem', 'Agriculture', 'papaya', 'papaye'],
  ['Camas Bulb', 'Bulbe de camassia', 'CamasBulbItem', 'Agriculture', 'camas', 'camassia', 'bulbe'],
  ['Bread', 'Pain', 'BreadItem', 'Nourriture', 'bread', 'pain', 'food'],
  ['Charred Fish', 'Poisson grillé', 'CharredFishItem', 'Nourriture', 'fish', 'poisson', 'food'],
  ['Charred Meat', 'Viande grillée', 'CharredMeatItem', 'Nourriture', 'meat', 'viande', 'food'],
  ['Huckleberry Extract', 'Extrait de myrtille', 'HuckleberryExtractItem', 'Nourriture', 'huckleberry', 'myrtille'],
  ['Fruit Salad', 'Salade de fruits', 'FruitSaladItem', 'Nourriture', 'fruit', 'salad', 'salade'],
  ['Vegetable Medley', 'Méli-mélo de légumes', 'VegetableMedleyItem', 'Nourriture', 'vegetable', 'légume'],
  ['Iron Bar', 'Barre de fer', 'IronBarItem', 'Matériaux', 'iron', 'bar', 'fer', 'barre'],
  ['Copper Bar', 'Barre de cuivre', 'CopperBarItem', 'Matériaux', 'copper', 'bar', 'cuivre', 'barre'],
  ['Steel Bar', 'Barre d’acier', 'SteelBarItem', 'Matériaux', 'steel', 'bar', 'acier', 'barre'],
  ['Glass', 'Verre', 'GlassItem', 'Matériaux', 'glass', 'verre'],
  ['Brick', 'Brique', 'BrickItem', 'Matériaux', 'brick', 'brique'],
  ['Mortared Stone', 'Pierre maçonnée', 'MortaredStoneItem', 'Matériaux', 'stone', 'mortar', 'pierre'],
  ['Lumber', 'Bois d’œuvre', 'LumberItem', 'Matériaux', 'lumber', 'wood', 'bois'],
  ['Hewn Log', 'Bûche équarrie', 'HewnLogItem', 'Matériaux', 'hewn', 'log', 'bûche'],
  ['Paper', 'Papier', 'PaperItem', 'Matériaux', 'paper', 'papier'],
  ['Cloth', 'Tissu', 'ClothItem', 'Matériaux', 'cloth', 'tissu'],
  ['Leather', 'Cuir', 'LeatherItem', 'Matériaux', 'leather', 'cuir'],
  ['Workbench', 'Établi', 'WorkbenchItem', 'Machines', 'workbench', 'établi'],
  ['Research Table', 'Table de recherche', 'ResearchTableItem', 'Machines', 'research', 'recherche', 'table'],
  ['Fletching Table', 'Table d’archerie', 'FletchingTableItem', 'Machines', 'fletching', 'archerie'],
  ['Tailoring Table', 'Table de couture', 'TailoringTableItem', 'Machines', 'tailoring', 'couture'],
  ['Butchery Table', 'Table de boucherie', 'ButcheryTableItem', 'Machines', 'butchery', 'boucherie'],
  ['Sawmill', 'Scierie', 'SawmillItem', 'Machines', 'sawmill', 'scierie'],
  ['Bloomery', 'Bas fourneau', 'BloomeryItem', 'Machines', 'bloomery', 'fourneau'],
  ['Blast Furnace', 'Haut fourneau', 'BlastFurnaceItem', 'Machines', 'blast', 'furnace', 'fourneau'],
  ['Rolling Mill', 'Laminoir', 'RollingMillItem', 'Machines', 'rolling', 'mill', 'laminoir'],
  ['Assembly Line', 'Chaîne d’assemblage', 'AssemblyLineItem', 'Machines', 'assembly', 'assemblage'],
  ['Robotic Assembly Line', 'Chaîne robotisée', 'RoboticAssemblyLineItem', 'Machines', 'robotic', 'assembly', 'robot'],
  ['Oil Refinery', 'Raffinerie', 'OilRefineryItem', 'Machines', 'oil', 'refinery', 'raffinerie'],
  ['Paint Mixer', 'Mélangeur de peinture', 'PaintMixerItem', 'Machines', 'paint', 'mixer', 'peinture'],
  ['Laboratory', 'Laboratoire', 'LaboratoryItem', 'Machines', 'laboratory', 'lab', 'laboratoire'],
  ['Kitchen', 'Cuisine', 'KitchenItem', 'Machines', 'kitchen', 'cuisine'],
  ['Bakery Oven', 'Four de boulangerie', 'BakeryOvenItem', 'Machines', 'bakery', 'oven', 'four'],
  ['Campfire', 'Feu de camp', 'CampfireItem', 'Machines', 'campfire', 'feu'],
  ['Stove', 'Cuisinière', 'StoveItem', 'Machines', 'stove', 'cuisinière'],
  ['Electric Stamping Press', 'Presse électrique', 'ElectricStampingPressItem', 'Machines', 'stamping', 'press', 'presse'],
  ['Wood Cart', 'Chariot en bois', 'WoodCartItem', 'Véhicules', 'wood', 'cart', 'chariot'],
  ['Steam Truck', 'Camion à vapeur', 'SteamTruckItem', 'Véhicules', 'steam', 'truck', 'camion'],
  ['Steam Tractor', 'Tracteur à vapeur', 'SteamTractorItem', 'Véhicules', 'steam', 'tractor', 'tracteur'],
  ['Skid Steer', 'Chargeuse compacte', 'SkidSteerItem', 'Véhicules', 'skid', 'steer', 'chargeuse'],
  ['Excavator', 'Excavatrice', 'ExcavatorItem', 'Véhicules', 'excavator', 'excavatrice'],
  ['Rowboat', 'Barque', 'RowboatItem', 'Véhicules', 'rowboat', 'boat', 'barque'],
  ['Small Wooden Boat', 'Petit bateau en bois', 'SmallWoodenBoatItem', 'Véhicules', 'boat', 'bateau'],
  ['Stone Axe', 'Hache en pierre', 'StoneAxeItem', 'Outils', 'stone', 'axe', 'hache'],
  ['Iron Axe', 'Hache en fer', 'IronAxeItem', 'Outils', 'iron', 'axe', 'hache'],
  ['Steel Axe', 'Hache en acier', 'SteelAxeItem', 'Outils', 'steel', 'axe', 'hache'],
  ['Stone Pickaxe', 'Pioche en pierre', 'StonePickaxeItem', 'Outils', 'stone', 'pickaxe', 'pioche'],
  ['Iron Pickaxe', 'Pioche en fer', 'IronPickaxeItem', 'Outils', 'iron', 'pickaxe', 'pioche'],
  ['Steel Pickaxe', 'Pioche en acier', 'SteelPickaxeItem', 'Outils', 'steel', 'pickaxe', 'pioche'],
  ['Bow', 'Arc', 'BowItem', 'Outils', 'bow', 'arc'],
  ['Arrow', 'Flèche', 'ArrowItem', 'Outils', 'arrow', 'flèche'],
  ['Hammer', 'Marteau', 'HammerItem', 'Outils', 'hammer', 'marteau'],
  ['Scythe', 'Faux', 'ScytheItem', 'Outils', 'scythe', 'faux']
];

export const ECO_ICON_CATALOG = ICON_SEEDS.map(entry);

export const ecoIconImageUrl = (icon: EcoIconCatalogEntry): string =>
  `https://wiki.play.eco/en/Special:Redirect/file/${encodeURIComponent(`${icon.iconName}_Icon.png`)}`;
