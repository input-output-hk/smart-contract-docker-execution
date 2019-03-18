import { expect } from 'chai'
import { loadContainer, initializeDockerClient, unloadContainer } from '../lib/docker'
import axios from 'axios'
import { readFileSync } from 'fs'
const executable = readFileSync(`${__dirname}/../../test/smart_contract_server_mock/smart_contract_server_base64.txt`)

describe('dockerInteractions', () => {
  afterEach(async () => {
    const docker = initializeDockerClient()
    const containers = await docker.listContainers()
    await Promise.all(containers.map(container => docker.getContainer(container.Id).kill()))
  })

  describe('load', () => {
    it('successfully boots a container that accepts HTTP on the returned port', async () => {
      const { port } = await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const result = await axios.post(`http://localhost:${port}`, {
        method: 'add',
        method_arguments: ['1', '2']
      })

      expect(result.status).to.eql(200)
    })

    it('does not boot a second container when a container with that address is already running', async () => {
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      expect(containers.length).to.eql(1)
    })
  })

  describe('unload', () => {
    it('successfully terminates an instance for an address', async () => {
      await loadContainer({ executable: executable.toString(), contractAddress: 'abcd', lowerPortBound: 10000, upperPortBound: 11000 })
      await unloadContainer('abcd')

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      expect(containers.length).to.eql(0)
    })

    it('resolves successfully if an instance for an address not exist', async () => {
      await unloadContainer('abcd')

      const docker = initializeDockerClient()
      const containers = await docker.listContainers()
      expect(containers.length).to.eql(0)
    })
  })
})
