const notesRouter = require("express").Router()
const Note = require("../models/note")

notesRouter.get("/", (req, res) => {
    Note.find({}).then(response => res.json(response))
})

notesRouter.get("/:id", (req, res, next) => {
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

notesRouter.delete("/:id", (req, res, next) => {

    Note.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).end())
        .catch(error => next(error))

    /*    const id = Number(req.params.id)
        notes = notes.filter(note => note.id !== id)
        res.status(204).end()*/
})

notesRouter.post("/", (req, res, next) => {
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

notesRouter.put("/:id", (req,res, next) => {
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

module.exports = notesRouter