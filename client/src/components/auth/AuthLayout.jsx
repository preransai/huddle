import { Scissors } from 'lucide-react';
import halftoneBand from '../../assets/halftone-band.svg';
import { LogoMark } from '../layout/Logo';
import { ThemeToggle } from '../layout/TopBar';
import Misregister from '../ui/Misregister';
import { cn } from '../../utils/format';

// One fest poster taped to the notice board: a pink halftone masthead with the two-ink wordmark
// and a logo sticker, a line of small print, a "cut here" line, then the form.
// `aside` (the demo slip on /login) is pinned beside the poster on wide screens, below it otherwise.
export default function AuthLayout({ title, subtitle, children, footer, aside }) {
  return (
    <main
      className={cn(
        'grid min-h-dvh grid-cols-[minmax(0,540px)] content-start justify-center px-4 pt-16 pb-8',
        // poster + slip side by side from 1000px (the slip needs the room), stacked below that
        aside ? 'sm:max-[999px]:pt-14 min-[1000px]:grid-cols-[540px_300px]' : 'sm:pt-14'
      )}
    >
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <div className="plate plate-pink relative border-2 border-line bg-sheet [--plate-r:-0.2deg] [--plate-x:5px] [--plate-y:5px] max-sm:mr-1.5 sm:[--plate-x:7px] sm:[--plate-y:7px]">
        <span
          className="tape -top-[11px] -left-3.5 h-[22px] w-[72px] -rotate-32 sm:-left-[34px] sm:h-[26px] sm:w-24"
          aria-hidden="true"
        />
        <span
          className="tape -top-[11px] -right-3.5 h-[22px] w-[72px] rotate-30 sm:-right-[34px] sm:h-[26px] sm:w-24"
          aria-hidden="true"
        />

        <div className="relative isolate h-[156px] overflow-hidden border-b-2 border-line sm:h-[196px]">
          <img
            src={halftoneBand}
            alt=""
            className="halftone absolute inset-0 -z-10 size-full object-cover object-[right_top]"
          />
          <span
            className="absolute top-3.5 right-3.5 flex size-[62px] rotate-[9deg] items-center justify-center rounded-full border-2 border-riso-black bg-paper shadow-[0_0_0_5px_#fff,0_0_0_7px_#141416] sm:top-5 sm:right-[22px] sm:size-[84px]"
            aria-hidden="true"
          >
            <LogoMark className="h-8 w-10 sm:h-[45px] sm:w-14" />
          </span>
          <p className="masthead-word type-poster absolute bottom-2 left-3 sm:bottom-2.5 sm:left-5">
            <span className="sr-only">Huddle</span>
            <Misregister aria-hidden="true">huddle</Misregister>
          </p>
        </div>

        <div className="px-[18px] pt-[18px] pb-6 sm:px-8 sm:pt-5 sm:pb-7">
          <p className="type-strap">The notice board for everyone you know on campus.</p>
          <p className="mt-2.5 type-meta text-ink-2">
            <span className="whitespace-nowrap">Photos, up to four a post</span> ·{' '}
            <span className="whitespace-nowrap">likes, comments &amp; @mentions</span> ·{' '}
            <span className="whitespace-nowrap">live notifications</span>
          </p>

          {/* perforated cut line between the poster and the form */}
          <div className="-mx-[18px] my-[18px] flex items-center gap-2 text-ink-3 sm:-mx-8 sm:my-5" aria-hidden="true">
            <Scissors className="ml-3 size-[18px] shrink-0 -rotate-90" />
            <span className="flex-1 border-t-2 border-dashed border-ink-3" />
          </div>

          <Misregister as="h1" className="type-h1 text-[34px] sm:text-[38px]">
            {title}
          </Misregister>
          {subtitle && <p className="mt-1.5 text-[15px] text-ink-2">{subtitle}</p>}
          <div className="mt-[18px]">{children}</div>
          {footer && <div className="mt-5 text-[14.5px] text-ink-2">{footer}</div>}
        </div>
      </div>

      {aside}

      <p className="col-span-full mt-10 text-center text-xs text-ink-3">&copy; 2026 Huddle</p>
    </main>
  );
}
