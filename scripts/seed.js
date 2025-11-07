#!/usr/bin/env node
import 'dotenv/config';
import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';

async function main() {
  const args = process.argv.slice(2);
  if (!args.length) {
    console.log('Usage: node scripts/seed.js create-product | promote-user <email>');
    process.exit(0);
  }

  const mongo = process.env.MONGODB_URI || env.mongoUri;
  await mongoose.connect(mongo, { maxPoolSize: 5 });

  const cmd = args[0];
  if (cmd === 'create-product') {
    const product = {
      name: 'Test Product',
      price: 100,
      description: 'Sample product',
      totalStock: 10,
      reservedStock: 0
    };
    const p = await Product.create(product);
    console.log('Created product:');
    console.log(JSON.stringify(p, null, 2));
  } else if (cmd === 'promote-user') {
    const email = args[1];
    if (!email) {
      console.error('Please provide an email to promote.');
      process.exit(1);
    }
    const u = await User.findOneAndUpdate({ email }, { $set: { role: 'ADMIN' } }, { new: true });
    if (!u) {
      console.error('User not found with email', email);
      process.exit(1);
    }
    console.log('Promoted user to ADMIN:');
    console.log(JSON.stringify(u, null, 2));
  } else {
    console.log('Unknown command:', cmd);
    console.log('Usage: node scripts/seed.js create-product | promote-user <email>');
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
