/**
 * Captures homepage screenshots of the live client sites for the work cards.
 *
 *   node scripts/capture-client-sites.mjs
 *
 * Uses the locally installed Chrome rather than downloading a Playwright browser.
 * Cookie banners are dismissed where they'd otherwise cover the hero.
 */
import { chromium } from 'playwright-core'
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

const OUT = path.join(process.cwd(), 'public', 'work')

const SITES = [
  {
    slug: 'explain-everything',
    url: 'https://explaineverything.com/',
    // Cookie/consent buttons vary; each site gets its own candidate list.
    dismiss: ['button:has-text("Accept")', 'button:has-text("Got it")', '#onetrust-accept-btn-handler'],
  },
  {
    slug: 'gbgb',
    url: 'https://www.gbgb.org.uk/',
    // Its consent bar is an anchor, not a button, and sits at the page foot.
    dismiss: ['a:has-text("Accept")', 'button:has-text("Accept")', '.cookie-accept'],
    // Fallback: hide anything that still overlays the hero.
    hide: ['[class*="cookie" i]', '[id*="cookie" i]', '[class*="consent" i]'],
  },
  {
    slug: 'port-praski',
    url: 'https://portpraski.pl/',
    dismiss: ['button:has-text("Akceptuj")', 'button:has-text("Zgadzam")', 'button:has-text("Accept")'],
  },
]

await mkdir(OUT, { recursive: true })

const browser = await chromium.launch({ executablePath: CHROME })

for (const site of SITES) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    // 1.5x rather than 2x: cards render at roughly 700px wide, so this is still
    // comfortably retina while keeping the files a fraction of the size.
    deviceScaleFactor: 1.5,
  })

  try {
    console.log(`→ ${site.url}`)
    await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 60_000 })

    // Let lazy images and above-the-fold animation settle.
    await page.waitForTimeout(3000)

    for (const selector of site.dismiss) {
      const button = page.locator(selector).first()
      if (await button.isVisible().catch(() => false)) {
        await button.click().catch(() => {})
        await page.waitForTimeout(800)
        break
      }
    }

    // Some consent bars survive a click, or reappear. Hide them outright.
    for (const selector of site.hide ?? []) {
      await page
        .evaluate((sel) => {
          document.querySelectorAll(sel).forEach((el) => {
            const style = getComputedStyle(el)
            // Only overlays — don't blank out ordinary in-flow content.
            if (style.position === 'fixed' || style.position === 'sticky') {
              el.remove()
            }
          })
        }, selector)
        .catch(() => {})
    }

    // Nudge the page to trigger scroll-linked reveals, then return to the top.
    await page.evaluate(() => window.scrollTo(0, 400))
    await page.waitForTimeout(600)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(600)

    // JPEG at high quality: a 1440x900 photographic screenshot is ~250KB here
    // versus 3-5MB as PNG, with no visible difference at display size.
    const file = path.join(OUT, `${site.slug}.jpg`)
    await page.screenshot({ path: file, type: 'jpeg', quality: 88 })

    const { size } = await stat(file)
    console.log(`  saved ${path.relative(process.cwd(), file)} (${Math.round(size / 1024)} KB)`)
  } catch (error) {
    console.error(`  FAILED ${site.slug}: ${error.message}`)
  } finally {
    await page.close()
  }
}

await browser.close()
console.log('\nDone.')
