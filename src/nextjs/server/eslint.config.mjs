import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import graphql from "@graphql-eslint/eslint-plugin";

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
  ]),
  // Extract GraphQL tagged templates from server code so the schema is linted
  // (graphql.config.js points the schema at schema.gql).
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    processor: graphql.processor,
  },
  // Lint GraphQL schema definitions.
  {
    files: ["**/*.{graphql,gql}"],
    plugins: { "@graphql-eslint": graphql },
    languageOptions: {
      parser: graphql.parser,
    },
    rules: {
      ...graphql.configs["flat/schema-recommended"].rules,
      // Turn off the schema-recommended stylistic rules that contradict this
      // project's established schema conventions:
      // - types use String! ids (not the ID scalar) and result-wrapper types
      //   deliberately carry no id.
      // - schema uses `#` hashtag descriptions and get-prefixed query fields.
      // The remaining rules (unique type/field names, known type names,
      // no-unreachable-types, possible-type-extension, ...) stay enabled.
      "@graphql-eslint/strict-id-in-types": "off",
      "@graphql-eslint/require-description": "off",
      "@graphql-eslint/no-hashtag-description": "off",
      "@graphql-eslint/naming-convention": "off",
      "@graphql-eslint/no-typename-prefix": "off",
    },
  },
]);

export default eslintConfig;
