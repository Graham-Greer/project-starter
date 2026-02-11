import styles from "./feature-comparison.module.css";

export default function FeatureComparison({
  columns = [],
  rows = [],
  className = "",
  ...props
}) {
  return (
    <div className={`${styles.wrap} ${className}`.trim()} {...props}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" className={styles.headerCell}>
              Feature
            </th>
            {columns.map((column, index) => (
              <th key={column.id || column.label || index} scope="col" className={styles.headerCell}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id || row.label || rowIndex}>
              <th scope="row" className={styles.rowLabel}>
                {row.label}
              </th>
              {columns.map((column, colIndex) => (
                <td key={`${row.id || rowIndex}-${column.id || colIndex}`} className={styles.cell}>
                  {row.values?.[column.id] ?? row.values?.[colIndex] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
