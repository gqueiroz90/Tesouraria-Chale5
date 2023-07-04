import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  HStack,
  Icon,
  extendTheme,
  InputGroup,
  Grid,
  Card,
  Badge,
  GridItem,
} from "@chakra-ui/react";
import { InputLeftAddon } from "@chakra-ui/react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  components: {
    IconButton: {
      baseStyle: {
        _hover: {
          bg: "transparent",
        },
      },
      variants: {
        light: {
          bg: "transparent",
          color: "gray.400",
          _hover: {
            color: "gray.800",
          },
        },
        dark: {
          bg: "transparent",
          color: "white",
          _hover: {
            color: "gray.300",
          },
        },
      },
    },
  },
});

function Lancamentos() {
  const [entradas, setEntradas] = useState<number>(0);
  const [saidas, setSaidas] = useState<number>(0);
  const [saldo, setSaldo] = useState<number>(0);
  const [historico, setHistorico] = useState<string[]>([]);
  const [descricao, setDescricao] = useState<string>("");
  const [valor, setValor] = useState<string>("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");

  const handleLancamento = () => {
    if (descricao.trim() === "" || valor.trim() === "") {
      return;
    }

    const parsedValor = parseFloat(valor.replace(",", "."));
    if (isNaN(parsedValor)) {
      return;
    }

    if (valor.includes(".") || valor.includes(",")) {
      alert("Digite apenas números!");
      return;
    }

    const lancamentoTipo = tipo;

    const lancamentoValor = lancamentoTipo === "entrada" ? parsedValor : -parsedValor;
    const novoSaldo = saldo + lancamentoValor;
    const valorFormatado = lancamentoValor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    const lancamento = `${lancamentoTipo[0].toUpperCase() + lancamentoTipo.substring(1)}: ${
      descricao[0].toUpperCase() + descricao.substring(1)
    } ${valorFormatado}`;

    setDescricao("");
    setValor("");
    setTipo("entrada");
    setSaldo(novoSaldo);
    setHistorico([lancamento, ...historico]);

    if (lancamentoTipo === "entrada") {
      setEntradas((prevEntradas) => prevEntradas + lancamentoValor);
    } else {
      setSaidas((prevSaidas) => prevSaidas + lancamentoValor);
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6}>
        <Box p={4}>
          <Heading mb={4}>Tesouraria</Heading>
          <Card p={4} boxShadow="md" rounded="md" mb={4} maxWidth={"16rem"}>
            <VStack spacing={4} align="start">
              <Text>Total de Entradas: R$ {entradas.toFixed(2)}</Text>
              <Text>Total de Saídas: R$ {saidas.toFixed(2)}</Text>
              <Text>Saldo: R$ {saldo.toFixed(2)}</Text>
            </VStack>
          </Card>
          <HStack>
            <Input
              placeholder="Descrição"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              mb={2}
              width={"20rem"}
            />
            <InputGroup position="relative">
              <InputLeftAddon children="R$" />
              <Input
                placeholder="Valor"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                mb={2}
                ml={"0.5rem"}
                width={"10rem"}
              />
              {tipo === "entrada" ? (
                <Icon as={FaArrowUp} color="green.500" ml={"0.5rem"} mt={"0.8rem"} />
              ) : (
                <Icon as={FaArrowDown} color="red.500" ml={"0.5rem"} mt={"0.8rem"} />
              )}
            </InputGroup>
          </HStack>
          <HStack mt={4} spacing={4}>
            <Button
              colorScheme={tipo === "entrada" ? "green" : "green"}
              variant={tipo === "entrada" ? "solid" : "outline"}
              onClick={() => setTipo("entrada")}
            >
              Entrada
            </Button>
            <Button
              colorScheme={tipo === "saida" ? "red" : "red"}
              variant={tipo === "saida" ? "solid" : "outline"}
              onClick={() => setTipo("saida")}
            >
              Saída
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleLancamento}
              mt={0}
              disabled={descricao.trim() === "" || valor.trim() === ""}
            >
              Lançar
            </Button>
          </HStack>
        </Box>
        <GridItem flexGrow={1}>
          <Box>
            <Heading p={5} size="md">Histórico</Heading>
            <VStack spacing={2} align="start" mt={2} flexGrow={1}>
              {historico.map((item, index) => (
                <Card key={index} p={4} boxShadow="md" rounded="md" height="100%" minWidth={"20rem"}>
                  <Badge 
                    maxWidth={"4rem"} 
                    colorScheme={item.includes("Entrada") ? "green" : "red"}>
                    {item.includes("Entrada") ? "Entrada" : "Saída"}
                  </Badge>
                  <Text>{item}</Text>
                </Card>
              ))}
            </VStack>
          </Box>
        </GridItem>
      </Grid>
    </ChakraProvider>
  );
}

export default Lancamentos;
