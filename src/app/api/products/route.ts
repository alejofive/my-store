let products: any[] = []
let currentId = 1 // 👈 ID NUMÉRICO AUTOINCREMENTAL

interface SellProductPayload {
  id: string
  quantity: number
}

export async function GET() {
  return Response.json(products)
}

export async function POST(req: Request) {
  const body = await req.json()

  const newProduct = {
    id: currentId++,
    name: body.name,
    price: body.price,
    stock: body.stock,
    image: body.image,
  }

  products.push(newProduct)

  return Response.json(newProduct, { status: 201 })
}


const sellProduct = async ({ id, quantity }: SellProductPayload) => {
  const res = await fetch(`http://localhost:3000/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  })

  if (!res.ok) {
    throw new Error('Error vendiendo producto')
  }

  return res.json()
}
