import { Table, Thead, Tbody, Tr, Th, Td } from "@chakra-ui/react";
import { ReactNode } from "react";

interface DataTableProps<T> {
  columns: string[];
  data: T[];
  renderRow: (item: T) => ReactNode;
}

const DataTable = <T,>({ columns, data, renderRow }: DataTableProps<T>) => (
  <Table variant="simple">
    <Thead>
      <Tr>
        {columns.map((col, index) => (
          <Th key={index}>{col}</Th>
        ))}
      </Tr>
    </Thead>
    <Tbody>{data.map(renderRow)}</Tbody>
  </Table>
);

export default DataTable;
