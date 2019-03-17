import * as Docker from 'dockerode'

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

export async function buildImage(executable: string, contractAddress: string) {
  const docker = initializeDockerClient()
  let stream = await docker.buildImage(`${__dirname}/../../DockerfileContracts`)

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, res) => err ? reject(err) : resolve(res));
  })
}

export async function loadContainer(executable: string, contractAddress: string) {
  const containerRunning = await isContainerRunning(contractAddress)
  if (containerRunning) return

}