import { useState } from "react";
import "./App.css";
import { HomePage } from "./pages/HomePage";
import { IngredientSelectPlaceholder } from "./pages/IngredientSelectPlaceholder";

type Screen = "home" | "ingredients";

function App() {
  const [screen, setScreen] = useState<Screen>("home");

  if (screen === "ingredients") {
    return <IngredientSelectPlaceholder onBack={() => setScreen("home")} />;
  }

  return <HomePage onStart={() => setScreen("ingredients")} />;
}

export default App;
