const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true //Ensure uniqueness
  },
  name: String,
  passwordHash: String,
  notes: [ //array of ObjectId references to the Note model (one-to-many relation)
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note' //name of the model being referenced
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString() //id as string copy of _id
    delete returnedObject._id //remove _id
    delete returnedObject.__v //remove __v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash //so it never leaks
  }
})

const User = mongoose.model('User', userSchema)

module.exports = User