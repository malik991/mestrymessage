"use client";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifySchema } from "@/schemas/varifySchema";
import axios, { AxiosError } from "axios";
import { useToast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/apiResponse";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const [btnDisable, setBtnDisable] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      setBtnDisable(true);
      const res = await axios.post("/api/verify-code", {
        username: params.username,
        verifyCode: data.code,
      });
      if (res.data.success === true) {
        toast({
          title: "Success",
          description: res.data.message,
        });
        setBtnDisable(false);
        router.replace(`/sign-in`);
      } else {
        setBtnDisable(false);
        toast({
          title: "Failed",
          description: res.data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setBtnDisable(false);
      console.error("Error during verify code: ", error);
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Code Verification Failed",
        description:
          axiosError.response?.data.message || "error in verify code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the verification code sent to your email</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="enter code" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="text-center">
              <Button className="w-1/2" type="submit" disabled={btnDisable}>
                {btnDisable ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> please wait
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;
