import createMDX from '@next/mdx'

const withMDX = createMDX({
  // bez remark/rehype plugina za sada
  extension: /\.mdx?$/
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts','tsx','mdx'],
  reactCompiler: true
}

export default withMDX(nextConfig)
