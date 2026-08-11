import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import type { Element, Root } from 'hast'
import { visit } from 'unist-util-visit'

/**
 * Markdown → HTML, rendered on the server.
 *
 * No classes are emitted: the output is plain semantic HTML styled entirely by
 * element selectors under `.prose` in globals.css. That keeps the renderer
 * ignorant of the design system, and means a token change restyles every case
 * study without touching this file.
 */

/**
 * Wrap tables in a scroll container.
 *
 * A table wide enough to be worth having is wider than a 65-character prose
 * measure. Without a wrapper it either forces the page to scroll horizontally or
 * gets crushed; with one it scrolls inside its own box.
 */
function wrapTables() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'table' || !parent || index === undefined) return

      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [node],
      }
    })
  }
}

/**
 * Turn `![alt](src)` followed by nothing else into a figure with a caption.
 *
 * A `.mp4` or `.webm` source becomes a `<video>` instead of an `<img>`. Authors write the
 * same image syntax either way, because from the content's point of view a clip is a
 * screenshot that couldn't hold still — the difference is a rendering concern, not
 * something worth a second syntax. The attributes match the `Clip` component: muted,
 * looping, inline autoplay, no controls.
 */
const VIDEO = /\.(mp4|webm)$/i

function imagesToFigures() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'p' || !parent || index === undefined) return

      // Only a paragraph that is nothing but one image becomes a figure —
      // an inline image inside a sentence should stay inline.
      if (node.children.length !== 1) return

      const [only] = node.children
      if (!only || only.type !== 'element' || only.tagName !== 'img') return

      const alt = typeof only.properties?.alt === 'string' ? only.properties.alt : ''
      const src = typeof only.properties?.src === 'string' ? only.properties.src : ''

      const media: Element = VIDEO.test(src)
        ? {
            type: 'element',
            tagName: 'video',
            properties: {
              src,
              autoPlay: true,
              muted: true,
              loop: true,
              playsInline: true,
              preload: 'metadata',
              // Not `alt`: on a video the caption text is exposed as the label.
              ariaLabel: alt || undefined,
            },
            // Shown only if the browser can't play the file at all.
            children: alt ? [{ type: 'text', value: alt }] : [],
          }
        : only

      parent.children[index] = {
        type: 'element',
        tagName: 'figure',
        properties: {},
        children: [
          media,
          ...(alt
            ? [
                {
                  type: 'element' as const,
                  tagName: 'figcaption',
                  properties: {},
                  children: [{ type: 'text' as const, value: alt }],
                },
              ]
            : []),
        ],
      }
    })
  }
}

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm) // tables, strikethrough, task lists
  .use(remarkRehype)
  .use(rehypeSlug) // heading ids, for deep links
  .use(wrapTables)
  .use(imagesToFigures)
  .use(rehypePrettyCode, {
    // Dual themes: Shiki emits both and CSS variables pick one at runtime, so
    // code blocks follow the site theme without a client-side re-highlight.
    theme: { light: 'github-light', dark: 'github-dark' },
    keepBackground: false, // the design system's --color-code-bg wins
  })
  .use(rehypeStringify)

export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await processor.process(markdown)
  return String(file)
}

/** ~200 wpm, rounded up. Good enough to set expectations, not a promise. */
export function readingMinutes(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}
