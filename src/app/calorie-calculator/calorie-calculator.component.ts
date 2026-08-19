import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ecoItemImageUrl} from '../eco-data/eco-item-image';
import {ECO_FOOD_BY_ID, ECO_FOODS, EcoFood} from './eco-food-data';
import {CalorieStore, CalorieStoreFood, CalorieStoresService} from '../service/calorie-stores.service';

type CalorieMetrics = {median: number; average: number; global: number} | null;

@Component({
  selector: 'app-calorie-calculator',
  imports: [FormsModule],
  templateUrl: './calorie-calculator.component.html',
  styleUrl: './calorie-calculator.component.scss'
})
export class CalorieCalculatorComponent implements OnInit {
  private readonly calorieStores = inject(CalorieStoresService);
  readonly stores = this.calorieStores.stores;
  readonly loading = this.calorieStores.loading;
  readonly foods = ECO_FOODS;
  readonly imageUrl = ecoItemImageUrl;
  readonly activeStoreId = signal<number | null>(null);
  readonly search = signal('');
  readonly copied = signal(false);
  readonly unavailableIcons = signal<ReadonlySet<string>>(new Set());

  readonly activeStore = computed(() => this.stores().find(store => store.id === this.activeStoreId()) ?? null);
  readonly activeMetrics = computed(() => this.metricsFor(this.activeStore()?.foods ?? []));
  readonly suggestions = computed(() => {
    const query = this.normalized(this.search());
    if (!query) return [];
    const selected = new Set(this.activeStore()?.foods.map(food => food.foodId) ?? []);
    return this.foods
      .filter(food => !selected.has(food.id) && this.searchable(food).includes(query))
      .slice(0, 10);
  });

  async ngOnInit() {
    await this.calorieStores.load();
  }

  async createStore() {
    const store = await this.calorieStores.createStore();
    if (store) this.activeStoreId.set(store.id);
  }

  openStore(store: CalorieStore) {
    this.activeStoreId.set(store.id);
    this.search.set('');
  }

  closeStore() {
    this.activeStoreId.set(null);
    this.search.set('');
  }

  renameStore(store: CalorieStore, value: string) {
    this.calorieStores.renameStore(store.id, value);
  }

  async deleteStore(store: CalorieStore) {
    if (!window.confirm(`Supprimer définitivement « ${this.storeName(store)} » et ses aliments ?`)) return;
    const deleted = await this.calorieStores.deleteStore(store.id);
    if (deleted && this.activeStoreId() === store.id) this.closeStore();
  }

  async addFood(food: EcoFood) {
    const store = this.activeStore();
    if (!store) return;
    const added = await this.calorieStores.addFood(store.id, food.id);
    if (added) this.search.set('');
  }

  removeFood(food: CalorieStoreFood) {
    const store = this.activeStore();
    if (store) void this.calorieStores.deleteFood(store.id, food.id);
  }

  setPrice(food: CalorieStoreFood, rawValue: number | string | null) {
    const store = this.activeStore();
    if (!store) return;
    const value = rawValue === '' || rawValue === null ? null : Number(rawValue);
    this.calorieStores.setFoodPrice(store.id, food.id, Number.isFinite(value) ? value : null);
  }

  foodFor(food: CalorieStoreFood): EcoFood | null {
    return ECO_FOOD_BY_ID.get(food.foodId) ?? null;
  }

  costFor(food: CalorieStoreFood): number | null {
    const item = this.foodFor(food);
    return item && food.price !== null ? food.price / item.calories * 1000 : null;
  }

  metricsFor(foods: readonly CalorieStoreFood[]): CalorieMetrics {
    const priced = foods.flatMap(food => {
      const item = this.foodFor(food);
      return item && food.price !== null ? [{price: food.price, calories: item.calories, cost: food.price / item.calories * 1000}] : [];
    });
    if (priced.length === 0) return null;
    const costs = priced.map(item => item.cost).sort((left, right) => left - right);
    const center = Math.floor(costs.length / 2);
    const median = costs.length % 2 === 0 ? (costs[center - 1] + costs[center]) / 2 : costs[center];
    const average = costs.reduce((total, value) => total + value, 0) / costs.length;
    const totalPrice = priced.reduce((total, item) => total + item.price, 0);
    const totalCalories = priced.reduce((total, item) => total + item.calories, 0);
    return {median, average, global: totalPrice / totalCalories * 1000};
  }

  async copyRecommended() {
    const value = this.activeMetrics()?.median;
    if (value === undefined) return;
    try {
      await navigator.clipboard.writeText(String(Number(value.toFixed(3))));
      this.copied.set(true);
      window.setTimeout(() => this.copied.set(false), 1600);
    } catch {
      this.copied.set(false);
    }
  }

  formatCost(value: number | null | undefined): string {
    return value === null || value === undefined || !Number.isFinite(value)
      ? '—'
      : new Intl.NumberFormat('fr-FR', {minimumFractionDigits: 2, maximumFractionDigits: 3}).format(value);
  }

  storeName(store: CalorieStore): string {
    return store.name.trim() || 'Magasin sans nom';
  }

  iconUnavailable(iconName: string): boolean {
    return this.unavailableIcons().has(iconName);
  }

  markIconUnavailable(iconName: string) {
    this.unavailableIcons.update(icons => new Set(icons).add(iconName));
  }

  private searchable(food: EcoFood): string {
    return this.normalized(`${food.nameFr} ${food.name}`);
  }

  private normalized(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
}
