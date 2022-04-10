const mongoose = require("mongoose")
const Document = require("./Document")
require('dotenv').config()
// "mongodb+srv://Atulkumargupta:Atul12345@cluster0.w34ny.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// mongoose.connect("mongodb://localhost/google-docs-clone", {

  mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.w34ny.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const express = require("express");
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'client/build')));


const io = require("socket.io")(4000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const defaultValue = ""

io.on("connection", socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.join(documentId)
    socket.emit("load-document", document.data)

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta)
    })

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data })
    })
  })
})

async function findOrCreateDocument(id) {
  if (id == null) return

  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue })
}
const port = process.env.PORT || 6000
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


app.listen(port, () => {
  console.log("Server running at port : " + port);
});
