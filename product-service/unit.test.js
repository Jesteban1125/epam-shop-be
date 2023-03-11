import fs from 'fs/promises';
import { handler as getProductsList } from './getProductsList'
import { handler as getProductsById } from './getProductsById'

const getProducts = async () => {
  return JSON.parse(await fs.readFile('./products.json'))
}

describe('#getProductsList', () => {
  test('should return product list from JSON file when getProductsList lambda is called', async () => {
    const products = await getProducts()

    const lambdaResponse = await getProductsList()
    const parseBody = JSON.parse(lambdaResponse.body)
    const keys = Object.keys(parseBody[0])

    expect(lambdaResponse.statusCode).toEqual(200)
    expect(parseBody.lenght).toEqual(products.lenght)
    expect(keys).toContain('count')
    expect(keys).toContain('description')
    expect(keys).toContain('id')
    expect(keys).toContain('price')
    expect(keys).toContain('title')
  })
})

describe('#getProductsById', () => {
  test('should return product from JSON file when getProductsById lambda is called with an existing id', async () => {
    const products = await getProducts()
    const event = {
      pathParameters: {
        productId: '7567ec4b-b10c-48c5-9345-fc73c48a80a2'
      }
    }

    const lambdaResponse = await getProductsById(event)
    const parseBody = JSON.parse(lambdaResponse.body)

    expect(lambdaResponse.statusCode).toEqual(200)
    expect(parseBody.count).toEqual(7)
    expect(parseBody.description).toEqual('Short Product Description2')
    expect(parseBody.id).toEqual(event.pathParameters.productId)
    expect(parseBody.price).toEqual(23)
    expect(parseBody.title).toEqual('ProductTop')
  })

  test('should return 404 error when getProductsById lambda is called with an non-existing id', async () => {
    const products = await getProducts()
    const event = {
      pathParameters: {
        productId: '123'
      }
    }

    const lambdaResponse = await getProductsById(event)

    expect(lambdaResponse.statusCode).toEqual(404)
  })
})
