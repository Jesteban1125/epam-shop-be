import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
const client = new DynamoDBClient({ region: process.env.AWS_REGION })

const getProduct = async (productId) => {
  const params = {
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': { S: productId }
    },
    TableName: process.env.PRODUCTS_TABLE_NAME
  }
  let result = (await client.send(new QueryCommand(params))).Items
  return result.map((x) => unmarshall(x))
}

const getStock = async (productId) => {
  const params = {
    KeyConditionExpression: 'product_id = :id',
    ExpressionAttributeValues: {
      ':id': { S: productId }
    },
    TableName: process.env.STOCKS_TABLE_NAME
  }
  let result = (await client.send(new QueryCommand(params))).Items
  return result.map((x) => unmarshall(x))
}

const handler = async (event) => {
  let result = []
  let statusCode = 200
  const productId = event?.pathParameters?.productId
  let productRaw = [], stockRaw = []

  console.log(event)

  if (!productId) {
    statusCode = 400
  }

  if (statusCode === 200) {
    try {
      productRaw = await getProduct(productId)
    } catch (err) {
      statusCode = 500
      console.log('Error', err)
    }
  }

  if (statusCode === 200 && productRaw.length !== 1) {
    statusCode = 404
  }

  if (statusCode === 200) {
    try {
      stockRaw = await getStock(productId)
    } catch (err) {
      statusCode = 500
      console.log('Error', err)
    }
  }

  if (statusCode === 200 && stockRaw.length !== 1) {
    statusCode = 404
  }

  if (statusCode === 200) {
    result = {
      ...productRaw[0],
      count: stockRaw[0].count
    }
  }

  return {
    statusCode,
    body: statusCode === 200 ? JSON.stringify(result) : undefined
  }
}

export { handler }
