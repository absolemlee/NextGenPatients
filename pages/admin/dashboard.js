import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [providers, setProviders] = useState([]);
  const [clients, setClients] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const profile = await getCurrentUserProfile();
        
        if (profile.role !== 'admin') {
          router.push('/home');
          return;
        }

        setUserProfile(profile);

        // Fetch all providers
        const providerDocs = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DOCTORS
        );
        setProviders(providerDocs.documents);

        // Fetch all clients
        const clientDocs = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PATIENTS
        );
        setClients(clientDocs.documents);

        // Fetch all disciplines
        const disciplineDocs = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DISCIPLINES
        );
        setDisciplines(disciplineDocs.documents);

        // Fetch all appointments
        const appointmentDocs = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.APPOINTMENTS
        );
        setAppointments(appointmentDocs.documents);

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
        <title>Admin Dashboard | NextGen</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome, {userProfile?.account.name}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/disciplines" className="bg-[#2A9988] text-white px-6 py-2 rounded hover:bg-[#1C665B]">
                Manage Disciplines
              </Link>
              <Link href="/logout" className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700">
                Logout
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Link href="/admin/providers" className="bg-[#2A9988] text-white p-6 rounded-lg shadow hover:bg-[#1C665B] transition">
              <h3 className="text-lg font-semibold">Providers</h3>
              <p className="text-sm mt-1 opacity-90">Manage all providers</p>
            </Link>
            <Link href="/admin/clients" className="bg-blue-600 text-white p-6 rounded-lg shadow hover:bg-blue-700 transition">
              <h3 className="text-lg font-semibold">Clients</h3>
              <p className="text-sm mt-1 opacity-90">Manage all clients</p>
            </Link>
            <Link href="/admin/disciplines" className="bg-purple-600 text-white p-6 rounded-lg shadow hover:bg-purple-700 transition">
              <h3 className="text-lg font-semibold">Disciplines</h3>
              <p className="text-sm mt-1 opacity-90">Manage disciplines</p>
            </Link>
            <Link href="/admin/services" className="bg-indigo-600 text-white p-6 rounded-lg shadow hover:bg-indigo-700 transition">
              <h3 className="text-lg font-semibold">Services</h3>
              <p className="text-sm mt-1 opacity-90">Manage all services</p>
            </Link>
            <Link href="/admin/certifications" className="bg-orange-600 text-white p-6 rounded-lg shadow hover:bg-orange-700 transition">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <p className="text-sm mt-1 opacity-90">Provider certifications</p>
            </Link>
            <Link href="/admin/appointments" className="bg-green-600 text-white p-6 rounded-lg shadow hover:bg-green-700 transition">
              <h3 className="text-lg font-semibold">Appointments</h3>
              <p className="text-sm mt-1 opacity-90">View all bookings</p>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Providers</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{providers.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Clients</h3>
              <p className="text-3xl font-bold text-gray-900 mt-2">{clients.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Pending Verifications</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {providers.filter(d => !d.verified).length}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Active Disciplines</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{disciplines.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-gray-500 text-sm font-medium">Total Appointments</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">{appointments.length}</p>
            </div>
          </div>

          {/* Providers Table */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Providers</h2>
              <Link href="/admin/providers" className="text-[#2A9988] hover:text-[#1C665B] font-medium">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discipline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {providers.slice(0, 5).map((provider) => (
                    <tr key={provider.$id}>
                      <td className="px-6 py-4 whitespace-nowrap">{provider.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{provider.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{provider.specialty || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          provider.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {provider.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          provider.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {provider.verified ? 'Yes' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Clients</h2>
              <Link href="/admin/clients" className="text-[#2A9988] hover:text-[#1C665B] font-medium">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {clients.slice(0, 5).map((client) => (
                    <tr key={client.$id}>
                      <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{client.phone || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
