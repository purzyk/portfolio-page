import Image from 'next/image'

/**
 * The frame every UI screenshot sits in.
 *
 * No device chrome — no title bar, no traffic lights, no rounded corners. A 1px
 * frame, plus (in light only) a 10px ink matte so dark UI screenshots don't read as
 * holes punched in a white page. Dark mode needs no matte: the page is already
 * darker than the screenshots.
 *
 * `object-position: left top` is load-bearing. These are UI captures, and centring
 * them crops the navigation off both sides.
 */

interface ScreenProps {
  src: string
  alt: string
  width: number
  height: number
  /**
   * `fill` absorbs remaining flex height — the desktop work pane, where the window is
   * a fixed 840px and nothing scrolls. Below that breakpoint the window unpins, so
   * `fill` also carries an explicit aspect ratio that only applies under 1100px.
   *
   * `ratio` is the plain always-a-ratio case (figures, the mobile detail page).
   */
  mode?: 'fill' | 'ratio'
  ratio?: string
  priority?: boolean
  className?: string
}

export function Screen({
  src,
  alt,
  width,
  height,
  mode = 'ratio',
  ratio = '16 / 10',
  priority = false,
  className = '',
}: ScreenProps) {
  return (
    <div
      className={[
        'min-h-0 overflow-hidden border border-screen-frame bg-screen-matte',
        // The matte is padding, and it's 0 in dark — hence the custom property
        // rather than two sets of classes.
        'p-[var(--screen-matte-pad)]',
        // Ratio below the fixed-window breakpoint, flex above it. One element either
        // way: rendering two frames would ship the same image twice.
        mode === 'fill' ? 'aspect-[16/10] lg:aspect-auto lg:flex-1' : '',
        className,
      ].join(' ')}
      style={mode === 'ratio' ? { aspectRatio: ratio } : undefined}
    >
      {/*
        object-cover crops to fill the frame, anchored top-left so a UI capture's nav
        doesn't get cropped off both sides. Below sm, object-contain instead: the whole
        capture fits the width, letterboxed in the matte rather than requiring a scroll
        to see the rest of it.
      */}
      <div className='h-full w-full'>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className='block h-full w-full object-cover object-left-top max-sm:object-contain'
        />
      </div>
    </div>
  )
}
