import fs from 'fs/promises'

const handler = async (event) => {
  const products = JSON.parse(await fs.readFile('./products.json'))

  return {
    statusCode: 200,
    body: JSON.stringify(products)
  }
}

export { handler }
