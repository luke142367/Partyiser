#!/usr/bin/env node

import path from 'path'
import { createCanvas, loadImage } from 'canvas'


/**
 * @file
 * This turns any PNG into a Party Parrot gif.
 */

import fs from 'fs'

import meow from 'meow'

const GIFEncoder = require('gifencoder')

const PARROT_COLORS = [
  '#FDD58E',
  '#8CFD8E',
  '#8CFFFE',
  '#8DB6FB',
  '#D690FC',
  '#FD90FD',
  '#FD6EF4',
  '#FC6FB6',
  '#FD6A6B',
  '#FD8E8D',
]

type callBack = (path: string) => void

const convert = (srcImage : string,
  destination : string,
  callBack : callBack = () => {},
  trans : boolean = false) => loadImage(srcImage).then((img) => {
  const w = img.width
  const h = img.height

  const encoder = new GIFEncoder(w, h)
  const writeStream = fs.createWriteStream(destination)
  writeStream.on('close', () => {
    callBack(path.resolve(srcImage))
  })
  encoder.createReadStream().pipe(writeStream)

  encoder.start()
  encoder.setRepeat(0)
  encoder.setDelay(50)
  encoder.setQuality(10)

  if (trans) {
    encoder.setTransparent('#00000000')
  }

  PARROT_COLORS.forEach((colour) => {
    const canvas = createCanvas(w, h)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0)
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillStyle = colour
    ctx.globalAlpha = 0.5
    ctx.fillRect(0, 0, w, h)
    encoder.addFrame(ctx)
  })

  encoder.finish()
})

const cli = meow(
  `
    Usage
      $ partyizer <path to png> <output filename>
 
    Examples
      $ partyizer unicorns.png unicorns.gif
`,
)

const [image, output] = cli.input

convert(image, output)

export default convert
