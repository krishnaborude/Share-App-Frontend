import { parseFilename } from './contentDisposition'

describe('parseFilename', () => {
  test('parses RFC5987 filename*', () => {
    const cd = "attachment; filename*=UTF-8''%E2%82%AC%20rates.pdf"
    expect(parseFilename(cd)).toBe('€ rates.pdf')
  })

  test('parses quoted filename', () => {
    const cd = 'attachment; filename="report.pdf"'
    expect(parseFilename(cd)).toBe('report.pdf')
  })

  test('returns empty when not present', () => {
    expect(parseFilename('inline')).toBe('')
  })
})
