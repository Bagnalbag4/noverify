import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { services, orders, customers } from './data.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log("Initializing Firebase...");
if (!firebaseConfig.apiKey) {
    console.error("ERROR: Firebase API Key is missing. Please check your .env file.");
    process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateData() {
    console.log("Starting Migration...");

    try {
        // Migrate Services (Products)
        console.log(`Migrating ${services.length} services...`);
        for (const service of services) {
            const docRef = doc(collection(db, "services"), service.id.toString());
            await setDoc(docRef, service);
        }
        console.log("Services migrated successfully.");

        // Migrate Orders
        console.log(`Migrating ${orders.length} orders...`);
        for (const order of orders) {
            const docRef = doc(collection(db, "orders"), order.id.toString());
            await setDoc(docRef, order);
        }
        console.log("Orders migrated successfully.");

        // Migrate Customers
        console.log(`Migrating ${customers.length} customers...`);
        for (const customer of customers) {
            const docRef = doc(collection(db, "customers"), customer.id.toString());
            await setDoc(docRef, customer);
        }
        console.log("Customers migrated successfully.");

        console.log("🎉 All data migrated to Firestore successfully!");
        process.exit(0);
    } catch (error) {
        console.error("Error migrating data:", error);
        process.exit(1);
    }
}

migrateData();
