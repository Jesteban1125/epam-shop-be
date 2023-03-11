import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand
} from '@aws-sdk/client-s3'
import { parse } from 'csv-parse'

const client = new S3Client({ region: process.env.AWS_REGION })

const getData = async (bucketName, key) => {
  const params = {
    Bucket: bucketName,
    Key: key
  }
  const result = (
    await client.send(
      new GetObjectCommand(params)
    )
  )

  return new Promise((resolve, reject) => {
    const items = []
    result.Body.pipe(parse())
      .on('data', (data) => items.push(data))
      .on('error', (error) => reject(data))
      .on('end', () => {
        return resolve(items)
      })
  })
}

const printData = (data) => data.map((item) => console.log(item))

const moveFile = async (bucketName, key) => {
  const copyParams = {
    CopySource: `${bucketName}/${key}`,
    Bucket: bucketName,
    Key: key.replace('uploaded/', 'parsed/')
  }
  await client.send(new CopyObjectCommand(copyParams))

  const deleteParams = {
    Bucket: bucketName,
    Key: key
  }
  await client.send(new DeleteObjectCommand(deleteParams))
}

const handler = async (event) => {
  console.log(event)

  for (const record of event?.Records) {
    const result = await getData(record.s3.bucket.name, record.s3.object.key)

    printData(result)

    await moveFile(record.s3.bucket.name, record.s3.object.key)
  }
}

export { handler }
