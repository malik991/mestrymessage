import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import myDbConnection from "@/lib/dbConnect";
import mongoose from "mongoose";
import UserModel from "@/models/user.model";
import { User } from "next-auth";

export async function DELETE(
  req: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;
  if (!session || !session?.user) {
    return Response.json(
      { successs: false, message: "user not Authenticated" },
      { status: 401 }
    );
  }
  try {
    await myDbConnection();
    const deleteMessage = await UserModel.updateOne(
      { _id: user?._id },
      { $pull: { messages: { _id: messageId } } }
    );
    if (deleteMessage.modifiedCount === 0) {
      return Response.json(
        {
          successs: false,
          message: "message not found, or already deleted",
        },
        { status: 404 }
      );
    }
    return Response.json(
      {
        successs: true,
        message: "message deleted successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.log("error in delete message api: ", error);
    return Response.json(
      {
        successs: false,
        message: error?.message || "Error in deleting messages",
      },
      { status: 500 }
    );
  }
}
