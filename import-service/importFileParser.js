import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'
import { SQSClient, SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import { parse } from 'csv-parse'

const clientS3 = new S3Client({ region: process.env.AWS_REGION })
const clientSQS = new SQSClient({ region: process.env.AWS_REGION })

const getData = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  }
  const result = (
    await clientS3.send(
      new GetObjectCommand(params)
    )
  )

  return new Promise((resolve, reject) => {
    const items = []
    result.Body.pipe(parse({ columns: true}))
      .on('data', (data) => items.push(data))
      .on('error', (error) => reject(data))
      .on('end', () => {
        return resolve(items)
      })
  })
}

const sendMessage = async (data) => {
  const params = {
    Entries: data.map((item) => ({ Id: randomUUID(), MessageBody: JSON.stringify(item) })),
    QueueUrl: process.env.CATALOG_ITEMS_QUEUE_URL
  }

  await clientSQS.send(new SendMessageBatchCommand(params))
}

const moveFile = async (bucketName, key) => {
  const copyParams = {
    CopySource: `${bucketName}/${key}`,
    Bucket: bucketName,
    Key: key.replace('uploaded/', 'parsed/')
  }
  await clientS3.send(new CopyObjectCommand(copyParams))

  const deleteParams = {
    Bucket: bucketName,
    Key: key
  }
  await clientS3.send(new DeleteObjectCommand(deleteParams))
}

const handler = async (event) => {
  console.log(event)

  for (const record of event?.Records) {
    const result = await getData(record.s3.bucket.name, record.s3.object.key)

    await sendMessage(result)

    await moveFile(record.s3.bucket.name, record.s3.object.key)
  }
}

export { handler }
