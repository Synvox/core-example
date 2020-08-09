import path from "path";
import knex from "./knex";
import { Core, withTimestamps, Mode, Table } from "@synvox/core";
import { Request } from "express";
import { QueryBuilder } from "knex";
import { User, Organization } from "./schema";

function getContext(req: Request) {
  let organizations: { [role: string]: Organization[] } = {};

  const context = {
    async getUser(): Promise<User> {
      return knex("auth.users").first();
    },
    async getOrganizations(role = null): Promise<Organization[]> {
      let roleKey = role || "__any";

      const user = await context.getUser();
      const stmt = knex("auth.organizations").whereIn(
        "organizations.id",
        knex("auth.memberships")
          .select("memberships.organizationId")
          .where("userId", user.id)
          .where("disabledAt", null)
      );

      if (role) stmt.where("memberships.role", role);

      return await stmt;
    },
    async getOrganizationIds(role = null): Promise<number[]> {
      const orgs = await context.getOrganizations(role);
      return orgs.map((o) => o.id);
    },
  };

  function cache<R, T extends (...args: unknown[]) => R>(fn: T): T {
    let results: { [args: string]: R | undefined } = {};

    async function get(...args: unknown[]) {
      let key = JSON.stringify(args);
      if (results[key]) return results[key];
      results[key] = fn(...args);
      return results[key];
    }

    return (get as unknown) as T;
  }

  for (let key in context) {
    //@ts-ignore
    context[key] = cache(context[key]);
  }

  return context;
}

type Context = ReturnType<typeof getContext>;

const core = Core(knex, getContext, {
  writeSchemaToFile: path.resolve(__dirname, "../schema.json"),
  writeTypesToFile: path.resolve(__dirname, "./schema.ts"),
  includeLinksWithTypes: false,
  origin: process.env.ORIGIN,
});
export default core;

const policies = {
  readOnly: async (query: QueryBuilder, _: Context, mode: Mode) => {
    if (mode !== "read") {
      query.whereRaw("false");
    }
  },
  createOnly: async (query: QueryBuilder, _: Context, mode: Mode) => {
    if (mode !== "insert") {
      query.whereRaw("false");
    }
  },
  inOrganization(roleMap: any = {}, columnName = "organizationId") {
    return async function (
      this: Table<Context>,
      query: QueryBuilder,
      context: Context,
      mode: Mode
    ) {
      query.whereIn(
        `${this.alias}.${columnName}`,
        await context.getOrganizationIds(roleMap[mode])
      );
    };
  },
};

// Auth
core.table(
  withTimestamps({
    schemaName: "auth",
    tableName: "users",
    idModifiers: {
      async me(query, context) {
        const user = await context.getUser();
        query.where("users.id", user.id);
      },
    },
    async policy(query, context, mode) {
      const user = await context.getUser();
      if (mode === "read") {
        query
          .join("auth.memberships", "memberships.userId", "users.id")
          .whereIn("memberships.organizationId", function () {
            this.select("organizations.id")
              .from("auth.organizations")
              .join(
                "auth.memberships",
                "organizations.id",
                "memberships.organizationId"
              )
              .where("memberships.userId", user.id);
          });
      } else {
        query.where("id", user.id);
      }
    },
  })
);

core.table(
  withTimestamps({
    schemaName: "auth",
    tableName: "organizations",
    async policy(query, context, mode) {
      const user = await context.getUser();
      await policies.readOnly.call(this, query, context, mode);
      await policies.inOrganization({}, "id").call(this, query, context, mode);
      query.orWhere(function () {
        this.whereIn(
          //@ts-ignore
          "organizations.id",
          knex("auth.memberships")
            .where("memberships.userId", user.id)
            .select("memberships.organizationId")
        );
      });
    },
  })
);

core.table(
  withTimestamps({
    schemaName: "auth",
    tableName: "memberships",
    async policy(query, context, mode) {
      const user = await context.getUser();
      await policies.readOnly.call(this, query, context, mode);
      await policies.inOrganization().call(this, query, context, mode);
      query.orWhere("memberships.userId", user.id);
    },
  })
);

core.table({
  schemaName: "auth",
  tableName: "roles",
  policy: policies.readOnly,
});

// Posts
core.table({
  schemaName: "posts",
  tableName: "posts",
  async policy(query, context, mode) {
    if (mode === "read")
      await policies.inOrganization().call(this, query, context, mode);
  },
});
