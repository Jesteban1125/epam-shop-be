import fs from 'fs/promises'

const handler = async (event) => {
  const products = JSON.parse(await fs.readFile('./products.json'))

  const product = products.filter(
    (product) => product.id === event?.pathParameters?.productId
  )[0]

  return {
    statusCode: product ? 200 : 404,
    body: JSON.stringify(product)
  }
}

export { handler }
