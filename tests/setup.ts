import { Server, createServer } from "http";
import Axios, { AxiosRequestConfig } from "axios";
import listen from "test-listen";
import app from "../src/app";
import knex from "../src/knex";

let server: Server | null = null;
export async function startServer(options?: Partial<AxiosRequestConfig>) {
  if (server) {
    server?.close();
    server = null;
  }

  server = createServer(app);
  const url = await listen(server);
  return Axios.create({ ...options, baseURL: url });
}

beforeEach(async () => {
  await knex.migrate.latest();
  await knex.seed.run();
});

afterEach(async () => {
  if (server) {
    server?.close();
    server = null;
  }
  await knex.migrate.rollback({}, true);
});

afterAll(async () => {
  await knex.destroy();
});
