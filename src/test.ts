import { loadContainer } from "./lib/docker";
import { readFileSync } from 'fs'

const executable = readFileSync(`${__dirname}/../util/http_server/http_server_base64.txt`)

loadContainer(executable.toString(), 'abcd')
  .catch(e => console.log(e))