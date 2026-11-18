import { useState } from "react";
import {
  Badge,
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  Tab,
  TabList,
  Tabs,
  ButtonGroup,
  Button,
} from "@chakra-ui/react";
import {
  brl,
  CATEGORIES,
  formatDate,
  PEOPLE,
  type Category,
  type Expense,
} from "./types";

interface Props {
  expenses: Expense[]; // already filtered by period
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: Props) {
  const [filter, setFilter] = useState<Category | "todas">("todas");

  const keys = ["todas", ...Object.keys(CATEGORIES)] as (Category | "todas")[];
  const rows = expenses
    .filter((e) => filter === "todas" || e.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Box bg="surface" borderWidth="1px" borderRadius="lg" p={4}>
      <Tabs
        variant="soft-rounded"
        colorScheme="ocean"
        index={keys.indexOf(filter)}
        onChange={(i) => setFilter(keys[i])}
        mb={4}
        isLazy
      >
        <TabList flexWrap="wrap" gap={2}>
          {keys.map((k) => (
            <Tab key={k}>{k === "todas" ? "Todas" : CATEGORIES[k].label}</Tab>
          ))}
        </TabList>
      </Tabs>

      {rows.length === 0 ? (
        <Text color="muted">Nenhum lançamento.</Text>
      ) : (
        <TableContainer>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Categoria</Th>
                <Th>Descrição</Th>
                <Th isNumeric>Total</Th>
                <Th isNumeric>Por pessoa</Th>
                <Th />
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((e) => (
                <Tr key={e.id}>
                  <Td>{formatDate(e.date)}</Td>
                  <Td>
                    <Badge colorScheme={CATEGORIES[e.category].color}>
                      {CATEGORIES[e.category].label}
                    </Badge>
                  </Td>
                  <Td>{e.description}</Td>
                  <Td isNumeric>{brl(e.amount)}</Td>
                  <Td isNumeric>{brl(e.amount / PEOPLE)}</Td>
                  <Td>
                    <ButtonGroup size="xs" variant="outline">
                      <Button onClick={() => onEdit(e)}>Editar</Button>
                      <Button
                        colorScheme="red"
                        onClick={() => {
                          if (confirm("Excluir este lançamento?")) void onDelete(e.id);
                        }}
                      >
                        Excluir
                      </Button>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
