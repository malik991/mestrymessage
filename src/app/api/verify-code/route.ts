import myDbConnection from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { verifySchema } from "@/schemas/varifySchema";

// const codeQuerySchema = z.object({
//   verifyCode: verifySchema,
// });

export async function POST(req: Request) {
  await myDbConnection();
  try {
    const { username, verifyCode } = await req.json();
    // if you get the values from URL, use the following method to get exact values
    //const username1 = decodeURIComponent(username);

    const code = { code: verifyCode };
    const isCodeValid = verifySchema.safeParse(code);

    if (!isCodeValid.success) {
      // get errors from zod
      const codeError = isCodeValid.error.format().code?._errors || []; // specific error of zod related to username
      return Response.json(
        {
          success: false,
          message:
            codeError.length > 0 ? codeError.join(", ") : "code is not correct",
        },
        { status: 400 }
      );
    }
    const existingUser = await UserModel.findOne({ username });
    if (!existingUser) {
      return Response.json(
        { success: false, message: "user not found" },
        { status: 400 }
      );
    }
    const isCodeVerified = existingUser.verifyCode === verifyCode;
    const checkCodeExpiry =
      new Date(existingUser.verifyCodeExpiry) > new Date(); // code expiry greater than at this time

    if (isCodeVerified && checkCodeExpiry) {
      existingUser.isVerified = true;
      await existingUser.save();
      return Response.json(
        { success: true, message: "Account verified successfully" },
        { status: 200 }
      );
    } else if (!checkCodeExpiry) {
      return Response.json(
        {
          success: false,
          message: "verify code expire, please signup again",
        },
        { status: 401 }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "verify code is not correct",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("error while verify code: ", error);
    return Response.json(
      { success: false, message: "Error while verify code" },
      { status: 500 }
    );
  }
}
