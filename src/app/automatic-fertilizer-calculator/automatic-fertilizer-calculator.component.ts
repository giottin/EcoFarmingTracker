import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

type Nutrients = { nitrogen: number; phosphorus: number; potassium: number };
type AvailabilityImportance = 'low' | 'normal' | 'high';
type Fertilizer = Nutrients & { name: string; difficulty: number };
type Solution = {
  quantities: number[];
  final: Nutrients;
  total: number;
  totalDeficit: number;
  worstDeficit: number;
  difficultyPenalty: number;
};

// Values are expressed in tenths of a nutrient point per difficulty level and per item.
// Keeping them in one place makes future balancing possible without touching the search.
export const AVAILABILITY_WEIGHTS: Record<AvailabilityImportance, number> = {
  low: 1,
  normal: 3,
  high: 7
};

export function calculateDifficultyPenalty(quantities: readonly number[], difficulties: readonly number[]): number {
  const easiestConfiguredLevel = difficulties.length > 0 ? Math.min(...difficulties) : 3;
  return quantities.reduce(
    (total, quantity, index) => total + quantity * ((difficulties[index] ?? easiestConfiguredLevel) - easiestConfiguredLevel),
    0
  );
}

export function calculateAvailabilityScore(
  totalDeficitInTenths: number,
  quantities: readonly number[],
  difficulties: readonly number[],
  importance: AvailabilityImportance
): number {
  return totalDeficitInTenths + calculateDifficultyPenalty(quantities, difficulties) * AVAILABILITY_WEIGHTS[importance];
}

@Component({
  selector: 'app-automatic-fertilizer-calculator',
  imports: [FormsModule],
  templateUrl: './automatic-fertilizer-calculator.component.html',
  styleUrl: './automatic-fertilizer-calculator.component.scss'
})
export class AutomaticFertilizerCalculatorComponent implements OnInit {
  private readonly storageKey = 'eco-automatic-fertilizer-calculator';
  readonly difficultyOptions = [1, 2, 3, 4, 5];
  readonly availabilityOptions: {value: AvailabilityImportance; label: string}[] = [
    {value: 'low', label: 'Faible'},
    {value: 'normal', label: 'Normale'},
    {value: 'high', label: 'Forte'}
  ];
  readonly fertilizers: Fertilizer[] = [
    {name: 'Baies', nitrogen: 4, phosphorus: 12, potassium: 19.2, difficulty: 3},
    {name: 'Peau', nitrogen: 20, phosphorus: 2, potassium: 2, difficulty: 3},
    {name: 'Fourrure', nitrogen: 16, phosphorus: 8, potassium: 8, difficulty: 3},
    {name: 'Phosphate', nitrogen: 2, phosphorus: 16, potassium: 2, difficulty: 3},
    {name: 'Compost', nitrogen: 8, phosphorus: 4, potassium: 14.8, difficulty: 3},
    {name: 'Sang', nitrogen: 12, phosphorus: 1.6, potassium: 1.6, difficulty: 3},
    {name: 'Camassia', nitrogen: 1.2, phosphorus: 2.8, potassium: 8, difficulty: 3}
  ];

  current: Nutrients = {nitrogen: 0, phosphorus: 0, potassium: 0};
  claims = 1;
  availabilityImportance: AvailabilityImportance = 'normal';
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
    const contributions = this.fertilizers.map(item => [
      Math.round(item.nitrogen * scale),
      Math.round(item.phosphorus * scale),
      Math.round(item.potassium * scale)
    ]);
    const difficulties = this.fertilizers.map(item => item.difficulty);
    type SearchResult = {
      quantities: number[];
      used: number[];
      totalDeficit: number;
      worstDeficit: number;
      total: number;
      difficultyPenalty: number;
      availabilityScore: number;
    };
    const result: {best: SearchResult | null} = {best: null};
    const quantities = Array(this.fertilizers.length).fill(0) as number[];

