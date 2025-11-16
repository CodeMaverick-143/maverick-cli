"use client";

import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import { useState } from "react";
import { authClient } from "./auth-client";

const DeviceAuthorizationPage = () => {
  const [userCode, setUserCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // 🔥 Auto-format code into XXXX-XXXX
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Insert dash automatically after 4 characters
    if (value.length > 4) {
      value = value.slice(0, 4) + "-" + value.slice(4, 8);
    }

    setUserCode(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // remove dash for API
      const formattedCode = userCode.replace(/-/g, "");

      const response = await authClient.device({
        query: { user_code: formattedCode }
      });

      if (response.data) {
        router.push(`/approve?user_code=${formattedCode}`);
      } else {
        setError("Invalid or expired device code.");
      }
    } catch {
      setError("Invalid or expired device code.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-zinc-950 to-black px-4">
      <div className="w-full max-w-md bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-xl animate-fadeIn flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-600/40">
            <ShieldAlert className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Device Authorization</h1>
            <p className="text-sm text-zinc-400">Enter the code shown on your device</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="code" className="text-sm text-zinc-300 font-medium">
              Device Code
            </label>

            <input
              id="code"
              type="text"
              value={userCode}
              onChange={handleChange}
              placeholder="xxxx-xxxx"
              maxLength={9} // auto-format needs 9
              className="
                w-full px-4 py-3 rounded-lg bg-zinc-800/50 text-white
                border border-zinc-700 focus:border-indigo-500 
                outline-none transition-all placeholder-zinc-500
              "
              autoFocus
            />

            <p className="text-xs text-zinc-500">
              This code appears on the device you are trying to authorize.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-400 bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || userCode.length < 9}
            className="
              w-full h-11 rounded-lg font-medium transition-all 
              bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 
              flex items-center justify-center gap-2 text-white shadow-md
            "
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
          </button>

          {/* Info */}
          <div className="text-xs text-zinc-500 text-center leading-relaxed">
            This code is temporary and unique to your device. Keep it private.
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default DeviceAuthorizationPage;
