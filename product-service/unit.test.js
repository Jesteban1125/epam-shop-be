import fs from 'fs/promises';
import { jest } from '@jest/globals'
import { handler as getProductsList } from './getProductsList'
import { handler as getProductsById } from './getProductsById'
import 'aws-sdk-client-mock-jest'
import { mockClient } from 'aws-sdk-client-mock'
import {
  DynamoDBClient,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'

const snsMock = mockClient(SNSClient)
snsMock.resolves({})
const dynamoDBMock = mockClient(DynamoDBClient)
dynamoDBMock.resolves({})

const { handler: catalogBatchProcess } = await import('./catalogBatchProcess')

const getProducts = async () => {
  return JSON.parse(await fs.readFile('./products.json'))
}

process.env.PRODUCTS_TABLE_NAME = 'UT-Products-Table'
process.env.STOCKS_TABLE_NAME = 'UT-Stocks-Table'
process.env.CREATE_PRODUCT_TOPIC_ARN = 'UT-Topic-Arn'

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

describe.only('#catalogBatchProcess', () => {
  test('should return product from JSON file when catalogBatchProcess lambda is called with an existing id', async () => {
    const event = {
      Records: [
        {
          messageId: '8049f77d-e078-48cd-8677-f4c357ee6997',
          body: '{"id":"7567ec4b-b10c-48c5-9345-fc73c48a80a3","title":"Product","description":"Short Product Description2","price":"23","count":"7"}'
        }
      ]
    }
    
    const lambdaResponse = await catalogBatchProcess(event)

    const expectedDbParams = {
      TransactItems: [
        {
          Put: {
            Item: {
              description: { S: 'Short Product Description2' },
              id: { S: '7567ec4b-b10c-48c5-9345-fc73c48a80a3' },
              price: { S: '23' },
              title: { S: 'Product' }
            },
            TableName: process.env.PRODUCTS_TABLE_NAME
          }
        },
        {
          Put: {
            Item: {
              count: { S: '7' },
              product_id: { S: '7567ec4b-b10c-48c5-9345-fc73c48a80a3' }
            },
            TableName: process.env.STOCKS_TABLE_NAME
          }
        }
      ]
    }
    expect(dynamoDBMock).toHaveReceivedCommandWith(
      TransactWriteItemsCommand,
      expectedDbParams
    )
    const expectedSnsParams = {
      Message: 'Products created. (Number of products: 1)',
      MessageAttributes: { count: { DataType: 'Number', StringValue: 1 } },
      TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN
    }
    expect(snsMock).toHaveReceivedCommandWith(PublishCommand, expectedSnsParams)
  })
})
