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
  Text,
} from "@chakra-ui/react";
import { FirebaseError } from "firebase/app";
import { motion } from "framer-motion";
import { fieldProps } from "./fieldProps";
import type { CashDeposit } from "./types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editing: CashDeposit | null;
  onSave: (d: Omit<CashDeposit, "id"> & { id?: string }) => Promise<void>;
  onBack?: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function DepositForm({ isOpen, onClose, editing, onSave, onBack }: Props) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setDescription(editing?.description ?? "");
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
      await onSave({ id: editing?.id, description: description.trim() || "Aporte", amount: value, date });
      onClose();
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "permission-denied") {
        setSaveError(
          "O Firestore negou o acesso. Publique as regras que permitem criar documentos em /aportes e confirme que sua conta está autorizada."
        );
      } else if (
        error instanceof FirebaseError &&
        (error.code === "unavailable" || error.code === "network-request-failed")
      ) {
        setSaveError("Sem conexão com o Firestore. Verifique sua internet e tente novamente.");
      } else {
        setSaveError("Não foi possível salvar o aporte. Tente novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" />
      <ModalContent bg="surface" color="ink" borderWidth="1px" borderColor="line" mx={4}>
        <ModalHeader>{editing ? "Editar aporte" : "Novo aporte no caixa"}</ModalHeader>
        <ModalCloseButton color="muted" _hover={{ bg: "sunken" }} />
        <ModalBody>
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
          {saveError && <Text color="red.500" role="alert">{saveError}</Text>}
          <FormControl>
            <FormLabel color="ink">Descrição</FormLabel>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={160} placeholder="Ex.: Aporte de Gabriel" {...fieldProps} />
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
