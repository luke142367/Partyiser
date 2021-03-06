
import express from 'express'
import bodyParser from 'body-parser'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import cors from 'cors'
import convert from './partyiser'

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

const calculatePreviousDate = (minsAgo : number) : Date => {
  const now = new Date()
  const mills = minsAgo * 60 * 1000
  return new Date(now.valueOf() - mills)
}

const deleteAllFilesOlder = (dir : string, age : number) => () => {
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

const deleteAllFiles = (dir : string) => {
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
  const { download } = req.query
  if (download) {
    res.download(path.resolve(`results/${id}`), 'party.gif')
  } else {
    res.sendFile(path.resolve(`results/${id}`))
  }
})

const returnFile = (res : express.Response, filename : string) => (srcPath : string) => {
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

const resolver : express.Handler = (req, res) => {
  const name = req.file.filename
  let trans = false
  if (req.query.trans && req.query.trans.toLowerCase() !== 'false') {
    trans = true
  }
  convert(`uploads/${name}`, `results/${name}.gif`, returnFile(res, name), trans)
}

app.post('/convert', upload.single('image'), resolver)

app.listen(process.env.PORT || port, () => console.log('listening on port', process.env.PORT || port))

deleteAllFilesOlder(path.resolve('results'), purgeDelay)()
setInterval(deleteAllFilesOlder(path.resolve('results'), purgeDelay), purgeDelayMS)
