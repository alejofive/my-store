export type Products = {
  id: number
  name: string
  price: number
  stock: number
  urlImage?: string
  image: string
  details: {
    packages: string // <-- antes number
    packageCost: string // <-- antes number
    unitPackages: string // <-- antes number
    basePrice: number
    profitPerUnit: number
    sold: number
    totalProfit: number
    totalCost: number
    currency: 'COP' | 'USD'
  }
}
