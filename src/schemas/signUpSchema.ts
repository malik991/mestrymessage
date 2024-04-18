import { z } from "zod";

export const userValidate = z
  .string()
  .min(2, "userName must contain 2 characters")
  .max(20, "userName must be less than 21 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can not contain special characters");

// now validate the whole signup form or schema
export const signUpValidation = z.object({
  username: userValidate,
  email: z.string().email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});
