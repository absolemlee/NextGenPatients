import { Client, Account, Databases, Storage } from "appwrite";

export const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

export const databaseClient = new Databases(client);
export const accountClient = new Account(client);
export const storageClient = new Storage(client);

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
export const COLLECTIONS = {
  DOCTORS: process.env.NEXT_PUBLIC_APPWRITE_DOCTORS_COLLECTION_ID,
  PATIENTS: process.env.NEXT_PUBLIC_APPWRITE_PATIENTS_COLLECTION_ID,
  APPOINTMENTS: process.env.NEXT_PUBLIC_APPWRITE_APPOINTMENTS_COLLECTION_ID,
  DISCIPLINES: process.env.NEXT_PUBLIC_DISCIPLINES_COLLECTION_ID,
  SERVICES: process.env.NEXT_PUBLIC_SERVICES_COLLECTION_ID,
  PROVIDER_DISCIPLINES: process.env.NEXT_PUBLIC_PROVIDER_DISCIPLINES_COLLECTION_ID,
};