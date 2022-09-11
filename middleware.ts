import withAuth from "next-auth/middleware";
import { authOptions } from "./pages/api/auth/[...nextauth]";

export default withAuth({
  jwt: { decode: authOptions.jwt as any },
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = { matcher: ["/api"], runtime: "experimental-edge" };
