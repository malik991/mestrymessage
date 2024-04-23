import myDbConnection from "@/lib/dbConnect";
import UserModel from "@/models/user.model";
import { z } from "zod";
import { userValidate } from "@/schemas/signUpSchema";

// now we will create a query schema to validate from userValidate schema
const userNameQuerySchema = z.object({
  username: userValidate,
});

export async function GET(req: Request) {
  await myDbConnection();
  try {
    // get user name from query params
    const { searchParams } = new URL(req.url);
    const queryParam = {
      username: searchParams.get("username"),
    };
    // check this username from zod
    //console.log("query: ", queryParam);

    const isUserQualify = userNameQuerySchema.safeParse(queryParam); // safeParse check the schema
    //console.log("zod username: ", isUserQualify); //TODO: remove
    if (!isUserQualify.success) {
      // get errors from zod
      const usernameError =
        isUserQualify.error.format().username?._errors || []; // specific error of zod related to username
      return Response.json(
        {
          success: false,
          message:
            usernameError.length > 0
              ? usernameError.join(", ")
              : "Invalid Query parameter",
        },
        { status: 400 }
      );
    }
    const { username } = isUserQualify.data;
    if (username) {
      const exisitingVerifiedUser = await UserModel.findOne({
        username,
        isVerified: true,
      });
      if (exisitingVerifiedUser) {
        return Response.json(
          {
            success: false,
            message: "user already taken",
          },
          { status: 400 }
        );
      } else {
        return Response.json(
          {
            success: true,
            message: "username is available",
          },
          { status: 201 }
        );
      }
    }
  } catch (error) {
    console.error("error while checking username unique: ", error);
    return Response.json(
      { success: false, message: "Error checking username unique" },
      { status: 500 }
    );
  }
}
