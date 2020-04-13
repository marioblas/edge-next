// See discussion https://github.com/zeit/next.js/discussions/11784
// See example
import http from "http"
import fetch from "isomorphic-unfetch"
import listen from "test-listen"
import { apiResolver } from "next/dist/next-server/server/api-utils"

import handler from '../../../../pages/api/content/[type]'


describe('Integrations tests for page-service endpoint', () => {
  let server
  let url

  beforeAll(async done => {
    server = http.createServer((req, res) => apiResolver(req, res, undefined, handler))
    url = await listen(server)
    
    done()
  })

  afterAll(done => {
    server.close(done)
  })

  test('Should return 405 if required query string is missing', async () => {
    const response = await fetch(url)
    expect(response.status).toBe(405)
  })

  test('Should return page details given valid link address', async () => {
    const urlToBeUsed = new URL(url)
    const params = { type: 'post' }
    Object.keys(params).forEach(key => urlToBeUsed.searchParams.append(key, params[key]))

    const response = await fetch(urlToBeUsed.href)
    const jsonResult = await response.json()

    expect(response.status).toBe(200)
    expect(jsonResult).toMatchObject({
      data: expect.any(Array),
      page: expect.any(Number),
      pageSize: expect.any(Number)
    })
  })
})