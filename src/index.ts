import { bootApi } from './lib/routes'
const { API_PORT, LOWER_PORT_BOUND, UPPER_PORT_BOUND } = process.env

bootApi({
  port: Number(API_PORT),
  lowerPortBound: Number(LOWER_PORT_BOUND),
  upperPortBound: Number(UPPER_PORT_BOUND)
})

console.log(`Smart Contract Docker Engine listening on Port ${API_PORT}`)
