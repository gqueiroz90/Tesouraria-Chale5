import React, { useState, useRef, ChangeEvent, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Input,
  Card,
  extendTheme,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  AvatarGroup,
  Avatar,
  useBreakpointValue,
} from "@chakra-ui/react";
import users from "./users.json";
import agenorAvatar from "../../assets/avatars/agenorAvatar.jpeg";
import arturAvatar from "../../assets/avatars/arturAvatar.jpeg";
import gabrielAvatar from "../../assets/avatars/gabrielAvatar.jpeg";
import leonardoAvatar from "../../assets/avatars/leonardoAvatar.jpeg";
import thiagoAvatar from "../../assets/avatars/thiagoAvatar.jpeg";

const avatars = [
  {
    name: "Agenor",
    url: agenorAvatar,
  },
  {
    name: "Arthur",
    url: arturAvatar,
  },
  {
    name: "Gabriel",
    url: gabrielAvatar,
  },
  {
    name: "Leonardo",
    url: leonardoAvatar,
  },
  {
    name: "Thiago",
    url: thiagoAvatar,
  },
];

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

function LoginCard({ handleLogin }: { handleLogin: (username: string, password: string) => void }) {
  const size = useBreakpointValue({ base: "md", md: "lg" });
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLogin(username, password);
    }
  };

  return (
    <Card maxWidth="300px" maxHeight="500px">
      <Box p={4}>
        <Heading mb={4} textAlign="center">
          Login
        </Heading>
        <AvatarGroup mb={4}>
          {avatars.map((avatar) => (
            <Avatar
              key={avatar.name}
              name={avatar.name}
              src={avatar.url}
              size={size}
              position="relative"
              zIndex={2}
              _before={{
                content: '""',
                width: "full",
                height: "full",
                rounded: "full",
                transform: "scale(1.080)",
                bgGradient: "linear(to-bl, blue.400,pink.400)",
                position: "absolute",
                zIndex: -1,
                top: 0,
                left: 0,
              }}
            />
          ))}
        </AvatarGroup>
        <Input
          placeholder="Usuário"
          mb={2}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Input
          type="password"
          placeholder="Senha"
          mb={4}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Box display="flex" justifyContent="center">
          <Button colorScheme="blue" onClick={() => handleLogin(username, password)}>
            Login
          </Button>
        </Box>
      </Box>
    </Card>
  );
}

function Login() {
  const [loginError, setLoginError] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const navigate = useNavigate();
  const leastDestructiveRef = useRef(null);

  const handleLogin = (username: string, password: string) => {
    const user = users.find((user) => user.username === username);
    if (user && user.password === password) {
      console.log("Login successful!");
      navigate("/lancamentos");
    } else {
      setLoginError(true);
      setShowErrorDialog(true);
    }
  };

  const handleCloseErrorDialog = () => {
    setShowErrorDialog(false);
  };

  return (
    <ChakraProvider theme={theme}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Flex justifyContent="center" alignItems="center" width="100%">
          {/* Card no lado esquerdo */}
          <Box pr={2}>
            <Card maxWidth="200px" maxHeight="150px" mt={2}>
              <Box p={4} mr={10}>
                <Heading mb={4} textAlign="center">
                  Card Esquerdo
                </Heading>
                {/* Adicione qualquer conteúdo que você desejar para o card esquerdo */}
              </Box>
            </Card>

            <Card maxWidth="200px" maxHeight="200px" mt={2}>
              <Box p={4}>
                <Heading mb={4} textAlign="center">
                  Card Esquerdo
                </Heading>
                {/* Adicione qualquer conteúdo que você desejar para o card esquerdo */}
              </Box>
            </Card>

            <Card maxWidth="200px" maxHeight="200px" mt={2}>
              <Box p={4}>
                <Heading mb={4} textAlign="center">
                  Card Esquerdo
                </Heading>
                {/* Adicione qualquer conteúdo que você desejar para o card esquerdo */}
              </Box>
            </Card>
          </Box>

          {/* Formulário de login no centro */}
          <Box px={2}>
            <LoginCard handleLogin={handleLogin} />
          </Box>

          {/* Card no lado direito */}
          <Box pl={2}>
            <Card maxWidth="200px" maxHeight="200px" mt={2}>
              <Box p={4}>
                <Heading mb={4} textAlign="center">
                  Card Direito
                </Heading>
                {/* Adicione qualquer conteúdo que você desejar para o card direito */}
              </Box>
            </Card>

            <Card maxWidth="200px" maxHeight="200px" mt={2}>
              <Box p={4}>
                <Heading mb={4} textAlign="center">
                  Card Direito
                </Heading>
                {/* Adicione qualquer conteúdo que você desejar para o card direito */}
              </Box>
            </Card>

            <Card maxWidth="200px" maxHeight="200px" mt={2}>
              <Box p={4}>
                <Heading mb={4} textAlign="center">
                  Card Direito
                </Heading>
                {/* Adicione qualquer conteúdo que você desejar para o card direito */}
              </Box>
            </Card>
          </Box>
        </Flex>

        <AlertDialog
          isOpen={showErrorDialog}
          leastDestructiveRef={leastDestructiveRef}
          onClose={handleCloseErrorDialog}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader>Erro de Login</AlertDialogHeader>
              <AlertDialogBody>
                Nome de usuário ou senha inválidos.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={leastDestructiveRef}
                  onClick={handleCloseErrorDialog}
                >
                  OK
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </ChakraProvider>
  );
}

export default Login;
