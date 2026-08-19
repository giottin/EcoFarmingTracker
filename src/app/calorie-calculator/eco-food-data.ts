// Compact local food catalogue. Calories come from the official Eco Wiki Module:FoodData export (Eco 0.13.0.2, 25 April 2026).
// Exact French names and icon IDs are retained where the newer official Module:ItemData export provides them.

export interface EcoFood {
  id: string;
  name: string;
  nameFr: string;
  iconName: string;
  calories: number;
}

export const ECO_FOODS: readonly EcoFood[] = 
[
  {
    "id": "AcornPowderItem",
    "name": "Acorn Powder",
    "nameFr": "Poudre de gland",
    "iconName": "AcornPowderItem",
    "calories": 40
  },
  {
    "id": "food:agave-leaves",
    "name": "Agave Leaves",
    "nameFr": "Agave Leaves",
    "iconName": "AgaveLeavesItem",
    "calories": 200
  },
  {
    "id": "AgoutiEnchiladasItem",
    "name": "Agouti Enchiladas",
    "nameFr": "Enchiladas d'agouti",
    "iconName": "AgoutiEnchiladasItem",
    "calories": 800
  },
  {
    "id": "AutumnStewItem",
    "name": "Autumn Stew",
    "nameFr": "Ragoût d'automne",
    "iconName": "AutumnStewItem",
    "calories": 1200
  },
  {
    "id": "BakedAgaveItem",
    "name": "Baked Agave",
    "nameFr": "Agave au four",
    "iconName": "BakedAgaveItem",
    "calories": 700
  },
  {
    "id": "food:baked-beet",
    "name": "Baked Beet",
    "nameFr": "Baked Beet",
    "iconName": "BakedBeetItem",
    "calories": 700
  },
  {
    "id": "food:baked-corn",
    "name": "Baked Corn",
    "nameFr": "Baked Corn",
    "iconName": "BakedCornItem",
    "calories": 700
  },
  {
    "id": "BakedHeartOfPalmItem",
    "name": "Baked Heart Of Palm",
    "nameFr": "Cœur de palmier au four",
    "iconName": "BakedHeartOfPalmItem",
    "calories": 700
  },
  {
    "id": "BakedMeatItem",
    "name": "Baked Meat",
    "nameFr": "Viande au four",
    "iconName": "BakedMeatItem",
    "calories": 700
  },
  {
    "id": "BakedRoastItem",
    "name": "Baked Roast",
    "nameFr": "Rôti au four",
    "iconName": "BakedRoastItem",
    "calories": 1000
  },
  {
    "id": "food:baked-taro",
    "name": "Baked Taro",
    "nameFr": "Baked Taro",
    "iconName": "BakedTaroItem",
    "calories": 700
  },
  {
    "id": "food:baked-tomato",
    "name": "Baked Tomato",
    "nameFr": "Baked Tomato",
    "iconName": "BakedTomatoItem",
    "calories": 700
  },
  {
    "id": "BanhXeoItem",
    "name": "Banh Xeo",
    "nameFr": "Banh Xeo",
    "iconName": "BanhXeoItem",
    "calories": 1550
  },
  {
    "id": "food:bannock",
    "name": "Bannock",
    "nameFr": "Bannock",
    "iconName": "BannockItem",
    "calories": 700
  },
  {
    "id": "food:basic-salad",
    "name": "Basic Salad",
    "nameFr": "Basic Salad",
    "iconName": "BasicSaladItem",
    "calories": 800
  },
  {
    "id": "BeanPasteItem",
    "name": "Bean Paste",
    "nameFr": "Pâte de haricots",
    "iconName": "BeanPasteItem",
    "calories": 40
  },
  {
    "id": "food:bean-sprout",
    "name": "Bean Sprout",
    "nameFr": "Bean Sprout",
    "iconName": "BeanSproutItem",
    "calories": 100
  },
  {
    "id": "food:beans",
    "name": "Beans",
    "nameFr": "Beans",
    "iconName": "BeansItem",
    "calories": 150
  },
  {
    "id": "BearSUPREMEItem",
    "name": "Bear S U P R E M E",
    "nameFr": "Suprême d'ours",
    "iconName": "BearSUPREMEItem",
    "calories": 1250
  },
  {
    "id": "BearclawItem",
    "name": "Bearclaw",
    "nameFr": "Gâteau patte d'ours",
    "iconName": "BearclawItem",
    "calories": 850
  },
  {
    "id": "BeetItem",
    "name": "Beet",
    "nameFr": "Betterave",
    "iconName": "BeetItem",
    "calories": 230
  },
  {
    "id": "BeetCampfireSaladItem",
    "name": "Beet Campfire Salad",
    "nameFr": "Salade de betteraves cuite au feu de camp",
    "iconName": "BeetCampfireSaladItem",
    "calories": 900
  },
  {
    "id": "BeetGreensItem",
    "name": "Beet Greens",
    "nameFr": "Feuilles de betteraves",
    "iconName": "BeetGreensItem",
    "calories": 100
  },
  {
    "id": "BisonChowFunItem",
    "name": "Bison Chow Fun",
    "nameFr": "Chow Fun au bison",
    "iconName": "BisonChowFunItem",
    "calories": 1450
  },
  {
    "id": "food:boiled-grains",
    "name": "Boiled Grains",
    "nameFr": "Boiled Grains",
    "iconName": "BoiledGrainsItem",
    "calories": 350
  },
  {
    "id": "food:boiled-rice",
    "name": "Boiled Rice",
    "nameFr": "Boiled Rice",
    "iconName": "BoiledRiceItem",
    "calories": 210
  },
  {
    "id": "food:boiled-sausage",
    "name": "Boiled Sausage",
    "nameFr": "Boiled Sausage",
    "iconName": "BoiledSausageItem",
    "calories": 600
  },
  {
    "id": "food:bolete-mushrooms",
    "name": "Bolete Mushrooms",
    "nameFr": "Bolete Mushrooms",
    "iconName": "BoleteMushroomsItem",
    "calories": 200
  },
  {
    "id": "BreadItem",
    "name": "Bread",
    "nameFr": "Pain",
    "iconName": "BreadItem",
    "calories": 750
  },
  {
    "id": "food:camas-bread",
    "name": "Camas Bread",
    "nameFr": "Camas Bread",
    "iconName": "CamasBreadItem",
    "calories": 800
  },
  {
    "id": "CamasBulbItem",
    "name": "Camas Bulb",
    "nameFr": "Bulbe de camassia",
    "iconName": "CamasBulbItem",
    "calories": 150
  },
  {
    "id": "CamasBulbBakeItem",
    "name": "Camas Bulb Bake",
    "nameFr": "Bulbe de camassia cuit",
    "iconName": "CamasBulbBakeItem",
    "calories": 700
  },
  {
    "id": "food:camas-paste",
    "name": "Camas Paste",
    "nameFr": "Camas Paste",
    "iconName": "CamasPasteItem",
    "calories": 60
  },
  {
    "id": "food:campfire-roast",
    "name": "Campfire Roast",
    "nameFr": "Campfire Roast",
    "iconName": "CampfireRoastItem",
    "calories": 1000
  },
  {
    "id": "food:campfire-stew",
    "name": "Campfire Stew",
    "nameFr": "Campfire Stew",
    "iconName": "CampfireStewItem",
    "calories": 1200
  },
  {
    "id": "CerealGermItem",
    "name": "Cereal Germ",
    "nameFr": "Germe de céréale",
    "iconName": "CerealGermItem",
    "calories": 20
  },
  {
    "id": "CharredAgaveItem",
    "name": "Charred Agave",
    "nameFr": "Agave carbonisé",
    "iconName": "CharredAgaveItem",
    "calories": 350
  },
  {
    "id": "CharredBeansItem",
    "name": "Charred Beans",
    "nameFr": "Haricots carbonisés",
    "iconName": "CharredBeansItem",
    "calories": 350
  },
  {
    "id": "CharredBeetItem",
    "name": "Charred Beet",
    "nameFr": "Betterave carbonisée",
    "iconName": "CharredBeetItem",
    "calories": 350
  },
  {
    "id": "food:charred-cactus-fruit",
    "name": "Charred Cactus Fruit",
    "nameFr": "Charred Cactus Fruit",
    "iconName": "CharredCactusFruitItem",
    "calories": 200
  },
  {
    "id": "food:charred-camas-bulb",
    "name": "Charred Camas Bulb",
    "nameFr": "Charred Camas Bulb",
    "iconName": "CharredCamasBulbItem",
    "calories": 350
  },
  {
    "id": "CharredCornItem",
    "name": "Charred Corn",
    "nameFr": "Maïs carbonisé",
    "iconName": "CharredCornItem",
    "calories": 350
  },
  {
    "id": "CharredFireweedShootsItem",
    "name": "Charred Fireweed Shoots",
    "nameFr": "Pousses d'épilobe carbonisées",
    "iconName": "CharredFireweedShootsItem",
    "calories": 350
  },
  {
    "id": "CharredFishItem",
    "name": "Charred Fish",
    "nameFr": "Poisson carbonisé",
    "iconName": "CharredFishItem",
    "calories": 400
  },
  {
    "id": "food:charred-heart-of-palm",
    "name": "Charred Heart Of Palm",
    "nameFr": "Charred Heart Of Palm",
    "iconName": "CharredHeartOfPalmItem",
    "calories": 210
  },
  {
    "id": "food:charred-meat",
    "name": "Charred Meat",
    "nameFr": "Charred Meat",
    "iconName": "CharredMeatItem",
    "calories": 400
  },
  {
    "id": "food:charred-mushrooms",
    "name": "Charred Mushrooms",
    "nameFr": "Charred Mushrooms",
    "iconName": "CharredMushroomsItem",
    "calories": 350
  },
  {
    "id": "CharredPapayaItem",
    "name": "Charred Papaya",
    "nameFr": "Papaye carbonisée",
    "iconName": "CharredPapayaItem",
    "calories": 350
  },
  {
    "id": "CharredPineappleItem",
    "name": "Charred Pineapple",
    "nameFr": "Ananas carbonisé",
    "iconName": "CharredPineappleItem",
    "calories": 350
  },
  {
    "id": "CharredSausageItem",
    "name": "Charred Sausage",
    "nameFr": "Saucisse carbonisée",
    "iconName": "CharredSausageItem",
    "calories": 700
  },
  {
    "id": "food:charred-taro",
    "name": "Charred Taro",
    "nameFr": "Charred Taro",
    "iconName": "CharredTaroItem",
    "calories": 350
  },
  {
    "id": "food:charred-tomato",
    "name": "Charred Tomato",
    "nameFr": "Charred Tomato",
    "iconName": "CharredTomatoItem",
    "calories": 350
  },
  {
    "id": "ClamChowderItem",
    "name": "Clam Chowder",
    "nameFr": "Chaudrée de palourdes",
    "iconName": "ClamChowderItem",
    "calories": 800
  },
  {
    "id": "CookeinaMushroomsItem",
    "name": "Cookeina Mushrooms",
    "nameFr": "Cookeinas",
    "iconName": "CookeinaMushroomsItem",
    "calories": 200
  },
  {
    "id": "food:corn",
    "name": "Corn",
    "nameFr": "Corn",
    "iconName": "CornItem",
    "calories": 230
  },
  {
    "id": "food:corn-fritters",
    "name": "Corn Fritters",
    "nameFr": "Corn Fritters",
    "iconName": "CornFrittersItem",
    "calories": 500
  },
  {
    "id": "food:corn-starch",
    "name": "Corn Starch",
    "nameFr": "Corn Starch",
    "iconName": "CornStarchItem",
    "calories": 10
  },
  {
    "id": "CornmealItem",
    "name": "Cornmeal",
    "nameFr": "Farine de maïs",
    "iconName": "CornmealItem",
    "calories": 60
  },
  {
    "id": "food:crimini-mushrooms",
    "name": "Crimini Mushrooms",
    "nameFr": "Crimini Mushrooms",
    "iconName": "CriminiMushroomsItem",
    "calories": 200
  },
  {
    "id": "food:crimson-salad",
    "name": "Crimson Salad",
    "nameFr": "Crimson Salad",
    "iconName": "CrimsonSaladItem",
    "calories": 1200
  },
  {
    "id": "CrispyBaconItem",
    "name": "Crispy Bacon",
    "nameFr": "Bacon croustillant",
    "iconName": "CrispyBaconItem",
    "calories": 800
  },
  {
    "id": "food:dried-fish",
    "name": "Dried Fish",
    "nameFr": "Dried Fish",
    "iconName": "DriedFishItem",
    "calories": 450
  },
  {
    "id": "food:dried-meat",
    "name": "Dried Meat",
    "nameFr": "Dried Meat",
    "iconName": "DriedMeatItem",
    "calories": 550
  },
  {
    "id": "food:ecoylent",
    "name": "Ecoylent",
    "nameFr": "Ecoylent",
    "iconName": "EcoylentItem",
    "calories": 1500
  },
  {
    "id": "ElkTacoItem",
    "name": "Elk Taco",
    "nameFr": "Taco de wapiti",
    "iconName": "ElkTacoItem",
    "calories": 700
  },
  {
    "id": "food:elk-wellington",
    "name": "Elk Wellington",
    "nameFr": "Elk Wellington",
    "iconName": "ElkWellingtonItem",
    "calories": 1450
  },
  {
    "id": "food:fantastic-forest-pizza",
    "name": "Fantastic Forest Pizza",
    "nameFr": "Fantastic Forest Pizza",
    "iconName": "FantasticForestPizzaItem",
    "calories": 1250
  },
  {
    "id": "FernCampfireSaladItem",
    "name": "Fern Campfire Salad",
    "nameFr": "Salade de fougères cuite au feu de camp",
    "iconName": "FernCampfireSaladItem",
    "calories": 900
  },
  {
    "id": "food:fiddleheads",
    "name": "Fiddleheads",
    "nameFr": "Fiddleheads",
    "iconName": "FiddleheadsItem",
    "calories": 150
  },
  {
    "id": "FieldCampfireStewItem",
    "name": "Field Campfire Stew",
    "nameFr": "Ragoût des prairies cuit au feu de camp",
    "iconName": "FieldCampfireStewItem",
    "calories": 1100
  },
  {
    "id": "FireweedShootsItem",
    "name": "Fireweed Shoots",
    "nameFr": "Pousses d'épilobe",
    "iconName": "FireweedShootsItem",
    "calories": 150
  },
  {
    "id": "food:fish-n-chips",
    "name": "Fish N Chips",
    "nameFr": "Fish N Chips",
    "iconName": "FishNChipsItem",
    "calories": 1000
  },
  {
    "id": "FlatbreadItem",
    "name": "Flatbread",
    "nameFr": "Pain plat",
    "iconName": "FlatbreadItem",
    "calories": 500
  },
  {
    "id": "FlaxseedOilItem",
    "name": "Flaxseed Oil",
    "nameFr": "Huile de lin",
    "iconName": "FlaxseedOilItem",
    "calories": 120
  },
  {
    "id": "food:flour",
    "name": "Flour",
    "nameFr": "Flour",
    "iconName": "FlourItem",
    "calories": 50
  },
  {
    "id": "FriedCamasItem",
    "name": "Fried Camas",
    "nameFr": "Camassias frits",
    "iconName": "FriedCamasItem",
    "calories": 750
  },
  {
    "id": "FriedFiddleheadsItem",
    "name": "Fried Fiddleheads",
    "nameFr": "Fougères frits",
    "iconName": "FriedFiddleheadsItem",
    "calories": 750
  },
  {
    "id": "FriedHareHaunchesItem",
    "name": "Fried Hare Haunches",
    "nameFr": "Cuisses de lièvre frites",
    "iconName": "FriedHareHaunchesItem",
    "calories": 750
  },
  {
    "id": "food:fried-hearts-of-palm",
    "name": "Fried Hearts Of Palm",
    "nameFr": "Fried Hearts Of Palm",
    "iconName": "FriedHeartsOfPalmItem",
    "calories": 750
  },
  {
    "id": "food:fried-taro",
    "name": "Fried Taro",
    "nameFr": "Fried Taro",
    "iconName": "FriedTaroItem",
    "calories": 750
  },
  {
    "id": "food:fried-tomatoes",
    "name": "Fried Tomatoes",
    "nameFr": "Fried Tomatoes",
    "iconName": "FriedTomatoesItem",
    "calories": 750
  },
  {
    "id": "food:fried-vegetables",
    "name": "Fried Vegetables",
    "nameFr": "Fried Vegetables",
    "iconName": "FriedVegetablesItem",
    "calories": 560
  },
  {
    "id": "food:fruit-muffin",
    "name": "Fruit Muffin",
    "nameFr": "Fruit Muffin",
    "iconName": "FruitMuffinItem",
    "calories": 800
  },
  {
    "id": "food:fruit-salad",
    "name": "Fruit Salad",
    "nameFr": "Fruit Salad",
    "iconName": "FruitSaladItem",
    "calories": 900
  },
  {
    "id": "food:fruit-tart",
    "name": "Fruit Tart",
    "nameFr": "Fruit Tart",
    "iconName": "FruitTartItem",
    "calories": 800
  },
  {
    "id": "GiantCactusFruitItem",
    "name": "Giant Cactus Fruit",
    "nameFr": "Fruit de saguaro",
    "iconName": "GiantCactusFruitItem",
    "calories": 100
  },
  {
    "id": "HeartOfPalmItem",
    "name": "Heart Of Palm",
    "nameFr": "Cœur de palmier",
    "iconName": "HeartOfPalmItem",
    "calories": 100
  },
  {
    "id": "HeartyHometownPizzaItem",
    "name": "Hearty Hometown Pizza",
    "nameFr": "Pizza copieuse de mon enfance",
    "iconName": "HeartyHometownPizzaItem",
    "calories": 1200
  },
  {
    "id": "HosomakiItem",
    "name": "Hosomaki",
    "nameFr": "Hosomaki",
    "iconName": "HosomakiItem",
    "calories": 700
  },
  {
    "id": "food:huckleberries",
    "name": "Huckleberries",
    "nameFr": "Huckleberries",
    "iconName": "HuckleberriesItem",
    "calories": 150
  },
  {
    "id": "food:huckleberry-extract",
    "name": "Huckleberry Extract",
    "nameFr": "Huckleberry Extract",
    "iconName": "HuckleberryExtractItem",
    "calories": 60
  },
  {
    "id": "food:huckleberry-fritter",
    "name": "Huckleberry Fritter",
    "nameFr": "Huckleberry Fritter",
    "iconName": "HuckleberryFritterItem",
    "calories": 900
  },
  {
    "id": "HuckleberryPieItem",
    "name": "Huckleberry Pie",
    "nameFr": "Tourte aux myrtilles",
    "iconName": "HuckleberryPieItem",
    "calories": 1300
  },
  {
    "id": "food:hydrocolloids",
    "name": "Hydrocolloids",
    "nameFr": "Hydrocolloids",
    "iconName": "HydrocolloidsItem",
    "calories": 10
  },
  {
    "id": "food:infused-oil",
    "name": "Infused Oil",
    "nameFr": "Infused Oil",
    "iconName": "InfusedOilItem",
    "calories": 120
  },
  {
    "id": "food:jungle-campfire-salad",
    "name": "Jungle Campfire Salad",
    "nameFr": "Jungle Campfire Salad",
    "iconName": "JungleCampfireSaladItem",
    "calories": 900
  },
  {
    "id": "JungleCampfireStewItem",
    "name": "Jungle Campfire Stew",
    "nameFr": "Ragoût de la jungle cuit au feu de camp",
    "iconName": "JungleCampfireStewItem",
    "calories": 1100
  },
  {
    "id": "food:kelpy-crab-roll",
    "name": "Kelpy Crab Roll",
    "nameFr": "Kelpy Crab Roll",
    "iconName": "KelpyCrabRollItem",
    "calories": 1350
  },
  {
    "id": "food:leavened-dough",
    "name": "Leavened Dough",
    "nameFr": "Leavened Dough",
    "iconName": "LeavenedDoughItem",
    "calories": 10
  },
  {
    "id": "food:liquid-nitrogen",
    "name": "Liquid Nitrogen",
    "nameFr": "Liquid Nitrogen",
    "iconName": "LiquidNitrogenItem",
    "calories": 10
  },
  {
    "id": "LoadedTaroFriesItem",
    "name": "Loaded Taro Fries",
    "nameFr": "Frites de taro garnies",
    "iconName": "LoadedTaroFriesItem",
    "calories": 1200
  },
  {
    "id": "food:macarons",
    "name": "Macarons",
    "nameFr": "Macarons",
    "iconName": "MacaronsItem",
    "calories": 1000
  },
  {
    "id": "food:maltodextrin",
    "name": "Maltodextrin",
    "nameFr": "Maltodextrin",
    "iconName": "MaltodextrinItem",
    "calories": 10
  },
  {
    "id": "MeatPieItem",
    "name": "Meat Pie",
    "nameFr": "Tourte à la viande",
    "iconName": "MeatPieItem",
    "calories": 1300
  },
  {
    "id": "MeatStockItem",
    "name": "Meat Stock",
    "nameFr": "Bouillon de viandes",
    "iconName": "MeatStockItem",
    "calories": 600
  },
  {
    "id": "MeatyStewItem",
    "name": "Meaty Stew",
    "nameFr": "Ragoût de viande",
    "iconName": "MeatyStewItem",
    "calories": 1100
  },
  {
    "id": "food:milk",
    "name": "Milk",
    "nameFr": "Milk",
    "iconName": "MilkItem",
    "calories": 120
  },
  {
    "id": "food:millionaires-salad",
    "name": "Millionaires Salad",
    "nameFr": "Millionaires Salad",
    "iconName": "MillionairesSaladItem",
    "calories": 1000
  },
  {
    "id": "food:mochi",
    "name": "Mochi",
    "nameFr": "Mochi",
    "iconName": "MochiItem",
    "calories": 750
  },
  {
    "id": "food:oil",
    "name": "Oil",
    "nameFr": "Oil",
    "iconName": "OilItem",
    "calories": 120
  },
  {
    "id": "food:papaya",
    "name": "Papaya",
    "nameFr": "Papaya",
    "iconName": "PapayaItem",
    "calories": 200
  },
  {
    "id": "food:pastry-dough",
    "name": "Pastry Dough",
    "nameFr": "Pastry Dough",
    "iconName": "PastryDoughItem",
    "calories": 10
  },
  {
    "id": "food:phad-thai",
    "name": "Phad Thai",
    "nameFr": "Phad Thai",
    "iconName": "PhadThaiItem",
    "calories": 1200
  },
  {
    "id": "PineappleItem",
    "name": "Pineapple",
    "nameFr": "Ananas",
    "iconName": "PineappleItem",
    "calories": 200
  },
  {
    "id": "PineappleFriendRiceItem",
    "name": "Pineapple Friend Rice",
    "nameFr": "Riz frit à l'ananas",
    "iconName": "PineappleFriendRiceItem",
    "calories": 720
  },
  {
    "id": "PirozhokItem",
    "name": "Pirozhok",
    "nameFr": "Pirozhok",
    "iconName": "PirozhokItem",
    "calories": 850
  },
  {
    "id": "PokeBowlItem",
    "name": "Poke Bowl",
    "nameFr": "Poke Bowl",
    "iconName": "PokeBowlItem",
    "calories": 1100
  },
  {
    "id": "food:prepared-meat",
    "name": "Prepared Meat",
    "nameFr": "Prepared Meat",
    "iconName": "PreparedMeatItem",
    "calories": 600
  },
  {
    "id": "food:prickly-pear-fruit",
    "name": "Prickly Pear Fruit",
    "nameFr": "Prickly Pear Fruit",
    "iconName": "PricklyPearFruitItem",
    "calories": 190
  },
  {
    "id": "PrimeCutItem",
    "name": "Prime Cut",
    "nameFr": "Morceau de choix",
    "iconName": "PrimeCutItem",
    "calories": 600
  },
  {
    "id": "PumpkinItem",
    "name": "Pumpkin",
    "nameFr": "Citrouille",
    "iconName": "PumpkinItem",
    "calories": 340
  },
  {
    "id": "food:pupusas",
    "name": "Pupusas",
    "nameFr": "Pupusas",
    "iconName": "PupusasItem",
    "calories": 900
  },
  {
    "id": "RawBaconItem",
    "name": "Raw Bacon",
    "nameFr": "Bacon cru",
    "iconName": "RawBaconItem",
    "calories": 200
  },
  {
    "id": "food:raw-fish",
    "name": "Raw Fish",
    "nameFr": "Raw Fish",
    "iconName": "RawFishItem",
    "calories": 200
  },
  {
    "id": "food:raw-meat",
    "name": "Raw Meat",
    "nameFr": "Raw Meat",
    "iconName": "RawMeatItem",
    "calories": 250
  },
  {
    "id": "RawRoastItem",
    "name": "Raw Roast",
    "nameFr": "Rôti cru",
    "iconName": "RawRoastItem",
    "calories": 600
  },
  {
    "id": "RawSausageItem",
    "name": "Raw Sausage",
    "nameFr": "Saucisse crue",
    "iconName": "RawSausageItem",
    "calories": 500
  },
  {
    "id": "food:rice",
    "name": "Rice",
    "nameFr": "Rice",
    "iconName": "RiceItem",
    "calories": 150
  },
  {
    "id": "food:rice-flour",
    "name": "Rice Flour",
    "nameFr": "Rice Flour",
    "iconName": "RiceFlourItem",
    "calories": 50
  },
  {
    "id": "food:rice-noodles",
    "name": "Rice Noodles",
    "nameFr": "Rice Noodles",
    "iconName": "RiceNoodlesItem",
    "calories": 200
  },
  {
    "id": "RoastPumpkinItem",
    "name": "Roast Pumpkin",
    "nameFr": "Citrouille cuite",
    "iconName": "RoastPumpkinItem",
    "calories": 1400
  },
  {
    "id": "RootCampfireSaladItem",
    "name": "Root Campfire Salad",
    "nameFr": "Salade de racines cuite au feu de camp",
    "iconName": "RootCampfireSaladItem",
    "calories": 950
  },
  {
    "id": "RootCampfireStewItem",
    "name": "Root Campfire Stew",
    "nameFr": "Ragoût de racines cuit au feu de camp",
    "iconName": "RootCampfireStewItem",
    "calories": 1100
  },
  {
    "id": "food:scrap-meat",
    "name": "Scrap Meat",
    "nameFr": "Scrap Meat",
    "iconName": "ScrapMeatItem",
    "calories": 50
  },
  {
    "id": "food:seared-meat",
    "name": "Seared Meat",
    "nameFr": "Seared Meat",
    "iconName": "SearedMeatItem",
    "calories": 600
  },
  {
    "id": "food:seeded-camas-roll",
    "name": "Seeded Camas Roll",
    "nameFr": "Seeded Camas Roll",
    "iconName": "SeededCamasRollItem",
    "calories": 1400
  },
  {
    "id": "SensuousSeaPizzaItem",
    "name": "Sensuous Sea Pizza",
    "nameFr": "Pizza sensuelle de la mer",
    "iconName": "SensuousSeaPizzaItem",
    "calories": 1200
  },
  {
    "id": "SharkFilletSoupItem",
    "name": "Shark Fillet Soup",
    "nameFr": "Soupe d'ailerons de requin",
    "iconName": "SharkFilletSoupItem",
    "calories": 1400
  },
  {
    "id": "food:simmered-meat",
    "name": "Simmered Meat",
    "nameFr": "Simmered Meat",
    "iconName": "SimmeredMeatItem",
    "calories": 900
  },
  {
    "id": "food:simple-syrup",
    "name": "Simple Syrup",
    "nameFr": "Simple Syrup",
    "iconName": "SimpleSyrupItem",
    "calories": 400
  },
  {
    "id": "SmoothGutNoodleRollItem",
    "name": "Smooth Gut Noodle Roll",
    "nameFr": "Rouleau de nouilles à la viande",
    "iconName": "SmoothGutNoodleRollItem",
    "calories": 1200
  },
  {
    "id": "SpikyRollItem",
    "name": "Spiky Roll",
    "nameFr": "Maki hérissé",
    "iconName": "SpikyRollItem",
    "calories": 1300
  },
  {
    "id": "StuffedTurkeyItem",
    "name": "Stuffed Turkey",
    "nameFr": "Dinde farcie",
    "iconName": "StuffedTurkeyItem",
    "calories": 1600
  },
  {
    "id": "SugarItem",
    "name": "Sugar",
    "nameFr": "Sucre",
    "iconName": "SugarItem",
    "calories": 50
  },
  {
    "id": "SugarcaneItem",
    "name": "Sugarcane",
    "nameFr": "Canne à sucre",
    "iconName": "SugarcaneItem",
    "calories": 1
  },
  {
    "id": "SunCheeseItem",
    "name": "Sun Cheese",
    "nameFr": "Fromage de tournesol",
    "iconName": "SunCheeseItem",
    "calories": 250
  },
  {
    "id": "food:sunflower",
    "name": "Sunflower",
    "nameFr": "Sunflower",
    "iconName": "SunflowerItem",
    "calories": 50
  },
  {
    "id": "SweetDeerJerkyItem",
    "name": "Sweet Deer Jerky",
    "nameFr": "Viande séchée de cerf",
    "iconName": "SweetDeerJerkyItem",
    "calories": 600
  },
  {
    "id": "SweetSaladItem",
    "name": "Sweet Salad",
    "nameFr": "Salade douce",
    "iconName": "SweetSaladItem",
    "calories": 1200
  },
  {
    "id": "TallowItem",
    "name": "Tallow",
    "nameFr": "Suif",
    "iconName": "TallowItem",
    "calories": 200
  },
  {
    "id": "TaroFriesItem",
    "name": "Taro Fries",
    "nameFr": "Frites de taro",
    "iconName": "TaroFriesItem",
    "calories": 600
  },
  {
    "id": "food:taro-root",
    "name": "Taro Root",
    "nameFr": "Taro Root",
    "iconName": "TaroRootItem",
    "calories": 250
  },
  {
    "id": "TastyTropicalPizzaItem",
    "name": "Tasty Tropical Pizza",
    "nameFr": "Pizza tropicale savoureuse",
    "iconName": "TastyTropicalPizzaItem",
    "calories": 1200
  },
  {
    "id": "TomatoItem",
    "name": "Tomato",
    "nameFr": "Tomate",
    "iconName": "TomatoItem",
    "calories": 240
  },
  {
    "id": "food:topped-porridge",
    "name": "Topped Porridge",
    "nameFr": "Topped Porridge",
    "iconName": "ToppedPorridgeItem",
    "calories": 700
  },
  {
    "id": "TortillaItem",
    "name": "Tortilla",
    "nameFr": "Tortilla",
    "iconName": "TortillaItem",
    "calories": 350
  },
  {
    "id": "food:transglutaminase",
    "name": "Transglutaminase",
    "nameFr": "Transglutaminase",
    "iconName": "TransglutaminaseItem",
    "calories": 10
  },
  {
    "id": "VegetableMedleyItem",
    "name": "Vegetable Medley",
    "nameFr": "Assortiment de légumes",
    "iconName": "VegetableMedleyItem",
    "calories": 900
  },
  {
    "id": "VegetableSoupItem",
    "name": "Vegetable Soup",
    "nameFr": "Soupe de légumes",
    "iconName": "VegetableSoupItem",
    "calories": 1200
  },
  {
    "id": "VegetableStockItem",
    "name": "Vegetable Stock",
    "nameFr": "Bouillon de légumes",
    "iconName": "VegetableStockItem",
    "calories": 700
  },
  {
    "id": "WheatItem",
    "name": "Wheat",
    "nameFr": "Blé",
    "iconName": "WheatItem",
    "calories": 150
  },
  {
    "id": "food:wild-mix",
    "name": "Wild Mix",
    "nameFr": "Wild Mix",
    "iconName": "WildMixItem",
    "calories": 800
  },
  {
    "id": "food:wild-stew",
    "name": "Wild Stew",
    "nameFr": "Wild Stew",
    "iconName": "WildStewItem",
    "calories": 1100
  },
  {
    "id": "WiltedFiddleheadsItem",
    "name": "Wilted Fiddleheads",
    "nameFr": "Crosses de fougère flétries",
    "iconName": "WiltedFiddleheadsItem",
    "calories": 350
  },
  {
    "id": "WorldlyDonutItem",
    "name": "Worldly Donut",
    "nameFr": "Beignet mondain",
    "iconName": "WorldlyDonutItem",
    "calories": 750
  },
  {
    "id": "YeastItem",
    "name": "Yeast",
    "nameFr": "Levure",
    "iconName": "YeastItem",
    "calories": 60
  }
]
.sort((left, right) => left.nameFr.localeCompare(right.nameFr, 'fr'));

export const ECO_FOOD_BY_ID = new Map(ECO_FOODS.map(food => [food.id, food] as const));
