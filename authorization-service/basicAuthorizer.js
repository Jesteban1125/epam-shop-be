const handler = async (event) => {
  console.log(event)
  const token = event.headers?.authorization
  let isAuthorized = false

  // if (!token) {
  //   return { statusCode: 401 }
  // }

  if (token) {
    let decodeToken = Buffer.from(token.replace('Basic ', ''), 'base64')
    decodeToken = decodeToken.toString().split(':').join('=')
    const credential = process.env.CREDENTIAL

    // if (decodeToken !== credential) {
    //   return { statusCode: 403 }
    // }

    if (decodeToken === credential) {
      isAuthorized = true
    }
  }

  return { isAuthorized }
}

export { handler }
