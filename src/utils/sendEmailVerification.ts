import { resend } from "@/lib/resend";
import VerificationEmail from "@/templates/emailTemplate";
import { ApiResponse } from "@/types/apiResponse";

export async function sendEmailForVerification(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "mestry message email verification",
      react: VerificationEmail({ username, otp: verifyCode }),
    });
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("error while sending email for verification: ", error);
    return {
      success: false,
      message: "Error while send email for verification",
    };
  }
}
