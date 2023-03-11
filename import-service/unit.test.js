import { jest } from '@jest/globals'

const mockUrl = 'https://url'

jest.unstable_mockModule('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue(mockUrl)
}))

const { handler: importProductsFile } = await import('./importProductsFile')
const { handler: importFileParser } = await import('./importFileParser')

describe('#importProductsFile', () => {
  test('should return presign url to upload a csv file when importProductsFile lambda is called', async () => {
    const event = {
      queryStringParameters: {
        name: 'products.csv'
      }
    }
    const lambdaResponse = await importProductsFile(event)
    console.log(lambdaResponse)
    const parseBody = JSON.parse(lambdaResponse.body)

    expect(lambdaResponse.statusCode).toEqual(200)
    expect(parseBody.url).toEqual(mockUrl)
  })
})
