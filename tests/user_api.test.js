const User = require("../models/user")
const supertest = require("supertest")
const app = require("../app")
const helper = require("./test_helper")
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")

const api = supertest(app)

describe("with one initial user in DB", () => {
    beforeEach(async () => {
        await User.deleteMany({username: {$not: {$regex: "Tester"}}})

        const passwordHash = await bcrypt.hash(helper.initialUser.password, 10)
        const user = new User({
            username: helper.initialUser.username,
            name: helper.initialUser.name,
            passwordHash
        })
        await user.save()

    })

    test("creation succeeds with fresh username", async () => {
        const usersAtStart = await helper.usersInDb()
        const newUser = {
            username: "testmansbestfriend",
            name: "Test Testers Best Friend",
            password: "youwouldneverfindout"
        }
        await api.post("/api/users")
            .send(newUser)
            .expect(200)
            .expect("Content-Type", /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
        const usernames = usersAtEnd.map(user => user.username)
        expect(usernames).toContain("testmansbestfriend")
    })
    
    test("creation fails with username already taken", async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "testingman",
            password: "verysecret",
            name: "Friend of Test Tester"
        }

        const result = await api.post("/api/users").send(newUser).expect(400)
        expect(result.body.error).toContain("expected `username` to be unique")

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

})