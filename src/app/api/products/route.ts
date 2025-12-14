let products: any[] = []
let currentId = 1 // 👈 ID NUMÉRICO AUTOINCREMENTAL

export async function GET() {
  return Response.json(products)
}

export async function POST(req: Request) {
  const body = await req.json()

  const newProduct = {
    id: currentId++, // 👈 SE GENERA AQUÍ, AUTOMÁTICAMENTE
    name: body.name,
    price: body.price,
    stock: body.stock,
    image: body.image,
  }

  products.push(newProduct)

  return Response.json(newProduct, { status: 201 })
}
