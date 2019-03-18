import { loadContainer, buildImage } from "./lib/docker";
import { readFileSync } from 'fs'

const executable = readFileSync(`${__dirname}/../util/http_server/http_server_base64.txt`)
console.log(executable.toString())

buildImage()
  .then(() => console.log('build successful'))
  .then(() => loadContainer(executable.toString(), 'abcd'))
  .catch(e => console.log(e))