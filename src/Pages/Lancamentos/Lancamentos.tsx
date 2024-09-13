import React, { useEffect, useState } from "react";
import {
  ChakraProvider,
  Box,
  Heading,
  Text,
  VStack,
  Grid,
  Card,
  Badge,
  GridItem,
} from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
// Importando diretamente o JSON
import caderninho from "../../data/caderninho.json";

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
});

type Lancamento = {
  id: number;
  autor: string;
  data: string;
  tipo: string;
  descricao: string;
  valor: number;
};

function Lancamentos() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [saldo, setSaldo] = useState<number>(0);

  useEffect(() => {
    // Definindo os dados diretamente do arquivo importado
    const lancamentosFiltrados = caderninho.map((item) => ({
      ...item,
      tipo: item.tipo === "entrada" || item.tipo === "saida" ? item.tipo : "saida",
    }));

    setLancamentos(lancamentosFiltrados);

    // Calculando o saldo total
    const totalSaldo = lancamentosFiltrados.reduce(
      (acc: number, lancamento: Lancamento) => {
        return lancamento.tipo === "entrada"
          ? acc + lancamento.valor
          : acc - lancamento.valor;
      },
      0
    );

    setSaldo(totalSaldo);
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <Grid templateColumns={{ base: "1fr", md: "1fr 2fr" }} gap={6}>
        <Box p={4}>
          <Heading mb={4}>Tesouraria</Heading>
          <Card p={4} boxShadow="md" rounded="md" mb={4} maxWidth={"16rem"}>
            <VStack spacing={4} align="start">
              <Text>
                Saldo Total: R${" "}
                {saldo.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </VStack>
          </Card>
        </Box>
        <GridItem flexGrow={1}>
          <Box>
            <Heading p={5} size="md">
              Histórico de Lançamentos
            </Heading>
            <VStack spacing={2} align="start" mt={2} flexGrow={1}>
              {lancamentos.map((lancamento) => (
                <Card
                  key={lancamento.id}
                  p={4}
                  boxShadow="md"
                  rounded="md"
                  height="100%"
                  minWidth={"20rem"}
                >
                  <Badge
                    maxWidth={"4rem"}
                    colorScheme={
                      lancamento.tipo === "entrada" ? "green" : "red"
                    }
                  >
                    {lancamento.tipo === "entrada" ? "Entrada" : "Saída"}
                  </Badge>
                  <Text>Autor: {lancamento.autor}</Text>
                  <Text>
                    Data: {new Date(lancamento.data).toLocaleDateString()}
                  </Text>
                  <Text>Descrição: {lancamento.descricao}</Text>
                  <Text>
                    Valor:{" "}
                    {lancamento.valor.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </Text>
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
