import { useEffect, useRef, useState } from "react";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { IngredientPage } from "./pages/IngredientPage";
import { ResultPage } from "./pages/ResultPage";
import {
  MINIMUM_RECIPE_MATCH_RATE,
  getRecipeCandidates,
  pickRecipeCandidate,
  type RecipeMatch,
} from "./utils/recommendRecipe";
import type { RecipeDifficulty } from "./types/recipe";

type Screen = "home" | "ingredients" | "result";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const mainRef = useRef<HTMLElement>(null);
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    [],
  );
  const [minimumMatchRate, setMinimumMatchRate] = useState(
    MINIMUM_RECIPE_MATCH_RATE,
  );
  const [difficultyFilter, setDifficultyFilter] = useState<
    RecipeDifficulty | "all"
  >("all");
  const [candidates, setCandidates] = useState<RecipeMatch[]>([]);
  const [recommendation, setRecommendation] = useState<RecipeMatch | null>(
    null,
  );

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredientIds((currentIds) =>
      currentIds.includes(ingredientId)
        ? currentIds.filter((id) => id !== ingredientId)
        : [...currentIds, ingredientId],
    );
  };

  const recommend = () => {
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
    setSelectedIngredientIds([]);
    setMinimumMatchRate(MINIMUM_RECIPE_MATCH_RATE);
    setDifficultyFilter("all");
    setCandidates([]);
    setRecommendation(null);
    setScreen("ingredients");
  };

  useEffect(() => {
    mainRef.current?.focus();
  }, [screen]);

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
        onMinimumMatchRateChange={setMinimumMatchRate}
        difficultyFilter={difficultyFilter}
        onDifficultyFilterChange={setDifficultyFilter}
        onToggleIngredient={toggleIngredient}
        onRecommend={recommend}
        onBack={() => setScreen("home")}
      />
    );
  }

  return <HomePage mainRef={mainRef} onStart={() => setScreen("ingredients")} />;
}

export default App;
