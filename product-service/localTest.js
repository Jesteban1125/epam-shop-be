import { handler as createProduct } from './createProduct-dist.js'
import { handler as getProductsById } from './getProductsById-dist.js'
import { handler as getProductsList } from './getProductsList-dist.js'
import { handler as catalogBatchProcess } from './catalogBatchProcess-dist.js'

process.env.AWS_PROFILE = 'personal'
process.env.PRODUCTS_TABLE_NAME = 'Products-Table'
process.env.STOCKS_TABLE_NAME = 'Stocks-Table'
process.env.CREATE_PRODUCT_TOPIC_ARN = 'arn:aws:sns:us-east-1:142176105809:createProductTopic'

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

const catalogBatchProcessEvent = {
  Records: [
    {
      messageId: '8049f77d-e078-48cd-8677-f4c357ee6997',
      body: '{"id":"7567ec4b-b10c-48c5-9345-fc73c48a80a3","title":"Product","description":"Short Product Description2","price":"23","count":"7"}'
    },
    {
      messageId: '4b67c584-2470-461a-ac3d-f322036af5fe',
      body: '{"id":"7567ec4b-b10c-48c5-9345-fc73c48a80aa","title":"ProductOne","description":"Short Product Description1","price":"2.4","count":"4"}'
    },
    {
      messageId: 'dd7a341b-53bf-4b02-90a1-3df14beee5e0',
      body: '{"id":"7567ec4b-b10c-48c5-9345-fc73c48a80a2","title":"ProductTop","description":"Short Product Description2","price":"23","count":"7"}'
    }
  ]
}

// console.log(await createProduct(createProductEvent))
// console.log(await getProductsById(getProductsByIdEvent))
// console.log(await getProductsList())
// await catalogBatchProcess(catalogBatchProcessEvent)
