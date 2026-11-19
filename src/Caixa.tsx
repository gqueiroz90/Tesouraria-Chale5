import { useMemo, useState } from "react";
import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import BookingCalendar from "./BookingCalendar";
import BookingForm from "./BookingForm";
import CashExpenseForm from "./CashExpenseForm";
import CashReports from "./CashReports";
import type { CollectionApi } from "./useCollection";
import {
  brl,
  CASH_CATEGORIES,
  cashBalance,
  cashInflows,
  formatDate,
  nightsBetween,
  type Booking,
  type CashDeposit,
  type CashExpense,
  type Expense,
} from "./types";
import DepositForm from "./DepositForm";

interface Props {
  bookings: CollectionApi<Booking>;
  cash: CollectionApi<CashExpense>;
  deposits: CollectionApi<CashDeposit>;
  expenses: Expense[]; // lançamentos; os da categoria "Caixa" entram como aporte
}

export default function Caixa({ bookings, cash, deposits, expenses }: Props) {
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editingExpense, setEditingExpense] = useState<CashExpense | null>(null);
  const [editingDeposit, setEditingDeposit] = useState<CashDeposit | null>(null);
  const bookingModal = useDisclosure();
  const expenseModal = useDisclosure();
  const depositModal = useDisclosure();
  const toast = useToast();

  const spending = useMemo(
    () => [...cash.items].sort((a, b) => b.date.localeCompare(a.date)),
    [cash.items]
  );

  const rentals = useMemo(
    () =>
      bookings.items
        .filter((booking) => booking.kind === "locacao")
        .sort((a, b) => b.checkIn.localeCompare(a.checkIn)),
    [bookings.items]
  );

  const inflows = useMemo(
    () => cashInflows(bookings.items, deposits.items, expenses),
    [bookings.items, deposits.items, expenses]
  );

  const contributions = useMemo(
    () =>
      [
        ...deposits.items.map((d) => ({ ...d, fromExpenses: false })),
        ...expenses
          .filter((e) => e.category === "caixa")
          .map((e) => ({ id: e.id, description: e.description, amount: e.amount, date: e.date, fromExpenses: true })),
      ].sort((a, b) => b.date.localeCompare(a.date)),
    [deposits.items, expenses]
  );

  if (bookings.loading || cash.loading || deposits.loading) {
    return (
      <Flex align="center" gap={3} color="muted" py={10}>
        <Spinner size="sm" />
        <Text>Carregando caixa...</Text>
      </Flex>
    );
  }

  const error = bookings.error || cash.error || deposits.error;
  if (error) {
    return <Alert status="error" borderRadius="12px"><AlertIcon />{error}</Alert>;
  }

  const removeWith = (remove: (id: string) => Promise<void>) => async (id: string) => {
    try {
      await remove(id);
    } catch {
      toast({ title: "Não foi possível excluir.", status: "error" });
    }
  };

  const balance = cashBalance(inflows, cash.items);

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Flex
        bg="surface"
        borderWidth="1px"
        borderColor="line"
        borderRadius="20px"
        p={{ base: 4, md: 5 }}
        justify="space-between"
        align={{ base: "stretch", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap={4}
      >
        <Box>
          <Text color="muted" fontSize="sm">Saldo do caixa</Text>
          <Heading size="lg" color={balance < 0 ? "red.400" : undefined}>{brl(balance)}</Heading>
          <Text color="muted" fontSize="xs" mt={1}>Separado da divisão das despesas da casa.</Text>
        </Box>
        <Flex gap={2} direction={{ base: "column", sm: "row" }} wrap="wrap">
          <Button
            colorScheme="ocean"
            borderRadius="12px"
            onClick={() => {
              setEditingDeposit(null);
              depositModal.onOpen();
            }}
          >
            Aporte
          </Button>
          <Button
            variant="outline"
            borderRadius="12px"
            borderColor="line"
            onClick={() => {
              setEditingBooking(null);
              bookingModal.onOpen();
            }}
          >
            Locação
          </Button>
          <Button
            variant="outline"
            borderRadius="12px"
            borderColor="line"
            onClick={() => {
              setEditingExpense(null);
              expenseModal.onOpen();
            }}
          >
            Novo Gasto
          </Button>
        </Flex>
      </Flex>

      <Tabs variant="soft-rounded" colorScheme="ocean" isLazy>
        <TabList flexWrap="wrap" gap={2} mb={4}>
          <Tab fontSize={{ base: "sm", md: "md" }}>Calendário</Tab>
          <Tab fontSize={{ base: "sm", md: "md" }}>Locação</Tab>
          <Tab fontSize={{ base: "sm", md: "md" }}>Aportes</Tab>
          <Tab fontSize={{ base: "sm", md: "md" }}>Gastos</Tab>
          <Tab fontSize={{ base: "sm", md: "md" }}>Relatórios</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0}>
            <BookingCalendar
              bookings={bookings.items}
              month={month}
              onMonthChange={setMonth}
              onEdit={(b) => {
                setEditingBooking(b);
                bookingModal.onOpen();
              }}
              onDelete={removeWith(bookings.remove)}
            />
          </TabPanel>
          <TabPanel p={0}>
            <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={{ base: 3, md: 5 }}>
              {rentals.length === 0 ? (
                <Text color="muted">Nenhuma locação cadastrada.</Text>
              ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                  {rentals.map((booking) => {
                    const nights = nightsBetween(booking.checkIn, booking.checkOut);
                    return (
                      <Flex
                        key={booking.id}
                        borderWidth="1px"
                        borderColor="line"
                        borderRadius="14px"
                        p={3}
                        gap={3}
                        justify="space-between"
                        align={{ base: "stretch", sm: "center" }}
                        direction={{ base: "column", sm: "row" }}
                      >
                        <Box minW={0}>
                          <Flex align="center" gap={2} wrap="wrap">
                            <Badge colorScheme="ocean">Locação</Badge>
                            <Text fontWeight="700" wordBreak="break-word">{booking.name}</Text>
                          </Flex>
                          <Text fontSize="sm" color="muted" mt={1}>
                            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)} · {nights} {nights === 1 ? "noite" : "noites"}
                          </Text>
                          <Text fontWeight="700" mt={1}>{brl(booking.amount)}</Text>
                          {booking.note && (
                            <Text fontSize="sm" color="muted" mt={1} wordBreak="break-word">
                              {booking.note}
                            </Text>
                          )}
                        </Box>
                        <ButtonGroup size="sm" variant="outline" flexShrink={0}>
                          <Button
                            flex={{ base: 1, sm: "none" }}
                            onClick={() => {
                              setEditingBooking(booking);
                              bookingModal.onOpen();
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            flex={{ base: 1, sm: "none" }}
                            colorScheme="red"
                            onClick={() => {
                              if (confirm("Excluir esta locação?")) {
                                void removeWith(bookings.remove)(booking.id);
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        </ButtonGroup>
                      </Flex>
                    );
                  })}
                </Box>
              )}
            </Box>
          </TabPanel>
          <TabPanel p={0}>
            <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={{ base: 3, md: 5 }}>
              {contributions.length === 0 ? (
                <Text color="muted">Nenhum aporte no caixa.</Text>
              ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                  {contributions.map((c) => (
                    <Flex
                      key={`${c.fromExpenses ? "l" : "a"}-${c.id}`}
                      borderWidth="1px"
                      borderColor="line"
                      borderRadius="14px"
                      p={3}
                      gap={3}
                      justify="space-between"
                      align={{ base: "stretch", sm: "center" }}
                      direction={{ base: "column", sm: "row" }}
                    >
                      <Box minW={0}>
                        <Flex align="center" gap={2} wrap="wrap">
                          <Badge colorScheme={c.fromExpenses ? "cyanSea" : "ocean"}>
                            {c.fromExpenses ? "Via Lançamentos" : "Aporte direto"}
                          </Badge>
                          <Text fontSize="sm" color="muted">{formatDate(c.date)}</Text>
                        </Flex>
                        <Text fontWeight="600" mt={1} wordBreak="break-word">{c.description}</Text>
                        <Text fontWeight="700">{brl(c.amount)}</Text>
                      </Box>
                      {!c.fromExpenses && (
                        <ButtonGroup size="sm" variant="outline" flexShrink={0}>
                          <Button
                            flex={{ base: 1, sm: "none" }}
                            onClick={() => {
                              setEditingDeposit(deposits.items.find((d) => d.id === c.id) ?? null);
                              depositModal.onOpen();
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            flex={{ base: 1, sm: "none" }}
                            colorScheme="red"
                            onClick={() => {
                              if (confirm("Excluir este aporte?")) void removeWith(deposits.remove)(c.id);
                            }}
                          >
                            Excluir
                          </Button>
                        </ButtonGroup>
                      )}
                    </Flex>
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>
          <TabPanel p={0}>
            <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={{ base: 3, md: 5 }}>
              {spending.length === 0 ? (
                <Text color="muted">Nenhum gasto do caixa.</Text>
              ) : (
                <Box display="flex" flexDirection="column" gap={3}>
                  {spending.map((e) => (
                    <Flex
                      key={e.id}
                      borderWidth="1px"
                      borderColor="line"
                      borderRadius="14px"
                      p={3}
                      gap={3}
                      justify="space-between"
                      align={{ base: "stretch", sm: "center" }}
                      direction={{ base: "column", sm: "row" }}
                    >
                      <Box minW={0}>
                        <Flex align="center" gap={2} wrap="wrap">
                          <Badge colorScheme={CASH_CATEGORIES[e.category].color}>{CASH_CATEGORIES[e.category].label}</Badge>
                          <Text fontSize="sm" color="muted">{formatDate(e.date)}</Text>
                        </Flex>
                        <Text fontWeight="600" mt={1} wordBreak="break-word">{e.description}</Text>
                        <Text fontWeight="700">{brl(e.amount)}</Text>
                      </Box>
                      <ButtonGroup size="sm" variant="outline" flexShrink={0}>
                        <Button
                          flex={{ base: 1, sm: "none" }}
                          onClick={() => {
                            setEditingExpense(e);
                            expenseModal.onOpen();
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          flex={{ base: 1, sm: "none" }}
                          colorScheme="red"
                          onClick={() => {
                            if (confirm("Excluir este gasto?")) void removeWith(cash.remove)(e.id);
                          }}
                        >
                          Excluir
                        </Button>
                      </ButtonGroup>
                    </Flex>
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>
          <TabPanel p={0}>
            <CashReports inflows={inflows} spending={cash.items} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <BookingForm
        isOpen={bookingModal.isOpen}
        onClose={bookingModal.onClose}
        editing={editingBooking}
        bookings={bookings.items}
        onSave={bookings.save}
      />
      <DepositForm
        isOpen={depositModal.isOpen}
        onClose={depositModal.onClose}
        editing={editingDeposit}
        onSave={deposits.save}
      />
      <CashExpenseForm
        isOpen={expenseModal.isOpen}
        onClose={expenseModal.onClose}
        editing={editingExpense}
        onSave={cash.save}
      />
    </Box>
  );
}
