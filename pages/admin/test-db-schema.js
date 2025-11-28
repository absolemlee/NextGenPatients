import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import { getCurrentUserProfile } from "@/appWrite-client/auth-helpers";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";

export default function TestDBSchema() {
  const [loading, setLoading] = useState(true);
  const [schemaInfo, setSchemaInfo] = useState({});
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    checkAuthAndTestDB();
  }, []);

  const checkAuthAndTestDB = async () => {
    try {
      const profile = await getCurrentUserProfile();
      
      if (profile.role !== 'admin') {
        router.push('/home');
        return;
      }

      // Test each collection
      const collections = ['disciplines', 'services', 'provider_disciplines'];
      const results = {};

      for (const collectionName of collections) {
        try {
          // Try to list documents (even if empty, this will show us the schema works)
          const response = await databaseClient.listDocuments(
            DATABASE_ID,
            collectionName
          );
          
          results[collectionName] = {
            status: 'success',
            documentCount: response.total,
            sampleDocument: response.documents[0] || null,
            attributes: response.documents[0] ? Object.keys(response.documents[0]) : []
          };
        } catch (error) {
          results[collectionName] = {
            status: 'error',
            error: error.message,
            code: error.code
          };
        }
      }

      setSchemaInfo(results);
      setLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Testing database schema...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Database Schema Test | Admin</title>
      </Head>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Database Schema Test</h1>
            <Link href="/admin/dashboard" className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700">
              Back to Dashboard
            </Link>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="space-y-6">
            {Object.entries(schemaInfo).map(([collectionName, info]) => (
              <div key={collectionName} className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-semibold mb-4 capitalize">{collectionName}</h2>
                
                {info.status === 'success' ? (
                  <>
                    <div className="mb-4">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                        ✓ Collection exists
                      </span>
                      <span className="ml-3 text-gray-600">
                        {info.documentCount} document{info.documentCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {info.attributes.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Available Attributes:</h3>
                        <div className="flex flex-wrap gap-2">
                          {info.attributes.map(attr => (
                            <span key={attr} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {info.sampleDocument && (
                      <div className="mt-4">
                        <h3 className="font-semibold mb-2">Sample Document:</h3>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                          {JSON.stringify(info.sampleDocument, null, 2)}
                        </pre>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                      ✗ Error
                    </span>
                    <p className="text-red-700 mt-2">
                      <strong>Message:</strong> {info.error}
                    </p>
                    {info.code && (
                      <p className="text-red-600 text-sm mt-1">
                        <strong>Code:</strong> {info.code}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mt-3">
                      Make sure the collection is created in Appwrite with the correct ID: <code className="bg-gray-200 px-1">{collectionName}</code>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded p-6">
            <h3 className="font-semibold text-lg mb-2">Environment Variables</h3>
            <div className="space-y-1 text-sm font-mono">
              <p>DATABASE_ID: {DATABASE_ID || '❌ Not set'}</p>
              <p>DISCIPLINES: {COLLECTIONS.DISCIPLINES || '❌ Not set'}</p>
              <p>SERVICES: {COLLECTIONS.SERVICES || '❌ Not set'}</p>
              <p>PROVIDER_DISCIPLINES: {COLLECTIONS.PROVIDER_DISCIPLINES || '❌ Not set'}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
