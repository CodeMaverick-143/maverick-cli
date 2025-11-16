"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { CheckCircle, XCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";

const DeviceApprovalPage = () => {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code");

  const [isProcessing, setIsProcessing] = useState({
    approve: false,
    deny: false,
  });

  // Loading session
  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <Spinner />
      </div>
    );
  }

  // No session → redirect
  if (!data?.session || !data?.user) {
    router.push("/sign-in");
    return null;
  }

  // No userCode in URL → invalid request
  if (!userCode) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Invalid device request.
      </div>
    );
  }

  const user = data.user;

  // ============================
  // Approve
  // ============================
  const handleApprove = async () => {
    setIsProcessing({ approve: true, deny: false });

    try {
      toast.loading("Approving device…", { id: "loading" });

      await authClient.device.approve({
        userCode,
      });

      toast.dismiss("loading");
      toast.success("Device approved successfully!");

      router.push("/");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsProcessing({ approve: false, deny: false });
    }
  };

  // ============================
  // Deny
  // ============================
  const handleDeny = async () => {
    setIsProcessing({ approve: false, deny: true });

    try {
      toast.loading("Denying device…", { id: "loading" });

      await authClient.device.deny({
        userCode,
      });

      toast.dismiss("loading");
      toast.success("Device denied");

      router.push("/");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setIsProcessing({ approve: false, deny: false });
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-950 to-black px-6">
      <div className="w-full max-w-lg bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-3xl p-10 shadow-xl animate-fadeIn flex flex-col gap-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-indigo-600/20 border border-indigo-600/40 shadow">
            <Smartphone className="h-7 w-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Authorize Device</h1>
            <p className="text-sm text-zinc-400">
              A new device is requesting access to your account.
            </p>
          </div>
        </div>

        {/* Device Code */}
        <div className="bg-zinc-800/40 px-6 py-4 rounded-xl border border-zinc-700 shadow-inner text-center">
          <p className="text-xs text-zinc-500">Device Code</p>
          <p className="text-3xl font-semibold tracking-widest text-indigo-300 mt-1">
            {userCode}
          </p>
        </div>

        {/* Security Info */}
        <div className="bg-zinc-900/40 px-6 py-4 rounded-xl border border-zinc-700/60 shadow">
          <p className="text-sm text-zinc-300 leading-relaxed">
            Approving this action will give this device access to your Better
            Auth account. Only approve this if you recognize the device and trust
            the source.
          </p>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-700/70 to-transparent" />

        {/* Buttons */}
        <div className="flex gap-4 mt-2">
          <Button
            onClick={handleApprove}
            disabled={isProcessing.approve}
            className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 shadow-lg"
          >
            {isProcessing.approve ? (
              <Spinner size="sm" />
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            Approve
          </Button>

          <Button
            variant="destructive"
            onClick={handleDeny}
            disabled={isProcessing.deny}
            className="flex-1 h-12 rounded-xl flex items-center justify-center gap-2"
          >
            {isProcessing.deny ? (
              <Spinner size="sm" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            Deny
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn .45s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default DeviceApprovalPage;
