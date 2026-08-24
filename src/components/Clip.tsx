'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * The moving equivalent of `Screen` — same 1px frame, same light-mode matte, so a clip
 * and a screenshot sit together in a case study without one looking like a different
 * kind of object.
 *
 * Autoplaying, muted, looping and inline. These are short UI recordings standing in
 * for a screenshot that couldn't hold still, not films: there is nothing to listen to, no
 * reason to make the reader press play, and no reason to stop at the end. `playsInline`
 * matters on iOS, where a video without it hijacks the screen into the native player.
 *
 * No `controls`. A looping clip with a scrubber invites a click that pauses it on a
 * frame that means nothing out of context.
 *
 * Client component for one reason: a loading state over the poster while the clip
 * buffers. Without it, a poster and a still `Screen` are indistinguishable — a reader
 * has no way to tell "this is a video, wait a moment" from "this is just a screenshot",
 * and a heavier clip on a slow connection reads as broken rather than loading.
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
  /**
   * `fill` absorbs remaining flex height — the desktop work pane, where the window is a
   * fixed 840px and nothing scrolls. Below that breakpoint the window unpins, so `fill`
   * also carries a fixed 16/9 box that only applies under 1100px. `ratio` is the plain
   * always-a-ratio case, matching `Screen`.
   */
  mode?: 'fill' | 'ratio'
  /**
   * Whether the clip is the thing on screen the moment its pane mounts (the work-list
   * hero) versus something a reader scrolls to (a case-study body clip). Only the
   * former is worth fetching in full up front — `preload="metadata"` for everything
   * else, since a case study can hold several clips and loading all of them before the
   * reader has scrolled to any is worse than a moment's delay at the one they reach.
   */
  eager?: boolean
  className?: string
}

export function Clip({
  src,
  caption,
  poster,
  ratio = '16 / 9',
  mode = 'ratio',
  eager = false,
  className = '',
}: ClipProps) {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // A plain `onCanPlay` prop misses a video that's already `canplay`-ready by the
  // time this effect runs — a warm browser cache fires the event before React has
  // attached its listener, and the indicator is then stuck showing "loading" forever
  // on a clip that finished instantly. Checking `readyState` up front covers that
  // case; the native listeners cover the normal async one. `progress` reads real
  // buffered-bytes-over-duration, not a fake animation — `duration` is only known
  // once metadata has loaded, so it's re-read on every tick rather than captured once.
  useEffect(() => {
    const el = videoRef.current
    if (!el) return

    const updateProgress = () => {
      if (!el.buffered.length || !Number.isFinite(el.duration) || el.duration <= 0) return
      const bufferedEnd = el.buffered.end(el.buffered.length - 1)
      setProgress(Math.min(100, Math.round((bufferedEnd / el.duration) * 100)))
    }

    if (el.readyState >= 3) {
      setLoading(false)
      return
    }

    updateProgress()
    const onReady = () => setLoading(false)
    el.addEventListener('canplay', onReady)
    el.addEventListener('progress', updateProgress)
    el.addEventListener('loadedmetadata', updateProgress)
    return () => {
      el.removeEventListener('canplay', onReady)
      el.removeEventListener('progress', updateProgress)
      el.removeEventListener('loadedmetadata', updateProgress)
    }
  }, [])

  const video = (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload={eager ? 'auto' : 'metadata'}
      aria-label={caption}
      className='block h-full w-full object-cover object-left-top'
    >
      {/* Reached only if the browser can't play the file at all. */}
      <p>{caption}</p>
    </video>
  )

  // Centred over the frame rather than tucked in a corner — a corner badge reads as a
  // minor annotation, easy to miss against a busy poster; the point here is to be the
  // first thing noticed, before anyone has time to wonder whether the clip is broken.
  const loadingIndicator = loading && (
    <div
      aria-hidden
      className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-page/85'
    >
      <span className='font-mono text-label-sm uppercase tracking-[0.18em] text-ink-muted'>
        loading
      </span>
      <div className='h-[2px] w-20 overflow-hidden bg-border'>
        <div
          className='h-full bg-accent transition-[width] duration-200'
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )

  // `fill` mirrors `Screen` exactly — a single bordered box that's a direct flex
  // child of the pane, so it can absorb the pane's remaining height. No figure
  // wrapper here: nesting one would break the flex chain `lg:flex-1` relies on.
  if (mode === 'fill') {
    return (
      <div
        className={[
          'relative overflow-hidden border border-screen-frame bg-screen-matte p-[var(--screen-matte-pad)]',
          'aspect-[16/9] lg:aspect-auto lg:flex-1',
          className,
        ].join(' ')}
      >
        {video}
        {loadingIndicator}
      </div>
    )
  }

  return (
    <div
      className={[
        'relative overflow-hidden border border-screen-frame bg-screen-matte p-[var(--screen-matte-pad)]',
        className,
      ].join(' ')}
      style={{ aspectRatio: ratio }}
    >
      {video}
      {loadingIndicator}
    </div>
  )
}
