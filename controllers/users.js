const express = require("express")
const userRouter = express.Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
require("express-async-errors")

userRouter.get("/", async (req, res) => {
    const allUsers = await User.find({}).populate("notes", {user: 0})
    console.log("allUsers", allUsers)
    res.json(allUsers)
})

userRouter.post("/", async (req, res) => {
    const body = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash: passwordHash,
        notes: body.notes || []
    })

    const newUser = await user.save()
    res.json(newUser)

})

module.exports = userRouter