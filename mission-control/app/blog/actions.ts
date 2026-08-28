"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { publishFiles } from "@/lib/git";
import {
  createPost,
  deletePost,
  getPost,
  publishPaths,
  savePost,
} from "@/lib/posts";
import { validatePost } from "@/lib/validate";

/**
 * Saving writes a file. Publishing commits and pushes, and because main
 * auto-deploys, publishing IS putting it on sebastianinman.com. They are
 * separate actions on purpose and must stay that way: never make a save
 * publish, and never publish as a side effect of anything else.
 */

export type PostState = { error?: string; message?: string };

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function createPostAction(
  _prev: PostState,
  formData: FormData
): Promise<PostState> {
  const title = text(formData, "title");
  if (!title) return { error: "Give it a working title. You can change it later." };
  const post = createPost(title);
  revalidatePath("/blog");
  redirect(`/blog/${post.slug}`);
}

export async function savePostAction(formData: FormData) {
  const slug = text(formData, "slug");
  savePost(slug, {
    title: text(formData, "title"),
    description: text(formData, "description"),
    date: text(formData, "date"),
    image: text(formData, "image"),
    imagePrompt: text(formData, "imagePrompt"),
    imageAlt: text(formData, "imageAlt"),
    imageCaption: text(formData, "imageCaption"),
    body: text(formData, "body"),
  });
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function publishPostAction(
  _prev: PostState,
  formData: FormData
): Promise<PostState> {
  const slug = text(formData, "slug");
  const message = text(formData, "message");
  const post = getPost(slug);
  if (!post) return { error: "That post is gone." };
  if (!message) return { error: "The commit needs a message." };

  // Re-run the checks here rather than trusting the ones on screen
  const issues = await validatePost(post);
  const errors = issues.filter((i) => i.level === "error");
  if (errors.length > 0) {
    return {
      error: `Not publishing while these are unfixed:\n${errors
        .map((e) => `- ${e.message}`)
        .join("\n")}`,
    };
  }

  const result = await publishFiles(publishPaths(post), message);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  return result.ok ? { message: result.message } : { error: result.message };
}

export async function deletePostAction(formData: FormData) {
  const slug = text(formData, "slug");
  deletePost(slug);
  revalidatePath("/blog");
  redirect("/blog");
}
