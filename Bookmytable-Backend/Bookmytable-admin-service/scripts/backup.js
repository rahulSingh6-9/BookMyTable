import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function backup() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://host.docker.internal:27017/', { dbName: 'bookmytable' });
  const collections = [
    'userreadmodels', 'brandreadmodels', 'branchreadmodels', 'restaurantreadmodels',
    'membershipreadmodels', 'subscriptionplanreadmodels', 'brandsubscriptionreadmodels',
    'invitationreadmodels', 'discoveryrestaurants'
  ];
  const timestamp = Date.now();
  for (const coll of collections) {
    try {
      await mongoose.connection.collection(coll).aggregate([{ $match: {} }, { $out: `${coll}_backup_${timestamp}` }]).toArray();
      console.log(`✅ Backed up ${coll} to ${coll}_backup_${timestamp}`);
    } catch (e) {
      if (e.codeName === 'NamespaceNotFound') {
        console.log(`⚠️  Collection ${coll} does not exist, skipping backup.`);
      } else {
        console.error(`❌ Error backing up ${coll}:`, e.message);
      }
    }
  }
  console.log('🎉 Backup complete');
  process.exit(0);
}
backup();
