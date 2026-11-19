import { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  Select,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { fieldProps } from "./fieldProps";
import { motion } from "framer-motion";
import {
  addDays,
  BOOKING_KINDS,
  bookingsOverlap,
  brl,
  formatDate,
  nightsBetween,
  type Booking,
  type BookingKind,
} from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: Booking | null;
  bookings: Booking[];
  fixedKind?: BookingKind;
  onSave: (b: Omit<Booking, "id"> & { id?: string }) => Promise<void>;
  onBack?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function BookingForm({
  isOpen,
  onClose,
  editing,
  bookings,
  fixedKind,
  onSave,
  onBack,
}: Props) {
  const [kind, setKind] = useState<BookingKind>("locacao");
  const [name, setName] = useState("");
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(addDays(today(), 1));
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setKind(editing?.kind ?? fixedKind ?? "locacao");
    setName(editing?.name ?? "");
    setCheckIn(editing?.checkIn ?? today());
    setCheckOut(editing?.checkOut ?? addDays(today(), 1));
    setAmount(editing && editing.amount ? String(editing.amount) : "");
    setNote(editing?.note ?? "");
    setSaveError("");
  }, [isOpen, editing, fixedKind]);

  const changeCheckIn = (value: string) => {
    setCheckIn(value);
    if (value && checkOut <= value) setCheckOut(addDays(value, 1));
  };

  const value = kind === "uso" ? 0 : parseFloat(amount.replace(",", "."));
  const datesValid = checkIn !== "" && checkOut !== "" && checkOut > checkIn;
  const conflict = datesValid
    ? bookings.find((b) => b.id !== editing?.id && bookingsOverlap(b, { checkIn, checkOut }))
    : undefined;
  const valid =
    name.trim() !== "" &&
    datesValid &&
    !conflict &&
    !isNaN(value) &&
    (kind === "uso" || value > 0);

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        id: editing?.id,
        kind,
        name: name.trim(),
        checkIn,
        checkOut,
        amount: value,
        note: note.trim(),
      });
      onClose();
    } catch {
      setSaveError("Não foi possível salvar. Verifique sua conexão e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="surface" color="ink" borderWidth="1px" borderColor="line" mx={4}>
        <ModalHeader>
          {editing ? "Editar reserva" : fixedKind === "locacao" ? "Nova locação" : "Nova reserva"}
        </ModalHeader>
        <ModalCloseButton color="muted" _hover={{ bg: "sunken" }} />
        <ModalBody>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
          {saveError && <Text color="red.500" role="alert">{saveError}</Text>}
          {fixedKind ? (
            <FormControl>
              <FormLabel color="ink">Tipo</FormLabel>
              <Text>{BOOKING_KINDS[fixedKind]}</Text>
            </FormControl>
          ) : (
            <FormControl>
              <FormLabel color="ink">Tipo</FormLabel>
              <Select value={kind} onChange={(e) => setKind(e.target.value as BookingKind)} {...fieldProps}>
                {Object.entries(BOOKING_KINDS).map(([k, label]) => (
                  <option key={k} value={k}>{label}</option>
                ))}
              </Select>
            </FormControl>
          )}
          <FormControl isRequired>
            <FormLabel color="ink">{kind === "locacao" ? "Hóspede" : "Quem vai usar"}</FormLabel>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} {...fieldProps} />
          </FormControl>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel color="ink">Entrada</FormLabel>
              <Input type="date" value={checkIn} onChange={(e) => changeCheckIn(e.target.value)} {...fieldProps} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel color="ink">Saída</FormLabel>
              <Input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} {...fieldProps} />
            </FormControl>
          </SimpleGrid>
          {datesValid && (
            <Text fontSize="sm" color="muted" mt={-2}>
              {nightsBetween(checkIn, checkOut)} {nightsBetween(checkIn, checkOut) === 1 ? "noite" : "noites"}
              {kind === "locacao" && value > 0 && ` · ${brl(value / nightsBetween(checkIn, checkOut))} por noite`}
            </Text>
          )}
          {checkIn && checkOut && !datesValid && (
            <Alert status="warning" borderRadius="12px"><AlertIcon />A saída precisa ser depois da entrada.</Alert>
          )}
          {conflict && (
            <Alert status="error" borderRadius="12px">
              <AlertIcon />
              Conflito com {conflict.name} ({formatDate(conflict.checkIn)} a {formatDate(conflict.checkOut)}).
            </Alert>
          )}
          {kind === "locacao" && (
            <FormControl isRequired>
              <FormLabel color="ink">Valor da locação (R$)</FormLabel>
              <NumberInput value={amount} onChange={setAmount} min={0}>
                <NumberInputField {...fieldProps} />
              </NumberInput>
            </FormControl>
          )}
          <FormControl>
            <FormLabel color="ink">Observação</FormLabel>
            <Input value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} {...fieldProps} />
          </FormControl>
          </motion.div>
        </ModalBody>
        <ModalFooter gap={2}>
          {onBack && <Button variant="ghost" mr="auto" onClick={onBack}>Voltar</Button>}
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button colorScheme="ocean" onClick={submit} isDisabled={!valid} isLoading={saving}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
