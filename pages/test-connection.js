import React, { useEffect, useState } from "react";
import Link from "next/link";
import { client, accountClient } from "@/appWrite-client/settings.config";

export default function TestConnection() {
  const [status, setStatus] = useState("Testing connection...");
  const [details, setDetails] = useState({});

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test 1: Check client config
        const endpoint = client.config.endpoint;
        const project = client.config.project;
        
        setDetails(prev => ({
          ...prev,
          endpoint,
          project,
        }));

        // Test 2: Try to get account (will fail if not logged in, but that's OK)
        try {
          const account = await accountClient.get();
          setStatus("✅ Connected! Already logged in as: " + account.email);
          setDetails(prev => ({ ...prev, account }));
        } catch (error) {
          // Not logged in is fine
          if (error.code === 401) {
            setStatus("✅ Connected to Appwrite! (Not logged in yet)");
          } else {
            setStatus("❌ Connection error: " + error.message);
            setDetails(prev => ({ ...prev, error: error.message }));
          }
        }
      } catch (error) {
        setStatus("❌ Failed: " + error.message);
        setDetails(prev => ({ ...prev, error: error.message }));
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow">
        <h1 className="text-3xl font-bold mb-4">Appwrite Connection Test</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Status:</h2>
          <p className="text-lg">{status}</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Configuration:</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(details, null, 2)}
          </pre>
        </div>

        <div className="flex gap-4">
          <Link 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </Link>
          <Link 
            href="/sign-up" 
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Go to Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
