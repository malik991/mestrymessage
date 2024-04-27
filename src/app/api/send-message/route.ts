import myDbConnection from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { Message } from "@/utils/interfaces";

export async function POST(req: Request) {
  try {
    await myDbConnection();
    const { username, content } = await req.json();
    console.log("check user name: ", username);

    const getUser = await UserModel.findOne({ username });
    if (!getUser) {
      return Response.json(
        {
          successs: false,
          message: "user not found while sending message",
        },
        { status: 404 }
      );
    }

    if (!getUser?.isAcceptingMessages) {
      return Response.json(
        {
          successs: false,
          message: "user not allowed to send him messages",
        },
        { status: 403 } // forbidden stauts
      );
    }

    console.log("getuser: ", getUser);

    // prepare a new messages
    const newMessage = { content, createdAt: new Date() };
    console.log("message content: ", newMessage);

    // push this messgae to user messgaes Array
    getUser.messages.push(newMessage as Message);
    await getUser.save();
    return Response.json(
      {
        successs: true,
        message: "message sent successfully",
      },
      { status: 200 } // forbidden stauts
    );
  } catch (error: any) {
    console.error("sending message from any user: ", error);
    return Response.json(
      {
        successs: false,
        message: error?.message || "Error in sending message from any user",
      },
      { status: 500 }
    );
  }
}
