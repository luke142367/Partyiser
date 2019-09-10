const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const convert = require('./partyiser')

const app = express()

const maxFileSize = 500 * 1024
const port = 3001
const purgeDelay = 45
const purgeDelayMS = purgeDelay * 60 * 1000

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: maxFileSize,
  },
})

const calculatePreviousDate = (minsAgo) => {
  const now = new Date()
  const mills = minsAgo * 60 * 1000
  return new Date(now.valueOf() - mills)
}

const deleteAllFilesOlder = (dir, age) => () => {
  console.log('Purging files')
  const files = fs.readdirSync(dir)
  const cutoff = calculatePreviousDate(age)
  files.forEach((file) => {
    const { birthtime } = fs.statSync(path.join(dir, file))
    if (birthtime < cutoff) {
      fs.unlink(path.join(dir, file), () => {})
    }
  })
}

const deleteAllFiles = (dir) => {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    fs.unlink(path.join(dir, file), () => {})
  })
}

app.use(cors())

app.use(bodyParser.urlencoded({
  extended: false,
}))

app.get('/', (req, res) => {
  res.send('Hello, World!')
})

app.get('/admin/files', (req, res) => {
  const files = fs.readdirSync(path.resolve('results'))
  res.send({
    files,
  })
})

app.delete('/admin/files', (req, res) => {
  deleteAllFiles(path.resolve('results'))
  deleteAllFiles(path.resolve('uploads'))
  res.send()
})

app.get('/image/:id', (req, res) => {
  const { id } = req.params
  res.sendFile(path.resolve(`results/${id}`))
})

const returnFile = (res, filename) => (srcPath) => {
  fs.unlinkSync(srcPath)
  if (process.env.CURRENT_URL) {
    res.send({
      url: `${process.env.CURRENT_URL}image/${filename}.gif`,
    })
  } else {
    res.send({
      url: `/image/${filename}.gif`,
    })
  }
}

const resolver = (req, res) => {
  const name = req.file.filename
  convert(`uploads/${name}`, `results/${name}.gif`, returnFile(res, name))
}

app.post('/convert', upload.single('image'), resolver)

app.listen(process.env.PORT || port, () => console.log('listening on port', process.env.PORT || port))

deleteAllFilesOlder(path.resolve('results'), purgeDelay)()
setInterval(deleteAllFilesOlder(path.resolve('results'), purgeDelay), purgeDelayMS)
