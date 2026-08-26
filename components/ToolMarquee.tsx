import Image from "next/image";

export type MarqueeTool = { name: string; icon?: string };

/**
 * Two counter-scrolling, infinitely looping rows of tool chips (top row
 * left, bottom row right). Hovering anywhere over the marquee pauses both
 * rows. Pure CSS animation (keyframes + classes in globals.css): each row
 * renders its chips twice and slides by exactly half its width, so the
 * loop is seamless; the duplicate set is aria-hidden. Users who prefer
 * reduced motion get a static wrapped grid instead (the duplicates hide
 * and the rows wrap; see the media query in globals.css).
 */
export function ToolMarquee({ tools }: { tools: MarqueeTool[] }) {
  const mid = Math.ceil(tools.length / 2);
  const rows: [MarqueeTool[], string][] = [
    [tools.slice(0, mid), "marquee-track-left"],
    [tools.slice(mid), "marquee-track-right"],
  ];

  return (
    <div className="marquee-pause flex flex-col gap-3">
      {rows.map(([row, direction]) => (
        <div key={direction} className="overflow-hidden motion-safe:marquee-mask">
          <div
            className={`marquee-track flex w-max gap-3 ${direction}`}
            style={{ "--marquee-dur": `${row.length * 3}s` } as React.CSSProperties}
          >
            <ChipRow tools={row} />
            <ChipRow tools={row} ariaHidden />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChipRow({
  tools,
  ariaHidden = false,
}: {
  tools: MarqueeTool[];
  ariaHidden?: boolean;
}) {
  return (
    <ul
      aria-hidden={ariaHidden || undefined}
      className={`flex shrink-0 gap-3 ${ariaHidden ? "marquee-dup" : "marquee-main"}`}
    >
      {tools.map((tool) => (
        <li
          key={tool.name}
          className="flex items-center gap-2.5 whitespace-nowrap rounded-lg border border-line bg-background px-5 py-2.5 font-medium text-pine-dark"
        >
          {tool.icon && (
            <Image
              src={tool.icon}
              alt=""
              width={22}
              height={22}
              className="shrink-0"
            />
          )}
          {tool.name}
        </li>
      ))}
    </ul>
  );
}
