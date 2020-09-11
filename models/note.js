const mongoose = require("mongoose")

const url = process.env.MONGODB_URI

console.log("connecting to", url)

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(res => {console.log("Connected to MongoDB")})
    .catch(error => {console.log("Error: ", error)})

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
}, {
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
        }
    }
})

module.exports = mongoose.model("Note", noteSchema)