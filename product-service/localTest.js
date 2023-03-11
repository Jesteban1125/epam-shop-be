import { handler as createProduct } from './createProduct-dist.js'
import { handler as getProductsById } from './getProductsById-dist.js'
import { handler as getProductsList } from './getProductsList-dist.js'

process.env.AWS_PROFILE = 'personal'
process.env.PRODUCTS_TABLE_NAME = 'Products-Table'
process.env.STOCKS_TABLE_NAME = 'Stocks-Table'

const createProductEvent = {
  body: JSON.stringify({
    count: 10,
    description: 'Short Product Description',
    price: 15,
    title: 'My Own Product'
  })
}

const getProductsByIdEvent = {
  pathParameters: {
    productId: '7567ec4b-b10c-48c5-9345-fc73c48a80aa'
  }
}

console.log(await createProduct(createProductEvent))
console.log(await getProductsById(getProductsByIdEvent))
console.log(await getProductsList())
