import random from 'lodash/random'

// Array of available nodes to connect to
export const nodes = [import.meta.env.VITE_NODE_1, import.meta.env.VITE_NODE_2, import.meta.env.VITE_NODE_3]

const getNodeUrl = () => {
  const randomIndex = random(0, nodes.length - 1)
  return nodes[randomIndex]
}

export default getNodeUrl
