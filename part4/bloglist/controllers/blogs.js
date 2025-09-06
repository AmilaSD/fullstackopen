const jwt = require("jsonwebtoken");
const blogRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const { userExtractor } = require("../utils/middleware");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogRouter.post("/", userExtractor, async (request, response) => {
  const { title, url } = request.body;
  const user = request.user;
  if (!user) {
    return response.status(400).json({ error: "User is not valid" });
  }
  if (!title) {
    return response.status(400).json({ error: "title is missing" });
  }
  if (!url) {
    return response.status(400).json({ error: "title is missing" });
  }

  const blog = new Blog({
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes || 0,
    user: user._id,
  });

  const result = await blog.save();
  
  user.blogs = user.blogs.concat(result._id);
  await user.save();
  
  const responseData = await result.populate("user", { username: 1, name: 1 });
  return response.status(201).json(responseData);
});

blogRouter.delete("/:id", userExtractor, async (request, response, next) => {
  const id = request.params.id;
  const user = request.user;
  const blog = await Blog.findById(id);
  if (!blog) {
    return response.status(404).json({ error: "blog not found" });
  }
  if(!user) {
    return response.status(400).json({ error: "User is not valid" });
  }
  if (blog.user.toString() !== user.id.toString()) {
    return response
      .status(403)
      .json({ error: "only the creator can delete a blog" });
  }
  await blog.deleteOne();
  response.status(204).end();
});

blogRouter.put("/:id", async (request, response, next) => {
  const { id } = request.params;
  const { title, author, url, likes } = request.body;

  const updatedBlog = await Blog.findByIdAndUpdate(
    id,
    { title, author, url, likes },
    { new: true, runValidators: true }
  );
  if (updatedBlog) {
    const responseData = await updatedBlog.populate("user", {
      username: 1,
      name: 1,
    });
    response.json(responseData);
  } else {
    response.status(404).end();
  }
});

module.exports = blogRouter;