    const evaluateLastTwo = (used: number[]) => {
      const sang = contributions[5];
      const camassia = contributions[6];
      const maxSang = Math.min(...capacity.map((limit, index) => Math.floor((limit - used[index]) / sang[index])));
      for (let sangCount = 0; sangCount <= maxSang; sangCount++) {
        const afterSang = used.map((value, index) => value + sang[index] * sangCount);
        const camassiaCount = Math.min(...capacity.map((limit, index) => Math.floor((limit - afterSang[index]) / camassia[index])));
        const finalUsed = afterSang.map((value, index) => value + camassia[index] * camassiaCount);
        const deficits = capacity.map((limit, index) => limit - finalUsed[index]);
        const totalDeficit = deficits.reduce((sum, value) => sum + value, 0);
        const worstDeficit = Math.max(...deficits);
        quantities[5] = sangCount;
        quantities[6] = camassiaCount;
        const candidateQuantities = [...quantities];
        const total = quantities.slice(0, 5).reduce((sum, value) => sum + value, 0) + sangCount + camassiaCount;
        const difficultyPenalty = calculateDifficultyPenalty(candidateQuantities, difficulties);
        const availabilityScore = calculateAvailabilityScore(
          totalDeficit,
          candidateQuantities,
          difficulties,
          this.availabilityImportance
        );
        const best = result.best;
        if (!best || availabilityScore < best.availabilityScore ||
          (availabilityScore === best.availabilityScore && totalDeficit < best.totalDeficit) ||
          (availabilityScore === best.availabilityScore && totalDeficit === best.totalDeficit && worstDeficit < best.worstDeficit) ||
          (availabilityScore === best.availabilityScore && totalDeficit === best.totalDeficit && worstDeficit === best.worstDeficit && total < best.total)) {
          result.best = {
            quantities: candidateQuantities,
            used: finalUsed,
            totalDeficit,
            worstDeficit,
            total,
            difficultyPenalty,
            availabilityScore
          };
        }
      }
    };

    const search = (index: number, used: number[]) => {
      if (index === 5) {
        evaluateLastTwo(used);
        return;
      }
      const contribution = contributions[index];
      const maximum = Math.min(...capacity.map((limit, nutrient) => Math.floor((limit - used[nutrient]) / contribution[nutrient])));
      for (let count = 0; count <= maximum; count++) {
        quantities[index] = count;
        search(index + 1, used.map((value, nutrient) => value + contribution[nutrient] * count));
      }
      quantities[index] = 0;
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
        worstDeficit: best.worstDeficit / scale,
        difficultyPenalty: best.difficultyPenalty
      };
    }
    this.save();
  }

  quantity(index: number): number { return this.solution?.quantities[index] ?? 0; }
  totalQuantity(index: number): number { return this.quantity(index) * this.claims; }
  format(value: number): string { return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ','); }
  setDifficulty(index: number, value: unknown) {
    this.fertilizers[index].difficulty = this.normalizeDifficulty(value);
    this.calculate();
  }
  setAvailabilityImportance(value: unknown) {
    if (value === 'low' || value === 'normal' || value === 'high') {
      this.availabilityImportance = value;
      this.calculate();
    }
  }
  difficultyLabel(level: number): string {
    return ['Très facile', 'Facile', 'Moyenne', 'Difficile', 'Très difficile'][level - 1] ?? 'Moyenne';
  }
  reset() { this.current = {nitrogen: 0, phosphorus: 0, potassium: 0}; this.claims = 1; this.calculate(); }

  private clamp(value: number): number { return Math.min(100, Math.max(0, this.number(value))); }
  private number(value: number): number { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : 0; }
  private normalizeDifficulty(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Math.min(5, Math.max(1, Math.round(parsed))) : 3;
  }
  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      current: this.current,
      claims: this.claims,
      difficulties: Object.fromEntries(this.fertilizers.map(item => [item.name, item.difficulty])),
      availabilityImportance: this.availabilityImportance
    }));
  }
  private restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      if (!saved) return;
      this.current = {nitrogen: this.clamp(saved.current?.nitrogen), phosphorus: this.clamp(saved.current?.phosphorus), potassium: this.clamp(saved.current?.potassium)};
      this.claims = Math.max(1, Math.floor(this.number(saved.claims)));
      for (const fertilizer of this.fertilizers) {
        if (saved.difficulties?.[fertilizer.name] !== undefined) {
          fertilizer.difficulty = this.normalizeDifficulty(saved.difficulties[fertilizer.name]);
        }
      }
      if (saved.availabilityImportance === 'low' || saved.availabilityImportance === 'normal' || saved.availabilityImportance === 'high') {
        this.availabilityImportance = saved.availabilityImportance;
      }
    } catch { localStorage.removeItem(this.storageKey); }
  }
}
