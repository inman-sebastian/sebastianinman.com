"use server";

import { verifyEmail, type VerifyResult } from "@/lib/hunter";

/**
 * Check an address before something important goes to it.
 *
 * Runs only when a button is pressed. Verifications are capped at 100 a
 * month on the free plan, so nothing here may be wired to a render, a
 * save, or any other automatic trigger; repeats come from the cache in
 * lib/hunter.ts so a second click costs nothing.
 */
export async function verifyEmailAction(email: string): Promise<VerifyResult> {
  return verifyEmail(email);
}
