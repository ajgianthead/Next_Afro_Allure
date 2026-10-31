// db.ts
import { Pool } from 'pg';

// Create a single pool instance
const pool = new Pool({
  // Holds the database password, so it must never carry the NEXT_PUBLIC_ prefix
  // (that ships a value to every browser). The old name is read until Vercel
  // has SUPABASE_CONNECTION_STRING set; then the fallback can go.
  connectionString: process.env.SUPABASE_CONNECTION_STRING ?? process.env.NEXT_PUBLIC_SUPABASE_CONNECTION_STRING,
  ssl: { rejectUnauthorized: false }, // Required for Supabase connections
});

export default pool;
