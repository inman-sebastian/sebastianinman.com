"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { fileState, publishFiles, removeAndPublish } from "@/lib/git";
import {
  createPost,
  deletePost,
  getPost,
  postPath,
  publishPaths,
  savePost,
} from "@/lib/posts";
import { validatePost } from "@/lib/validate";
import { clearJob, startIllustration } from "@/lib/illustrate";
import {
  adoptCandidate,
  discardCandidate,
  optimizeImages,
  saveUpload,
} from "@/lib/images";

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

/**
 * Starts the real illustration pipeline in the background. It does not
 * wait: the run drives a browser and takes minutes. Nothing it produces
 * is published; it writes an image into public/images/blog and stops.
 */
export async function generateIllustrationAction(
  _prev: PostState,
  formData: FormData
): Promise<PostState> {
  const slug = text(formData, "slug");
  const prompt = text(formData, "imagePrompt");
  const post = getPost(slug);
  if (!post) return { error: "That post is gone." };

  // Save the prompt first, so what runs is what is on screen
  if (prompt && prompt !== post.imagePrompt) {
    savePost(slug, { imagePrompt: prompt });
  }

  const problem = startIllustration(slug, prompt || post.imagePrompt);
  if (problem) return { error: problem };

  revalidatePath(`/blog/${slug}`);
  return { message: "Started. It drives Flow in a browser, so give it a few minutes." };
}

/** Take a file off Sebastian's machine and put it where the site expects */
export async function uploadIllustrationAction(formData: FormData) {
  const slug = text(formData, "slug");
  const file = formData.get("upload");
  if (!(file instanceof File) || file.size === 0) return;
  const bytes = Buffer.from(await file.arrayBuffer());
  const webPath = saveUpload(slug, bytes, file.name);
  savePost(slug, { image: webPath });
  await optimizeImages();
  revalidatePath(`/blog/${slug}`);
}

/** Put a staged image on the post. The one it replaces is kept, staged,
    so changing your mind does not mean generating again. */
export async function adoptCandidateAction(formData: FormData) {
  const slug = text(formData, "slug");
  const file = text(formData, "file");
  try {
    const webPath = adoptCandidate(slug, file);
    savePost(slug, { image: webPath });
    await optimizeImages();
  } catch {
    // The only way here is a candidate that vanished under us; the page
    // re-render will show it is gone
  }
  clearJob(slug);
  revalidatePath(`/blog/${slug}`);
}

export async function discardCandidateAction(formData: FormData) {
  discardCandidate(text(formData, "file"));
  revalidatePath(`/blog/${text(formData, "slug")}`);
}

export async function dismissJobAction(formData: FormData) {
  clearJob(text(formData, "slug"));
  revalidatePath(`/blog/${text(formData, "slug")}`);
}

/**
 * Deleting a local draft just removes the file. Deleting something that
 * is already published has to say so on the site too, so that one
 * commits the removal and pushes it.
 */
export async function deletePostAction(formData: FormData) {
  const slug = text(formData, "slug");
  const post = getPost(slug);
  if (!post) redirect("/blog");

  const state = await fileState(postPath(slug));
  if (state === "untracked") {
    deletePost(slug);
  } else {
    const result = await removeAndPublish(
      publishPaths(post),
      `Remove blog post: ${post.title || slug}`
    );
    // git rm takes the file with it; if git refused, fall back to
    // removing it here so the CMS does not keep showing a post the
    // user has decided is gone
    if (!result.ok) deletePost(slug);
  }

  clearJob(slug);
  revalidatePath("/blog");
  redirect("/blog");
}
