import Knex from "knex";
import pg from "pg";
import { knexHelpers } from "@synvox/core";
import knexfile from "../knexfile";

pg.types.setTypeParser(20, Number);

const knex = Knex({
  ...(knexfile as any)[process.env.NODE_ENV || "development"],
  ...knexHelpers,
});

export default knex;
