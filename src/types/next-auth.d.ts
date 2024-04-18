import "next-auth";
import { DefaultSession } from "next-auth";

// modify the ddefault user of next-auth
declare module "next-auth" {
  interface User {
    _id?: string;
    isVerified: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
  interface Session {
    user: {
      _id?: string;
      isVerified: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession["user"]; // store a key in defualt sesssion by which we raise query
  }
}
// antoher way to modify any module in next-auth
declare module "next-auth/jwt" {
  interface JWT {
    _id?: string;
    isVerified: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
