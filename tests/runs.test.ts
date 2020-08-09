import { startServer } from "./setup";

it("runs the server", async () => {
  const { get } = await startServer();
  expect((await get("/auth/users/me")).data.data).toEqual(
    expect.objectContaining({
      email: "john@dev.com",
      familyName: "Dev",
      givenName: "John",
      id: 1,
    })
  );
});

it("can create posts", async () => {
  const { post } = await startServer();
  expect(
    (
      await post("/posts/posts", {
        // organizationId: 1,
        title: "title",
        body: "body",
      }).catch((e) => e.response)
    ).data
  ).toMatchInlineSnapshot(`
    Object {
      "errors": Object {
        "organizationId": "is required",
      },
    }
  `);

  expect(
    (
      await post("/posts/posts", {
        organizationId: 1,
        title: "title",
        body: "body",
      })
    ).data.data
  ).toMatchInlineSnapshot(`
    Object {
      "@links": Object {
        "organization": "http://localhost:3000/auth/organizations/1",
      },
      "@url": "http://localhost:3000/posts/posts/1",
      "authorId": null,
      "body": "body",
      "id": 1,
      "organizationId": 1,
      "title": "title",
    }
  `);
});
