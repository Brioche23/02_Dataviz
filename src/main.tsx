import { rootState, RootStateContext } from "./state/index.ts";

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <RootStateContext.Provider value={rootState}>
      {/* <GameContextProvider> */}
      <App />
      {/* </GameContextProvider> */}
    </RootStateContext.Provider>
  </>
);
