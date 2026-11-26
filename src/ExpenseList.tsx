import { useState } from "react";
import {
  Badge,
  Box,
  Flex,
  Stack,
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
  CASH_CATEGORIES,
  formatDate,
  PEOPLE,
  type CashCategory,
  type CashExpense,
  type CashEntry,
  type Category,
  type Expense,
} from "./types";

interface Props {
  expenses: Expense[]; // already filtered by period
  cashExpenses: CashExpense[];
  cashEntries: CashEntry[];
  onEdit: (e: Expense) => void;
  onDelete: (id: string) => Promise<void>;
  onEditCashExpense: (e: CashExpense) => void;
  onDeleteCashExpense: (id: string) => Promise<void>;
  onEditCashEntry: (entry: CashEntry) => void;
  onDeleteCashEntry: (entry: CashEntry) => Promise<void>;
}

type CashBlockRow =
  | { id: string; date: string; description: string; amount: number; source: "entry"; entry: CashEntry }
  | { id: string; date: string; description: string; amount: number; source: "expense"; category: CashCategory; expense: CashExpense };

export default function ExpenseList({
  expenses,
  cashExpenses,
  cashEntries,
  onEdit,
  onDelete,
  onEditCashExpense,
  onDeleteCashExpense,
  onEditCashEntry,
  onDeleteCashEntry,
}: Props) {
  const [expenseFilter, setExpenseFilter] = useState<Category | "todas">("todas");
  const [cashFilter, setCashFilter] = useState<CashCategory | "todas">("todas");

  const expenseFilters: { key: Category | "todas"; label: string }[] = [
    { key: "todas", label: "Todas" },
    ...Object.entries(CATEGORIES).map(([category, config]) => ({
      key: category as Category,
      label: config.label,
    })),
  ];
  const rows = expenses
    .filter((e) => expenseFilter === "todas" || e.category === expenseFilter)
    .sort((a, b) => b.date.localeCompare(a.date));
  const cashFilters: { key: CashCategory | "todas"; label: string }[] = [
    { key: "todas", label: "Todas" },
    ...Object.entries(CASH_CATEGORIES).map(([category, config]) => ({
      key: category as CashCategory,
      label: config.label,
    })),
  ];
  const cashRows: CashBlockRow[] = [
    ...cashEntries.map((entry) => ({
      id: entry.id,
      date: entry.date,
      description: entry.description,
      amount: entry.amount,
      source: "entry" as const,
      entry,
    })),
    ...cashExpenses.map((expense) => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      source: "expense" as const,
      category: expense.category,
      expense,
    })),
  ]
    .filter((row) => cashFilter === "todas" || (row.source === "expense" && row.category === cashFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const confirmDelete = (id: string) => {
    if (confirm("Excluir este lançamento?")) void onDelete(id);
  };

  return (
    <Box display="flex" flexDirection="column" gap={4}>
      <Box bg="surface" borderWidth="1px" borderRadius="lg" p={{ base: 3, md: 4 }}>
        <Text fontWeight="700" mb={3}>Despesas</Text>
        <Tabs
          variant="soft-rounded"
          colorScheme="ocean"
          index={expenseFilters.findIndex((item) => item.key === expenseFilter)}
          onChange={(i) => setExpenseFilter(expenseFilters[i].key)}
          mb={4}
          isLazy
        >
          <TabList flexWrap="wrap" gap={2}>
            {expenseFilters.map((item) => (
              <Tab key={item.key} fontSize={{ base: "sm", md: "md" }}>{item.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        {rows.length === 0 ? (
          <Text color="muted">Nenhuma despesa neste período.</Text>
        ) : (
          <>
            <Stack spacing={3} display={{ base: "flex", xl: "none" }}>
              {rows.map((e) => (
                <Box key={e.id} borderWidth="1px" borderColor="line" borderRadius="14px" p={3}>
                  <Flex justify="space-between" align="center" gap={2} mb={2} wrap="wrap">
                    <Badge colorScheme={CATEGORIES[e.category].color}>
                      {CATEGORIES[e.category].label}
                    </Badge>
                    <Text fontSize="sm" color="muted">{formatDate(e.date)}</Text>
                  </Flex>
                  <Text fontWeight="600" wordBreak="break-word">{e.description}</Text>
                  <Flex justify="space-between" align="baseline" gap={2} mt={1} wrap="wrap">
                    <Text fontWeight="700">{brl(e.amount)}</Text>
                    <Text fontSize="sm" color="muted">
                      {brl(e.amount / PEOPLE)} por pessoa
                    </Text>
                  </Flex>
                  <ButtonGroup size="sm" variant="outline" mt={3} w="full" isAttached={false}>
                    <Button
                      flex={1}
                      onClick={() => onEdit(e)}
                    >
                      Editar
                    </Button>
                    <Button
                      flex={1}
                      colorScheme="red"
                      onClick={() => {
                        confirmDelete(e.id);
                      }}
                    >
                      Excluir
                    </Button>
                  </ButtonGroup>
                </Box>
              ))}
            </Stack>

            <TableContainer display={{ base: "none", xl: "block" }} whiteSpace="normal">
              <Table size="sm" sx={{ tableLayout: "fixed" }}>
                <Thead>
                  <Tr>
                    <Th w="11%">Data</Th>
                    <Th aria-hidden="true" w="12%" />
                    <Th w="16%">Categoria</Th>
                    <Th w="24%">Descrição</Th>
                    <Th w="11%">Total</Th>
                    <Th w="11%">Por pessoa</Th>
                    <Th w="15%" />
                  </Tr>
                </Thead>
                <Tbody>
                  {rows.map((e) => (
                    <Tr key={e.id}>
                      <Td>{formatDate(e.date)}</Td>
                      <Td aria-hidden="true" />
                      <Td>
                        <Badge colorScheme={CATEGORIES[e.category].color}>
                          {CATEGORIES[e.category].label}
                        </Badge>
                      </Td>
                      <Td>{e.description}</Td>
                      <Td>{brl(e.amount)}</Td>
                      <Td>{brl(e.amount / PEOPLE)}</Td>
                      <Td>
                        <ButtonGroup size="xs" variant="outline" flexWrap="nowrap">
                          <Button onClick={() => onEdit(e)}>Editar</Button>
                          <Button
                            colorScheme="red"
                            onClick={() => confirmDelete(e.id)}
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
          </>
        )}
      </Box>
      <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="lg" p={{ base: 3, md: 4 }}>
        <Text fontWeight="700" mb={3}>Caixa</Text>
        <Tabs
          variant="soft-rounded"
          colorScheme="ocean"
          index={cashFilters.findIndex((item) => item.key === cashFilter)}
          onChange={(i) => setCashFilter(cashFilters[i].key)}
          mb={4}
          isLazy
        >
          <TabList flexWrap="wrap" gap={2}>
            {cashFilters.map((item) => (
              <Tab key={item.key} fontSize={{ base: "sm", md: "md" }}>{item.label}</Tab>
            ))}
          </TabList>
        </Tabs>

        {cashRows.length === 0 ? (
          <Text color="muted">Nenhuma movimentação do caixa neste período.</Text>
        ) : (
          <>
            <Stack spacing={3} display={{ base: "flex", xl: "none" }}>
              {cashRows.map((row) => (
                <Box key={row.id} borderWidth="1px" borderColor="line" borderRadius="14px" p={3}>
                  <Flex justify="space-between" align="center" gap={2} mb={2} wrap="wrap">
                    <Badge
                      colorScheme={row.source === "entry"
                        ? row.entry.type === "Locação" ? "teal" : "blue"
                        : CASH_CATEGORIES[row.category].color}
                    >
                      {row.source === "entry" ? row.entry.type : CASH_CATEGORIES[row.category].label}
                    </Badge>
                    <Badge colorScheme={row.source === "entry" ? "green" : "red"}>
                      {row.source === "entry" ? "Entrada" : "Saída"}
                    </Badge>
                    <Text fontSize="sm" color="muted">{formatDate(row.date)}</Text>
                  </Flex>
                  <Text fontWeight="600" wordBreak="break-word">{row.description}</Text>
                  <Flex justify="space-between" align="baseline" gap={2} mt={1} wrap="wrap">
                    <Text fontWeight="700">{brl(row.amount)}</Text>
                    <Text fontSize="sm" color="muted">Não rateado</Text>
                  </Flex>
                  <ButtonGroup size="sm" variant="outline" mt={3} w="full" isAttached={false}>
                    <Button
                      flex={1}
                      onClick={() => row.source === "entry"
                        ? onEditCashEntry(row.entry)
                        : onEditCashExpense(row.expense)}
                    >
                      Editar
                    </Button>
                    <Button
                      flex={1}
                      colorScheme="red"
                      onClick={() => {
                        if (row.source === "entry") {
                          if (confirm(`Excluir esta ${row.entry.type.toLowerCase()}?`)) {
                            void onDeleteCashEntry(row.entry);
                          }
                        } else if (confirm("Excluir este gasto do caixa?")) {
                          void onDeleteCashExpense(row.expense.id);
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </ButtonGroup>
                </Box>
              ))}
            </Stack>

            <TableContainer display={{ base: "none", xl: "block" }} whiteSpace="normal">
              <Table size="sm" sx={{ tableLayout: "fixed" }}>
                <Thead>
                  <Tr>
                    <Th w="11%">Data</Th>
                    <Th w="12%">Tipo</Th>
                    <Th w="16%">Categoria</Th>
                    <Th w="24%">Descrição</Th>
                    <Th w="11%">Total</Th>
                    <Th aria-hidden="true" w="11%" />
                    <Th w="15%" />
                  </Tr>
                </Thead>
                <Tbody>
                  {cashRows.map((row) => (
                    <Tr key={row.id}>
                      <Td>{formatDate(row.date)}</Td>
                      <Td w="140px">
                        <Badge colorScheme={row.source === "entry" ? "green" : "red"}>
                          {row.source === "entry" ? "Entrada" : "Saída"}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={row.source === "entry"
                            ? row.entry.type === "Locação" ? "teal" : "blue"
                            : CASH_CATEGORIES[row.category].color}
                        >
                          {row.source === "entry" ? row.entry.type : CASH_CATEGORIES[row.category].label}
                        </Badge>
                      </Td>
                      <Td>{row.description}</Td>
                      <Td>{brl(row.amount)}</Td>
                      <Td aria-hidden="true" />
                      <Td>
                        <ButtonGroup size="xs" variant="outline" flexWrap="nowrap">
                          <Button
                            onClick={() => row.source === "entry"
                              ? onEditCashEntry(row.entry)
                              : onEditCashExpense(row.expense)}
                          >
                            Editar
                          </Button>
                          <Button
                            colorScheme="red"
                            onClick={() => {
                              if (row.source === "entry") {
                                if (confirm(`Excluir esta ${row.entry.type.toLowerCase()}?`)) {
                                  void onDeleteCashEntry(row.entry);
                                }
                              } else if (confirm("Excluir este gasto do caixa?")) {
                                void onDeleteCashExpense(row.expense.id);
                              }
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
          </>
        )}
      </Box>
    </Box>
  );
}
