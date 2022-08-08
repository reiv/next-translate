const specFileOrFolderRgx =
  /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/

export const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g

export const defaultLoader =
  '(l, n) => import(`@next-translate-root/locales/${l}/${n}`).then(m => m.default)'

export function getDefaultAppJs(hasLoadLocaleFrom: boolean) {
  return `
  import i18nConfig from '@next-translate-root/i18n'
  import appWithI18n from 'next-translate/appWithI18n'

  function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
  }

  export default appWithI18n(MyApp, {
    ...i18nConfig,
    skipInitialProps: true,
    isLoader: true,
    ${overwriteLoadLocales(hasLoadLocaleFrom)}
  })
`
}

export function overwriteLoadLocales(exist: boolean): string {
  if (exist) return ''
  return `loadLocaleFrom: ${defaultLoader},`
}

export function hasExportName(data: string, name: string) {
  return Boolean(
    data.match(
      new RegExp(`export +(const|var|let|async +function|function) +${name}`)
    ) ||
      data.match(
        new RegExp(`export\\s*\\{[^}]*(?<!\\w)${name}(?!\\w)[^}]*\\}`, 'm')
      )
  )
}

export function isPageToIgnore(pageFilePath: string) {
  const fileName = pageFilePath.substring(pageFilePath.lastIndexOf('/') + 1)
  return (
    pageFilePath.startsWith('/api/') ||
    pageFilePath.startsWith('/_document.') ||
    pageFilePath.startsWith('/middleware.') ||
    fileName.startsWith('_middleware.') ||
    specFileOrFolderRgx.test(pageFilePath)
  )
}

export function hasHOC(rawData: string) {
  return false
}

function getRef(data: string) {
  const escapeRegex = (str: string) =>
    str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const ref = (data.replace(/ /g, '').match(`exportdefault*([^\\n|;]*)`) ||
    [])[1]
  const prevRef = (data.match(
    new RegExp(`${escapeRegex(ref)} += +(\\w+)($| |;|\\n)`)
  ) || [])[1]

  return prevRef || ref
}
