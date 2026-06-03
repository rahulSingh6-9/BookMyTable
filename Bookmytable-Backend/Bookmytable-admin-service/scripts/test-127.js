import mongoose from 'mongoose';

async function check() {
  try {
    const conn1 = await mongoose.createConnection('mongodb://127.0.0.1:27017/bookmytable').asPromise();
    const admin1 = conn1.db.admin();
    console.log("127.0.0.1 collections:");
    const c1 = await conn1.db.listCollections().toArray();
    c1.forEach(c => console.log(' -', c.name));
    
    // Check if 'users' exists
    const users1 = await conn1.collection('users').countDocuments();
    console.log("Users in 127.0.0.1:", users1);

    // Try a known host IP or docker network IP if possible, but actually we can just check if users are here.
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
check();
