import * as Docker from 'dockerode'
import { writeFile, chmod } from 'fs'

const BASE_IMAGE = 'plutus-base-execution-runtime'

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
export async function buildImage() {
  const docker = initializeDockerClient()
  const buildOpts: any = {
    context: `${__dirname}/../..`,
    src: [`DockerfileContracts`]
  }

  let stream = await docker.buildImage(buildOpts, { t: BASE_IMAGE, dockerfile: 'DockerfileContracts' })

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err: any, res: any) => err ? reject(err) : resolve(res));
  })
}

export function writeExecutable(executable: string, executablePath: string) {
  const executableData = Buffer.from(executable, 'base64')

  return new Promise((resolve, reject) => {
    writeFile(executablePath, executableData, (error) => {
      if (error) return reject(error)

      // TODO: Remove this hack, actually sort out the permission with docker
      chmod(executablePath, '777', (error) => {
        if (error) return reject(error)
        resolve()
      })
    })
  })
}

export async function loadContainer(executable: string, contractAddress: string) {
  const containerRunning = await isContainerRunning(contractAddress)
  if (containerRunning) return

  const executablePath = `${__dirname}/${contractAddress}`
  await writeExecutable(executable, executablePath)

  // 2. Start the container, with a volume to the executable on the fs [need to manage port mappings]
  const docker = initializeDockerClient()
  const containerOpts: any = {
    Image: BASE_IMAGE,
    ExposedPorts: { '3333/tcp': {} },
    PortBindings: { '8000/tcp': [{ 'HostPort': '3333' }] },
    HostConfig: {
      AutoRemove: true,
      Binds: [
        `${executablePath}:/plutus/executable`
      ]
    }
  }

  const container = await docker.createContainer(containerOpts)
  container.attach({ stream: true, stdout: true, stderr: true }, function (_, stream) {
    stream.pipe(process.stdout);
  })

  return container.start()
}