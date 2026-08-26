import { Reveal } from "@/components/Reveal";

/**
 * A chat-window panel: a run of incoming messages on the left (the
 * things business owners say) answered by one pine-green reply on the
 * right (Sebastian). The window framing is what makes the one-sided
 * run + single reply read as a real conversation. Used by the homepage
 * and service page "Sound familiar?" sections.
 */
export function ChatThread({
  messages,
  reply,
}: {
  messages: string[];
  reply: string;
}) {
  return (
    <div className="flex w-full max-w-2xl flex-col gap-2 rounded-2xl border border-line bg-background p-5 shadow-sm sm:p-6">
      {messages.map((message, i) => (
        <Reveal key={message} delay={i * 150} className="self-start">
          <p
            className={`max-w-md rounded-2xl bg-pine-tint px-4 py-2.5 leading-relaxed text-pine-dark ${
              i === messages.length - 1 ? "rounded-bl-sm" : ""
            }`}
          >
            {message}
          </p>
        </Reveal>
      ))}
      <Reveal delay={messages.length * 150 + 200} className="mt-2 self-end">
        <p className="max-w-md rounded-2xl rounded-br-sm bg-pine px-4 py-2.5 leading-relaxed text-white">
          {reply}
        </p>
      </Reveal>
    </div>
  );
}
