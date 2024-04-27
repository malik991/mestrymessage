"use client";
import { signOut } from "next-auth/react";
import React from "react";

const dashboardPage = () => {
  return (
    <>
      <div>dashboardPage</div>
      <div className="mt-4">
        <button onClick={() => signOut({ callbackUrl: "/sign-in" })}>
          logout
        </button>
      </div>
    </>
  );
};

export default dashboardPage;
