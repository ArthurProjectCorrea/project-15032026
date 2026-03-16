export interface Material {
  id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  unit: string;
  cost: number;
  minStock: number;
  status: 'ok' | 'baixo';
  expiryDate: string; // ISO date
  monthlyUsage?: number;
  priceTrend?: 'up' | 'down' | 'stable';
  wasteRisk?: number; // 0 to 100
}

export const mockMaterials: Material[] = [
  {
    id: '1',
    name: 'Leite condensado',
    brand: 'Moça',
    category: 'Laticínios',
    stock: 10,
    unit: 'lata',
    cost: 6.0,
    minStock: 5,
    status: 'ok',
    expiryDate: '2026-06-15',
    monthlyUsage: 45,
    priceTrend: 'up',
    wasteRisk: 5,
  },
  {
    id: '2',
    name: 'Chocolate Meio Amargo',
    brand: 'Sicao',
    category: 'Chocolataria',
    stock: 2,
    unit: 'kg',
    cost: 45.0,
    minStock: 5,
    status: 'baixo',
    expiryDate: '2026-12-20',
    monthlyUsage: 12,
    priceTrend: 'stable',
    wasteRisk: 2,
  },
  {
    id: '3',
    name: 'Pote 250ml',
    brand: 'Galvanotek',
    category: 'Embalagens',
    stock: 100,
    unit: 'un',
    cost: 1.2,
    minStock: 20,
    status: 'ok',
    expiryDate: '2028-01-01',
    monthlyUsage: 300,
    priceTrend: 'down',
    wasteRisk: 0,
  },
  {
    id: '4',
    name: 'Colher Plástica',
    brand: 'Bebecê',
    category: 'Descartáveis',
    stock: 20,
    unit: 'un',
    cost: 0.15,
    minStock: 50,
    status: 'baixo',
    expiryDate: '2027-10-10',
    monthlyUsage: 500,
    priceTrend: 'stable',
    wasteRisk: 0,
  },
  {
    id: '5',
    name: 'Creme de leite',
    brand: 'Nestlé',
    category: 'Laticínios',
    stock: 15,
    unit: 'caixa',
    cost: 4.5,
    minStock: 10,
    status: 'ok',
    expiryDate: '2026-04-10', // Near expiry
    monthlyUsage: 40,
    priceTrend: 'up',
    wasteRisk: 45,
  },
  {
    id: '6',
    name: 'Granulado Colorido',
    brand: 'Mavalério',
    category: 'Confeitaria',
    stock: 3,
    unit: 'kg',
    cost: 12.0,
    minStock: 2,
    status: 'ok',
    expiryDate: '2026-08-05',
    monthlyUsage: 8,
    priceTrend: 'down',
    wasteRisk: 10,
  },
];
