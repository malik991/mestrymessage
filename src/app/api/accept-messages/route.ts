// get the session from server not client using next-auth
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import myDbConnection from "@/lib/dbConnect";
import mongoose from "mongoose";
import UserModel from "@/models/user.model";
import { User } from "next-auth"; // this is not that user which we stored in session

export async function POST(request: Request) {
  try {
    await myDbConnection();
    const session = await getServerSession(authOptions); // it will return session from server
    /// get the user which we store in session
    const user: User = session?.user as User; // due to typeScript use User ans use assertion like as User
    if (!session || !session?.user) {
      return Response.json(
        { successs: false, message: "user not Authenticated" },
        { status: 401 }
      );
    }
    const userId = new mongoose.Types.ObjectId(user?._id);
    const { acceptMessages } = await request.json();
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );
    if (!updatedUser) {
      console.error("failed to update the user isAcceptingMessgae status: ");
      return Response.json(
        {
          successs: false,
          message: "failed to update the user isAcceptingMessgae status",
        },
        { status: 400 }
      );
    }
    return Response.json(
      {
        successs: true,
        message: "Updated Successfully, now user get messages",
        updatedUser,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("failed to user to accept messages: ", error);
    return Response.json(
      {
        successs: false,
        message: error?.message || "Error in accept messages",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await myDbConnection();
    const session = await getServerSession(authOptions);
    const user: User = session?.user as User;
    if (!session || !session?.user) {
      return Response.json(
        { successs: false, message: "user not Authenticated" },
        { status: 401 }
      );
    }
    const userId = user?._id;
    const userExist = await UserModel.findById(userId);
    if (!userExist) {
      return Response.json(
        { successs: false, message: "user not found" },
        { status: 404 }
      );
    }
    return Response.json(
      {
        successs: true,
        message: "fetch isAcceptingMessage successfully",
        isAcceptingMessages: userExist.isAcceptingMessages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "failed to get the user's isAcceptingMessage status: ",
      error
    );
    return Response.json(
      {
        successs: false,
        message: error?.message || "Error in user's isAcceptingMessage status",
      },
      { status: 500 }
    );
  }
}
