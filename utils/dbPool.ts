// db.ts
import { Pool } from 'pg';

// Create a single pool instance
const pool = new Pool({
  connectionString: process.env.NEXT_PUBLIC_SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }, // Required for Supabase connections
});

export default pool;
