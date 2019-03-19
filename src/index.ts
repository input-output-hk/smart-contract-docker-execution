const { API_PORT } = process.env
import { bootApi } from './lib/routes'
bootApi(Number(API_PORT))