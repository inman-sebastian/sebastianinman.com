/**
 * Small UI cards floating over the hero landscape. They show busywork
 * handling itself (the headline's promise) with real, crisp text instead
 * of asking the illustration to depict it. Desktop only.
 */
export function HeroCards() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
      {/* Paid invoice notification */}
      <div className="absolute right-[8%] top-[18%] rotate-2">
        <div
          className="w-64 rounded-xl border border-line bg-surface/95 p-4 shadow-lg motion-reduce:animate-none"
          style={{ animation: "float-slow 7s ease-in-out infinite" }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pine-tint text-pine">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
              </svg>
            </span>
            <div>
              <p className="text-sm font-semibold text-pine-dark">Invoice #142 paid</p>
              <p className="text-xs text-muted">Reminder went out on its own</p>
            </div>
          </div>
        </div>
      </div>

      {/* After-hours chat, answered automatically */}
      <div className="absolute bottom-[16%] right-[16%] -rotate-1">
        <div
          className="w-72 rounded-xl border border-line bg-surface/95 p-4 shadow-lg motion-reduce:animate-none"
          style={{ animation: "float-slow 9s ease-in-out 1.5s infinite" }}
        >
          <div className="flex flex-col gap-2">
            <p className="self-start rounded-2xl rounded-bl-sm bg-pine-tint px-3 py-1.5 text-xs text-pine-dark">
              Are you open Saturday?
            </p>
            <p className="self-end rounded-2xl rounded-br-sm bg-pine px-3 py-1.5 text-xs text-white">
              Yes! Open 9 to 3. Want me to save you a spot?
            </p>
            <p className="mt-1 text-[11px] text-muted">Answered automatically at 9:42 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}
