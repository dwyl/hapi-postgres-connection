import { defineConfig } from "eslint/config";

export default defineConfig([
    // File-pattern specific overrides
    {
        files: ["index.js", "test/*.js"],
        rules: {
            semi: ["warn", "always"],
            "no-undef": "off",
            "no-unused-vars": "off"
        }
    },
    {
        files:["test/*.js"],
        rules: {
            "no-console": "off",
            "no-undef": "off"
        }
    }
]);