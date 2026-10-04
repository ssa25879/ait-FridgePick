import { useEffect, useRef, useState } from "react";
import { graniteEvent } from "@apps-in-toss/web-framework";
import "./App.css";
import { initializeBannerAds } from "./ads/bannerAds";
import { HomePage } from "./pages/HomePage";
import { IngredientPage } from "./pages/IngredientPage";
import { ResultPage } from "./pages/ResultPage";
import {
  getRecipeCandidates,
  pickRecipeCandidate,
  type RecipeMatch,
} from "./utils/recommendRecipe";
import { usePersistentUserState } from "./hooks/usePersistentUserState";
import { createDefaultUserState } from "./storage/userState";

type Screen = "home" | "ingredients" | "result";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const mainRef = useRef<HTMLElement>(null);
  const { state, saveStatus, updateState, preserveCurrentState } = usePersistentUserState();
  const { selectedIngredientIds, minimumMatchRate, difficultyFilter } = state;
  const [candidates, setCandidates] = useState<RecipeMatch[]>([]);
  const [recommendation, setRecommendation] = useState<RecipeMatch | null>(
    null,
  );
  const [bannerAdsReady, setBannerAdsReady] = useState(false);

  const toggleIngredient = (ingredientId: string) => {
    updateState((current) => ({
      ...current,
      selectedIngredientIds: current.selectedIngredientIds.includes(ingredientId)
        ? current.selectedIngredientIds.filter((id) => id !== ingredientId)
        : [...current.selectedIngredientIds, ingredientId],
    }));
  };

  const recommend = () => {
    preserveCurrentState();
    const nextCandidates = getRecipeCandidates(selectedIngredientIds, undefined, {
      minimumMatchRate,
      difficultyFilter,
    });
    setCandidates(nextCandidates);
    setRecommendation(pickRecipeCandidate(nextCandidates));
    setScreen("result");
  };

  const reroll = () => {
    setRecommendation((current) =>
      pickRecipeCandidate(candidates, current?.recipe.id),
    );
  };

  const startOver = () => {
    updateState(createDefaultUserState);
    setCandidates([]);
    setRecommendation(null);
    setScreen("ingredients");
  };

  useEffect(() => {
    mainRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    if (screen === "home") return;
    const cleanups: (() => void)[] = [];
    for (const event of ["backEvent", "homeEvent"] as const) {
      try {
        cleanups.push(graniteEvent.addEventListener(event, {
          onEvent: () => setScreen((current) =>
            event === "backEvent" && current === "result" ? "ingredients" : "home",
          ),
          onError: () => console.warn("플랫폼 화면 이동 이벤트를 처리하지 못했습니다."),
        }));
      } catch {
        console.warn("플랫폼 화면 이동 이벤트를 연결하지 못했습니다.");
      }
    }
    return () => {
      for (const cleanup of cleanups) {
        try { cleanup(); } catch {
          console.warn("플랫폼 화면 이동 이벤트를 해제하지 못했습니다.");
        }
      }
    };
  }, [screen]);

  useEffect(() => {
    let isMounted = true;

    void initializeBannerAds().then((isReady) => {
      if (isMounted) {
        setBannerAdsReady(isReady);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (screen === "result") {
    return (
      <ResultPage
        mainRef={mainRef}
        recommendation={recommendation}
        selectedIngredientIds={selectedIngredientIds}
        candidateCount={candidates.length}
        onReroll={reroll}
        onBackHome={() => setScreen("home")}
        onEditIngredients={() => setScreen("ingredients")}
        onStartOver={startOver}
      />
    );
  }

  if (screen === "ingredients") {
    return (
      <IngredientPage
        mainRef={mainRef}
        selectedIngredientIds={selectedIngredientIds}
        minimumMatchRate={minimumMatchRate}
        onMinimumMatchRateChange={(value) => updateState((current) => ({ ...current, minimumMatchRate: value }))}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={(value) => updateState((current) => ({ ...current, difficultyFilter: value }))}
        onToggleIngredient={toggleIngredient}
        saveStatus={saveStatus}
        onReset={startOver}
        onRecommend={recommend}
        showBannerAd={bannerAdsReady}
        onBack={() => setScreen("home")}
      />
    );
  }

  return (
    <HomePage
      mainRef={mainRef}
      onStart={() => setScreen("ingredients")}
    />
  );
}

export default App;
