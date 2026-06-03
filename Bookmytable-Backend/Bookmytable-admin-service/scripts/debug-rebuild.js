import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function debug() {
  console.log('==================================================');
  console.log('STEP 1: VERIFY DATABASE CONNECTIONS');
  const mongoUri = 'mongodb://localhost:27017/';
  
  // We need two connections: Core DB and Admin DB
  const coreConn = await mongoose.createConnection(mongoUri, { dbName: 'bookmytable' }).asPromise();
  const adminConn = await mongoose.createConnection(mongoUri, { dbName: 'bookmytable-admin' }).asPromise();

  console.log('Mongo URI:', mongoUri);
  console.log('Core Host:', coreConn.host);
  console.log('Core DB:', coreConn.name);
  console.log('Admin Host:', adminConn.host);
  console.log('Admin DB:', adminConn.name);

  console.log('\n==================================================');
  console.log('STEP 2: PRINT COLLECTION DISCOVERY');
  
  // List all databases
  const adminDb = coreConn.db.admin();
  const dbs = await adminDb.listDatabases();
  console.log('\nAvailable Databases:');
  dbs.databases.forEach(db => console.log(` - ${db.name} (sizeOnDisk: ${db.sizeOnDisk})`));

  console.log('\nCollections in Core DB (bookmytable):');
  const coreCollections = await coreConn.db.listCollections().toArray();
  coreCollections.forEach(c => console.log(` - ${c.name}`));

  console.log('\nCollections in Admin DB (bookmytable-admin):');
  const adminCollections = await adminConn.db.listCollections().toArray();
  adminCollections.forEach(c => console.log(` - ${c.name}`));

  console.log('\n==================================================');
  console.log('STEP 3: VERIFY SOURCE COLLECTIONS');
  
  const sources = [
    'users', 'brands', 'restaurantbranches', 'branchmemberships', 
    'subscriptionplans', 'brandsubscriptions', 'staffinvites'
  ];

  for (const coll of sources) {
    const count = await coreConn.collection(coll).countDocuments();
    console.log(`Core DB - ${coll} count: ${count}`);
  }

  console.log('\n==================================================');
  console.log('DEBUG COMPLETE');
  process.exit(0);
}

debug().catch(err => {
  console.error(err);
  process.exit(1);
});
