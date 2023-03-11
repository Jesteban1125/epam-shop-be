import fs from 'fs/promises'
import { DynamoDBClient, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'

const PRODUCTS_TABLE_NAME = 'Products-Table'
const STOCKS_TABLE_NAME = 'Stocks-Table'

const jsonToDynamoFormat = (data) =>
  data.map((x) => ({
    PutRequest: { Item: marshall(x) }
  }))

const main = async (event) => {
  const client = new DynamoDBClient({ region: 'us-east-1' })
  const productsRaw = JSON.parse(await fs.readFile('./products.json'))
  const productsClean = productsRaw.map((x) => ({
    id: x.id,
    title: x.title,
    description: x.description,
    price: x.price
  }))
  const stocksClean = productsRaw.map((x) => ({
    product_id: x.id,
    count: x.count
  }))

  const params = { RequestItems: {} }
  params.RequestItems[PRODUCTS_TABLE_NAME] = jsonToDynamoFormat(productsClean)
  params.RequestItems[STOCKS_TABLE_NAME] = jsonToDynamoFormat(stocksClean)

  try {
    const data = await client.send(new BatchWriteItemCommand(params))
    console.log('Success, items inserted', data)
    return data
  } catch (err) {
    console.log('Error', err)
  }
}

await main()
