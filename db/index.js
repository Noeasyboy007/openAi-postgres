import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';

const db = drizzle(process.env.DATABASE_URL);

// DATABASE_URL=postgresql://postgres:aritrabera007@localhost:5431/postgres