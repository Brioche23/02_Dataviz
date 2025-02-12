import { observer } from "mobx-react-lite"
import styles from "./RegionFilter.module.css"
import { REGIONS } from "../const"
import { useMst } from "../state"
import classNames from "classnames"
import { includes } from "lodash"

export const RegionFilter = observer(() => {
  const mst = useMst()
  return (
    <div className={styles.filter}>
      {REGIONS.map((r, i) => {
        return (
          <button
            key={i}
            onClick={() => mst.toggleFilters(r.gen)}
            className={classNames(
              styles["filter-chip"],
              includes(mst.generationFilter, r.gen) ? styles.active : ""
            )}
          >
            {r.region}
          </button>
        )
      })}
    </div>
  )
})
