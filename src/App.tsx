import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { graniteEvent } from "@apps-in-toss/web-framework";
import "./App.css";
import { initializeBannerAds } from "./ads/bannerAds";
import { HomePage } from "./pages/HomePage";
import { IngredientPage } from "./pages/IngredientPage";
import { ResultPage } from "./pages/ResultPage";
import type { RecipeMatch } from "./utils/recommendRecipe";
import { isRecipeReady } from "./utils/recipeReadiness";
import { loadRecommendationModule, type RecommendationModule } from "./utils/loadRecommendationModule";
import { createDefaultUserState } from "./storage/userState";

type Screen = "home" | "ingredients" | "result";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const mainRef = useRef<HTMLElement>(null);
  const scrollAfterReroll = useRef(false);
  const [state, updateState] = useState(createDefaultUserState);
  const { selectedIngredientIds, minimumMatchRate, difficultyFilter } = state;
  const [candidates, setCandidates] = useState<RecipeMatch[]>([]);
  const [candidateGroup, setCandidateGroup] = useState<"ready" | "needs">("ready");
  const readyCandidates = candidates.filter(isRecipeReady);
  const needsCandidates = candidates.filter((match) => !isRecipeReady(match));
  const activeCandidates = candidateGroup === "ready" ? readyCandidates : needsCandidates;
  const [recommendation, setRecommendation] = useState<RecipeMatch | null>(
    null,
  );
  const [bannerAdsReady, setBannerAdsReady] = useState(false);
  const moduleRef = useRef<RecommendationModule | null>(null);
  const requestVersion = useRef(0);
  const pendingRef = useRef(false);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string>();

  const cancelRecommendation = () => {
    requestVersion.current += 1;
    pendingRef.current = false;
    setIsRecommending(false);
    setRecommendationError(undefined);
  };

  const navigate = (next: Screen) => {
    cancelRecommendation();
    setScreen(next);
  };

  const startIngredients = () => {
    navigate("ingredients");
    void loadRecommendationModule().then((module) => {
      moduleRef.current = module;
    }).catch(() => { /* A recommendation can retry a failed preload. */ });
  };

  const toggleIngredient = (ingredientId: string) => {
    cancelRecommendation();
    updateState((current) => ({
      ...current,
      selectedIngredientIds: current.selectedIngredientIds.includes(ingredientId)
        ? current.selectedIngredientIds.filter((id) => id !== ingredientId)
        : [...current.selectedIngredientIds, ingredientId],
    }));
  };

  const recommend = async () => {
    if (pendingRef.current) return;
    if (selectedIngredientIds.length === 0) {
      setCandidates([]);
      setRecommendation(null);
      navigate("result");
      return;
    }
    const version = ++requestVersion.current;
    pendingRef.current = true;
    setIsRecommending(true);
    setRecommendationError(undefined);
    try {
      const module = moduleRef.current ?? await loadRecommendationModule();
      moduleRef.current = module;
      if (version !== requestVersion.current) return;
      const nextCandidates = module.getRecipeCandidates(selectedIngredientIds, undefined, {
        minimumMatchRate,
        difficultyFilter,
      });
      setCandidates(nextCandidates);
      const ready = nextCandidates.filter(isRecipeReady);
      const group = ready.length > 0 ? "ready" : "needs";
      setCandidateGroup(group);
      setRecommendation(module.pickRecipeCandidate(ready.length > 0 ? ready : nextCandidates));
      setScreen("result");
    } catch {
      if (version === requestVersion.current) {
        setRecommendationError("메뉴를 불러오지 못했어요. 메뉴 뽑기를 눌러 다시 시도해 주세요.");
      }
    } finally {
      if (version === requestVersion.current) {
        pendingRef.current = false;
        setIsRecommending(false);
      }
    }
  };

  const reroll = () => {
    scrollAfterReroll.current = true;
    setRecommendation((current) =>
      moduleRef.current?.pickRecipeCandidate(activeCandidates, current?.recipe.id) ?? null,
    );
  };

  useLayoutEffect(() => {
    if (!scrollAfterReroll.current) return;
    scrollAfterReroll.current = false;
    mainRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [recommendation]);

  const changeCandidateGroup = (group: "ready" | "needs") => {
    const pool = group === "ready" ? readyCandidates : needsCandidates;
    if (pool.length === 0 || group === candidateGroup) return;
    setCandidateGroup(group);
    setRecommendation(moduleRef.current?.pickRecipeCandidate(pool) ?? null);
  };

  const startOver = () => {
    cancelRecommendation();
    updateState(createDefaultUserState);
    setCandidates([]);
    setRecommendation(null);
    setScreen("ingredients");
  };

  useEffect(() => {
    mainRef.current?.focus();
  }, [screen]);

  useEffect(() => () => { requestVersion.current += 1; }, []);

  useEffect(() => {
    if (screen === "home") return;
    const cleanups: (() => void)[] = [];
    for (const event of ["backEvent", "homeEvent"] as const) {
      try {
        cleanups.push(graniteEvent.addEventListener(event, {
          onEvent: () => {
            cancelRecommendation();
            setScreen((current) => event === "backEvent" && current === "result" ? "ingredients" : "home");
          },
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
        candidateCount={activeCandidates.length}
        readyCandidateCount={readyCandidates.length}
        needsCandidateCount={needsCandidates.length}
        candidateGroup={candidateGroup}
        onChangeCandidateGroup={changeCandidateGroup}
        onReroll={reroll}
        onBackHome={() => navigate("home")}
        onEditIngredients={() => navigate("ingredients")}
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
        onMinimumMatchRateChange={(value) => { cancelRecommendation(); updateState((current) => ({ ...current, minimumMatchRate: value })); }}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={(value) => { cancelRecommendation(); updateState((current) => ({ ...current, difficultyFilter: value })); }}
        onToggleIngredient={toggleIngredient}
        onReset={startOver}
        onRecommend={recommend}
        isRecommending={isRecommending}
        recommendationError={recommendationError}
        showBannerAd={bannerAdsReady}
        onBack={() => navigate("home")}
      />
    );
  }

  return (
    <HomePage
      mainRef={mainRef}
      onStart={startIngredients}
    />
  );
}

export default App;
