// import { handler as importProductsFile } from './importProductsFile.js'
// import { handler as importFileParser } from './importFileParser.js'
import { handler as importProductsFile } from './importProductsFile-dist.js'
import { handler as importFileParser } from './importFileParser-dist.js'

process.env.AWS_PROFILE = 'personal'
process.env.S3_BUCKET_NAME = 'import-storage-epam-202303'
process.env.CATALOG_ITEMS_QUEUE_URL = 'https://sqs.us-east-1.amazonaws.com/142176105809/catalogItemsQueue'

const importProductsFileEvent = {
  queryStringParameters: {
    name: 'products'
  }
}

const importFileParserEvent = {
  Records: [
    {
      s3: {
        bucket: {
          name: process.env.S3_BUCKET_NAME
        },
        object: {
          key: 'uploaded/products.csv'
        }
      }
    }
  ]
}

console.log(await importProductsFile(importProductsFileEvent))
await importFileParser(importFileParserEvent)
