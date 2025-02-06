import "./App.css";

import { observer } from "mobx-react-lite";
import { useMst } from "./state";
import { Table } from "./components/Table";
import { ScatterPlot } from "./components/ScatterPlot";
import { MatrixPlot } from "./components/MatrixPlot";

const App = observer(() => {
  const mst = useMst();
  console.log("mst length", mst.data.length);
  return (
    <main>
      <h1>Test Data Print</h1>

      <h2>Length</h2>
      {mst.data?.length ?? "Loading..."}
      <MatrixPlot />
      <ScatterPlot />
      <h2>Pokemons</h2>
      <Table />
    </main>
  );
});

export default App;
