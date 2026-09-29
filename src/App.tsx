import { useState } from "react";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { IngredientPage } from "./pages/IngredientPage";

type Screen = "home" | "ingredients";

function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>(
    [],
  );

  const toggleIngredient = (ingredientId: string) => {
    setSelectedIngredientIds((currentIds) =>
      currentIds.includes(ingredientId)
        ? currentIds.filter((id) => id !== ingredientId)
        : [...currentIds, ingredientId],
    );
  };

  if (screen === "ingredients") {
    return (
      <IngredientPage
        selectedIngredientIds={selectedIngredientIds}
        onToggleIngredient={toggleIngredient}
        onBack={() => setScreen("home")}
      />
    );
  }

  return <HomePage onStart={() => setScreen("ingredients")} />;
}

export default App;
