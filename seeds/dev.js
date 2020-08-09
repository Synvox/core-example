/**
 * @param {import('knex')} knex
 */
exports.seed = async function (knex) {
  const [org] = await knex("auth.organizations")
    .insert({ name: "Dev" })
    .returning("*");

  const [user] = await knex("auth.users")
    .insert({ family_name: "Dev", given_name: "John", email: "john@dev.com" })
    .returning("*");

  await knex("auth.memberships")
    .insert({ role_id: "owner", user_id: user.id, organization_id: org.id })
    .returning("*");
};
