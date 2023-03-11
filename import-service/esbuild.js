import { build } from 'esbuild'

;(async () => {
  const props = {
    // minify: true,
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node18',
    external: ['@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner']
  }
  await build({
    ...props,
    entryPoints: ['importProductsFile.js'],
    outfile: 'importProductsFile-dist.js'
  })
  await build({
    ...props,
    entryPoints: ['importFileParser.js'],
    outfile: 'importFileParser-dist.js'
  })
})()
