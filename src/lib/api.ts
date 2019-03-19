import * as express from 'express'
import { findContainerPort, loadContainer, unloadContainer } from './docker-api'
import * as bodyParser from 'body-parser'
import axios from 'axios'

export function configureApi ({ port, lowerPortBound, upperPortBound }: { port: number, lowerPortBound: number, upperPortBound: number }) {
  const app = express()
  app.use(bodyParser.json({ limit: '50mb' }))

  app.post('/loadContainer', async (req, res) => {
    const { contractAddress, executable } = req.body
    if (!contractAddress || !executable) {
      return res.status(400).json({ error: 'Missing parameters in request body' })
    }

    await loadContainer({ contractAddress, executable, lowerPortBound, upperPortBound })
    res.status(204).json({})
  })

  app.post('/unloadContainer', async (req, res) => {
    const { contractAddress } = req.body
    if (!contractAddress) {
      return res.status(400).json({ error: 'contractAddress missing from request body' })
    }

    await unloadContainer(contractAddress)
    res.status(204).json({})
  })

  app.post('/execute', async (req, res) => {
    const { contractAddress, method, methodArguments } = req.body
    if (!contractAddress || !method || !methodArguments) {
      return res.status(400).json({ error: 'Missing parameters in request body' })
    }

    const associatedPort = await findContainerPort(contractAddress)

    if (associatedPort === 0) {
      return res.status(400).json({ error: 'Container not initialized. Call /loadContainer and try again' })
    }

    const result = await axios.post(`http://0.0.0.0:${associatedPort}`, {
      method,
      method_arguments: methodArguments
    })

    res.status(201).json({ data: result.data })
  })

  app.use(function (_req, res, _next) {
    res.status(404).send({ error: 'Route not found' })
  })

  return app.listen(port)
}

export function bootApi () {
  const { API_PORT, LOWER_PORT_BOUND, UPPER_PORT_BOUND } = process.env

  if (!API_PORT || !LOWER_PORT_BOUND || !UPPER_PORT_BOUND) {
    throw new Error('Missing environment config')
  }

  configureApi({
    port: Number(API_PORT),
    lowerPortBound: Number(LOWER_PORT_BOUND),
    upperPortBound: Number(UPPER_PORT_BOUND)
  })

  console.log(`Smart Contract Docker Engine listening on Port ${API_PORT}`)
}
