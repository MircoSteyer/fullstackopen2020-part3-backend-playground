const mongoose = require("mongoose")
const supertest = require("supertest")
const app = require("../app")
const Note = require("../models/note")
const helper = require("./test_helper")

const api = supertest(app)
let webToken = null
beforeAll(async () => {
    const loginData = {
        username: "Tester",
        password: "1234"
    }
    let response = await api.post("/api/login").send(loginData).expect(200)
    webToken = response.body.token
})

beforeEach(async () => {
    jest.setTimeout(10000)

    await Note.deleteMany({})

    for (const note of helper.initialNotes) {
        let newNote = new Note(note)
        await newNote.save()
    }

})

describe("when there are initially some notes saved", () => {

    describe("get all notes", () => {
        test("notes are returned as json", async () => {
            await api.get("/api/notes")
                .expect(200)
                .expect("Content-Type", /application\/json/)
        })

        test("all notes are returned", async () => {
            const response = await api.get("/api/notes")
            expect(response.body).toHaveLength(helper.initialNotes.length)
        })

        test("the first note is about HTTP methods", async () => {
            const response = await api.get("/api/notes")
            expect(response.body[0].content).toBe("HTML is easy")
        })

        test("a specific note is within the returned notes", async () => {
            const response = await api.get("/api/notes")

            const contents = response.body.map(note => note.content)
            expect(contents).toContain("Browser can execute only Javascript")
        })
    })

    describe("add a note", () => {

        test("adding a note is successful and returns status 200", async () => {
            const newNote = {
                content: "async/await simplifies making async calls",
                important: true,
                user: "5f770fcd25767531a4767d1b"
            }

            await api.post("/api/notes").auth(webToken, {type: "bearer"}).send(newNote)

            const response = await helper.notesInDb()
            expect(response).toHaveLength(helper.initialNotes.length + 1)
        })

        test("added note has correct format", async () => {
            const newNote = {
                content: "checking for format is very important",
                important: true,
                user: "5f77169abe092a3bd0df74f0"
            }

            await api.post("/api/notes")
                .auth(webToken, {type: "bearer"})
                .send(newNote)
                .expect(200)
                .expect("Content-Type", /application\/json/)

            const response = await helper.notesInDb()

            console.log(typeof response[2].user)

            expect(response[2]).toEqual(expect.objectContaining({
                content: expect.any(String),
                important: expect.any(Boolean),
                date: expect.any(Date),
                id: expect.any(String),
                user: expect.any(Object)
            }))
        })
        // should automatically not only check for existence of importance, but also that importance is set to low
        test("adding note works without giving importance and returns correct format", async () => {
            const newNote = {
                content: "not giving importance to a note automatically assigns important = false",
                user: "5f77169abe092a3bd0df74f0"
            }

            await api.post("/api/notes")
                .auth(webToken, {type: "bearer"})
                .send(newNote)
                .expect(200)
                .expect("Content-Type", /application\/json/)
            const response = await helper.notesInDb()
            expect(response[2]).toHaveProperty("important", false)
        })

        test("adding note fails without having given content property", async () => {
            const newNote = {
                important: true,
                user: "5f77169abe092a3bd0df74f0"
            }
            await api.post("/api/notes")
                .auth(webToken, {type: "bearer"})
                .send(newNote)
                .expect(400)

            const response = await helper.notesInDb()
            expect(response).toHaveLength(2)
        })
    })

    describe("single note", () => {

        test("get a single note", async () => {
            const notesInDb = await helper.notesInDb()
            const firstNote = notesInDb[0]

            const response = await api.get(`/api/notes/${firstNote.id}`)
                .expect(200)
                .expect("Content-Type", /application\/json/)

            expect(response.body).toEqual(expect.objectContaining({
                content: expect.stringMatching("HTML is easy"),
                important: expect.any(Boolean),
                date: expect.any(String),
                id: expect.any(String),
                user: expect.any(String)
            }))
        })

        test("getting a single note with wrong id doesnt work", async () => {
            const toBeRemovedNote = {
                content: "soon to be removed",
                important: false,
                user: "5f77169abe092a3bd0df74f0"
            }

            const response = await api.post("/api/notes")
                .auth(webToken, {type: "bearer"})
                .send(toBeRemovedNote)
                .expect(200)

            const allNotes = await helper.notesInDb()
            expect(allNotes).toHaveLength(helper.initialNotes.length + 1)
            await api.delete(`/api/notes/${response.body.id}`).expect(204)

            await api.get(`/api/notes/${response.body.id}`).expect(204)

        })

    })

    describe("deletion of a note", () => {

        test("a note can be deleted", async () => {
            const notesAtStart = await helper.notesInDb()
            const noteToDelete = notesAtStart[0]

            expect(notesAtStart).toHaveLength(helper.initialNotes.length)

            await api.delete(`/api/notes/${noteToDelete.id}`).expect(204)

            const notesAtEnd = await helper.notesInDb()
            expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

            const arrayOfContents = notesAtEnd.map(note => note.content)
            expect(arrayOfContents).not.toContain(noteToDelete.content)

        })

    })

})

afterAll(async () => {
    await mongoose.connection.close()
})