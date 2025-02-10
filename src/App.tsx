import "./App.css"

import { observer } from "mobx-react-lite"
import { useMst } from "./state"
import { Table } from "./components/Table"
import { ScatterPlot } from "./components/ScatterPlot"
import { MatrixPlot } from "./components/MatrixPlot"
import { StackedBarChart } from "./components/StackedBarChart"
import { useWindowSize } from "./hooks/useWindowSize"

const MAX_CHART_WIDTH = 1000
const CHART_MARGINS = 50
const App = observer(() => {
  const mst = useMst()

  const pageSize = useWindowSize()
  const chartWidth = Math.min(MAX_CHART_WIDTH, pageSize.width - CHART_MARGINS)

  console.log("mst length", mst.data.length)
  return (
    <main>
      <h1>Test Data Print</h1>
      <h2>Length</h2>
      {mst.data?.length ?? "Loading..."}
      <StackedBarChart width={chartWidth} />
      <MatrixPlot width={chartWidth} />
      <ScatterPlot width={chartWidth} />
      <h2>Pokemons</h2>
      <Table />
    </main>
  )
})

export default App
