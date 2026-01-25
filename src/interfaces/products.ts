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

export type Movement = {
  id: string
  date: string
  concept: string
  amount: number // + debe / - paga
  products?: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
}

export type Person = {
  id: string
  name: string
  typeMony: 'COP' | 'USD'
  movements: Movement[]
  products?: {
    id: string
    name: string
    stock: number
    price: number
    quantity: number
  }[]
}
