import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en','es','sr'],
  defaultLocale: 'en',
  localeDetection: true
})

export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] }
