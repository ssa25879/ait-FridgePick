import { Storage } from "@apps-in-toss/web-framework";
import { INGREDIENTS } from "../data/ingredients";
import type { RecipeDifficulty } from "../types/recipe";

export interface PersistedUserState {
  selectedIngredientIds: string[];
  minimumMatchRate: number;
  difficultyFilter: RecipeDifficulty | "all";
}

type LoadResult =
  | { status: "loaded"; state: PersistedUserState | null }
  | { status: "unavailable" };

const ingredientIds = new Set(INGREDIENTS.map(({ id }) => id));
const matchRates = [0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1];
// A remount must not race a previous mount's pending write to the same user.
const pendingWrites = new Map<string, Promise<boolean>>();

export function createDefaultUserState(): PersistedUserState {
  return { selectedIngredientIds: [], minimumMatchRate: 0.6, difficultyFilter: "all" };
}

function storageKey(userHash: string): string {
  return `fridgepick:user-state:v1:${encodeURIComponent(userHash)}`;
}

function decodeState(raw: string | null): PersistedUserState | null {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    const data = value as Record<string, unknown>;
    if (data.version !== 1) return null;
    const defaults = createDefaultUserState();
    const difficulty = data.difficultyFilter;
    return {
      selectedIngredientIds: Array.isArray(data.selectedIngredientIds)
        ? [...new Set(data.selectedIngredientIds.filter(
            (id): id is string => typeof id === "string" && ingredientIds.has(id),
          ))]
        : defaults.selectedIngredientIds,
      minimumMatchRate:
        typeof data.minimumMatchRate === "number" && matchRates.includes(data.minimumMatchRate)
          ? data.minimumMatchRate
          : defaults.minimumMatchRate,
      difficultyFilter:
        difficulty === "easy" || difficulty === "normal" || difficulty === "hard" || difficulty === "all"
          ? difficulty
          : defaults.difficultyFilter,
    };
  } catch {
    return null;
  }
}

export async function loadUserState(userHash: string): Promise<LoadResult> {
  try {
    const key = storageKey(userHash);
    await pendingWrites.get(key);
    return { status: "loaded", state: decodeState(await Storage.getItem(key)) };
  } catch {
    // A read error is not an empty store: do not enable writes in this session.
    return { status: "unavailable" };
  }
}

export function saveUserState(userHash: string, state: PersistedUserState): Promise<boolean> {
  const key = storageKey(userHash);
  const snapshot = JSON.stringify({ version: 1, ...state });
  const previous = pendingWrites.get(key) ?? Promise.resolve(true);
  const write = previous.then(async () => {
    try {
      await Storage.setItem(key, snapshot);
      return true;
    } catch {
      return false;
    }
  });
  pendingWrites.set(key, write);
  void write.then(() => {
    if (pendingWrites.get(key) === write) pendingWrites.delete(key);
  });
  return write;
}
