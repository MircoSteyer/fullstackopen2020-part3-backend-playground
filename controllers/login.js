const config = require("../utils/config")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const express = require("express")
const loginRouter = express.Router()
const User = require("../models/user")

loginRouter.post("/", async (req, res) => {
    const body = req.body
    const user = await User.findOne({username: body.username})
    const passwordCorrect = user
        ? await bcrypt.compare(body.password, user.passwordHash)
        : false

    if (!(user && passwordCorrect)) {
        return res.status(401).json({error: "invalid username or password"})
    }

    const userForToken = {
        username: user.username,
        id: user._id
    }
    const token = jwt.sign(userForToken, config.SECRET)
    res.status(200).send({token, username: user.username, name: user.name})

})

module.exports = loginRouter