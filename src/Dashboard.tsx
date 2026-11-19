import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { LuDroplets, LuHouse, LuTag, LuUsers, LuPiggyBank, LuZap } from "react-icons/lu";
import {
  brl,
  CATEGORIES,
  monthLabel,
  monthOf,
  PEOPLE,
  type Category,
  type Expense,
} from "./types";

interface Props {
  expenses: Expense[]; // already filtered by period
  allExpenses: Expense[];
  showMonths: boolean;
  cashBalance: number | null;
  cashInflowByMonth: Record<string, number>;
  onOpenCaixa: () => void;
}

const sum = (list: Expense[]) => list.reduce((a, e) => a + e.amount, 0);

const CATEGORY_ICONS: Record<Category, JSX.Element> = {
  aluguel: <LuHouse />,
  agua: <LuDroplets />,
  luz: <LuZap />,
  caixa: <LuPiggyBank />,
  outros: <LuTag />,
};

export default function Dashboard({
  expenses,
  allExpenses,
  showMonths,
  cashBalance,
  cashInflowByMonth,
  onOpenCaixa,
}: Props) {
  const currentMonth = monthOf(new Date().toLocaleDateString("sv-SE"));
  const currentMonthExpenses = allExpenses.filter((expense) => monthOf(expense.date) === currentMonth);
  const currentMonthTotal = sum(currentMonthExpenses);

  const byCategory = (Object.keys(CATEGORIES) as Category[])
    .filter((category) => category !== "caixa")
    .map((category) => ({
      key: category,
      total: sum(currentMonthExpenses.filter((e) => e.category === category)),
    }));

  const monthTotals = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      const m = monthOf(e.date);
      acc[m] = (acc[m] ?? 0) + e.amount;
      return acc;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b));
  const maxMonth = Math.max(
    0,
    ...monthTotals.map(([, value]) => value),
    ...Object.values(cashInflowByMonth)
  );
  const expensesByMonth = Object.fromEntries(monthTotals);
  const summaryMonths = [...new Set([
    ...monthTotals.map(([month]) => month),
    ...Object.keys(cashInflowByMonth),
  ])].sort();

  return (
    <Box display="flex" flexDirection="column" gap={7}>
      <Flex
        bgGradient="linear(120deg, #05AFF2 0%, #05C7F2 100%)"
        color="heroInk"
        borderRadius="24px"
        p={{ base: 5, md: 8 }}
        minH="220px"
        align="center"
        justify="space-between"
        gap={6}
        wrap="wrap"
        overflow="hidden"
        position="relative"
      >
        <Box position="relative" zIndex={1}>
          <HStack spacing={2} mb={3} opacity={0.9}>
            <LuHouse />
            <Text fontSize="sm" fontWeight="600">RESUMO DO CHALÉ</Text>
          </HStack>
          <Text fontSize="sm" opacity={0.9}>Despesas de {monthLabel(currentMonth)}</Text>
          <Heading fontSize={{ base: "3xl", md: "5xl" }} mt={1}>
            {brl(currentMonthTotal)}
          </Heading>
          <Text mt={2} opacity={0.88}>
            {currentMonthExpenses.length} {currentMonthExpenses.length === 1 ? "lançamento" : "lançamentos"} realizados
          </Text>
        </Box>
        <Flex
          position="relative"
          zIndex={1}
          direction={{ base: "column", sm: "row" }}
          gap={3}
          w={{ base: "full", lg: "auto" }}
        >
          <Flex
            bg="whiteAlpha.200"
            border="1px solid"
            borderColor="whiteAlpha.300"
            borderRadius="18px"
            p={5}
            minW={{ base: "full", sm: "210px" }}
            align="center"
            gap={4}
          >
            <Flex
              boxSize="48px"
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="16px"
              bg="whiteAlpha.200"
              fontSize="xl"
            >
              <LuUsers />
            </Flex>
            <Box>
              <Text fontSize="sm" opacity={0.9}>Divisão</Text>
              <Heading size="lg" mt={1}>{brl(currentMonthTotal / PEOPLE)}</Heading>
              <Text fontSize="xs" mt={1} opacity={0.8}>igualmente entre {PEOPLE}</Text>
            </Box>
          </Flex>
          <Flex
            bg="whiteAlpha.200"
            border="1px solid"
            borderColor="whiteAlpha.300"
            borderRadius="18px"
            p={5}
            minW={{ base: "full", sm: "210px" }}
            align="center"
            gap={4}
          >
            <Flex
              boxSize="48px"
              flexShrink={0}
              align="center"
              justify="center"
              borderRadius="16px"
              bg="whiteAlpha.200"
              fontSize="xl"
            >
              <LuPiggyBank />
            </Flex>
            <Box minW={0}>
              <Text fontSize="sm" opacity={0.9}>Caixa do Chalé</Text>
              <Heading size="lg" mt={1}>
                {cashBalance === null ? "—" : brl(cashBalance)}
              </Heading>
              <Button
                variant="link"
                color="inherit"
                fontSize="xs"
                mt={1}
                onClick={onOpenCaixa}
              >
                Abrir caixa
              </Button>
            </Box>
          </Flex>
        </Flex>
        <Box
          position="absolute"
          w="270px"
          h="270px"
          right="-120px"
          top="-155px"
          border="1px solid"
          borderColor="whiteAlpha.200"
          borderRadius="full"
          boxShadow="0 0 0 28px rgba(255,255,255,.035), 0 0 0 56px rgba(255,255,255,.025)"
          pointerEvents="none"
        />
      </Flex>

      <Box>
        <Flex justify="space-between" align="end" gap={3} mb={3} wrap="wrap">
          <Box>
            <Heading size="md">Despesas por categoria — {monthLabel(currentMonth)}</Heading>
          </Box>
          <Text color="muted" fontSize="sm">Total: {brl(currentMonthTotal)}</Text>
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing={3}>
          {byCategory.map(({ key, total: t }) => (
            <Box
              key={key}
              p={4}
              borderWidth="1px"
              borderColor="line"
              borderRadius="18px"
              bg="surface"
              opacity={t ? 1 : 0.72}
            >
              <Flex align="center" gap={3} mb={4}>
                <Flex
                  boxSize="40px"
                  align="center"
                  justify="center"
                  borderRadius="13px"
                  bg={key === "aluguel" ? "shell.100" : `${CATEGORIES[key].color}.400`}
                  color={`${CATEGORIES[key].color}.800`}
                  fontSize="lg"
                >
                  {CATEGORY_ICONS[key]}
                </Flex>
                <Box>
                  <Text fontWeight="700">{CATEGORIES[key].label}</Text>
                  <Text color="muted" fontSize="xs">{t ? `${Math.round((t / (currentMonthTotal || 1)) * 100)}% do total` : "Sem lançamentos"}</Text>
                </Box>
              </Flex>
              <Heading size="md">{brl(t)}</Heading>
              <Text color="muted" fontSize="sm" mt={1} mb={3}>{brl(t / PEOPLE)} por pessoa</Text>
              <Progress
                value={currentMonthTotal ? (t / currentMonthTotal) * 100 : 0}
                colorScheme={CATEGORIES[key].color}
                bg="sunken"
                borderRadius="full"
                h="8px"
              />
            </Box>
          ))}
        </SimpleGrid>
      </Box>

      {showMonths && (
        <Box p={{ base: 4, md: 5 }} borderWidth="1px" borderColor="line" borderRadius="20px" bg="surface">
          <Heading size="md" mb={1}>Resumo por mês</Heading>
          <Text color="muted" fontSize="sm" mb={5}>
            Compare despesas e entradas do caixa mês a mês.
          </Text>
          {summaryMonths.length === 0 && <Text color="muted">Sem dados.</Text>}
          <Box display="flex" flexDirection="column" gap={4}>
            {summaryMonths.map((m) => {
              const t = expensesByMonth[m] ?? 0;
              const cashInflow = cashInflowByMonth[m] ?? 0;
              return (
              <Box key={m}>
                <Box display="flex" justifyContent="space-between" flexWrap="wrap" columnGap={3} mb={1}>
                  <Text fontWeight="600">{monthLabel(m)}</Text>
                  <Text>
                    {brl(t)}{" "}
                    <Text as="span" color="muted" fontSize="sm">
                      ({brl(t / PEOPLE)} p/ pessoa)
                    </Text>
                  </Text>
                </Box>
                <Progress
                  value={maxMonth ? (t / maxMonth) * 100 : 0}
                  colorScheme="red"
                  bg="sunken"
                  borderRadius="full"
                  h="8px"
                />
                <Text color="muted" fontSize="sm" mt={2}>
                  Entrou no caixa: {brl(cashInflow)}
                </Text>
                <Progress
                  value={maxMonth ? (cashInflow / maxMonth) * 100 : 0}
                  colorScheme="green"
                  bg="sunken"
                  borderRadius="full"
                  h="8px"
                />
              </Box>
              );
            })}
          </Box>
        </Box>
      )}
    </Box>
  );
}
