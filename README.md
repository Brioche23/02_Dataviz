# Dataviz in React

## The Data we need

## Fetching the Data

To fetch the data we can use the Fetch API. Usially there is a file `api.ts` which contains a funcion that preciesly returns the well formatted data.
To perform the Fetch we can use the `async... await` structure or the `.then` since the Fetch() returns a `Promise`, which is not the final data but, yes you guessed it, the promies that the data will arrive. It comes with different helpful methods such as .status and .text or .json.

First, a generic function that fetches the CSV. We can also use the `csv` method of D3.

```ts
export async function fetchCSV<T extends object>(url: string) {
  const response = await fetch(url);

  const text = await response.text();
  const parsed = csvParse(text, autoType);
  console.log([...parsed]); // lo spread rimuove gli altri campi
  return [...parsed] as T[];
}
```

Then we can specify the types of the Data rows we are working with. This will also help typescript to provide us some hints and safety.

```ts
interface RawPokemonDatum {
  "#": number;
  Name: string;
  "Type 1": string;
  "Type 2"?: string;
  Total: number;
  HP: number;
  Attack: number;
  Defense: number;
  "Sp. Atk": number;
  "Sp. Def": number;
  Speed: number;
  Generation: number;
  Legendary: string;
}

export interface PokemonDatum {
  "#": string;
  Name: string;
  "Type 1": string;
  "Type 2"?: string;
  Total: number;
  HP: number;
  Attack: number;
  Defense: number;
  "Sp. Atk": number;
  "Sp. Def": number;
  Speed: number;
  Generation: number;
  Legendary: boolean;
}
```

Then we can have two functions that, one fetching the RAW Data and formatting them correctly, and one returning finally the formatted data.

```ts
function formatPokemonData(data: RawPokemonDatum[]): PokemonDatum[] {
  const formattedData = data.map((datum) => ({
    ...datum,
    "#": datum["#"].toString(),
    Legendary: datum.Legendary === "True",
  }));

  return formattedData;
}

export async function fetchPokemon() {
  const url = "/Pokemon.csv";
  const rawData = await fetchCSV<RawPokemonDatum>(url);
  return formatPokemonData(rawData);
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
