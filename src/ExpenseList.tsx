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

  const confirmDelete = (id: string) => {
    if (confirm("Excluir este lançamento?")) void onDelete(id);
  };

  return (
    <Box bg="surface" borderWidth="1px" borderRadius="lg" p={{ base: 3, md: 4 }}>
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
            <Tab key={k} fontSize={{ base: "sm", md: "md" }}>{k === "todas" ? "Todas" : CATEGORIES[k].label}</Tab>
          ))}
        </TabList>
      </Tabs>

      {rows.length === 0 ? (
        <Text color="muted">Nenhum lançamento.</Text>
      ) : (
        <>
          <Stack spacing={3} display={{ base: "flex", lg: "none" }}>
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
                  <Text fontSize="sm" color="muted">{brl(e.amount / PEOPLE)} por pessoa</Text>
                </Flex>
                <ButtonGroup size="sm" variant="outline" mt={3} w="full" isAttached={false}>
                  <Button flex={1} onClick={() => onEdit(e)}>Editar</Button>
                  <Button flex={1} colorScheme="red" onClick={() => confirmDelete(e.id)}>
                    Excluir
                  </Button>
                </ButtonGroup>
              </Box>
            ))}
          </Stack>

          <TableContainer display={{ base: "none", lg: "block" }}>
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
                        <Button colorScheme="red" onClick={() => confirmDelete(e.id)}>
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
  );
}
