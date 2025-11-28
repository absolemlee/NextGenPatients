import React, { useEffect, useState } from "react";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS, accountClient } from "@/appWrite-client/settings.config";

export default function DebugAuth() {
  const [account, setAccount] = useState(null);
  const [profile, setProfile] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const debug = async () => {
      try {
        // Get account
        const acc = await accountClient.get();
        setAccount(acc);

        // Get profile
        const prof = await getCurrentUserProfile();
        setProfile(prof);

        // Get all doctors
        const doctorDocs = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DOCTORS
        );
        setDoctors(doctorDocs.documents);

        // Get all patients
        const patientDocs = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PATIENTS
        );
        setPatients(patientDocs.documents);

      } catch (err) {
        setError(err.message);
      }
    };

    debug();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Auth Debug Page</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Account</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(account, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Profile (from auth-helpers)</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">All Doctors in Database</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(doctors, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">All Patients in Database</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(patients, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
