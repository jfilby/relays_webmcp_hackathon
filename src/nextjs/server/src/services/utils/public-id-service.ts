import { randomBytes } from 'crypto'

export class PublicIdService {

  // Consts
  clName = 'PublicIdService'

  // Length of the random hash portion (hex characters)
  hashLength = 10

  // Maximum length of the readable slug portion
  slugMaxLength = 50

  // Code
  // Generate a public id: an optional readable slug from text (e.g. a title)
  // plus a short random hash, e.g. 'my-first-post-3f9a2b7c1d'. Without text,
  // just the hash.
  static generate(text: string | undefined | null): string {

    const hash =
      randomBytes(5).toString('hex')   // 10 hex chars

    const service = new PublicIdService()
    const slug = service.slugify(text)

    return slug !== '' ? `${slug}-${hash}` : hash
  }

  // Lowercase, collapse non-alphanumerics into single hyphens, trim, cap at
  // the max length. Mirrors the SQL backfill in scripts/backfill-public-ids.sql
  private slugify(text: string | undefined | null): string {

    if (text == null) {
      return ''
    }

    const slug = text
      .substring(0, this.slugMaxLength + 20)   // oversample so trailing separator runs get trimmed below
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, this.slugMaxLength)
      .replace(/-+$/g, '')

    return slug
  }
}
