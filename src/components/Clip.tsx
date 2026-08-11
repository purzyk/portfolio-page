/**
 * The moving equivalent of `Screen` — same 1px frame, same light-mode matte, so a clip
 * and a screenshot sit together in a case study without one looking like a different
 * kind of object.
 *
 * Autoplaying, muted, looping and inline. These are 20-second UI recordings standing in
 * for a screenshot that couldn't hold still, not films: there is nothing to listen to, no
 * reason to make the reader press play, and no reason to stop at the end. `playsInline`
 * matters on iOS, where a video without it hijacks the screen into the native player.
 *
 * `preload="metadata"` rather than `auto`: a case study can hold several clips, and
 * fetching all of them in full before the reader has scrolled to any is worse than a
 * moment's delay at the one they reach.
 *
 * No `controls`. A looping clip with a scrubber invites a click that pauses it on a
 * frame that means nothing out of context.
 */

interface ClipProps {
  src: string
  /**
   * Describes what the clip shows, for anyone who can't watch it — read out by screen
   * readers and shown if the file fails to load. Write it as the sentence you'd use to
   * describe the sequence, not a filename.
   */
  caption: string
  /** Poster frame, if one has been exported. Without it the first frame is the poster. */
  poster?: string
  /** Matches `Screen`, which defaults to 16/10; these recordings are 16/9. */
  ratio?: string
  className?: string
}

export function Clip({ src, caption, poster, ratio = '16 / 9', className = '' }: ClipProps) {
  return (
    <figure className={`my-7 ${className}`}>
      <div
        className='overflow-hidden border border-screen-frame bg-screen-matte p-[var(--screen-matte-pad)]'
        style={{ aspectRatio: ratio }}
      >
        <video
          src={src}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload='metadata'
          aria-label={caption}
          className='block h-full w-full object-cover object-left-top'
        >
          {/* Reached only if the browser can't play the file at all. */}
          <p>{caption}</p>
        </video>
      </div>

      <figcaption className='mt-2.5 font-mono text-meta text-ink-muted'>{caption}</figcaption>
    </figure>
  )
}
