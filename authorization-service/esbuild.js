import { build } from 'esbuild'

;(async () => {
  const props = {
    bundle: false,
    format: 'esm',
    platform: 'node'
  }
  await build({
    ...props,
    entryPoints: ['basicAuthorizer.js'],
    outfile: 'basicAuthorizer-dist.js'
  })
})()