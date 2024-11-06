import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

interface Column {
  key: string;
  label: string;
}

interface CustomTableProps<T> {
  columns: Column[];
  data: T[];
  actions?: (item: T) => React.ReactNode;
}

const CustomTable = <T extends { id: number | string }>({
  columns,
  data,
  actions,
}: CustomTableProps<T>) => {
  return (
    <Table variant="simple">
      <Thead>
        <Tr>
          {columns.map((column) => (
            <Th key={column.key}>{column.label}</Th>
          ))}
          {actions && <Th>アクション</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {data.map((item) => (
          <Tr key={item.id}>
            {columns.map((column) => (
              <Td key={column.key}>{(item as any)[column.key]}</Td>
            ))}
            {actions && <Td>{actions(item)}</Td>}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

export default CustomTable;
