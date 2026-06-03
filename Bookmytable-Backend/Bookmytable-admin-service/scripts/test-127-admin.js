import mongoose from 'mongoose';

async function checkAdmin() {
  try {
    const conn1 = await mongoose.createConnection('mongodb://127.0.0.1:27017/bookmytable-admin').asPromise();
    console.log("127.0.0.1/bookmytable-admin collections:");
    const c1 = await conn1.db.listCollections().toArray();
    c1.forEach(c => console.log(' -', c.name));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
checkAdmin();
