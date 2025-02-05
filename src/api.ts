import { csvParse, autoType } from "d3-dsv";

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

export async function fetchCSV<T extends object>(url: string) {
  const response = await fetch(url);

  const text = await response.text();
  const parsed = csvParse(text, autoType);
  console.log([...parsed]); // lo spread rimuove gli altri campi
  return [...parsed] as T[];
}
