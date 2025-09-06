const { test, after, before, beforeEach, describe } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const supertest = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../app");
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("./test_helper");

const api = supertest(app);

let token;

describe("when there is initially some blogs saved", () => {
  before(async () => {
    await User.deleteMany({});
    const passwordHash = await bcrypt.hash("testpassword", 10);
    const user = new User({
      username: "testuser",
      name: "Test User",
      passwordHash,
    });
    await user.save();

    const loginResponse = await api
      .post("/api/login")
      .send({ username: "testuser", password: "testpassword" })
      .expect(200)
      .expect("Content-Type", /application\/json/);

    token = loginResponse.body.token;
  });
  beforeEach(async () => {
    await Blog.deleteMany({});

    const users = await User.find({});
    if (users.length === 0) {
      throw new Error("No users in DB");
    }

    const firstUser = users[0];
    const blogObjects = helper.initialBlogs.map((blog) => {
      return new Blog({
        ...blog,
        user: firstUser._id,
      });
    });
    const promiseArray = blogObjects.map((blog) => blog.save());
    await Promise.all(promiseArray);
  });

  describe("fetching blogs", () => {
    // 4.8
    test("blogs are returned as json", async () => {
      await api
        .get("/api/blogs")
        .expect(200)
        .expect("Content-Type", /application\/json/);
    });

    // 4.8
    test("correct amount of blog posts are returned", async () => {
      const response = await api.get("/api/blogs");
      const blogs = response.body;

      assert.strictEqual(blogs.length, helper.initialBlogs.length);
    });

    // 4.9
    test("the unique identifier is id", async () => {
      const response = await api.get("/api/blogs");
      const blogs = response.body;

      blogs.forEach((blog) => {
        assert.ok(blog.id);
        assert.strictEqual(blog._id, undefined);
      });
    });
  });

  describe("blogs with no likes", () => {
    // 4.11
    test("if likes property is missing, it defaults to 0", async () => {
      const newBlog = {
        title: "Test Blog for Likes Property",
        author: "Example Author",
        url: "http://likestestblog.com",
      };

      const response = await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      assert.strictEqual(response.body.likes, 0);
    });
  });

  describe("creation of a new blog", () => {
    // 4.10
    test("successfully creates a new blog post", async () => {
      const newBlog = {
        title: "React patterns Test",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
      };
      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(201)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1);

      const titles = blogsAtEnd.map((b) => b.title);
      assert.ok(titles.includes("React patterns Test"));
    });
    // 4.23
    test("creation fails if token is not provided", async () => {
      const newBlog = {
        title: "Unauthorized Blog",
        author: "No Token Author",
        url: "http://notokenblog.com",
        likes: 3,
      };

      await api.post("/api/blogs").send(newBlog).expect(401);
      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    // 4.12
    test("if title properties is missing, responds with 400 Bad Request", async () => {
      const newBlog = {
        author: "No Title Author",
        url: "http://notitleblog.com",
        likes: 5,
      };

      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });

    test("if url is missing, responds with 400 Bad Request", async () => {
      const newBlog = {
        title: "No URL Blog",
        author: "Author Without URL",
        likes: 5,
      };
      await api
        .post("/api/blogs")
        .set("Authorization", `Bearer ${token}`)
        .send(newBlog)
        .expect(400);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  describe("deletion of a blog", () => {
    // 4.13
    test("deleting functionality works", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(204);

      const blogsAtEnd = await helper.blogsInDb();

      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

      const titles = blogsAtEnd.map((b) => b.title);

      assert.ok(!titles.includes(blogToDelete.title));
    });
    test("deleting not work if token is not provided", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToDelete = blogsAtStart[0];

      await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401);

      const blogsAtEnd = await helper.blogsInDb();
      assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
    });
  });

  describe("updating a blog", () => {
    // 4.14
    test("updating functionality works", async () => {
      const blogsAtStart = await helper.blogsInDb();
      const blogToUpdate = blogsAtStart[0];

      const updatedData = {
        title: "Updated Title",
        author: "Updated Author",
        url: "http://updatedurl.com",
        likes: blogToUpdate.likes + 1,
      };

      const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedData)
        .expect(200)
        .expect("Content-Type", /application\/json/);

      const blogsAtEnd = await Blog.find({});
      assert.strictEqual(blogsAtEnd[0].title, updatedData.title);
      assert.strictEqual(blogsAtEnd[0].author, updatedData.author);
      assert.strictEqual(blogsAtEnd[0].url, updatedData.url);
      assert.strictEqual(blogsAtEnd[0].likes, updatedData.likes);
    });
  });
});


after(() => {
  mongoose.connection.close();
});
