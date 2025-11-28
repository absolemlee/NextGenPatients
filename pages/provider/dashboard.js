import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";

export default function ProviderDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentUserProfile();
        
        if (profile.role !== 'provider' && profile.role !== 'admin') {
          router.push('/home');
          return;
        }

        setUserProfile(profile);
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Provider Dashboard | NextGen</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Provider Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome, {userProfile?.account.name}</p>
              <p className="text-sm text-gray-500">
                Role: <span className="font-semibold">{userProfile?.role}</span>
                {userProfile?.profile?.specialty && ` | Discipline: ${userProfile.profile.specialty}`}
              </p>
            </div>
            <div className="flex gap-4">
              {userProfile?.role === 'admin' && (
                <Link href="/admin/dashboard" className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                  Admin Panel
                </Link>
              )}
              <Link href="/logout" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
                Logout
              </Link>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Name:</p>
                <p className="font-semibold">{userProfile?.profile?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Email:</p>
                <p className="font-semibold">{userProfile?.profile?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Discipline:</p>
                <p className="font-semibold">{userProfile?.profile?.specialty || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">Verification Status:</p>
                <p className={`font-semibold ${userProfile?.profile?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {userProfile?.profile?.verified ? 'Verified ✓' : 'Pending Verification'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">My Appointments</h3>
              <p className="text-gray-600 text-sm">View and manage your scheduled sessions</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">My Clients</h3>
              <p className="text-gray-600 text-sm">Manage your client list</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">Edit Profile</h3>
              <p className="text-gray-600 text-sm">Update your information and availability</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
