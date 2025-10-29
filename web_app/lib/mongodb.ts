import { MongoClient, Db } from 'mongodb'

// HEALIS Database Configuration
if (!process.env.MONGODB_URI_HEALIS || !process.env.MONGODB_URI_ADMIN) {
  throw new Error('Invalid/Missing environment variables: "MONGODB_URI_HEALIS" or "MONGODB_URI_ADMIN"')
}

const healIsUri = process.env.MONGODB_URI_HEALIS
const adminUri = process.env.MONGODB_URI_ADMIN
const options = {}

let healIsClient: MongoClient
let adminClient: MongoClient
let healIsClientPromise: Promise<MongoClient>
let adminClientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use global variables for HMR
  let globalWithMongo = global as typeof globalThis & {
    _healIsClientPromise?: Promise<MongoClient>
    _adminClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._healIsClientPromise) {
    healIsClient = new MongoClient(healIsUri, options)
    globalWithMongo._healIsClientPromise = healIsClient.connect()
  }
  healIsClientPromise = globalWithMongo._healIsClientPromise

  if (!globalWithMongo._adminClientPromise) {
    adminClient = new MongoClient(adminUri, options)
    globalWithMongo._adminClientPromise = adminClient.connect()
  }
  adminClientPromise = globalWithMongo._adminClientPromise
} else {
  // Production mode
  healIsClient = new MongoClient(healIsUri, options)
  healIsClientPromise = healIsClient.connect()
  
  adminClient = new MongoClient(adminUri, options)
  adminClientPromise = adminClient.connect()
}

// Export client promises
export { healIsClientPromise as default, adminClientPromise }

// Database Helper Functions
export async function getHealIsDatabase(): Promise<Db> {
  const client = await healIsClientPromise
  return client.db(process.env.DATABASE_NAME_HEALIS || 'healis')
}

export async function getAdminDatabase(): Promise<Db> {
  const client = await adminClientPromise
  return client.db(process.env.DATABASE_NAME_ADMIN || 'healis-admin')
}

// HEALIS Database Helper Functions
export async function getUsers() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_USERS || 'users').find({}).toArray()
}

export async function getDoctorAppointments() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_DOCTOR_APPOINTMENTS || 'doctorappointments').find({}).toArray()
}

export async function getHealthCheckups() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_HEALTH_CHECKUPS || 'healthcheckups').find({}).toArray()
}

export async function getMedications() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_MEDICATIONS || 'medications').find({}).toArray()
}

export async function getLabTests() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_LAB_TESTS || 'labtests').find({}).toArray()
}

export async function getVaccinations() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_VACCINATIONS || 'vaccinations').find({}).toArray()
}

export async function getMentalHealthRecords() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_MENTAL_HEALTH || 'mentalhealth').find({}).toArray()
}

export async function getNutritionistBookings() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_NUTRITIONIST_BOOKINGS || 'nutritionistbookings').find({}).toArray()
}

export async function getPharmacyOrders() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_PHARMACY_ORDERS || 'pharmacyorders').find({}).toArray()
}

export async function getReminders() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_REMINDERS || 'reminders').find({}).toArray()
}

export async function getContacts() {
  const db = await getHealIsDatabase()
  return await db.collection(process.env.COLLECTION_CONTACTS || 'contacts').find({}).toArray()
}

// Admin Database Helper Functions
export async function getAdminPharmacy() {
  const db = await getAdminDatabase()
  return await db.collection(process.env.COLLECTION_ADMIN_PHARMACY || 'pharmacy').find({}).toArray()
}

export async function getAdminRegister() {
  const db = await getAdminDatabase()
  return await db.collection(process.env.COLLECTION_ADMIN_REGISTER || 'register').find({}).toArray()
}

// Real-time data insertion for demonstration
export async function insertSampleHealIsData() {
  const db = await getHealIsDatabase()
  
  // Sample Indian Healthcare Data
  const samplePatients = [
    {
      patientId: 'PT240001',
      fullName: 'Rajesh Kumar Sharma',
      age: 45,
      gender: 'Male',
      city: 'Mumbai',
      condition: 'Hypertension',
      priority: 7,
      phoneNumber: '+91-9876543210',
      email: 'rajesh.sharma@email.com',
      createdAt: new Date()
    },
    {
      patientId: 'PT240002',
      fullName: 'Priya Nair',
      age: 32,
      gender: 'Female',
      city: 'Kochi',
      condition: 'Diabetes Type 2',
      priority: 5,
      phoneNumber: '+91-9876543211',
      email: 'priya.nair@email.com',
      createdAt: new Date()
    },
    {
      patientId: 'PT240003',
      fullName: 'Amit Singh Patel',
      age: 28,
      gender: 'Male',
      city: 'Delhi',
      condition: 'Chest Pain',
      priority: 9,
      phoneNumber: '+91-9876543212',
      email: 'amit.patel@email.com',
      createdAt: new Date()
    }
  ]

  const sampleAppointments = [
    {
      patientId: 'PT240001',
      patientName: 'Rajesh Kumar Sharma',
      doctorName: 'Dr. Anil Sharma',
      specialty: 'Cardiology',
      appointmentDate: new Date('2024-10-30'),
      appointmentTime: '10:00',
      status: 'Scheduled',
      hospital: 'AIIMS Delhi'
    },
    {
      patientId: 'PT240002',
      patientName: 'Priya Nair',
      doctorName: 'Dr. Meera Iyer',
      specialty: 'Endocrinology',
      appointmentDate: new Date('2024-10-30'),
      appointmentTime: '11:00',
      status: 'Confirmed',
      hospital: 'Apollo Chennai'
    }
  ]

  const sampleHospitals = [
    {
      id: 'AIIMS_DEL',
      name: 'All India Institute of Medical Sciences',
      city: 'New Delhi',
      state: 'Delhi',
      type: 'Government',
      specialties: ['Cardiology', 'Neurology', 'Oncology', 'Emergency'],
      capacity: 2500,
      currentLoad: 85,
      coordinates: { lat: 28.5672, lng: 77.2100 }
    },
    {
      id: 'APOLLO_CHN',
      name: 'Apollo Hospitals',
      city: 'Chennai',
      state: 'Tamil Nadu',
      type: 'Private',
      specialties: ['Cardiac Surgery', 'Transplant', 'Oncology'],
      capacity: 1000,
      currentLoad: 72,
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    {
      id: 'FORTIS_MUM',
      name: 'Fortis Hospital',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Private',
      specialties: ['Emergency', 'Trauma', 'Critical Care'],
      capacity: 800,
      currentLoad: 90,
      coordinates: { lat: 19.0760, lng: 72.8777 }
    }
  ]

  try {
    await db.collection('patients').insertMany(samplePatients)
    await db.collection('appointments').insertMany(sampleAppointments)
    await db.collection('hospitals').insertMany(sampleHospitals)
    console.log('Sample healthcare data inserted successfully!')
  } catch (error) {
    console.log('Data already exists or error:', error)
  }
}
