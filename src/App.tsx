import { useEffect, useState } from "react";
import "./App.css";

import { fetchPokemon } from "./api";
import { PokemonDatum } from "./api";

function App() {
  const [data, setData] = useState<PokemonDatum[] | null>(null);

  const columns = Object.keys(data?.[0] ?? {}) as (keyof PokemonDatum)[];
  useEffect(() => {
    fetchPokemon().then((data) => setData(data));
    console.log("Test");
  }, []);
  return (
    <main>
      <h1>Test Data Print</h1>

      <h2>Length</h2>
      {data?.length ?? "Loading..."}
      <h2>Cols</h2>
      <h2>Pokemons</h2>
      <table>
        <thead>
          <tr>
            {columns.map((d, i) => {
              return <th key={i}>{d}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {data?.map((d, i) => {
            return (
              <tr key={i}>
                {columns.map((c, i) => {
                  return <td key={i}>{d[c]}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}

export default App;
