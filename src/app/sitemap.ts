import type { MetadataRoute } from 'next'
import { getCaseStudies } from '@/lib/content'
import { SITE_URL } from '@/lib/site'
import { WORK } from '@/lib/work'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const studies = await getCaseStudies()

  const workPages = WORK
    // The lead item's own /work/[slug] canonicalises to '/', already listed below —
    // listing both would put two URLs for the same page in the sitemap.
    .filter((item) => item.slug !== WORK[0]!.slug)
    .map((item) => ({ url: `${SITE_URL}/work/${item.slug}` }))

  const studyPages = studies.map((study) => ({ url: `${SITE_URL}/work/${study.slug}` }))

  return [{ url: SITE_URL }, { url: `${SITE_URL}/about` }, ...workPages, ...studyPages]
}
