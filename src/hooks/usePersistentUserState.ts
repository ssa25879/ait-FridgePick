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
  const [saveStatus, setSaveStatus] = useState<"checking" | "ready" | "saving" | "saved" | "error" | "session">("checking");
  const mounted = useRef(false);
  const latestWrite = useRef(0);
  const currentState = useRef(state);
  const userHash = useRef<string | null>(null);
  const interacted = useRef(false);
  const initialization = useRef<ReturnType<typeof initializeUserState> | null>(null);

  const persist = useCallback((hash: string, next: PersistedUserState) => {
    const request = ++latestWrite.current;
    setSaveStatus("saving");
    void saveUserState(hash, next).then((saved) => {
      if (mounted.current && latestWrite.current === request) {
        setSaveStatus(saved ? "saved" : "error");
      }
    });
  }, []);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    const timeout = setTimeout(() => {
      active = false;
      setSaveStatus("session");
    }, 1500);
    initialization.current ??= initializeUserState();

    void initialization.current.then((restored) => {
      clearTimeout(timeout);
      if (!active) return;
      if (!restored) {
        setSaveStatus("session");
        return;
      }

      userHash.current = restored.userHash;
      if (interacted.current) {
        persist(restored.userHash, currentState.current);
      } else {
        setSaveStatus("ready");
        if (restored.state) {
          currentState.current = restored.state;
          setState(restored.state);
        }
      }
    });

    return () => {
      active = false;
      mounted.current = false;
      clearTimeout(timeout);
    };
  }, [persist]);

  const updateState = useCallback((update: (current: PersistedUserState) => PersistedUserState) => {
    interacted.current = true;
    const next = update(currentState.current);
    currentState.current = next;
    setState(next);
    if (userHash.current) persist(userHash.current, next);
  }, [persist]);

  const preserveCurrentState = useCallback(() => {
    // A late restore must not change the input of an already computed result.
    interacted.current = true;
  }, []);

  return { state, saveStatus, updateState, preserveCurrentState };
}
