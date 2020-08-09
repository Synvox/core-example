/**
 * @param {import('knex')} knex
 */
exports.up = async function (knex) {
  await knex.schema.createSchema("auth");

  await knex.schema.withSchema("auth").createTable("memberships", (t) => {
    t.specificType("id", "bigserial").primary();
    t.specificType("organization_id", "bigint")
      .notNullable()
      .unsigned()
      .index();
    t.specificType("created_at", "timestamp with time zone")
      .notNullable()
      .defaultTo(knex.raw("now()"));
    t.specificType("updated_at", "timestamp with time zone")
      .notNullable()
      .defaultTo(knex.raw("now()"));
    t.specificType("disabled_at", "timestamp with time zone");
    t.specificType("user_id", "bigint").notNullable().unsigned().index();
    t.specificType("role_id", "text").notNullable();
  });

  await knex.schema.withSchema("auth").createTable("organizations", (t) => {
    t.specificType("id", "bigserial").primary();
    t.specificType("name", "text").notNullable();
    t.specificType("created_at", "timestamp with time zone")
      .notNullable()
      .defaultTo(knex.raw("now()"));
    t.specificType("updated_at", "timestamp with time zone")
      .notNullable()
      .defaultTo(knex.raw("now()"));
  });

  await knex.schema.withSchema("auth").createTable("roles", (t) => {
    t.specificType("id", "text").primary();
  });

  await knex.schema.withSchema("auth").createTable("users", (t) => {
    t.specificType("id", "bigserial").primary();
    t.specificType("created_at", "timestamp with time zone")
      .notNullable()
      .defaultTo(knex.raw("now()"));
    t.specificType("updated_at", "timestamp with time zone")
      .notNullable()
      .defaultTo(knex.raw("now()"));
    t.specificType("email", "text")
      .notNullable()
      .defaultTo(knex.raw("''::text"));
    t.specificType("given_name", "text")
      .notNullable()
      .defaultTo(knex.raw("''::text"));
    t.specificType("family_name", "text")
      .notNullable()
      .defaultTo(knex.raw("''::text"));
  });

  await knex.schema.withSchema("auth").alterTable("memberships", (t) => {
    t.foreign("organization_id")
      .references("id")
      .inTable("auth.organizations")
      .onDelete("cascade")
      .onUpdate("cascade");
    t.foreign("role_id").references("id").inTable("auth.roles");
    t.foreign("user_id")
      .references("id")
      .inTable("auth.users")
      .onDelete("cascade")
      .onUpdate("cascade");
  });

  // seed roles
  await knex("auth.roles").insert([{ id: "owner" }, { id: "member" }]);

  await knex.schema.createSchema("posts");
  await knex.schema.withSchema("posts").createTable("posts", (t) => {
    t.bigIncrements("id").primary();
    t.bigInteger("organization_id")
      .notNullable()
      .references("id")
      .inTable("auth.organizations");
    t.bigInteger("author_id").references("id").inTable("auth.users");
    t.text("title").notNullable();
    t.text("body").notNullable();
  });
};

/**
 * @param {import('knex')} knex
 */
exports.down = async function (knex) {
  await knex.raw("drop schema if exists auth cascade");
  await knex.raw("drop schema if exists posts cascade");
};
