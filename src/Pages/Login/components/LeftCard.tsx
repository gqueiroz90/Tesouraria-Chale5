import { Box, Card, Heading } from "@chakra-ui/react";

function LeftCard() {
  return (
    <Card maxWidth="200px" p={4}>
      <Box>
        <Heading as="h3" size="md" mb={2}>
          Left Card
        </Heading>
        <p>Conteúdo do card do lado esquerdo.</p>
      </Box>
    </Card>
  );
}

export default LeftCard;
