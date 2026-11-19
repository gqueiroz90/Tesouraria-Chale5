import { useMemo } from "react";
import { Badge, Box, Button, ButtonGroup, Flex, Heading, HStack, IconButton, SimpleGrid, Text } from "@chakra-ui/react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import {
  BOOKING_KINDS,
  brl,
  formatDate,
  monthLabel,
  nightsBetween,
  type Booking,
} from "./types";

interface Props {
  bookings: Booking[];
  month: string; // YYYY-MM
  onMonthChange: (ym: string) => void;
  onEdit: (b: Booking) => void;
  onDelete: (id: string) => Promise<void>;
}

const WEEK = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const KIND_STYLE = {
  locacao: { bg: "ocean.400", color: "#12343F" },
  uso: { bg: "sun.300", color: "#443E0B" },
} as const;

const pad = (n: number) => String(n).padStart(2, "0");

export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export default function BookingCalendar({ bookings, month, onMonthChange, onEdit, onDelete }: Props) {
  const [y, m] = month.split("-").map(Number);
  const daysInMonth = new Date(y, m, 0).getDate();
  const offset = new Date(y, m - 1, 1).getDay();
  const first = `${month}-01`;
  const last = `${month}-${pad(daysInMonth)}`;
  const today = new Date().toLocaleDateString("sv-SE");

  const monthBookings = useMemo(
    () =>
      bookings
        .filter((b) => b.checkIn <= last && b.checkOut >= first)
        .sort((a, b) => a.checkIn.localeCompare(b.checkIn)),
    [bookings, first, last]
  );

  const cells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${pad(i + 1)}`),
  ];

  return (
    <Box display="flex" flexDirection="column" gap={5}>
      <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={{ base: 3, md: 5 }}>
        <Flex justify="space-between" align="center" gap={2} mb={4}>
          <IconButton
            aria-label="Mês anterior"
            icon={<LuChevronLeft />}
            variant="outline"
            borderColor="line"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
          />
          <Heading size="md" textAlign="center">{monthLabel(month)}</Heading>
          <IconButton
            aria-label="Próximo mês"
            icon={<LuChevronRight />}
            variant="outline"
            borderColor="line"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
          />
        </Flex>

        <SimpleGrid columns={7} spacing={{ base: 1, md: 2 }}>
          {WEEK.map((d) => (
            <Text key={d} textAlign="center" fontSize="xs" fontWeight="700" color="muted">{d}</Text>
          ))}
          {cells.map((day, i) => {
            if (!day) return <Box key={`empty-${i}`} />;
            const dayBookings = bookings.filter((b) => b.checkIn <= day && day <= b.checkOut);
            return (
              <Box
                key={day}
                minH={{ base: "56px", md: "88px" }}
                minW={0}
                p={1}
                borderWidth="1px"
                borderColor={day === today ? "ocean.400" : "line"}
                borderRadius="10px"
                bg="sunken"
              >
                <Text fontSize="xs" fontWeight={day === today ? "800" : "600"} color={day === today ? "ocean.400" : "muted"}>
                  {Number(day.slice(8))}
                </Text>
                {dayBookings.map((b) => (
                  <Box
                    key={b.id}
                    mt="2px"
                    px={1}
                    borderRadius="5px"
                    fontSize={{ base: "9px", md: "xs" }}
                    fontWeight="600"
                    lineHeight="1.4"
                    noOfLines={1}
                    title={`${BOOKING_KINDS[b.kind]}: ${b.name}`}
                    {...KIND_STYLE[b.kind]}
                  >
                    {b.name}
                  </Box>
                ))}
              </Box>
            );
          })}
        </SimpleGrid>

        <HStack spacing={4} mt={4} fontSize="sm" color="muted" wrap="wrap">
          {(Object.keys(KIND_STYLE) as (keyof typeof KIND_STYLE)[]).map((k) => (
            <HStack key={k} spacing={2}>
              <Box boxSize="12px" borderRadius="4px" bg={KIND_STYLE[k].bg} />
              <Text>{BOOKING_KINDS[k]}</Text>
            </HStack>
          ))}
        </HStack>
      </Box>

      <Box bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={{ base: 3, md: 5 }}>
        <Heading size="sm" mb={3}>Reservas de {monthLabel(month)}</Heading>
        {monthBookings.length === 0 ? (
          <Text color="muted">Nenhuma reserva neste mês.</Text>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {monthBookings.map((b) => {
              const nights = nightsBetween(b.checkIn, b.checkOut);
              return (
                <Flex
                  key={b.id}
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
                      <Badge colorScheme={b.kind === "locacao" ? "ocean" : "sun"}>{BOOKING_KINDS[b.kind]}</Badge>
                      <Text fontWeight="700" wordBreak="break-word">{b.name}</Text>
                    </Flex>
                    <Text fontSize="sm" color="muted" mt={1}>
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)} · {nights} {nights === 1 ? "noite" : "noites"}
                      {b.kind === "locacao" && ` · ${brl(b.amount)}`}
                    </Text>
                    {b.note && <Text fontSize="sm" mt={1} wordBreak="break-word">{b.note}</Text>}
                  </Box>
                  <ButtonGroup size="sm" variant="outline" flexShrink={0}>
                    <Button flex={{ base: 1, sm: "none" }} onClick={() => onEdit(b)}>Editar</Button>
                    <Button
                      flex={{ base: 1, sm: "none" }}
                      colorScheme="red"
                      onClick={() => {
                        if (confirm("Excluir esta reserva?")) void onDelete(b.id);
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
    </Box>
  );
}
