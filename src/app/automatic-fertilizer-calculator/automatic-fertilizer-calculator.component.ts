import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

type Nutrients = { nitrogen: number; phosphorus: number; potassium: number };
type Fertilizer = Nutrients & { name: string; available: boolean };
type Solution = { quantities: number[]; final: Nutrients; total: number; totalDeficit: number; worstDeficit: number };

@Component({
  selector: 'app-automatic-fertilizer-calculator',
  imports: [FormsModule],
  templateUrl: './automatic-fertilizer-calculator.component.html',
  styleUrl: './automatic-fertilizer-calculator.component.scss'
})
export class AutomaticFertilizerCalculatorComponent implements OnInit {
  private readonly storageKey = 'eco-automatic-fertilizer-calculator';
  readonly fertilizers: Fertilizer[] = [
    {name: 'Baies', nitrogen: 4, phosphorus: 12, potassium: 19.2, available: true},
    {name: 'Peau', nitrogen: 20, phosphorus: 2, potassium: 2, available: true},
    {name: 'Fourrure', nitrogen: 16, phosphorus: 8, potassium: 8, available: true},
    {name: 'Phosphate', nitrogen: 2, phosphorus: 16, potassium: 2, available: true},
    {name: 'Compost', nitrogen: 8, phosphorus: 4, potassium: 14.8, available: true},
    {name: 'Sang', nitrogen: 12, phosphorus: 1.6, potassium: 1.6, available: true},
    {name: 'Camassia', nitrogen: 1.2, phosphorus: 2.8, potassium: 8, available: true}
  ];

  current: Nutrients = {nitrogen: 0, phosphorus: 0, potassium: 0};
  claims = 1;
  solution: Solution | null = null;

  ngOnInit() {
    this.restore();
    this.calculate();
  }

  calculate() {
    this.current = {
      nitrogen: this.clamp(this.current.nitrogen),
      phosphorus: this.clamp(this.current.phosphorus),
      potassium: this.clamp(this.current.potassium)
    };
    this.claims = Math.max(1, Math.floor(this.number(this.claims)));

    const scale = 10;
    const capacity = [
      Math.round((100 - this.current.nitrogen) * scale),
      Math.round((100 - this.current.phosphorus) * scale),
      Math.round((100 - this.current.potassium) * scale)
    ];
    const availableFertilizers = this.fertilizers
      .map((fertilizer, originalIndex) => ({
        originalIndex,
        contribution: [
          Math.round(fertilizer.nitrogen * scale),
          Math.round(fertilizer.phosphorus * scale),
          Math.round(fertilizer.potassium * scale)
        ]
      }))
      .filter(({originalIndex}) => this.fertilizers[originalIndex].available);

    type SearchResult = { quantities: number[]; used: number[]; totalDeficit: number; worstDeficit: number; total: number };
    const result: {best: SearchResult | null} = {best: null};
    const quantities = Array(this.fertilizers.length).fill(0) as number[];

    const consider = (used: number[]) => {
      const last = availableFertilizers[availableFertilizers.length - 1];
      let finalUsed = used;
      if (last) {
        const maximum = Math.min(...capacity.map((limit, nutrient) => Math.floor((limit - used[nutrient]) / last.contribution[nutrient])));
        quantities[last.originalIndex] = maximum;
        finalUsed = used.map((value, nutrient) => value + last.contribution[nutrient] * maximum);
      }
      const deficits = capacity.map((limit, index) => limit - finalUsed[index]);
      const totalDeficit = deficits.reduce((sum, value) => sum + value, 0);
      const worstDeficit = Math.max(...deficits);
      const total = quantities.reduce((sum, value) => sum + value, 0);
      const best = result.best;
      if (!best || totalDeficit < best.totalDeficit ||
        (totalDeficit === best.totalDeficit && worstDeficit < best.worstDeficit) ||
        (totalDeficit === best.totalDeficit && worstDeficit === best.worstDeficit && total < best.total)) {
        result.best = {quantities: [...quantities], used: finalUsed, totalDeficit, worstDeficit, total};
      }
      if (last) quantities[last.originalIndex] = 0;
    };

    const search = (index: number, used: number[]) => {
      if (index >= availableFertilizers.length - 1) {
        consider(used);
        return;
      }
      const fertilizer = availableFertilizers[index];
      const maximum = Math.min(...capacity.map((limit, nutrient) => Math.floor((limit - used[nutrient]) / fertilizer.contribution[nutrient])));
      for (let count = 0; count <= maximum; count++) {
        quantities[fertilizer.originalIndex] = count;
        search(index + 1, used.map((value, nutrient) => value + fertilizer.contribution[nutrient] * count));
      }
      quantities[fertilizer.originalIndex] = 0;
    };

    search(0, [0, 0, 0]);
    const best = result.best;
    if (best) {
      this.solution = {
        quantities: best.quantities,
        final: {
          nitrogen: this.current.nitrogen + best.used[0] / scale,
          phosphorus: this.current.phosphorus + best.used[1] / scale,
          potassium: this.current.potassium + best.used[2] / scale
        },
        total: best.total,
        totalDeficit: best.totalDeficit / scale,
        worstDeficit: best.worstDeficit / scale
      };
    }
    this.save();
  }

  quantity(index: number): number { return this.solution?.quantities[index] ?? 0; }
  totalQuantity(index: number): number { return this.quantity(index) * this.claims; }
  format(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ','); }
  setAvailability(index: number, value: unknown) {
    this.fertilizers[index].available = value === true;
    this.calculate();
  }
  reset() { this.current = {nitrogen: 0, phosphorus: 0, potassium: 0}; this.claims = 1; this.calculate(); }

  private clamp(value: number): number { return Math.min(100, Math.max(0, this.number(value))); }
  private number(value: number): number { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      current: this.current,
      claims: this.claims,
      availability: Object.fromEntries(this.fertilizers.map(item => [item.name, item.available]))
    }));
  }
  private restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      if (!saved) return;
      this.current = {nitrogen: this.clamp(saved.current?.nitrogen), phosphorus: this.clamp(saved.current?.phosphorus), potassium: this.clamp(saved.current?.potassium)};
      this.claims = Math.max(1, Math.floor(this.number(saved.claims)));
      for (const fertilizer of this.fertilizers) {
        if (typeof saved.availability?.[fertilizer.name] === 'boolean') {
          fertilizer.available = saved.availability[fertilizer.name];
        }
      }
    } catch { localStorage.removeItem(this.storageKey); }
  }
}
