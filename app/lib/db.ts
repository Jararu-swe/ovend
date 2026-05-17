import postgres from 'postgres';

const globalForPostgres = globalThis as unknown as {
  sql: postgres.Sql<any> | undefined;
};

export const sql =
  globalForPostgres.sql ??
  postgres(process.env.POSTGRES_URL!, { 
    ssl: 'require',
    max: 10, // Maximum number of connections in the pool
    idle_timeout: 20, // Close idle connections after 20 seconds
    connect_timeout: 10, // Timeout for establishing connection (10 seconds)
    max_lifetime: 60 * 30, // Maximum lifetime of a connection (30 minutes)
    connection: {
      application_name: 'vendle-app',
    },
    onnotice: () => {}, // Suppress notices
    debug: process.env.NODE_ENV === 'development' ? false : false, // Disable debug logs
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPostgres.sql = sql;
}

// Test connection on startup
if (process.env.NODE_ENV === 'development') {
  sql`SELECT 1`.catch((err) => {
    console.error('⚠️  Database connection failed:', err.message);
    console.error('Please check your POSTGRES_URL and internet connection');
  });
}
