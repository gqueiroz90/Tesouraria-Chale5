import { useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { GiPalmTree } from "react-icons/gi";
import { LuLayoutDashboard, LuLogOut, LuMoon, LuReceipt, LuSun, LuHouse, LuPiggyBank } from "react-icons/lu";
import { motion } from "framer-motion";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Spinner,
  Text,
  useColorMode,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Caixa from "./Caixa";
import BookingForm from "./BookingForm";
import DepositForm from "./DepositForm";
import Dashboard from "./Dashboard";
import ExpenseForm from "./ExpenseForm";
import ExpenseList from "./ExpenseList";
import {
  cashBalance,
  cashInflows,
  monthLabel,
  monthOf,
  type Booking,
  type CashDeposit,
  type CashEntry,
  type Expense,
} from "./types";
import { useExpenses } from "./useExpenses";
import { useBookings, useCashDeposits, useCashExpenses } from "./useCollection";

type Page = "dashboard" | "lancamentos" | "caixa";

const NAV: { key: Page; label: string; icon: JSX.Element }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LuLayoutDashboard /> },
  { key: "lancamentos", label: "Lançamentos", icon: <LuReceipt /> },
  { key: "caixa", label: "Caixa", icon: <LuPiggyBank /> },
];

interface Props {
  user: User;
  onSignOut: () => Promise<void>;
}

