import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:3000",
    "chromeWebSecurity": false,
    env: {
      "GOOGLE_USER": "username@company.com",
      "GOOGLE_PW": "password",
      "COOKIE_NAME": "next-auth.session-token",
      "SITE_NAME": "http://localhost:3000"
    }

  },
});
