import {Component, OnInit} from '@angular/core';
import {FormsModule} from '@angular/forms';

type Nutrients = { nitrogen: number; phosphorus: number; potassium: number };
type Fertilizer = Nutrients & { name: string; quantity: number };

@Component({
  selector: 'app-fertilizer-calculator',
  imports: [FormsModule],
  templateUrl: './fertilizer-calculator.component.html',
  styleUrl: './fertilizer-calculator.component.scss'
})
export class FertilizerCalculatorComponent implements OnInit {
  private readonly storageKey = 'eco-fertilizer-calculator';
  readonly fertilizers: Fertilizer[] = [
    {name: 'Baies', nitrogen: 1, phosphorus: 3, potassium: 4.8, quantity: 0},
    {name: 'Sang', nitrogen: 3, phosphorus: 0.4, potassium: 0.4, quantity: 0},
    {name: 'Camassia', nitrogen: 0.3, phosphorus: 0.7, potassium: 2, quantity: 0},
    {name: 'Peau', nitrogen: 5, phosphorus: 0.5, potassium: 0.5, quantity: 0},
    {name: 'Fourrure', nitrogen: 4, phosphorus: 2, potassium: 2, quantity: 0},
    {name: 'Phosphate', nitrogen: 0.5, phosphorus: 4, potassium: 0.5, quantity: 0},
    {name: 'Compost', nitrogen: 2, phosphorus: 1, potassium: 3.7, quantity: 0}
  ];

  current: Nutrients = {nitrogen: 0, phosphorus: 0, potassium: 0};
  claims = 1;

  ngOnInit() {
    this.restore();
  }

  get increase(): Nutrients {
    return this.fertilizers.reduce((sum, fertilizer) => ({
      nitrogen: sum.nitrogen + fertilizer.nitrogen * 4 * fertilizer.quantity,
      phosphorus: sum.phosphorus + fertilizer.phosphorus * 4 * fertilizer.quantity,
      potassium: sum.potassium + fertilizer.potassium * 4 * fertilizer.quantity
    }), {nitrogen: 0, phosphorus: 0, potassium: 0});
  }

  get after(): Nutrients {
    const increase = this.increase;
    return {
      nitrogen: this.number(this.current.nitrogen) + increase.nitrogen,
      phosphorus: this.number(this.current.phosphorus) + increase.phosphorus,
      potassium: this.number(this.current.potassium) + increase.potassium
    };
  }

  get totalPerClaim(): number {
    return this.fertilizers.reduce((sum, fertilizer) => sum + fertilizer.quantity, 0);
  }

  get totalItems(): number {
    return this.totalPerClaim * this.claims;
  }

  get balanceGap(): number {
    const values = Object.values(this.after);
    return Math.max(...values) - Math.min(...values);
  }

  contribution(fertilizer: Fertilizer, nutrient: keyof Nutrients): number {
    return fertilizer[nutrient] * 4 * fertilizer.quantity;
  }

  setQuantity(fertilizer: Fertilizer, value: number) {
    fertilizer.quantity = Math.max(0, Math.floor(this.number(value)));
    this.save();
  }

  changeQuantity(fertilizer: Fertilizer, amount: number) {
    this.setQuantity(fertilizer, fertilizer.quantity + amount);
  }

  updateInputs() {
    this.current = {
      nitrogen: Math.max(0, this.number(this.current.nitrogen)),
      phosphorus: Math.max(0, this.number(this.current.phosphorus)),
      potassium: Math.max(0, this.number(this.current.potassium))
    };
    this.claims = Math.max(1, Math.floor(this.number(this.claims)));
    this.save();
  }

  reset() {
    this.current = {nitrogen: 0, phosphorus: 0, potassium: 0};
    this.claims = 1;
    this.fertilizers.forEach(fertilizer => fertilizer.quantity = 0);
    this.save();
  }

  format(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.', ',');
  }

  private number(value: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify({
      current: this.current,
      claims: this.claims,
      quantities: this.fertilizers.map(fertilizer => fertilizer.quantity)
    }));
  }

  private restore() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null');
      if (!saved) return;
      this.current = {
        nitrogen: Math.max(0, this.number(saved.current?.nitrogen)),
        phosphorus: Math.max(0, this.number(saved.current?.phosphorus)),
        potassium: Math.max(0, this.number(saved.current?.potassium))
      };
      this.claims = Math.max(1, Math.floor(this.number(saved.claims)));
      this.fertilizers.forEach((fertilizer, index) => {
        fertilizer.quantity = Math.max(0, Math.floor(this.number(saved.quantities?.[index])));
      });
    } catch {
      localStorage.removeItem(this.storageKey);
    }
  }
}
