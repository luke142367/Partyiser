"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var multer_1 = __importDefault(require("multer"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var cors_1 = __importDefault(require("cors"));
var partyiser_1 = __importDefault(require("./partyiser"));
var app = express_1.default();
var maxFileSize = 500 * 1024;
var port = 3001;
var purgeDelay = 45;
var purgeDelayMS = purgeDelay * 60 * 1000;
var upload = multer_1.default({
    dest: 'uploads/',
    limits: {
        fileSize: maxFileSize,
    },
});
var calculatePreviousDate = function (minsAgo) {
    var now = new Date();
    var mills = minsAgo * 60 * 1000;
    return new Date(now.valueOf() - mills);
};
var deleteAllFilesOlder = function (dir, age) { return function () {
    console.log('Purging files');
    var files = fs_1.default.readdirSync(dir);
    var cutoff = calculatePreviousDate(age);
    files.forEach(function (file) {
        var birthtime = fs_1.default.statSync(path_1.default.join(dir, file)).birthtime;
        if (birthtime < cutoff) {
            fs_1.default.unlink(path_1.default.join(dir, file), function () { });
        }
    });
}; };
var deleteAllFiles = function (dir) {
    var files = fs_1.default.readdirSync(dir);
    files.forEach(function (file) {
        fs_1.default.unlink(path_1.default.join(dir, file), function () { });
    });
};
app.use(cors_1.default());
app.use(body_parser_1.default.urlencoded({
    extended: false,
}));
app.get('/', function (req, res) {
    res.send('Hello, World!');
});
app.get('/admin/files', function (req, res) {
    var files = fs_1.default.readdirSync(path_1.default.resolve('results'));
    res.send({
        files: files,
    });
});
app.delete('/admin/files', function (req, res) {
    deleteAllFiles(path_1.default.resolve('results'));
    deleteAllFiles(path_1.default.resolve('uploads'));
    res.send();
});
app.get('/image/:id', function (req, res) {
    var id = req.params.id;
    var download = req.query.download;
    if (download) {
        res.download(path_1.default.resolve("results/" + id), 'party.gif');
    }
    else {
        res.sendFile(path_1.default.resolve("results/" + id));
    }
});
var returnFile = function (res, filename) { return function (srcPath) {
    fs_1.default.unlinkSync(srcPath);
    if (process.env.CURRENT_URL) {
        res.send({
            url: process.env.CURRENT_URL + "image/" + filename + ".gif",
        });
    }
    else {
        res.send({
            url: "/image/" + filename + ".gif",
        });
    }
}; };
var resolver = function (req, res) {
    var name = req.file.filename;
    var trans = false;
    if (req.query.trans && req.query.trans.toLowerCase() !== 'false') {
        trans = true;
    }
    partyiser_1.default("uploads/" + name, "results/" + name + ".gif", returnFile(res, name), trans);
};
app.post('/convert', upload.single('image'), resolver);
app.listen(process.env.PORT || port, function () { return console.log('listening on port', process.env.PORT || port); });
deleteAllFilesOlder(path_1.default.resolve('results'), purgeDelay)();
setInterval(deleteAllFilesOlder(path_1.default.resolve('results'), purgeDelay), purgeDelayMS);
