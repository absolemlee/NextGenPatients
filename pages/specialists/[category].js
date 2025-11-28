import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import { useRouter } from "next/router";
import { databaseClient, DATABASE_ID, COLLECTIONS } from "@/appWrite-client/settings.config";
import { Query } from "appwrite";
import { Spin, Tag, Button } from "antd";
import { CheckCircleOutlined, PhoneOutlined, MailOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function Category() {
  const [discipline, setDiscipline] = useState(null);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [providerDisciplines, setProviderDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { category } = router.query;

  useEffect(() => {
    if (category) {
      loadDisciplineData();
    }
  }, [category]);

  const loadDisciplineData = async () => {
    try {
      // Try to load discipline by slug first, then by ID
      let disciplineDoc;
      try {
        const slugResponse = await databaseClient.listDocuments(
          DATABASE_ID,
          COLLECTIONS.DISCIPLINES,
          [Query.equal('slug', category)]
        );
        disciplineDoc = slugResponse.documents[0];
      } catch (error) {
        // If slug search fails, try by ID
        disciplineDoc = await databaseClient.getDocument(
          DATABASE_ID,
          COLLECTIONS.DISCIPLINES,
          category
        );
      }

      if (!disciplineDoc) {
        setLoading(false);
        return;
      }

      // Check if discipline is publicly accessible
      // For now, if not public, we'll show it but you can add authentication checks here
      if (!disciplineDoc.isPublic) {
        console.warn('Accessing non-public discipline:', disciplineDoc.name);
        // TODO: Add authentication check here - only allow if user is logged in
        // For now, we'll allow viewing but you might want to redirect
      }

      setDiscipline(disciplineDoc);

      // Load services for this discipline
      const servicesResponse = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.SERVICES,
        [Query.equal('disciplineId', disciplineDoc.$id)]
      );
      setServices(servicesResponse.documents.filter(s => s.status === 'active'));

      // Load provider-discipline relationships
      const providerDisciplinesResponse = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.PROVIDER_DISCIPLINES,
        [Query.equal('disciplineId', disciplineDoc.$id)]
      );
      const activeProviderDisciplines = providerDisciplinesResponse.documents.filter(
        pd => pd.isActive || pd.status === 'active'
      );
      setProviderDisciplines(activeProviderDisciplines);

      // Load all providers
      const providersResponse = await databaseClient.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DOCTORS
      );
      
      // Filter to only certified providers for this discipline
      const certifiedProviderIds = activeProviderDisciplines.map(pd => pd.providerId);
      const certifiedProviders = providersResponse.documents.filter(
        p => certifiedProviderIds.includes(p.$id) && p.verified
      );
      setProviders(certifiedProviders);

      setLoading(false);
    } catch (error) {
      console.error("Error loading discipline data:", error);
      setLoading(false);
    }
  };

  const getProviderCertification = (providerId) => {
    return providerDisciplines.find(pd => pd.providerId === providerId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!discipline) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl text-gray-600">Discipline not found</h1>
        <Button onClick={() => router.push('/specialists')} className="mt-4">
          Back to Disciplines
        </Button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{discipline.name} | NEXTGEN Care</title>
        <meta name="description" content={discipline.description || "NEXTGEN Care disciplines and providers"} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center w-screen">
        <div className="flex flex-col w-[95%] max-w-[1200px] min-h-screen pt-5 pb-14 xl:pt-24">
          <Nav />

          <div className="mb-4">
            <button
              className="px-1 text-black dark:text-white hover:text-[#2A9988]"
              onClick={() => router.push('/specialists')}
            >
              &larr; back to disciplines
            </button>
          </div>

          {/* Discipline Header */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              {discipline.imageUrl ? (
                <div className="relative w-16 h-16">
                  <Image 
                    fill 
                    src={discipline.imageUrl} 
                    alt={discipline.name}
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-[#2A9988] rounded-full text-white text-3xl font-bold">
                  {discipline.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-4xl md:text-6xl text-[#2A9988] font-bold">
                {discipline.name}
              </h1>
            </div>
            {discipline.description && (
              <p className="text-lg text-center text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
                {discipline.description}
              </p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              {!discipline.isPublic && (
                <Tag color="gold">Private Discipline</Tag>
              )}
              {discipline.isInternal && (
                <Tag color="purple">Internal Only</Tag>
              )}
              {discipline.licenseRequired && (
                <Tag color="orange">License Required: {discipline.licenseType}</Tag>
              )}
              {discipline.minCertificationLevel && (
                <Tag color="blue">Min Level: {discipline.minCertificationLevel}</Tag>
              )}
              <Tag color="green">{providers.length} Certified Provider{providers.length !== 1 ? 's' : ''}</Tag>
              <Tag color="purple">{services.length} Service{services.length !== 1 ? 's' : ''}</Tag>
            </div>
          </div>

          {/* Services Section */}
          {services.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Available Services</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div key={service.$id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {service.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Tag color="blue">{service.serviceType}</Tag>
                      {service.duration && <Tag>{service.duration} min</Tag>}
                      {service.cost > 0 && <Tag color="green">${service.cost}</Tag>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Providers Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              Certified Providers
            </h2>
            {providers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400">No certified providers yet for this discipline.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => {
                  const certification = getProviderCertification(provider.$id);
                  return (
                    <div
                      className="flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
                      key={provider.$id}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-16 h-16 bg-[#2A9988] rounded-full text-white text-2xl font-bold">
                          {provider.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {provider.name}
                          </h3>
                          {provider.verified && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircleOutlined />
                              <span className="text-sm">Verified</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {certification && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            <Tag color="purple">{certification.role}</Tag>
                            <Tag color="gold">{certification.certificationLevel}</Tag>
                          </div>
                        </div>
                      )}

                      {provider.specialty && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Specialty: {provider.specialty}
                        </p>
                      )}

                      <div className="space-y-2 mt-auto">
                        {provider.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <PhoneOutlined />
                            <span>{provider.phone}</span>
                          </div>
                        )}
                        {provider.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <MailOutlined />
                            <span>{provider.email}</span>
                          </div>
                        )}
                      </div>

                      <Link href="/booking" className="mt-4">
                        <Button type="primary" className="w-full bg-[#2A9988] hover:bg-[#1C665B]">
                          Book Appointment
                        </Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
