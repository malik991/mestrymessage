"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
// import { useDebounceValue } from "usehooks-ts";
import { useDebounceCallback } from "usehooks-ts";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { signUpValidation } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
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

const page = () => {
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isLoadingUsername, setIsLoadingUsername] = useState(false);
  const [isSubmitting, setIsSubitting] = useState(false);
  // use useDebaunce value to get time when user write his user name so after
  // some time we will hit the db to check either is it available or not

  const debounced = useDebounceCallback(setUsername, 500); // now we will check debounceusername instead of username
  const router = useRouter();

  // now check how to use zod
  const register = useForm<z.infer<typeof signUpValidation>>({
    // here we can use different resolver, but now we use zod resolver
    resolver: zodResolver(signUpValidation),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
  // to hit the api
  useEffect(() => {
    const getUsernameUniqueOrNot = async () => {
      if (username) {
        setIsLoadingUsername(true);
        setUsernameMessage("");
        try {
          const res = await axios.get(
            `/api/unique-username?username=${username}`
          );
          if (res.data) {
            //console.log("data: ", res.data);

            setUsernameMessage(res.data.message);
          }
        } catch (error) {
          const handleAxiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            handleAxiosError.response?.data.message ??
              "Error while checking user name"
          );
        } finally {
          setIsLoadingUsername(false);
        }
      }
    };
    getUsernameUniqueOrNot();
  }, [username]); // we call when debounceUsername is change

  // submit form
  const onSubmit = async (data: z.infer<typeof signUpValidation>) => {
    setIsSubitting(true);
    try {
      console.log("Data for signup form: ", data);
      const res = await axios.post<ApiResponse>("/api/sign-up", data);
      if (res.data.success) {
        toast({
          title: "Success",
          description: res.data.message,
        });
      } else {
        toast({
          title: "Failed",
          description: res.data.message,
          variant: "destructive",
        });
      }
      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error("Error during sign-up submitting:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      ("There was a problem with your sign-up. Please try again.");

      toast({
        title: "Sign Up Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubitting(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...register}>
          <form
            onSubmit={register.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              name="username"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    placeholder="username"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />

                  {isLoadingUsername && <Loader className="animate-spin" />}
                  {!isLoadingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === "username is available"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>

                  <Input placeholder="enter email" {...field} />
                  <p className="text-muted text-gray-400 text-sm">
                    We will send you a verification code
                  </p>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={register.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" /> please wait
                </>
              ) : (
                "Sign up"
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{" "}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
