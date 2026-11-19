import { useEffect, useState } from "react";
import {
  Alert,
  AlertIcon,
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { GiPalmTree } from "react-icons/gi";
import { auth, isAllowedEmail, isFirebaseConfigured } from "./firebase";
import App from "./App";

const LOGIN_SPLASH_MS = 1000;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.15); opacity: 1; }
`;

export default function AuthGate() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isFirebaseConfigured);
  const [error, setError] = useState("");
  const [minDelayDone, setMinDelayDone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), LOGIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const firebaseAuth = auth;
    if (!firebaseAuth) return;

    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      if (nextUser && !isAllowedEmail(nextUser.email)) {
        setUser(null);
        setError("Esta conta não tem acesso ao sistema.");
        void signOut(firebaseAuth);
      } else {
        setUser(nextUser);
        if (nextUser) setError("");
      }
      setLoading(false);
    });
  }, []);

  const login = async () => {
    if (!auth) return;
    setError("");
    try {
      const result = await signInWithPopup(auth, new GoogleAuthProvider());
      if (!isAllowedEmail(result.user.email)) {
        await signOut(auth);
        setError("Esta conta não tem acesso ao sistema.");
      }
    } catch {
      setError("Não foi possível entrar com Google. Tente novamente.");
    }
  };

  if (!isFirebaseConfigured) {
    return (
      <Center minH="100vh" bg="pageBg" p={6}>
        <Box maxW="md" w="full" bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={8}>
          <Heading size="md" mb={3}>Conecte o Firebase</Heading>
          <Text color="muted">
            Preencha as variáveis VITE_FIREBASE no arquivo .env com a configuração do app Web do Firebase.
          </Text>
        </Box>
      </Center>
    );
  }

  if (user && !loading) {
    const firebaseAuth = auth;
    if (firebaseAuth) {
      return <App user={user} onSignOut={() => signOut(firebaseAuth)} />;
    }
  }

  if (loading || !minDelayDone) {
    return (
      <Center minH="100vh" bg="pageBg" flexDirection="column" gap={5}>
        <Box
          fontSize="5xl"
          color="ocean.600"
          animation={`${pulse} 1s ease-in-out infinite`}
        >
          <GiPalmTree aria-hidden="true" />
        </Box>
        <Spinner color="ocean.600" size="md" />
      </Center>
    );
  }

  return (
    <Center minH="100vh" bg="pageBg" p={6}>
      <Flex direction="column" gap={4} maxW="sm" w="full" bg="surface" borderWidth="1px" borderColor="line" borderRadius="20px" p={8}>
        <Heading size="lg" display="flex" alignItems="center" justifyContent="center" textAlign="center" gap={2}>
          <GiPalmTree aria-hidden="true" />
          Chalé 5
        </Heading>
        <AvatarGroup
          size="lg"
          max={5}
          spacing="-3"
          justifyContent="center"
          sx={{ "& .chakra-avatar": { border: "none !important" } }}
        >
          {[
            ["5451d986-b6fc-44b9-bf98-7bf5b7564e54", "Integrante 1"],
            ["efa7a674-ebf7-442f-9582-fb8d37e28481", "Integrante 5"],
            ["0ea008e3-4daa-4b8e-b6d5-f007232cf10f", "Integrante 2"],
            ["9b39a5c6-a8dc-4526-910f-f845b2fd5383", "Integrante 4"],
            ["c2cd0dc6-41a9-48f0-bc5b-cb218763ad01", "Integrante 3"],
          ].map(([id, label]) => (
            <Avatar
              key={id}
              src={`/avatars/${id}.png`}
              aria-label={label}
              bg="whiteAlpha.200"
              icon={<span />}
            />
          ))}
        </AvatarGroup>
        {error && <Alert status="error" borderRadius="12px"><AlertIcon />{error}</Alert>}
        <Button colorScheme="ocean" leftIcon={<FcGoogle />} onClick={login}>
          Entrar com Google
        </Button>
      </Flex>
    </Center>
  );
}