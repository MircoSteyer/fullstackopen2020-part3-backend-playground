const mongoose = require("mongoose")
const uniqueValidator = require("mongoose-unique-validator")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "Username must be unique."],
        required: [true, "Username is required."]
    },
    name: {
        type: String,
        required: [true, "Name is required."]
    },
    passwordHash: {
        type: String,
        required: true
    },
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Note"
        }
    ]
},{
    toJSON: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString()
            delete ret._id
            delete ret.__v
            delete ret.passwordHash
        }
    }
})

userSchema.plugin(uniqueValidator)

module.exports = mongoose.model("User", userSchema)