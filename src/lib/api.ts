import * as express from 'express'
import * as bodyParser from 'body-parser'
import { RegisterRoutes } from './routes'

import './controllers/container'
const swaggerUiAssetPath = require('swagger-ui-dist').getAbsoluteFSPath()

export function configureApi ({ port }: { port: number }) {
  const app = express()
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use('/documentation', express.static(swaggerUiAssetPath))
  app.use('/documentation/swagger.json', (_, res) => {
    res.sendFile(process.cwd() + '/dist/swagger.json')
  })

  app.get('/docs', (_, res) => {
    res.redirect('/documentation?url=swagger.json')
  })

  RegisterRoutes(app)

  app.use(function (_req, res, _next) {
    res.status(404).send({ error: 'Route not found' })
  })

  return app.listen(port)
}

export function bootApi () {
  const { API_PORT, CONTAINER_LOWER_PORT_BOUND, CONTAINER_UPPER_PORT_BOUND } = process.env

  if (!API_PORT || !CONTAINER_LOWER_PORT_BOUND || !CONTAINER_UPPER_PORT_BOUND) {
    throw new Error('Missing environment config')
  }

  configureApi({
    port: Number(API_PORT)
  })

  console.log(`Smart Contract Docker Engine listening on Port ${API_PORT}`)
}
