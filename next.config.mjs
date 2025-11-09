import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] }
})

/** @type {import('next').NextConfig} */
const nextConfig = { pageExtensions: ['ts','tsx','mdx'] }

export default withMDX(nextConfig)
