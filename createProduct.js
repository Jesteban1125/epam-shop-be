import { randomUUID } from 'crypto'
import { DynamoDBClient, TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb'
import { marshall } from '@aws-sdk/util-dynamodb'
const client = new DynamoDBClient({ region: process.env.AWS_REGION })

const getErrorStructure = (status, message) => {
  const result = { 
    statusCode: 201,
    result: undefined
  }

  if (!status) {
    result.statusCode = 400
    result.result = message
  }

  return result
}

const isAValidString = (data) => {
  let status = false
  if (data) {
    status = typeof data === 'string'
  }
  return status
}

const isAValidNumber = (data) => {
  let status = false
  if (data || data === 0) {
    status = typeof data === 'number' && data >= 0
  }
  return status
}

const createProduct = async (data) => {
  const product = {
    id: data.id,
    title: data.title,
    description: data.description,
    price: data.price
  }
  const stock = {
    product_id: data.id,
    count: data.count
  }
  const params = {
    TransactItems: [
      {
        Put: {
          TableName: process.env.PRODUCTS_TABLE_NAME,
          Item: marshall(product)
        }
      },
      {
        Put: {
          TableName: process.env.STOCKS_TABLE_NAME,
          Item: marshall(stock)
        }
      }
    ]
  }
  await client.send(new TransactWriteItemsCommand(params))
}

const handler = async (event) => {
  let result = undefined
  let statusCode = 201
  let requestBody

  console.log(event)
  
  ;({ result, statusCode } = getErrorStructure(
    !!event?.body,
    'Product information is required'
  ))

  if (statusCode === 201) {
    requestBody = JSON.parse(event?.body)
  }

  if (statusCode === 201) {
    ;({ result, statusCode } = getErrorStructure(
      isAValidString(requestBody?.title),
      '"title" field is not a valid string.'
    ))
  }
  if (statusCode === 201) {
    ;({ result, statusCode } = getErrorStructure(
      isAValidString(requestBody?.description),
      '"description" field is not a valid string.'
    ))
  }
  if (statusCode === 201) {
    ;({ result, statusCode } = getErrorStructure(
      isAValidNumber(requestBody?.price),
      '"price" field is not a valid number.'
    ))
  }
  if (statusCode === 201) {
    ;({ result, statusCode } = getErrorStructure(
      isAValidNumber(requestBody?.count),
      '"count" field is not a valid number.'
    ))
  }

  if (statusCode === 201) {
    requestBody.id = randomUUID()
    try {
      await createProduct(requestBody)
    } catch (err) {
      statusCode = 500
      console.log('Error', err)
    }
  }

  return {
    statusCode,
    body: result
  }
}

export { handler }
