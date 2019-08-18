const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const path = require('path')
const { exec } = require('child_process')
// const convert = require('./partyizer')

const app = express()
const upload = multer({ dest: 'uploads/' })

app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
  res.send('')
})

const resolver = (req, res) => {
  exec(`node partyiser uploads/${req.file.filename} results/${req.file.filename}.gif`, (err, stdout, stderr) => {
    console.log(stdout, stderr)
    res.sendFile(path.resolve(`./results/${req.file.filename}.gif`))
  })
}

app.post('/convert', upload.single('image'), resolver)

app.listen(3000, () => console.log('listening on port 3000'))
