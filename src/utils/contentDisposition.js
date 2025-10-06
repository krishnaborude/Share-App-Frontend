export function parseFilename(contentDisposition) {
  if (!contentDisposition || typeof contentDisposition !== 'string') return ''
  // Try RFC 5987: filename*=UTF-8''%e2%82%ac%20rates.pdf
  const rfcMatch = /filename\*=(?:UTF-8'')?([^;]+)/i.exec(contentDisposition)
  if (rfcMatch) {
    try {
      return decodeURIComponent(rfcMatch[1].replace(/"/g, ''))
    } catch (_) {
      return rfcMatch[1].replace(/"/g, '')
    }
  }

  // Try simple filename="name.pdf" or filename=name.pdf
  const match = /filename=(?:"?)([^";]+)/i.exec(contentDisposition)
  if (match) return match[1].replace(/"/g, '')
  return ''
}

export default parseFilename
