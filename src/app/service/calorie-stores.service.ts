import {Injectable, signal} from '@angular/core';
import {SupabaseService} from './supabase.service';

export type CalorieStoreFood = {
  id: number;
  storeId: number;
  foodId: string;
  price: number | null;
  createdAt: Date;
};

export type CalorieStore = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  foods: CalorieStoreFood[];
};

type CalorieStoreRow = {id: number; name: string; created_at: string; updated_at: string};
type CalorieStoreFoodRow = {id: number; store_id: number; food_id: string; price: number | string | null; created_at: string};

@Injectable({providedIn: 'root'})
export class CalorieStoresService {
  readonly stores = signal<CalorieStore[]>([]);
  readonly loading = signal(false);
  private readonly pendingNames = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly pendingPrices = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(private readonly supabase: SupabaseService) {}

  async load() {
    this.loading.set(true);
    const [storesResponse, foodsResponse] = await Promise.all([
      this.supabase.client.from('calorie_stores').select('id, name, created_at, updated_at').order('created_at', {ascending: true}),
      this.supabase.client.from('calorie_store_foods').select('id, store_id, food_id, price, created_at').order('created_at', {ascending: true})
    ]);
    if (!storesResponse.error && !foodsResponse.error && storesResponse.data && foodsResponse.data) {
      const foods = (foodsResponse.data as CalorieStoreFoodRow[]).map(row => this.foodFromRow(row));
      this.stores.set((storesResponse.data as CalorieStoreRow[]).map(row => ({
        ...this.storeFromRow(row),
        foods: foods.filter(food => food.storeId === Number(row.id))
      })));
    }
    this.loading.set(false);
  }

  async createStore(): Promise<CalorieStore | null> {
    const now = new Date().toISOString();
    const {data, error} = await this.supabase.client
      .from('calorie_stores')
      .insert({name: 'Nouveau magasin', updated_at: now})
      .select('id, name, created_at, updated_at')
      .single();
    if (error || !data) return null;
    const store = {...this.storeFromRow(data as CalorieStoreRow), foods: []};
    this.stores.update(stores => [...stores, store]);
    return store;
  }

  renameStore(storeId: number, value: string) {
    const name = value.slice(0, 120);
    this.stores.update(stores => stores.map(store => store.id === storeId ? {...store, name} : store));
    const pending = this.pendingNames.get(storeId);
    if (pending) clearTimeout(pending);
    this.pendingNames.set(storeId, setTimeout(() => {
      this.pendingNames.delete(storeId);
      const trimmed = name.trim();
      if (!trimmed) return;
      void this.supabase.client
        .from('calorie_stores')
        .update({name: trimmed, updated_at: new Date().toISOString()})
        .eq('id', storeId)
        .then(({error}) => { if (error) void this.load(); });
    }, 350));
  }

  async deleteStore(storeId: number): Promise<boolean> {
    const pending = this.pendingNames.get(storeId);
    if (pending) clearTimeout(pending);
    this.pendingNames.delete(storeId);
    const {error} = await this.supabase.client.from('calorie_stores').delete().eq('id', storeId);
    if (error) return false;
    this.stores.update(stores => stores.filter(store => store.id !== storeId));
    return true;
  }

  async addFood(storeId: number, foodId: string): Promise<boolean> {
    const store = this.stores().find(candidate => candidate.id === storeId);
    if (!store || store.foods.some(food => food.foodId === foodId)) return false;
    const {data, error} = await this.supabase.client
      .from('calorie_store_foods')
      .insert({store_id: storeId, food_id: foodId, price: null, updated_at: new Date().toISOString()})
      .select('id, store_id, food_id, price, created_at')
      .single();
    if (error || !data) return false;
    const food = this.foodFromRow(data as CalorieStoreFoodRow);
    this.stores.update(stores => stores.map(candidate => candidate.id === storeId ? {...candidate, foods: [...candidate.foods, food]} : candidate));
    return true;
  }

  setFoodPrice(storeId: number, foodRowId: number, value: number | null) {
    const price = value === null || !Number.isFinite(value) || value < 0 ? null : value;
    this.stores.update(stores => stores.map(store => store.id === storeId ? {
      ...store,
      foods: store.foods.map(food => food.id === foodRowId ? {...food, price} : food)
    } : store));
    const pending = this.pendingPrices.get(foodRowId);
    if (pending) clearTimeout(pending);
    this.pendingPrices.set(foodRowId, setTimeout(() => {
      this.pendingPrices.delete(foodRowId);
      void this.supabase.client
        .from('calorie_store_foods')
        .update({price, updated_at: new Date().toISOString()})
        .eq('id', foodRowId)
        .then(({error}) => { if (error) void this.load(); });
    }, 350));
  }

  async deleteFood(storeId: number, foodRowId: number): Promise<boolean> {
    const pending = this.pendingPrices.get(foodRowId);
    if (pending) clearTimeout(pending);
    this.pendingPrices.delete(foodRowId);
    const {error} = await this.supabase.client.from('calorie_store_foods').delete().eq('id', foodRowId);
    if (error) return false;
    this.stores.update(stores => stores.map(store => store.id === storeId ? {...store, foods: store.foods.filter(food => food.id !== foodRowId)} : store));
    return true;
  }

  private storeFromRow(row: CalorieStoreRow): Omit<CalorieStore, 'foods'> {
    return {id: Number(row.id), name: row.name, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at)};
  }

  private foodFromRow(row: CalorieStoreFoodRow): CalorieStoreFood {
    return {id: Number(row.id), storeId: Number(row.store_id), foodId: row.food_id, price: row.price === null ? null : Number(row.price), createdAt: new Date(row.created_at)};
  }
}
