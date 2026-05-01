import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://ramji:Ramji23112005@cluster0.ln4g5.mongodb.net/velrona";

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const count = await mongoose.connection.db.collection('contents').countDocuments();
    console.log('Total documents in contents:', count);
    
    const businesses = await mongoose.connection.db.collection('contents').find({ category: 'investor_businesses' }).toArray();
    console.log('Investor businesses found:', businesses.length);
    businesses.forEach(b => console.log(' - ', b.title));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

test();
