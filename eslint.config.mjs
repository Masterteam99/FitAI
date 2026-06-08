import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Prisma client generato: non è codice nostro, non va lintato.
    "src/generated/**",
    // Snippet di riferimento (esempi Gemini), non codice dell'app.
    "SKILL ZIP x Claude/**",
  ]),
  // eslint-config-next 16 abilita di default le regole del React Compiler
  // (react-hooks/*) come errori. Sono diagnostiche di ottimizzazione su pattern
  // legittimi e funzionanti (sync stato in effect, ref callback, ecc.), non bug
  // a runtime. Le teniamo come warning: visibili e affrontabili in modo
  // incrementale, senza bloccare la CI su debito preesistente.
  {
    rules: {
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/use-memo": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
    },
  },
  // Le fixture Playwright destrutturano un parametro chiamato `use`, che la regola
  // rules-of-hooks scambia per un React Hook. Falso positivo: disattiva solo qui.
  {
    files: ["tests/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },
]);

export default eslintConfig;
