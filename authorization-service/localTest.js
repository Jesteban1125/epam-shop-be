import * as dotenv from 'dotenv'
// import { handler as basicAuthorizer } from './basicAuthorizer-dist.js'
import { handler as basicAuthorizer } from './basicAuthorizer.js'

dotenv.config()

process.env.AWS_PROFILE = 'personal'

const basicAuthorizerEvent = {
  headers: {
    authorization: `Basic ${process.env.TOKEN}`
  }
}

// console.log(await basicAuthorizer(basicAuthorizerEvent))
