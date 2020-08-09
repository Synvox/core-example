require("dotenv").config();

module.exports = {
  [process.env.NODE_ENV || "development"]: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "migrations",
    },
  },
  ...(process.env.TEST_DATABASE_URL
    ? {
        test: {
          client: "pg",
          connection: process.env.TEST_DATABASE_URL,
        },
      }
    : {}),
};
