const mongoose = require("mongoose")

const noteSchema = new mongoose.Schema({
    content: {
        type: String,
        minlength: 5,
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    important: Boolean,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
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