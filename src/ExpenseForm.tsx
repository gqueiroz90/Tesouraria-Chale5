import { useEffect, useState } from "react";
import {
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
  Text,
} from "@chakra-ui/react";
import { brl, CATEGORIES, PEOPLE, type Category, type Expense } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: Expense | null;
  onSave: (e: Omit<Expense, "id"> & { id?: string }) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseForm({ isOpen, onClose, editing, onSave }: Props) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("aluguel");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDescription(editing?.description ?? "");
    setCategory(editing?.category ?? "aluguel");
    setAmount(editing ? String(editing.amount) : "");
    setDate(editing?.date ?? today());
  }, [isOpen, editing]);

  const value = parseFloat(amount.replace(",", "."));
  const valid = !isNaN(value) && value > 0 && date !== "";

  const submit = async () => {
    if (!valid) return;
    setSaving(true);
    setSaveError("");
    try {
      await onSave({
        id: editing?.id,
        description: description.trim() || CATEGORIES[category].label,
        category,
        amount: value,
        date,
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
        <ModalHeader>{editing ? "Editar lançamento" : "Novo lançamento"}</ModalHeader>
        <ModalCloseButton color="muted" _hover={{ bg: "sunken" }} />
        <ModalBody display="flex" flexDirection="column" gap={4}>
          {saveError && <Text color="red.500" role="alert">{saveError}</Text>}
          <FormControl>
            <FormLabel color="ink">Categoria</FormLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              bg="sunken"
              color="ink"
              borderColor="line"
              _hover={{ borderColor: "ocean.400" }}
              _focusVisible={{ borderColor: "ocean.400", boxShadow: "0 0 0 1px var(--chakra-colors-ocean-400)" }}
            >
              {Object.entries(CATEGORIES).map(([k, c]) => (
                <option key={k} value={k}>
                  {c.label}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel color="ink">Descrição</FormLabel>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              bg="sunken"
              color="ink"
              borderColor="line"
              _hover={{ borderColor: "ocean.400" }}
              _focusVisible={{ borderColor: "ocean.400", boxShadow: "0 0 0 1px var(--chakra-colors-ocean-400)" }}
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="ink">Valor total (R$)</FormLabel>
            <NumberInput value={amount} onChange={setAmount} min={0}>
              <NumberInputField
                bg="sunken"
                color="ink"
                borderColor="line"
                _hover={{ borderColor: "ocean.400" }}
                _focusVisible={{ borderColor: "ocean.400", boxShadow: "0 0 0 1px var(--chakra-colors-ocean-400)" }}
              />
            </NumberInput>
            {valid && (
              <Text fontSize="sm" color="muted" mt={1}>
                {brl(value / PEOPLE)} por pessoa
              </Text>
            )}
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="ink">Data</FormLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              bg="sunken"
              color="ink"
              borderColor="line"
              _hover={{ borderColor: "ocean.400" }}
              _focusVisible={{ borderColor: "ocean.400", boxShadow: "0 0 0 1px var(--chakra-colors-ocean-400)" }}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="ocean" onClick={submit} isDisabled={!valid} isLoading={saving}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
