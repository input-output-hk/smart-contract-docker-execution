import * as express from 'express'
import { findContainerPort, loadContainer, unloadContainer } from './docker-api'
import * as bodyParser from 'body-parser'
import axios from 'axios'

export function bootApi({ port, lowerPortBound, upperPortBound }: { port: number, lowerPortBound: number, upperPortBound: number }) {
  const app = express()
  app.use(bodyParser.json())

  app.post('/loadContainer', async (req, res) => {
    const { contractAddress, executable } = req.body
    await loadContainer({ contractAddress, executable, lowerPortBound, upperPortBound })
    res.status(204).send()
  })

  app.post('/unloadContainer', async (req, res) => {
    const { contractAddress } = req.body
    await unloadContainer(contractAddress)
    res.status(204).send()
  })

  app.post('/execute', async (req, res) => {
    const { contractAddress, method, method_arguments } = req.body
    const associatedPort = await findContainerPort(contractAddress)

    if (associatedPort === 0) {
      return res.status(400).json({ error: 'Container not initialized. Call /loadContainer and try again' })
    }

    const result = await axios.post(`http://0.0.0.0:${associatedPort}`, { method, method_arguments })
    res.status(201).json({ data: result.data })
  })

  app.use(function (_req, res, _next) {
    res.status(404).send({ error: 'Route not found' })
  })

  return app.listen(port)
}