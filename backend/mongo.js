// Import Mongoose - our MongoDB object modeling library
const mongoose = require('mongoose')

// Check if user provided a password as a command line argument
// Remember: run this with "node mongo.js YOUR_PASSWORD"
if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

// Grab the password from command line arguments (second argument after filename)
const password = process.argv[2]

// MongoDB Atlas connection string - this connects to our cloud database
// The password gets inserted into the URL dynamically
const url = `mongodb+srv://fullstack:${password}@cluster0.tkkxlf4.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

// Tell Mongoose to be less strict about query validation (legacy compatibility)
mongoose.set('strictQuery',false)

// Actually connect to the database using our connection string
mongoose.connect(url)

// Define what our Note documents should look like (the blueprint)
// Think of this as the structure/rules for our data
const noteSchema = new mongoose.Schema({
  content: String,    // The actual note text
  important: Boolean, // Whether this note is marked as important
})

// Create a Model class from our schema - this is what we'll use to interact with the database
// Mongoose will automatically create a "notes" collection (plural of Note)
const Note = mongoose.model('Note', noteSchema)

// Create a new note instance - this is just in memory for now, not saved yet
// const note = new Note({
//   content: 'HTML is easy',
//   important: true,
// })
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})

// Actually save the note to the database
// .save() returns a Promise, so we use .then() to handle when it's done
note.save().then(result => {
  console.log('note saved!')
  // Always close the connection when we're done, otherwise the script hangs forever
  mongoose.connection.close()
})