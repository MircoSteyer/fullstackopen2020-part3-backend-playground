const Note = require("../models/note")
const User = require("../models/user")

const initialNotes = [
    {
        content: "HTML is easy",
        date: new Date(),
        important: false,
        user: "5f77169abe092a3bd0df74f0"
    },
    {
        content: "Browser can execute only Javascript",
        date: new Date(),
        important: true,
        user: "5f77169abe092a3bd0df74f0"
    }
]

const initialUser = {
    username: "testingman",
    password: "verysecret",
    name: "Test Tester"
}

const nonExistingId = async () => {
    const note = new Note({
        content: "soon to be deleted",
        date: new Date(),
    })

    await note.save()
    await note.remove()

    return note._id.toString()
}

const notesInDb = async () => {
    const notes = await Note.find({})
    return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(user => user.toJSON())
}

module.exports = {
    notesInDb, initialNotes, nonExistingId, usersInDb, initialUser
}
