const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const convert = require('./partyiser')

const app = express()

const maxFileSize = 200 * 124

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: maxFileSize,
  },
})

app.use(bodyParser.urlencoded({
  extended: false,
}))

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

const returnFile = res => (srcPath, resPath) => {
  fs.unlinkSync(srcPath)
  res.sendFile(resPath, () => {
    fs.unlinkSync(resPath)
  })
}

const resolver = (req, res) => {
  convert(`uploads/${req.file.filename}`, `results/${req.file.filename}.gif`, returnFile(res))
}

app.post('/convert', upload.single('image'), resolver)

app.listen(3000, () => console.log('listening on port 3000'))
