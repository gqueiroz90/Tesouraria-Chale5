import { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Heading,
  Input,
  Card,
  extendTheme,
  useColorMode,
  Icon,
  Button,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import { IoMdSunny, IoMdMoon } from "react-icons/io";
import users from './users.json';

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
          color: "gray.400", // Altere a cor para uma cor mais clara, como gray.400
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


function Login() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const navigate = useNavigate();
  const leastDestructiveRef = useRef(null);

  const handleLogin = () => {
    const user = users.find((user) => user.username === username);
    if (user && user.password === password) {
      console.log('Login successful!');
      navigate('/lancamentos'); // Redireciona para a página de lançamentos
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
        <Card maxWidth="300px" maxHeight="500px">
          <Box p={4}>
            <Heading mb={4} textAlign="center">
              Login
            </Heading>
            <Input
              placeholder="Usuário"
              mb={2}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Senha"
              mb={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Box display="flex" justifyContent="center">
              <Button colorScheme="teal" onClick={handleLogin}>
                Login
              </Button>
            </Box>
          </Box>
        </Card>
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
                <Button ref={leastDestructiveRef} onClick={handleCloseErrorDialog}>
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
