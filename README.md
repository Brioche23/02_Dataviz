# Dataviz in React

There are multiple ways to make dataviz using d3. The best way is to use d3 to compute the logic (create scales) and to apply them directly to SVG elements in the TSX using react.

## The Data we need

## Fetching the Data

To fetch the data we can use the Fetch API. Usially there is a file `api.ts` which contains a funcion that preciesly returns the well formatted data.
To perform the Fetch we can use the `async... await` structure or the `.then` since the Fetch() returns a `Promise`, which is not the final data but, yes you guessed it, the promies that the data will arrive. It comes with different helpful methods such as .status and .text or .json.

First, a generic function that fetches the CSV. We can also use the `csv` method of D3.

```ts
export async function fetchCSV<T extends object>(url: string) {
  const response = await fetch(url)

  const text = await response.text()
  const parsed = csvParse(text, autoType)
  console.log([...parsed]) // lo spread rimuove gli altri campi
  return [...parsed] as T[]
}
```

Then we can specify the types of the Data rows we are working with. This will also help typescript to provide us some hints and safety.

```ts
interface RawPokemonDatum {
  "#": number
  Name: string
  "Type 1": string
  "Type 2"?: string
  Total: number
  HP: number
  Attack: number
  Defense: number
  "Sp. Atk": number
  "Sp. Def": number
  Speed: number
  Generation: number
  Legendary: string
}

export interface PokemonDatum {
  "#": string
  Name: string
  "Type 1": string
  "Type 2"?: string
  Total: number
  HP: number
  Attack: number
  Defense: number
  "Sp. Atk": number
  "Sp. Def": number
  Speed: number
  Generation: number
  Legendary: boolean
}
```

Then we can have two functions that, one fetching the RAW Data and formatting them correctly, and one returning finally the formatted data.

```ts
function formatPokemonData(data: RawPokemonDatum[]): PokemonDatum[] {
  const formattedData = data.map((datum) => ({
    ...datum,
    "#": datum["#"].toString(),
    Legendary: datum.Legendary === "True",
  }))

  return formattedData
}

export async function fetchPokemon() {
  const url = "/Pokemon.csv"
  const rawData = await fetchCSV<RawPokemonDatum>(url)
  return formatPokemonData(rawData)
}
```

In our app we can then retrieve the data in the useEffect statement and set the data using the promise.

```js
function App() {
  const [data, setData] = useState<PokemonDatum[] | null>(null);

  const columns = Object.keys(data?.[0] ?? {}) as (keyof PokemonDatum)[];
  useEffect(() => {
    fetchPokemon().then((data) => setData(data));
    console.log("Test");
  }, []);
  return (
    ...
  )}
```

## D3.js

### ScatterPlot

### Correlogram

### Stacked Bar Chart

## Utils

### Responsive Charts

To make a chart responsive we have to first detect the changes in window size. To do that we can use and eventListenter -> to use an eventListener we create a useEffect and finally, since we would like to save our page size in a state variable, let's create a custom hook altogether.

In `useWindowSize.ts`

```js
import { useEffect, useState } from "react"

function getPageSize() {
  console.log("w", window.innerWidth, "h", window.innerHeight)

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export function useWindowSize() {
  const [pageSize, setPageSize] = useState(getPageSize())

  useEffect(() => {
    function handleResize() {
      setPageSize(getPageSize())
    }

    window.addEventListener("resize", handleResize) //se non rimuovo, si incrementano

    return () => window.removeEventListener("resize", handleResize)
  }, [setPageSize])

  return pageSize
}
```

We don't want to access this hook from every individual chart, so we can call it just from the App.tsx file, and pass down the dimensions as props.

In `App.tsx`

```tsx
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

      {mst.data && (
        <section>
          <StackedBarChart width={chartWidth} />
          <MatrixPlot width={chartWidth} />
          <ScatterPlot width={chartWidth} />
          <h2>Pokemons</h2>
          <Table />
        </section>
      )}
    </main>
  )
})

export default App
```

and we can apply the width as a layout property value of our YogurtLayout

```ts
const layout = makeLayout({
  id: "root",
  width: width, //applying the width taken as prop
  height: 1000,
  padding: {
    right: marginRight,
  },
  children: [
    {
      id: "yLabel",
      width: 50,
    },
    {
      id: "",
      direction: "column",
      children: [{ id: "chart" }, { id: "xLabel", height: 35 }],
    },
  ],
})
```

### Rollups vs CountBy

To extract the unique values in a column we can either use `rollups` by d3 or `countBy` from Lodash and then extract them with `Object.entries()`

```js
const groupedTypes = rollups(
  mst.data,
  (g) => g.length,
  (d) => d["Type 1"]
)

const groupedTypes_LD = Object.entries(countBy(mst.data, "Type 1"))
console.log("Types Rollup", groupedTypes, "Lodash", groupedTypes_LD)
```

The result is the same, but Lodash method is far more readable.

### Isolate properties and groupBy two properties

```js
const groupedTypes = sortBy(Object.entries(countBy(mst.data, "Type 1")))
const uniqueTypes = groupedTypes.map((type) => type[0])

// First i group by a concat of two properties (with unsusal char in the middle)
const groupedTypesCombo = Object.entries(
  groupBy(mst.data, (d) => `${d["Type 1"]}__${d["Type 2"] ?? d["Type 1"]}`)
).map(([k, v]) => ({
  // then create an object by splitting the key into the two props again
  type1: k.split("__")[0],
  type2: k.split("__")[1],
  count: v.length,
  list: v,
}))
```

## Yogurt Layoyut

## Lava

## Data processing

```js
//  BREAKDOWN OF DATA SELECTION

const step1 = Object.entries(groupBy(mst.data, (d) => `${d["Generation"]}__${d["Type 1"]}`)).map(
  ([k, v]) => ({
    gen: k.split("__")[0],
    type: k.split("__")[1],
    count: v.length,
    list: v,
  })
)
console.log("typesPerGen", typesPerGen)

//   const groupTypesPerGen = typesPerGen.map((o) => o.gen)
const step2 = Object.entries(groupBy(typesPerGen, (t) => t.gen))

const step3 = step2.map(([gen, types]) => ({
  gen,
  ...mapValues(keyBy(types, "type"), "count"),
}))
```

This code lacked of a check to see if every object had all the possible types. Missing types were causing problems in the generation of the bar chart stacks.

To resolve that we can create a typeTemplate with all the variables properties set to 0 and than with the spread operator we can overwrite just the types that actually had a count.

```js
const typeTemplate = Object.fromEntries(uniqueTypes.map((type) => [type, 0]))

const typesPerGen = Object.entries(
  groupBy(mst.data, (d) => `${d["Generation"]}__${d["Type 1"]}`)
).map(([k, v]) => ({
  gen: k.split("__")[0],
  type: k.split("__")[1],
  count: v.length,
}))

const groupTypesPerGen: Group[] = Object.entries(groupBy(typesPerGen, (t) => t.gen)).map(
  ([gen, types]) => {
    const newObject: { [key: string]: number } = mapValues(keyBy(types, "type"), "count")
    return {
      gen: toNumber(gen),
      ...typeTemplate, // This adds all types with 0
      ...newObject,
    }
  }
)
```
