#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var canvas_1 = require("canvas");
var fs_1 = __importDefault(require("fs"));
var meow_1 = __importDefault(require("meow"));
var gifencoder_1 = __importDefault(require("gifencoder"));
/**
 * @file
 * This turns any PNG into a Party Parrot gif.
 */
var PARROT_COLORS = [
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
];
var convert = function (srcImage, destination, callBack, trans) {
    if (callBack === void 0) { callBack = function () { }; }
    if (trans === void 0) { trans = false; }
    return canvas_1.loadImage(srcImage).then(function (img) {
        var w = img.width;
        var h = img.height;
        var encoder = new gifencoder_1.default(w, h);
        var writeStream = fs_1.default.createWriteStream(destination);
        writeStream.on('close', function () {
            callBack(path_1.default.resolve(srcImage));
        });
        encoder.createReadStream().pipe(writeStream);
        encoder.start();
        encoder.setRepeat(0);
        encoder.setDelay(50);
        encoder.setQuality(10);
        if (trans) {
            encoder.setTransparent('#00000000');
        }
        PARROT_COLORS.forEach(function (colour) {
            var canvas = canvas_1.createCanvas(w, h);
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0);
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = colour;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(0, 0, w, h);
            encoder.addFrame(ctx);
        });
        encoder.finish();
    });
};
var cli = meow_1.default("\n    Usage\n      $ partyizer <path to png> <output filename>\n \n    Examples\n      $ partyizer unicorns.png unicorns.gif\n");
var _a = cli.input, image = _a[0], output = _a[1];
convert(image, output);
exports.default = convert;
