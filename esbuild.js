import { build } from 'esbuild'

;(async () => {
  const props = {
    bundle: false,
    format: 'esm',
    platform: 'node'
  }
  await build({
    ...props,
    entryPoints: ['getProductsList.js'],
    outfile: 'getProductsList-dist.js'
  })
  await build({
    ...props,
    entryPoints: ['getProductsById.js'],
    outfile: 'getProductsById-dist.js'
  })
  await build({
    ...props,
    entryPoints: ['createProduct.js'],
    outfile: 'createProduct-dist.js'
  })
})()