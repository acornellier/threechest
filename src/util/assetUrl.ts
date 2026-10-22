let assetBaseUrl = ''

/** Lets the embedded RouteMap load images from threechest.io instead of the host page's origin. */
export function setAssetBaseUrl(baseUrl: string) {
  assetBaseUrl = baseUrl.replace(/\/$/, '')
}

export const assetUrl = (path: string) => `${assetBaseUrl}${path}`
