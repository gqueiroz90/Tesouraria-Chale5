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
import { fieldProps } from "./fieldProps";
import { CASH_CATEGORIES, type CashCategory, type CashExpense } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: CashExpense | null;
  onSave: (e: Omit<CashExpense, "id"> & { id?: string }) => Promise<void>;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function CashExpenseForm({ isOpen, onClose, editing, onSave }: Props) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<CashCategory>("manutencao");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDescription(editing?.description ?? "");
    setCategory(editing?.category ?? "manutencao");
    setAmount(editing ? String(editing.amount) : "");
    setDate(editing?.date ?? today());
    setSaveError("");
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
        description: description.trim() || CASH_CATEGORIES[category].label,
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
        <ModalHeader>{editing ? "Editar gasto do caixa" : "Novo gasto do caixa"}</ModalHeader>
        <ModalCloseButton color="muted" _hover={{ bg: "sunken" }} />
        <ModalBody display="flex" flexDirection="column" gap={4}>
          {saveError && <Text color="red.500" role="alert">{saveError}</Text>}
          <FormControl>
            <FormLabel color="ink">Categoria</FormLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value as CashCategory)} {...fieldProps}>
              {Object.entries(CASH_CATEGORIES).map(([k, c]) => (
                <option key={k} value={k}>{c.label}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel color="ink">Descrição</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={160} {...fieldProps} />
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="ink">Valor (R$)</FormLabel>
            <NumberInput value={amount} onChange={setAmount} min={0}>
              <NumberInputField {...fieldProps} />
            </NumberInput>
          </FormControl>
          <FormControl isRequired>
            <FormLabel color="ink">Data</FormLabel>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} {...fieldProps} />
          </FormControl>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button colorScheme="ocean" onClick={submit} isDisabled={!valid} isLoading={saving}>
            Salvar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
