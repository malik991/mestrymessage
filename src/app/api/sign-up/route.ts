import myDbConnection from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { sendEmailForVerification } from "@/utils/sendEmailVerification";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    await myDbConnection();
    const { email, username, password } = await request.json();
    const existingUsernameAndVerified = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUsernameAndVerified) {
      return Response.json(
        { success: false, message: "username already existed" },
        { status: 400 }
      );
    }
    // now check with email
    const existingUserWithEmail = await UserModel.findOne({ email });
    // generate 6 digit code or number
    let verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (existingUserWithEmail) {
      if (existingUserWithEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: "this email is already taken by other user",
          },
          { status: 400 }
        );
      } else {
        const hasedPassword = await bcrypt.hash(password, 10);
        existingUserWithEmail.password = hasedPassword;
        existingUserWithEmail.username = username;
        existingUserWithEmail.verifyCode = verifyCode;
        existingUserWithEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserWithEmail.save();
      }
    } else {
      const hasedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date(); // when use new key word its an object which can change its value later
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hasedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],
      });
      await newUser.save();
    }

    // send email verification
    const emailResponse = await sendEmailForVerification(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }
    return Response.json(
      {
        success: true,
        message: "User registered successfully. Please verify your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while sign up request from user: ", error);
    return Response.json(
      { success: false, message: "Error Registering user" },
      { status: 500 }
    );
  }
}