export default function App({ user, onSignOut }: Props) {
  const { expenses, loading, error, save, remove } = useExpenses();
  const bookings = useBookings();
  const cash = useCashExpenses();
  const deposits = useCashDeposits();
  const cashFlowEntries = useMemo(
    () => cashInflows(bookings.items, deposits.items, expenses),
    [bookings.items, deposits.items, expenses]
  );
  const cashEntries = useMemo<CashEntry[]>(
    () =>
      [
        ...deposits.items.map((deposit) => ({
          id: `deposit-${deposit.id}`,
          recordId: deposit.id,
          type: "Aporte" as const,
          description: deposit.description,
          amount: deposit.amount,
          date: deposit.date,
        })),
        ...bookings.items
          .filter((booking) => booking.kind === "locacao")
          .map((booking) => ({
            id: `booking-${booking.id}`,
            recordId: booking.id,
            type: "Locação" as const,
            description: booking.name,
            amount: booking.amount,
            date: booking.checkIn,
          })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [bookings.items, deposits.items]
  );
  const cashInflowByMonth = useMemo(
    () =>
      cashFlowEntries.reduce<Record<string, number>>((totals, entry) => {
        const month = monthOf(entry.date);
        totals[month] = (totals[month] ?? 0) + entry.amount;
        return totals;
      }, {}),
    [cashFlowEntries]
  );
  const balance =
    loading || error || bookings.loading || cash.loading || deposits.loading ||
    bookings.error || cash.error || deposits.error
      ? null
      : cashBalance(cashFlowEntries, cash.items);
  const [page, setPage] = useState<Page>("dashboard");
  const [period, setPeriod] = useState("geral");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<CashDeposit | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const launchChoice = useDisclosure();
  const cashEntryChoice = useDisclosure();
  const cashDeposit = useDisclosure();
  const bookingLaunch = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  const months = useMemo(
    () =>
      [...new Set([
        ...expenses.map((e) => monthOf(e.date)),
        ...cashEntries.map((entry) => monthOf(entry.date)),
      ])].sort().reverse(),
    [expenses, cashEntries]
  );

  const filtered = useMemo(
    () => (period === "geral" ? expenses : expenses.filter((e) => monthOf(e.date) === period)),
    [expenses, period]
  );
  const filteredCashEntries = useMemo(
    () => (period === "geral" ? cashEntries : cashEntries.filter((entry) => monthOf(entry.date) === period)),
    [cashEntries, period]
  );

  const openNew = () => {
    setEditing(null);
    launchChoice.onOpen();
  };
  const openExpenseForm = () => {
    launchChoice.onClose();
    onOpen();
  };
  const backToLaunchChoice = () => {
    onClose();
    launchChoice.onOpen();
  };
  const openCashForm = () => {
    launchChoice.onClose();
    cashEntryChoice.onOpen();
  };
  const backToLaunchChoiceFromCash = () => {
    cashEntryChoice.onClose();
    launchChoice.onOpen();
  };
  const openCashDeposit = () => {
    cashEntryChoice.onClose();
    setEditingDeposit(null);
    cashDeposit.onOpen();
  };
  const backToCashChoices = () => {
    cashDeposit.onClose();
    if (editingDeposit) {
      setPage("lancamentos");
    } else {
      cashEntryChoice.onOpen();
    }
  };
  const openCashRental = () => {
    cashEntryChoice.onClose();
    setEditingBooking(null);
    bookingLaunch.onOpen();
  };
  const backToCashChoicesFromRental = () => {
    bookingLaunch.onClose();
    if (editingBooking) {
      setPage("lancamentos");
    } else {
      cashEntryChoice.onOpen();
    }
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
  const editCashEntry = (entry: CashEntry) => {
    if (entry.type === "Locação") {
      const booking = bookings.items.find((item) => item.id === entry.recordId);
      if (!booking) {
        toast({ title: "Não foi possível localizar a locação.", status: "error" });
        return;
      }
      setEditingBooking(booking);
      bookingLaunch.onOpen();
      return;
    }

    const deposit = deposits.items.find((item) => item.id === entry.recordId);
    if (!deposit) {
      toast({ title: "Não foi possível localizar o aporte.", status: "error" });
      return;
    }
    setEditingDeposit(deposit);
    cashDeposit.onOpen();
  };
  const deleteCashEntry = async (entry: CashEntry) => {
    try {
      if (entry.type === "Locação") {
        await bookings.remove(entry.recordId);
      } else {
        await deposits.remove(entry.recordId);
      }
    } catch {
      toast({ title: "Não foi possível excluir a entrada do caixa.", status: "error" });
    }
  };

  return (
    <Flex minH="100vh" bg="pageBg" color="ink" direction={{ base: "column", lg: "row" }}>
      <Flex
        as="nav"
        bg="surface"
        borderColor="line"
        borderRightWidth={{ lg: "1px" }}
        borderBottomWidth={{ base: "1px", lg: 0 }}
        w={{ base: "full", lg: "256px" }}
        flexShrink={0}
        direction={{ base: "row", lg: "column" }}
        wrap={{ base: "wrap", lg: "nowrap" }}
        p={{ base: 3, lg: 6 }}
        gap={2}
        align={{ base: "center", lg: "stretch" }}
      >
        <Flex align="center" gap={3} mb={{ lg: 10 }} w={{ base: "full", lg: "auto" }}>
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
            aria-label={n.label}
            title={n.label}
            justifyContent={{ base: "center", lg: "flex-start" }}
            variant={page === n.key ? "solid" : "ghost"}
            colorScheme={page === n.key ? "ocean" : undefined}
            color={page === n.key ? undefined : "muted"}
            borderRadius="12px"
            h={{ base: "44px", lg: "44px" }}
            minW={0}
            flex={{ base: 1, lg: "none" }}
            onClick={() => setPage(n.key)}
          >
            <Flex as="span" align="center" justify="center" gap={2} minW={0}>
              {n.icon}
              <Box as="span" display={{ base: "none", sm: "inline" }} noOfLines={1}>
                {n.label}
              </Box>
            </Flex>
          </Button>
        ))}
      </Flex>

      <Box flex="1" minW={0} p={{ base: 4, md: 8 }}>
        <Box maxW="1120px" mx="auto">
        <Flex justify="space-between" align="center" mb={7} gap={4} wrap="wrap">
          <Box>
            <Heading size="lg">{NAV.find((n) => n.key === page)?.label}</Heading>
            <Box color="muted" fontSize="sm" mt={1}>
              {page === "caixa"
                ? "Locações e gastos do caixa"
                : "Extrato"}
            </Box>
          </Box>
          <Flex gap={2} align="center" wrap="wrap" w={{ base: "full", md: "auto" }}>
            {page !== "caixa" && (
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
            )}
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
              Novo Lançamento
            </Button>
          </Flex>
        </Flex>

        {page === "caixa" ? (
          <Caixa bookings={bookings} cash={cash} deposits={deposits} expenses={expenses} />
        ) : loading ? (
          <Flex align="center" gap={3} color="muted" py={10}>
            <Spinner size="sm" />
            <Text>Carregando lançamentos...</Text>
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="12px"><AlertIcon />{error}</Alert>
        ) : page === "lancamentos" && (bookings.loading || deposits.loading) ? (
          <Flex align="center" gap={3} color="muted" py={10}>
            <Spinner size="sm" />
            <Text>Carregando entradas do caixa...</Text>
          </Flex>
        ) : page === "lancamentos" && (bookings.error || deposits.error) ? (
          <Alert status="error" borderRadius="12px">
            <AlertIcon />{bookings.error || deposits.error}
          </Alert>
        ) : page === "dashboard" ? (
          <Dashboard
            expenses={filtered}
            allExpenses={expenses}
            showMonths={period === "geral"}
            cashBalance={balance}
            cashInflowByMonth={cashInflowByMonth}
            onOpenCaixa={() => setPage("caixa")}
          />
        ) : (
          <ExpenseList
            expenses={filtered}
            cashEntries={filteredCashEntries}
            onEdit={openEdit}
            onDelete={deleteExpense}
            onEditCashEntry={editCashEntry}
            onDeleteCashEntry={deleteCashEntry}
          />
        )}
        </Box>
      </Box>

      <ExpenseForm
        isOpen={isOpen}
        onClose={onClose}
        editing={editing}
        onSave={save}
        onBack={editing ? undefined : backToLaunchChoice}
      />
      <Modal isOpen={launchChoice.isOpen} onClose={launchChoice.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="surface" color="ink" borderWidth="1px" borderColor="line" mx={4}>
          <ModalHeader>Novo lançamento</ModalHeader>
          <ModalCloseButton color="muted" _hover={{ bg: "sunken" }} />
          <ModalBody pb={6}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Flex direction={{ base: "column", sm: "row" }} gap={3}>
                <Button
                  flex={1}
                  minH="64px"
                  colorScheme="red"
                  borderRadius="12px"
                  onClick={openExpenseForm}
                >
                  Despesas
                </Button>
                <Button
                  flex={1}
                  minH="64px"
                  colorScheme="blue"
                  borderRadius="12px"
                  onClick={openCashForm}
                >
                  Caixa
                </Button>
              </Flex>
            </motion.div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal isOpen={cashEntryChoice.isOpen} onClose={cashEntryChoice.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent bg="surface" color="ink" borderWidth="1px" borderColor="line" mx={4}>
          <ModalHeader>Adicionar ao caixa</ModalHeader>
          <ModalCloseButton color="muted" _hover={{ bg: "sunken" }} />
          <ModalBody pb={6}>
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <Flex direction={{ base: "column", sm: "row" }} gap={3}>
                <Button
                  flex={1}
                  minH="64px"
                  colorScheme="blue"
                  borderRadius="12px"
                  onClick={openCashDeposit}
                >
                  Aporte
                </Button>
                <Button
                  flex={1}
                  minH="64px"
                  colorScheme="teal"
                  borderRadius="12px"
                  isDisabled={bookings.loading || !!bookings.error}
                  onClick={openCashRental}
                >
                  Locação
                </Button>
              </Flex>
              {bookings.loading && (
                <Text color="muted" fontSize="sm" mt={3}>Carregando reservas...</Text>
              )}
              {bookings.error && (
                <Text color="red.500" fontSize="sm" mt={3}>{bookings.error}</Text>
              )}
            </motion.div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={backToLaunchChoiceFromCash}>Voltar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <DepositForm
        isOpen={cashDeposit.isOpen}
        onClose={cashDeposit.onClose}
        editing={editingDeposit}
        onSave={deposits.save}
        onBack={backToCashChoices}
      />
      <BookingForm
        isOpen={bookingLaunch.isOpen}
        onClose={bookingLaunch.onClose}
        editing={editingBooking}
        bookings={bookings.items}
        fixedKind="locacao"
        onSave={bookings.save}
        onBack={backToCashChoicesFromRental}
      />
    </Flex>
  );
}
