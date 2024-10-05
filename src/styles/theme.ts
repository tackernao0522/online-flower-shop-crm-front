import { extendTheme, ThemeConfig } from "@chakra-ui/react";
import { ThemeComponentProps } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading:
      '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    body: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
  },
  colors: {
    brand: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: (props: ThemeComponentProps) => ({
          bg: `${props.colorScheme}.500`,
          color: "white",
          _hover: {
            bg: `${props.colorScheme}.600`,
          },
        }),
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "bold",
      },
      sizes: {
        xl: {
          fontSize: ["24px", "28px", "32px"],
          lineHeight: ["32px", "36px", "40px"],
        },
        lg: {
          fontSize: ["20px", "22px", "24px"],
          lineHeight: ["28px", "30px", "32px"],
        },
        md: {
          fontSize: ["18px", "20px", "22px"],
          lineHeight: ["24px", "26px", "28px"],
        },
        sm: {
          fontSize: ["16px", "18px", "20px"],
          lineHeight: ["22px", "24px", "26px"],
        },
      },
    },
    Text: {
      baseStyle: {
        fontSize: ["14px", "16px"],
        lineHeight: ["20px", "24px"],
      },
    },
  },
  // 横向き用のスタイルを追加
  styles: {
    global: (_props: ThemeConfig) => ({
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
      "@media (orientation: landscape) and (max-height: 500px)": {
        "html, body": {
          fontSize: "0.9em",
        },
      },
    }),
  },
  breakpoints: {
    sm: "30em", // 480px
    md: "48em", // 768px
    lg: "62em", // 992px
    xl: "80em", // 1280px
    "2xl": "96em", // 1536px
  },
});

export default theme;
