import { stageInfo, type Stage } from "@/lib/stages";

const TONE: Record<string, string> = {
  done: "bg-line/60 text-muted",
  lost: "bg-terracotta-tint text-terracotta-dark",
};

export function StageBadge({ stage }: { stage: Stage }) {
  const tone = TONE[stage] ?? "bg-pine-tint text-pine-dark";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${tone}`}
    >
      {stageInfo(stage).label}
    </span>
  );
}
