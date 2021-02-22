const config = require("../utils/config")
const notesRouter = require("express").Router()
const Note = require("../models/note")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
require("express-async-errors")

const getWebToken = request => {
    const authorization = request.get("authorization")
    if (authorization && authorization.toLowerCase().startsWith("bearer ")) {
        return authorization.substring(7)
    }
    return null
}

const decodeToken = token => {
    return jwt.verify(token, config.SECRET)
}

notesRouter.get("/", async (req, res) => {
    const notes = await Note.find({}).populate("user", {notes: 0})
    res.json(notes)
})

notesRouter.get("/:id", async (req, res) => {

    const response = await Note.findById(req.params.id)
    response ? res.json(response) : res.status(204).end()

})

notesRouter.delete("/:id", async (req, res) => {
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()

})

notesRouter.post("/", async (req, res) => {
    const body = req.body
    const token = getWebToken(req)
    const decodedToken = decodeToken(token)
    console.log("decodedToken", decodedToken)
    if (!token || !decodedToken.id) {
        return res.status(401).json({error: "token missing or invalid"})
    }

    const user = await User.findById(decodedToken.id)

    const newNote = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
        user: user._id
    })

    const savedNote = await newNote.save()
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    res.json(savedNote)
})

notesRouter.put("/:id", async (req,res) => {
    const body = req.body

    const newNote = {
        content: body.content,
        important: body.important,
    }

    const response = await Note.findByIdAndUpdate(req.params.id, newNote, {new: true, useFindAndModify: false})
    res.json(response)
})

module.exports = notesRouter
