import db from "../database/database";

const testDbConnection = async (): Promise<void> => {
  await db.query("SELECT 1");
};

export default { testDbConnection };
