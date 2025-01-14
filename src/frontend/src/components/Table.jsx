export const Table = ({ data, columns, rowIdExtractor }) => {
  const mappedRows = data.map((row, index) => {
    const mappedColumns = columns.map((column) => (
      <td key={column.id}>{column.render(row) ?? "-"}</td>
    ));

    return <tr key={rowIdExtractor(row)}>{mappedColumns}</tr>;
  });

  const mappedHeaders = columns.map((column) => (
    <th key={column.id}>{column.title}</th>
  ));

  return (
    <table className="table table-zebra">
      <thead>
        <tr>{mappedHeaders}</tr>
      </thead>
      <tbody>{mappedRows}</tbody>
    </table>
  );
};
