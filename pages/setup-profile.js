import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { accountClient, databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { ID } from "appwrite";

export default function SetupProfile() {
  const [account, setAccount] = useState(null);
  const [userType, setUserType] = useState("provider");
  const [formData, setFormData] = useState({
    specialty: "",
    licenseNumber: "",
    phone: "",
    role: "admin", // Default to admin for first setup
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const getAccount = async () => {
      try {
        const acc = await accountClient.get();
        setAccount(acc);
        setFormData(prev => ({
          ...prev,
          phone: acc.phone || "",
        }));
      } catch (error) {
        router.push("/login");
      }
    };
    getAccount();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (userType === "provider") {
        // Create doctor document
        await databaseClient.createDocument(
          DATABASE_ID,
          COLLECTIONS.DOCTORS,
          ID.unique(),
          {
            userId: account.$id,
            name: account.name,
            email: account.email,
            specialty: formData.specialty,
            licenseNumber: formData.licenseNumber,
            phone: formData.phone,
            role: formData.role,
            verified: formData.role === "admin" ? true : false,
          }
        );
        setMessage("✅ Provider profile created! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/provider/dashboard");
        }, 2000);
      } else {
        // Create patient document
        await databaseClient.createDocument(
          DATABASE_ID,
          COLLECTIONS.PATIENTS,
          ID.unique(),
          {
            userId: account.$id,
            name: account.name,
            email: account.email,
            phone: formData.phone,
          }
        );
        setMessage("✅ Patient profile created! Redirecting to home...");
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      setMessage("❌ Error: " + error.message);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold mb-2">Complete Your Profile</h1>
        <p className="text-gray-600 mb-6">Welcome, {account.name}! Let&apos;s set up your account.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-semibold mb-2">
              I am a:
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="provider">Provider/Practitioner</option>
              <option value="patient">Client/Seeker</option>
            </select>
          </div>

          {userType === "provider" && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Admin</option>
                  <option value="provider">Provider</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  Choose &quot;Admin&quot; for full access to manage the platform
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Discipline
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  placeholder="e.g., Meditation, Reiki, Counseling"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  License/Certification Number
                </label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1234567890"
              className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes("✅") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Creating Profile..." : "Complete Setup"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/debug-auth" className="text-sm text-blue-600 hover:underline">
            View Debug Info
          </Link>
        </div>
      </div>
    </div>
  );
}
