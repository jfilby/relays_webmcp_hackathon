export class PromptGuardClient {

  // Consts
  clName = 'PromptGuardClient'

  port = 3096

  get = 'GET'
  post = 'POST'

  // Code
  // NOTE: call is an internal function, don't call it directly
  async call(
    method: string,
    endpoint: string,
    body: string | undefined,
    debug: boolean = false,
    exceptionOnError: boolean = true) {

    // Debug
    const fnName = `${this.clName}.call()`

    if (debug === true) {
      console.log(`${fnName}: endpoint: ${endpoint}`)
    }

    // Try fetch
    try {
      const response = await
        fetch(
          endpoint,
          {
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            body: body  // `body` is already a JSON string; send verbatim
          })

      if (!response.ok &&
        exceptionOnError === true) {

        console.error(`${fnName}: status: ${response.status}: ` +
          `${response.statusText}`)

        const errorData = await response.json()

        console.error(`${fnName}: errorData: ` + JSON.stringify(errorData))
        throw new Error(`${fnName}: error: ${response.status} ` +
          `${response.statusText}`)
      }

      const data = await response.json()

      if (debug === true) {
        console.log(`${fnName}: response data:`, data)
      }

      return {
        status: true,
        message: undefined,
        data: data
      }

    } catch (error) {
      if (debug === true) {
        console.error(`${fnName}: error calling local API:`, error)
      }

      return {
        status: false,
        message: error as string
      }
    }
  }

  async check(
    text: string,
    debug: boolean = false,
    exceptionOnError: boolean = true) {

    // Debug
    const fnName = `${this.clName}.check()`

    // Define endpoint
    const endpoint = `http://localhost:${this.port}/check`

    // Define body
    const body = JSON.stringify({ text: text })

    // Call
    return await this.call(
      this.post,
      endpoint,
      body,
      debug,
      exceptionOnError)
  }

  async health(
    debug: boolean = false,
    exceptionOnError: boolean = true) {

    // Debug
    const fnName = `${this.clName}.health()`

    // Define endpoint
    const endpoint = `http://localhost:${this.port}/health`

    // Define body
    const body = undefined

    // Call
    return await this.call(
      this.get,
      endpoint,
      body,
      debug,
      exceptionOnError)
  }
}

// Singleton (module scoped, matching the codebase service pattern)
const promptGuardClient = new PromptGuardClient()

export { promptGuardClient }
