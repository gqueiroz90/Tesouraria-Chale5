import {
  Box,
  Flex,
  Heading,
  HStack,
  Progress,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { LuDroplets, LuHouse, LuTag, LuUsers, LuZap } from "react-icons/lu";
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
  showMonths: boolean;
}

const sum = (list: Expense[]) => list.reduce((a, e) => a + e.amount, 0);

const CATEGORY_ICONS: Record<Category, JSX.Element> = {
  aluguel: <LuHouse />,
  agua: <LuDroplets />,
  luz: <LuZap />,
  outros: <LuTag />,
};

export default function Dashboard({ expenses, showMonths }: Props) {
  const total = sum(expenses);

  const byCategory = (Object.keys(CATEGORIES) as Category[]).map((c) => ({
    key: c,
    total: sum(expenses.filter((e) => e.category === c)),
  }));

  const monthTotals = Object.entries(
    expenses.reduce<Record<string, number>>((acc, e) => {
      const m = monthOf(e.date);
      acc[m] = (acc[m] ?? 0) + e.amount;
      return acc;
    }, {})
  ).sort(([a], [b]) => a.localeCompare(b));
  const maxMonth = Math.max(0, ...monthTotals.map(([, v]) => v));

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
          <Text fontSize="sm" opacity={0.9}>Total lançado</Text>
          <Heading fontSize={{ base: "3xl", md: "5xl" }} mt={1}>
            {brl(total)}
          </Heading>
          <Text mt={2} opacity={0.88}>
            {expenses.length} {expenses.length === 1 ? "lançamento" : "lançamentos"} neste período
          </Text>
        </Box>
        <Flex
          position="relative"
          zIndex={1}
          bg="whiteAlpha.200"
          border="1px solid"
          borderColor="whiteAlpha.300"
          borderRadius="18px"
          p={5}
          minW={{ base: "full", sm: "230px" }}
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
            <Text fontSize="sm" opacity={0.9}>Parte de cada amigo</Text>
            <Heading size="lg" mt={1}>{brl(total / PEOPLE)}</Heading>
            <Text fontSize="xs" mt={1} opacity={0.8}>dividido igualmente entre {PEOPLE}</Text>
          </Box>
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
            <Heading size="md">Despesas por categoria</Heading>
            <Text color="muted" fontSize="sm" mt={1}>A divisão da conta para cada pessoa.</Text>
          </Box>
          <Text color="muted" fontSize="sm">Total: {brl(total)}</Text>
        </Flex>
        <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} spacing={3}>
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
                  <Text color="muted" fontSize="xs">{t ? `${Math.round((t / (total || 1)) * 100)}% do total` : "Sem lançamentos"}</Text>
                </Box>
              </Flex>
              <Heading size="md">{brl(t)}</Heading>
              <Text color="muted" fontSize="sm" mt={1} mb={3}>{brl(t / PEOPLE)} por pessoa</Text>
              <Progress
                value={total ? (t / total) * 100 : 0}
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
          <Text color="muted" fontSize="sm" mb={5}>Compare os gastos acumulados em cada mês.</Text>
          {monthTotals.length === 0 && <Text color="muted">Sem dados.</Text>}
          <Box display="flex" flexDirection="column" gap={4}>
            {monthTotals.map(([m, t]) => (
              <Box key={m}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Text fontWeight="600">{monthLabel(m)}</Text>
                  <Text>
                    {brl(t)}{" "}
                    <Text as="span" color="muted" fontSize="sm">
                      ({brl(t / PEOPLE)} p/ pessoa)
                    </Text>
                  </Text>
                </Box>
                <Progress value={maxMonth ? (t / maxMonth) * 100 : 0} colorScheme="cyanSea" bg="sunken" borderRadius="full" h="8px" />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
