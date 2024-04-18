import NextAuth from "next-auth/next";
import { authOptions } from "./options";

const handler = NextAuth(authOptions); // name should be handler

export { handler as GET, handler as POST }; // in this file like route.ts no mehotd will
// export by itself, we have to use verbs like get, post , path etc. coz its framework
