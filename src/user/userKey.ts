import { User } from "@apps-in-toss/web-framework";

export async function getMiniAppUserKey(): Promise<string | null> {
  try {
    if (!User.getAnonymousKey.isSupported()) return null;

    const result = await User.getAnonymousKey();
    if (result?.type !== "HASH" || typeof result.hash !== "string") return null;
    return result.hash.trim() ? result.hash : null;
  } catch {
    // Unsupported/failed identity must never fall back to a shared storage key.
    return null;
  }
}
