import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { REPO_ROOT } from "./site";

/**
 * The bridge to paperwork-app. Its print CSS and buildPdf() took many
 * rounds to get right, so nothing here reimplements them: both calls
 * shell out to its own scripts.
 *
 * Running them as separate processes is deliberate. It keeps Chrome and
 * puppeteer out of this app's bundler entirely, it means the CLI Cowork
 * uses (`npm --prefix paperwork-app run generate -- <slug>`) and the
 * button in the UI are the same code path, and a broken document can
 * only fail a child process, never this server.
 */

const run = promisify(execFile);
const PAPERWORK_DIR = path.join(REPO_ROOT, "paperwork-app");

export type RunResult = { ok: boolean; message: string };

/** The branded HTML for a draft, for the in-app preview iframe */
export async function renderPreviewHtml(slug: string): Promise<string> {
  const { stdout } = await run(
    "node",
    [path.join(PAPERWORK_DIR, "preview.js"), slug],
    { cwd: PAPERWORK_DIR, maxBuffer: 16 * 1024 * 1024 }
  );
  return stdout;
}

/** Build the finished PDF into docs/clients/drafts/out/<slug>.pdf */
export async function generatePdf(slug: string): Promise<RunResult> {
  try {
    const { stdout } = await run(
      "node",
      [path.join(PAPERWORK_DIR, "generate.js"), slug],
      { cwd: PAPERWORK_DIR, maxBuffer: 16 * 1024 * 1024, timeout: 120_000 }
    );
    return { ok: true, message: stdout.trim() || "PDF generated." };
  } catch (err) {
    // The usual cause is Chrome not being where generate.js looks for
    // it, and its own error says exactly that
    const detail =
      err && typeof err === "object" && "stderr" in err
        ? String((err as { stderr: string }).stderr).trim()
        : String(err);
    return { ok: false, message: detail.split("\n").slice(0, 4).join("\n") };
  }
}
