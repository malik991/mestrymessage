// get the session from server not client using next-auth
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import myDbConnection from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import mongoose from "mongoose";
import { User } from "next-auth"; // this is not that user which we stored in session

export async function GET(req: Request) {
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
    // coz we converted user into string at the time of user insertion in session
    const userId = new mongoose.Types.ObjectId(user?._id);
    const userMessages = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": -1 } }, // messgaes is field name
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]).exec();
    if (!userMessages || userMessages.length === 0) {
      return Response.json(
        {
          success: false,
          message: "User do not have messages",
        },
        { status: 404 }
      );
    }

    return Response.json(
      {
        success: true,
        messages: userMessages[0].messages,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("failed to get Messages: ", error);
    return Response.json(
      {
        successs: false,
        message: error?.message || "Error in getting the messages",
      },
      { status: 500 }
    );
  }
}
