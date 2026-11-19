import { Box, Card, Heading } from "@chakra-ui/react";

function RightCard() {
  return (
    <Card maxWidth="200px" p={4}>
      <Box>
        <Heading as="h3" size="md" mb={2}>
          Right Card
        </Heading>
        <p>Conteúdo do card do lado direito.</p>
      </Box>
    </Card>
  );
}

export default RightCard;
