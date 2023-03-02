import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
const client = new DynamoDBClient({ region: process.env.AWS_REGION })

const getProducts = async () => {
  let result = (
    await client.send(
      new ScanCommand({ TableName: process.env.PRODUCTS_TABLE_NAME })
    )
  ).Items
  return result.map((x) => unmarshall(x)) 
}

const getStocks = async () => {
  let result = (
    await client.send(
      new ScanCommand({ TableName: process.env.STOCKS_TABLE_NAME })
    )
  ).Items
  return result.map((x) => unmarshall(x)) 
}

const handler = async (event) => {
  let result = []
  let statusCode = 200
  let productsRaw, stocksRaw

  console.log(event)

  try {
    productsRaw = await getProducts()
  } catch (err) {
    statusCode = 500
    console.log('Error', err)
  }

  if (statusCode === 200 && productsRaw.length > 0) {
    try {
      stocksRaw = await getStocks()
    } catch (err) {
      statusCode = 500
      console.log('Error', err)
    }
  }

  if (statusCode === 200 && productsRaw.length > 0) {
    result = productsRaw.map((product) => ({
      ...product,
      count: stocksRaw.filter((stock) => stock.product_id === product.id)[0]
        .count
    }))
  }

  return {
    statusCode,
    body: statusCode === 200 ? JSON.stringify(result) : undefined
  }
}

export { handler }
