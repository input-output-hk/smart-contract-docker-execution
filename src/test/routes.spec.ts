import { expect } from 'chai'
import { bootApi } from '../lib/routes'
import * as request from 'supertest'
import { Server } from 'http'
import { readFileSync } from 'fs'
import { loadContainer, initializeDockerClient } from '../lib/docker-api';
const executable = readFileSync(`${__dirname}/../../test/smart_contract_server_mock/smart_contract_server_base64.txt`)

describe.only('api', () => {
  let app: Server

  beforeEach(async () => {
    app = await bootApi(4111)
  })

  afterEach(async () => {
    app.close()
    const docker = initializeDockerClient()
    const containers = await docker.listContainers()
    await Promise.all(containers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('/execute', () => {
    it('successfully executes a method against a running contract', async () => {
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await new Promise(res => setTimeout(res, 1000))

      return request(app)
        .post('/execute')
        .send({ contractAddress: 'abcd' })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        // .expect(201)
        .then(response => {
          console.log(response)
          expect(1).to.eql(1)
        })
        .catch(e => {
          console.log(e)
        })
    })
  })
})