import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { GiPalmTree } from "react-icons/gi";
import { LuLayoutDashboard, LuLogOut, LuMoon, LuReceipt, LuSun, LuHouse } from "react-icons/lu";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Select,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Dashboard from "./Dashboard";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import { monthLabel, monthOf, type Expense } from "./types";
import { useExpenses } from "./useExpenses";

type Page = "dashboard" | "lancamentos";

const NAV: { key: Page; label: string; icon: JSX.Element }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LuLayoutDashboard /> },
  { key: "lancamentos", label: "Lançamentos", icon: <LuReceipt /> },
];

interface Props {
  user: User;
  onSignOut: () => Promise<void>;
}

export default function App({ user, onSignOut }: Props) {
  const { expenses, loading, error, save, remove } = useExpenses();
  const [page, setPage] = useState<Page>("dashboard");
  const [period, setPeriod] = useState("geral");
  const [editing, setEditing] = useState<Expense | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const months = useMemo(
    () => [...new Set(expenses.map((e) => monthOf(e.date)))].sort().reverse(),
    [expenses]
  );

  const filtered = useMemo(
    () => (period === "geral" ? expenses : expenses.filter((e) => monthOf(e.date) === period)),
    [expenses, period]
  );

  const openNew = () => {
    setEditing(null);
    onOpen();
  };
  const openEdit = (e: Expense) => {
    setEditing(e);
    onOpen();
  };
  const deleteExpense = async (id: string) => {
    try {
      await remove(id);
    } catch {
      toast({ title: "Não foi possível excluir o lançamento.", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" bg="pageBg" color="ink" direction={{ base: "column", md: "row" }}>
      <Flex
        as="nav"
        bg="surface"
        borderColor="line"
        borderRightWidth={{ md: "1px" }}
        borderBottomWidth={{ base: "1px", md: 0 }}
        w={{ base: "full", md: "256px" }}
        flexShrink={0}
        direction={{ base: "row", md: "column" }}
        wrap={{ base: "wrap", md: "nowrap" }}
        p={{ base: 3, md: 6 }}
        gap={{ base: 2, md: 2 }}
        align={{ base: "center", md: "stretch" }}
      >
        <Flex align="center" gap={3} mb={{ md: 10 }} w={{ base: "full", md: "auto" }}>
          <Flex
            boxSize="42px"
            align="center"
            justify="center"
            borderRadius="15px"
            bg="ocean.600"
            color="white"
            fontSize="xl"
          >
            <LuHouse />
          </Flex>
          <Box>
            <Heading size="md" lineHeight="1" display="flex" alignItems="center" gap={2}>
              <GiPalmTree aria-hidden="true" />
              Chalé 5
            </Heading>
            <Box mt={1} color="muted" fontSize="xs" fontWeight="600" letterSpacing="0.04em" noOfLines={1}>
               TESOURARIA
            </Box>
          </Box>
        </Flex>
        {NAV.map((n) => (
          <Button
            key={n.key}
            leftIcon={n.icon}
            justifyContent="flex-start"
            variant={page === n.key ? "solid" : "ghost"}
            colorScheme={page === n.key ? "ocean" : undefined}
            color={page === n.key ? undefined : "muted"}
            borderRadius="12px"
            h={{ base: "40px", md: "44px" }}
            flex={{ base: 1, md: "none" }}
            onClick={() => setPage(n.key)}
          >
            {n.label}
          </Button>
        ))}
      </Flex>

      <Box flex="1" minW={0} p={{ base: 4, md: 8 }}>
        <Box maxW="1120px" mx="auto">
        <Flex justify="space-between" align="center" mb={7} gap={4} wrap="wrap">
          <Box>
            <Heading size="lg">{NAV.find((n) => n.key === page)?.label}</Heading>
            <Box color="muted" fontSize="sm" mt={1}>
              Despesas da casa divididas.
            </Box>
          </Box>
          <Flex gap={2} align="center" wrap="wrap" w={{ base: "full", md: "auto" }}>
            <Select
              flex={{ base: 1, sm: "none" }}
              minW={0}
              w={{ base: "auto", sm: "190px" }}
              bg="surface"
              borderColor="line"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="geral">Geral</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </Select>
            <IconButton
              aria-label={colorMode === "light" ? "Ativar modo escuro" : "Ativar modo claro"}
              icon={colorMode === "light" ? <LuSun /> : <LuMoon />}
              onClick={toggleColorMode}
              variant="outline"
              size="md"
              borderColor="line"
              bg="surface"
            />
            <Button
              variant="ghost"
              leftIcon={<LuLogOut />}
              iconSpacing={{ base: 0, sm: 2 }}
              px={{ base: 3, sm: 4 }}
              onClick={() => void onSignOut()}
              aria-label={`Sair da conta ${user.email ?? "Google"}`}
            >
              <Box as="span" display={{ base: "none", sm: "inline" }}>Sair</Box>
            </Button>
            <Button colorScheme="ocean" onClick={openNew} borderRadius="12px" w={{ base: "full", sm: "auto" }}>
              Novo lançamento
            </Button>
          </Flex>
        </Flex>

        {loading ? (
          <Flex align="center" gap={3} color="muted" py={10}>
            <Spinner size="sm" />
            <Text>Carregando lançamentos...</Text>
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="12px"><AlertIcon />{error}</Alert>
        ) : page === "dashboard" ? (
          <Dashboard expenses={filtered} showMonths={period === "geral"} />
        ) : (
          <ExpenseList expenses={filtered} onEdit={openEdit} onDelete={deleteExpense} />
        )}
        </Box>
      </Box>

      <ExpenseForm isOpen={isOpen} onClose={onClose} editing={editing} onSave={save} />
    </Flex>
  );
}
