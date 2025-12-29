"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { authClient } from "@/lib/auth-client";

export const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 to-black p-6 gap-16">

      {/* Left section */}
      <div className="flex flex-col items-start gap-4 max-w-md">
        <Image
          src="/login.svg"
          alt="Login Illustration"
          height={400}
          width={400}
          className="
            opacity-100 
            drop-shadow-[0_0_25px_rgba(99,102,241,0.25)]
            hover:scale-[1.03] 
            transition-all 
            duration-300 
            ease-out
          "
        />

        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-indigo-400 to-blue-500 text-transparent bg-clip-text">
          Welcome Back!
        </h1>

        <p className="text-base font-medium text-zinc-400">
          Login to your account to continue
        </p>
      </div>

      {/* Right card */}
      <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900/40 backdrop-blur-xl shadow-xl rounded-2xl">
        <CardContent className="p-6 flex flex-col gap-4">

          <Button
            variant="outline"
            className="w-full flex items-center gap-3 justify-center h-11 text-white border-zinc-700 hover:bg-zinc-800 transition-all"
            type="button"
            disabled={isLoading}
            onClick={() =>
              authClient.signIn.social({
                provider: "github",
                callbackURL: "https://maverick-cli.vercel.app",
              })
            }
          >
            <Image
              src="/github.svg"
              alt="GitHub"
              height={24}
              width={24}
              className="
                dark:invert
                drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]
                hover:rotate-6 
                hover:scale-110
                transition-all 
                duration-300
              "
            />

            {isLoading ? "Connecting…" : "Continue with GitHub"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
};
