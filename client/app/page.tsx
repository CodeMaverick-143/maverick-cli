"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function Home() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  // Loading
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Not logged in → go sign in
  if (!data?.session || !data?.user) {
    router.push("/sign-in");
    return null;
  }

  const user = data.user;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-black">

      {/* 🔥 Floating Background Blobs */}
      <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-indigo-600/30 blur-[110px] animate-pulse" />
      <div className="absolute -bottom-28 -right-10 h-96 w-96 rounded-full bg-purple-600/25 blur-[130px] animate-pulse" />

      {/* Main Card */}
      <div
        className="
          bg-zinc-900/30 
          backdrop-blur-2xl 
          border border-zinc-700/50 
          shadow-[0_0_40px_rgba(80,80,255,0.2)] 
          rounded-3xl 
          p-10 
          w-full 
          max-w-xl 
          flex 
          flex-col 
          gap-8 
          animate-fadeIn
        "
      >

        {/* Avatar */}
        <div className="flex justify-center">
          <div
            className="
              h-28 
              w-28 
              rounded-full 
              overflow-hidden 
              border border-indigo-500/40 
              shadow-[0_0_20px_rgba(99,102,241,0.6)]
              hover:scale-105 
              transition-all 
              duration-300 
              transform 
              hover:rotate-1
            "
          >
            <Image
              src={user?.image ?? "/github.svg"}
              alt="User Avatar"
              height={112}
              width={112}
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

        {/* User Info */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
            Hey, {user.name || "User"} 👋
          </h1>
          <p className="text-zinc-400 mt-2 text-sm tracking-wide">
            You're logged in — stay awesome.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700/60 to-transparent" />

        {/* User info card */}
        <div
          className="
            bg-zinc-900/40 
            border border-zinc-700/40 
            rounded-xl 
            p-5 
            shadow-inner
          "
        >
          <div className="flex justify-between text-sm text-zinc-300">
            <p>Email</p>
            <p className="font-medium text-indigo-300">{user.email}</p>
          </div>
        </div>

        {/* Logout button */}
        <Button
          className="
            w-full 
            h-11 
            font-medium 
            bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:brightness-110 
            transition-all 
            duration-300 
            rounded-xl 
            shadow-[0_0_15px_rgba(99,102,241,0.5)]
          "
          onClick={() =>
            authClient.signOut({
              fetchOptions: {
                onError: (ctx) => console.log("SignOut Error:", ctx),
                onSuccess: () => router.push("/sign-in"),
              },
            })
          }
        >
          Sign Out
        </Button>

      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}
