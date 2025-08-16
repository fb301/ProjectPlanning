import postgres from "postgres";

interface Props {
  sql: string;
  connectionString: string;
}

const connectionString = process.env.DATABASE_URLconst;
if (!connectionString) {
  throw new Error("DATABASE_URLconst environment variable is not set.");
}

const sql = postgres(connectionString);

export default sql;
