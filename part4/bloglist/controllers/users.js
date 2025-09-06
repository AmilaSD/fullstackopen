const userRouter = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");

userRouter.post("/", async (request, response, next) => {
    const { username, name, password } = request.body;

    const saltsRound = 10;
    const passwordHash = await bcrypt.hash(password, saltsRound);

    if(!username || username.length < 3) {
        return response.status(400).json({ error: "username is required and must be at least 3 characters long" });
    }

    if(!password || password.length < 3) {
        return response.status(400).json({ error: "password is required and must be at least 3 characters long" });
    }

    const user = new User({
        username,
        name,
        passwordHash
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
});

userRouter.get("/", async (request, response, next) => {
    const users = await User.find({}).populate("blogs", { title: 1, author: 1, url: 1 });
    response.json(users);
})

module.exports = userRouter;
