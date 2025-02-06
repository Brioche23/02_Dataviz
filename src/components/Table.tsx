import { observer } from "mobx-react-lite"
import { useMst } from "../state"

export const Table = observer(() => {
  const mst = useMst()

  return (
    <table>
      <thead>
        <tr>
          {mst.columns.map((d, i) => {
            return <th key={i}>{d}</th>
          })}
        </tr>
      </thead>
      <tbody>
        {mst.data?.map((d, i) => {
          return (
            <tr key={i}>
              {mst.columns.map((c, i) => {
                if (c === "Legendary") return <td key={i}>{d[c] === true ? "Yes" : "No"}</td>
                else return <td key={i}>{d[c]}</td>
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
})
