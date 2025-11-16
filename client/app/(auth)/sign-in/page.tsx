"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { LoginForm } from "@/components/login-form";

export default function Page() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  // While loading session state
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // If already logged in → redirect
  if (data?.session && data?.user) {
    router.push("/sign-in");
    return null;
  }

  // Otherwise show login form
  return <LoginForm />;
}
