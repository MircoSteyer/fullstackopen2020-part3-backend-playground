require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()
const Note = require("./models/note")

/*let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2019-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2019-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2019-05-30T19:20:14.298Z",
        important: true
    }
]*/

/*const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(note => note.id))
        : 0
    return maxId + 1
}*/

app.use(express.static("build"))

app.use(cors())

app.use(express.json())

app.get("/api/notes", (req, res) => {
    Note.find({}).then(response => res.json(response))
})

app.get("/api/notes/:id", (req, res, next) => {
    Note.findById(req.params.id)
        .then(note => {
            if (note) {
                res.json(note)
            } else {
                res.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.delete("/api/notes/:id", (req, res) => {

    Note.findByIdAndDelete(req.params.id)
        .then(result => res.status(204).end())
        .catch(error => next(error))

/*    const id = Number(req.params.id)
    notes = notes.filter(note => note.id !== id)
    res.status(204).end()*/
})

app.post("/api/notes", (req, res, next) => {
    const body = req.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })
    note.save()
        .then(response => {res.json(response)})
        .catch(error => next(error))
})

app.put("/api/notes/:id", (req,res) => {
    const body = req.body

    const newNote = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(req.params.id, newNote, {new: true, useFindAndModify: false})
        .then(note => {
        res.json(note)})
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: "unknown endpoint"})
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log(error.message)
    if (error.name === "CastError") {
        return res.status(400).send({error: "malformatted id"})
    }
    if (error.name === "ValidationError") {
        return res.status(400).send({error: error.message})
    }
    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`)
})
