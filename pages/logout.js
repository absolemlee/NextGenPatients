import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { accountClient } from "@/appWrite-client/settings.config";

export default function Logout() {
  const [status, setStatus] = useState("Logging out...");
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await accountClient.deleteSession("current");
        setStatus("✅ Logged out successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } catch (error) {
        console.error("Logout error:", error);
        setStatus("❌ Error: " + error.message);
        // Even if there's an error, redirect to login after a moment
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4">{status}</h1>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    </div>
  );
}
