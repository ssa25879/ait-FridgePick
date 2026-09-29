import { useState } from "react";
import "./create-ait-app.css";
// create-ait-app:sample-imports:start
import { InAppAdsPage } from "./pages/InAppAdsPage";
// create-ait-app:sample-imports:end

function App() {
  const [page, setPage] = useState<string | null>(null);

  // create-ait-app:sample-routes:start
  if (page === "iaa") return <InAppAdsPage onBack={() => setPage(null)} />;
  // create-ait-app:sample-routes:end

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="page-title">Apps in Toss</h1>
        <p className="page-subtitle">원하는 기능을 샌드박스 앱이나 토스 앱에서 확인해 보세요.</p>
      </header>
      <div className="app-actions">
        {/* create-ait-app:sample-buttons:start */}
        <button type="button" className="app-button app-button-primary" onClick={() => setPage("iaa")}>인앱 광고 테스트하기</button>
        {/* create-ait-app:sample-buttons:end */}
      </div>
    </main>
  );
}

export default App;
