const { test, after, describe, beforeEach } = require("node:test");
const assert = require("node:assert");
const supertest = require("supertest");
  const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/user");
const helper = require("./test_helper");

const api = supertest(app);

describe("user tests", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("user creation", () => {
    test("succeeds with a valid username and password", async () => {
      const newUser = {
        username: "newuser", // valid username ( at least 3 characters long )
        name: "New User",
        password: "securepassword", // valid password ( at least 3 characters long )
      };

      await api
        .post("/api/users")
        .send(newUser)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, 1);
      const usernames = usersAtEnd.map((u) => u.username);
      assert(usernames.includes(newUser.username));
    });
    test("fails with status code 400 if username is less than 3 characters", async () => {
      const newUser = {
        username: "ab", // invalid username ( less than 3 characters long )
        name: "Short Username",
        password: "validpassword",
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      assert.strictEqual(
        result.body.error,
        "username is required and must be at least 3 characters long"
      );

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, 0);
    });

    test("fails with status code 400 if password is less than 3 characters", async () => {
      const newUser = {
        username: "validusername",
        name: "Short Password",
        password: "pw", // invalid password ( less than 3 characters long )
      };

      const result = await api
        .post("/api/users")
        .send(newUser)
        .expect(400)
        .expect("Content-Type", /application\/json/);

      assert.strictEqual(
        result.body.error,
        "password is required and must be at least 3 characters long"
      );

      const usersAtEnd = await helper.usersInDb();
      assert.strictEqual(usersAtEnd.length, 0);
    });
  });
});

after(async () => {
  mongoose.connection.close();
});