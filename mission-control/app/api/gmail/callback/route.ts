import { redirect } from "next/navigation";
import { exchangeCode } from "@/lib/gmail";

/**
 * Where Google sends the browser back after consent. It carries a one-time
 * `code` we trade for the refresh token, then bounces to the inbox. This is
 * the only place the OAuth code is handled; the token never leaves
 * lib/gmail's store.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const error = params.get("error");
  if (error) {
    redirect(`/inbox?error=${encodeURIComponent(error)}`);
  }
  const code = params.get("code");
  if (!code) {
    redirect("/inbox?error=no_code");
  }
  try {
    await exchangeCode(code as string);
  } catch (err) {
    redirect(
      `/inbox?error=${encodeURIComponent(
        err instanceof Error ? err.message : String(err),
      )}`,
    );
  }
  redirect("/inbox?connected=1");
}
