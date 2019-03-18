import * as Docker from 'dockerode'
import { writeFile } from 'fs'

export function initializeDockerClient() {
  return new Docker({ socketPath: '/var/run/docker.sock' })
}

export async function isContainerRunning(contractAddress: string): Promise<boolean> {
  const docker = initializeDockerClient()
  const container = docker.getContainer(contractAddress)

  return container.inspect()
    .then(() => true)
    .catch(() => false)
}

// TODO: Call this on application boot such that we can guarantee its existence
export async function buildImage(dockerfilePath: string, imageName: string) {
  const docker = initializeDockerClient()

  // TODO: Make more robust
  const dockerfileRelativePath = dockerfilePath.split('smart-contract-docker-execution')[1]

  const buildOpts: any = {
    context: `${__dirname}/../..`,
    src: [dockerfileRelativePath, 'dist']
  }

  let stream = await docker.buildImage(buildOpts, { t: imageName, dockerfile: dockerfileRelativePath })

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err: any, res: any) => err ? reject(err) : resolve(res));
  })
}

export function writeExecutable(executable: string, executablePath: string) {
  const executableData = Buffer.from(executable, 'base64')

  return new Promise((resolve, reject) => {
    writeFile(executablePath, executableData, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

export function writeDockerfile(executablePath: string) {
  const dockerfile = `
    FROM ubuntu:18.04
    RUN ["mkdir", "/plutus"]
    COPY ${executablePath} /plutus/executable
    RUN chmod +x /plutus/executable
    CMD /plutus/executable
  `

  return new Promise((resolve, reject) => {
    writeFile(`${executablePath}-Dockerfile`, dockerfile, (error) => {
      if (error) return reject(error)
      resolve()
    })
  })
}

export async function loadContainer(executable: string, contractAddress: string) {
  const containerRunning = await isContainerRunning(contractAddress)
  if (containerRunning) return

  const executablePath = `${__dirname}/${contractAddress}`
  const relativeExecutablePath = `dist/lib/${contractAddress}`

  await writeExecutable(executable, executablePath)
  await writeDockerfile(relativeExecutablePath)
  await buildImage(`${executablePath}-Dockerfile`, `i-${contractAddress}`)

  const docker = initializeDockerClient()
  const containerOpts: any = {
    Image: `i-${contractAddress}`,
    ExposedPorts: { '3333/tcp': {} },
    PortBindings: { '8000/tcp': [{ 'HostPort': '3333' }] },
    HostConfig: {
      AutoRemove: true,
    }
  }

  const container = await docker.createContainer(containerOpts)
  return container.start()
}