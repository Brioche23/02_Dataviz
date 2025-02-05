import { useEffect, useState } from "react";
import "./App.css";
import { csvParse, csv } from "d3";

function App() {
  const [data, setData] = useState<d3.DSVRowArray | null>(null);
  const BASE_URL = "/Pokemon.csv";

  useEffect(() => {
    // async function getData() {
    //   const url = "/Pokemon.csv";
    //   try {
    //     const response = await fetch(url);
    //     if (!response.ok) {
    //       throw new Error(`Response status: ${response.status}`);
    //     }
    //     const text = await response.text();
    //     const parsed = csvParse(text);
    //     console.log(parsed);
    //     setData(parsed);
    //     // return text;
    //     // const json = await response.json();
    //   } catch (error) {
    //     console.error(error.message);
    //     return [];
    //   }
    // }
    // getData();

    async function getD3Fetch(filePath: string) {
      const data = await csv(filePath);
      // console.log(data);

      setData(data);
    }

    getD3Fetch(BASE_URL);
    console.log("Test");
    // const fetchedData = getData();
    // if (fetchedData) {
    //   console.log(fetchedData);
    //   setData(fetchedData);
    // }
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
            {data?.columns.map((d, i) => {
              return <th key={i}>{d}</th>;
            })}
          </tr>
        </thead>
        <tbody>
          {data?.map((d, i) => {
            // console.log(d);
            return (
              <tr key={i}>
                {data?.columns.map((c, i) => {
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
