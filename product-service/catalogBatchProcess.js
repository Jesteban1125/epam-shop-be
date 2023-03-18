import { randomUUID } from 'crypto'
import {
  DynamoDBClient,
  TransactWriteItemsCommand
} from '@aws-sdk/client-dynamodb'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { marshall } from '@aws-sdk/util-dynamodb'

const clientDB = new DynamoDBClient({ region: process.env.AWS_REGION })
const clientSNS = new SNSClient({ region: process.env.AWS_REGION })

const getProductParams = (records) => {
  return records.map((product) => ({
    Put: {
      TableName: process.env.PRODUCTS_TABLE_NAME,
      Item: marshall({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price
      })
    }
  }))
}

const getStockParams = (records) => {
  return records.map((product) => ({
    Put: {
      TableName: process.env.STOCKS_TABLE_NAME,
      Item: marshall({
        product_id: product.id,
        count: product.count
      })
    }
  }))
}

const importProducts = async (records) => {
  records = records.map((x) => JSON.parse(x.body))
  records = records.map((x) => ({ ...x, id: x.id || randomUUID() }))
  const paramsDB = {
    TransactItems: [...getProductParams(records), ...getStockParams(records)]
  }

  await clientDB.send(new TransactWriteItemsCommand(paramsDB))

  const paramsSNS = {
    MessageAttributes: {
      count: { DataType: 'Number', StringValue: records.length }
    },
    Message: `Products created. (Number of products: ${records.length})`,
    TopicArn: process.env.CREATE_PRODUCT_TOPIC_ARN
  }

  await clientSNS.send(new PublishCommand(paramsSNS))
}

const handler = async (event) => {
  console.log(event)

  await importProducts(event.Records)
}

export { handler }
