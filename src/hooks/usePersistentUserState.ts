import { useCallback, useEffect, useRef, useState } from "react";
import { getMiniAppUserKey } from "../user/userKey";
import {
  createDefaultUserState,
  loadUserState,
  saveUserState,
  type PersistedUserState,
} from "../storage/userState";

async function initializeUserState() {
  const userHash = await getMiniAppUserKey();
  if (!userHash) return null;
  const result = await loadUserState(userHash);
  return result.status === "loaded" ? { userHash, state: result.state } : null;
}

export function usePersistentUserState() {
  const [state, setState] = useState(createDefaultUserState);
  const currentState = useRef(state);
  const userHash = useRef<string | null>(null);
  const interacted = useRef(false);
  const initialization = useRef<ReturnType<typeof initializeUserState> | null>(null);

  useEffect(() => {
    let active = true;
    const timeout = setTimeout(() => { active = false; }, 1500);
    initialization.current ??= initializeUserState();

    void initialization.current.then((restored) => {
      clearTimeout(timeout);
      if (!active || !restored) return;

      userHash.current = restored.userHash;
      if (interacted.current) {
        void saveUserState(restored.userHash, currentState.current);
      } else if (restored.state) {
        currentState.current = restored.state;
        setState(restored.state);
      }
    });

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, []);

  const updateState = useCallback((update: (current: PersistedUserState) => PersistedUserState) => {
    interacted.current = true;
    const next = update(currentState.current);
    currentState.current = next;
    setState(next);
    if (userHash.current) void saveUserState(userHash.current, next);
  }, []);

  const preserveCurrentState = useCallback(() => {
    // A late restore must not change the input of an already computed result.
    interacted.current = true;
  }, []);

  return { state, updateState, preserveCurrentState };
}
