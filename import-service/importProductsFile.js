import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const client = new S3Client({ region: process.env.AWS_REGION })

const signS3URL = async (filename) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `uploaded/${filename}`,
    ContentType: 'text/csv'
  }
  const command = new PutObjectCommand(params);

  return await getSignedUrl(client, command, { expiresIn: 60 })
}

const handler = async (event) => {
  let result
  let statusCode = 200
  const filename = event?.queryStringParameters?.name

  console.log(event)

  if (!filename) {
    statusCode = 400
    result = '"name" query param is required.'
  }

  if (statusCode === 200) {
    try {
      result = {
        url: await signS3URL(filename),
      }
    } catch (err) {
      statusCode = 500
      console.log('Error', err)
    }
  }

  return {
    statusCode,
    body: (result && statusCode === 200) ? JSON.stringify(result) : undefined
  }
}

export { handler }
