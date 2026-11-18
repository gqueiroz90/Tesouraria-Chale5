import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider, ColorModeScript, extendTheme } from "@chakra-ui/react";
import AuthGate from "./AuthGate";

const theme = extendTheme({
  config: { initialColorMode: "system", useSystemColorMode: false },
  fonts: {
    heading: "'Bricolage Grotesque', 'Avenir Next', sans-serif",
    body: "'DM Sans', 'Segoe UI', sans-serif",
  },
  colors: {
    ocean: {
      50: "#EAF9FE",
      100: "#C9F0FC",
      200: "#91DFF9",
      300: "#54CCF5",
      400: "#05AFF2",
      500: "#087C9F",
      600: "#086783",
      700: "#0C5369",
      800: "#104251",
      900: "#12343F",
    },
    lagoon: {
      50: "#E8FFFC",
      100: "#C7FFFA",
      200: "#8FFFF2",
      300: "#4FF9E8",
      400: "#05F2DB",
      500: "#087F75",
      600: "#09665F",
      700: "#0D514C",
      800: "#103F3C",
      900: "#123330",
    },
    cyanSea: {
      50: "#E8FBFE",
      100: "#C9F5FC",
      200: "#91EAF9",
      300: "#4DDCF6",
      400: "#05C7F2",
      500: "#087E9A",
      600: "#09667D",
      700: "#0D5265",
      800: "#104151",
      900: "#12343F",
    },
    sun: {
      50: "#FFFDE5",
      100: "#FFF9B8",
      200: "#FFF17A",
      300: "#F5E74A",
      400: "#EDD300",
      500: "#887900",
      600: "#6E6200",
      700: "#584F05",
      800: "#443E0B",
      900: "#35310D",
    },
    shell: {
      50: "#FCF8F5",
      100: "#F2E6DF",
      200: "#E8D4C9",
      300: "#D7B8A7",
      400: "#BD927C",
      500: "#946D5A",
      600: "#795747",
      700: "#614638",
      800: "#4B382F",
      900: "#3C2E28",
    },
  },
  semanticTokens: {
    colors: {
      pageBg: { _light: "#EAF9FE", _dark: "#10252D" },
      surface: { _light: "#FFFCFA", _dark: "#19333B" },
      sunken: { _light: "#EAF9FE", _dark: "#142B33" },
      ink: { _light: "#18323B", _dark: "#F0F7F5" },
      muted: { _light: "#526B74", _dark: "#A9BEC0" },
      line: { _light: "#DFCFC7", _dark: "#2D4850" },
      hero: { _light: "#05AFF2", _dark: "#05C7F2" },
      heroInk: { _light: "#12343F", _dark: "#12343F" },
      accentCoral: { _light: "#05F2DB", _dark: "#05F2DB" },
    },
  },
  styles: {
    global: {
      "html, body, #root": { minHeight: "100%" },
      body: { bg: "pageBg", color: "ink", fontVariantNumeric: "tabular-nums" },
      "::selection": { background: "#05F2DB", color: "#12343F" },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <AuthGate />
    </ChakraProvider>
  </React.StrictMode>
);
