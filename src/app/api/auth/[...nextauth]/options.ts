// in options file we write all type of providers and call back
// i.e google , credential or github etc
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import myDbConnection from "@/lib/dbConnect";
import UserModel from "@/models/user.model";

// becuse we make provider in other file so export it to use in route.ts
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "email",
          type: "text",
          placeholder: "malik@gmial.com ",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        try {
          await myDbConnection();
          const getUser = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!getUser) {
            throw new Error("no user found");
          }
          if (!getUser.isVerified) {
            throw new Error(
              "Please verify your account before logging in, through email"
            );
          }
          // for password we have to use like this credentials.password
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            getUser.password
          );
          if (!isPasswordCorrect) {
            throw new Error("password is incorrect");
          } else {
            return getUser;
          }
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
    // add another provide like git hub
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        //create payload in token so we can access anywhere through token or session
        // and save the DB hit
        token._id = user._id?.toString(); // modift the datatype of next auth user in next-auth.d.ts
        token.isVerified = user?.isVerified;
        token.isAcceptingMessages = user?.isAcceptingMessages;
        token.username = user?.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in", // it auto design the pages for signin now
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
