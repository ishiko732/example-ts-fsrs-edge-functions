import { FSRSVersion, generatorParameters } from 'ts-fsrs'

export const config = {
  runtime: 'edge'
}

const project = {
  name: 'ts-fsrs',
  version: FSRSVersion,
  repo: 'https://github.com/open-spaced-repetition/ts-fsrs',
  npm: 'https://www.npmjs.com/package/ts-fsrs',
  codecov: 'https://app.codecov.io/gh/open-spaced-repetition/ts-fsrs',
  default: generatorParameters()
} as const

export default function handler() {
  const data = {
    project
  }
  return new Response(JSON.stringify(data), {
    headers: {
      'content-type': 'application/json',
      'x-vercel-region': process.env.VERCEL_REGION || 'unknown'
    }
  })
}
