import db from '../database/database'; // your existing DB connection/pool

const testDbConnection = async (): Promise<void> => {
  // Simple query to check DB connectivity
  await db.query('SELECT 1');
};

export default { testDbConnection };