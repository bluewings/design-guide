var expreses = require('express');
var router = expreses.Router();
/*var bodyParser = require('body-parser');

  app.use(express.bodyParser({ 
    keepExtensions: true, 
    uploadDir: __dirname + '/tmp',
    limit: '2mb'
  }));*/

router.get('/', function (req, res) {

    res.render('index', {
        title: 'Design Guide Helper',
        stylesheets: ['/stylesheets/design-guide.css'],
        javascripts: [
            '/javascripts/jquery.form.min.js',
            '/javascripts/pixastic.custom.js',
            '/javascripts/ui-bootstrap-tpls-0.11.0.min.js',
            '/javascripts/design-guide.util.js',
            '/javascripts/design-guide.js']
    });
});

router.get('/modal/saveAs', function (req, res) {

    res.render('modal-saveAs', {});
});

router.get('/modal/browse', function (req, res) {

    res.render('modal-browse', {});
});

// WORK - Create
router.post('/work', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        id = (parseInt(Math.random() * 900000000 + 100000000, 10)).toString(36).substr(0, 5),
        filename;

    if (!req.body.name) {
        res.jsonp({
            code: 500,
            message: 'name is required.'
        });
    } else if (!req.body.content) {
        res.jsonp({
            code: 500,
            message: 'no contents found.'
        });
    }

    filename = path.join(__dirname, '..', 'public', 'works', req.body.name + '.' + id + '.json');

    fs.writeFile(filename, req.body.content, function (err) {

        if (err) {
            res.jsonp({
                code: 500,
                message: err
            });
        } else {
            res.jsonp({
                code: 200,
                message: 'ok',
                result: {
                    id: id
                }
            });
        }
    });
});

// WORK - Update
router.post('/work/:id', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        dir = path.join(__dirname, '..', 'public', 'works'),
        allFiles = fs.readdirSync(dir),
        filepath, fStat, matches, inx,
        files = [];

    for (inx = 0; inx < allFiles.length; inx++) {
        filepath = path.join(dir, allFiles[inx]);
        matches = allFiles[inx].match(/^(.*)\.([0-9a-zA-Z]{5})\.json$/);
        if (matches && matches[2] == req.params.id) {
            fs.unlink(filepath, function (err, data) {
                // do nothing
            });
        }
    }

    filename = path.join(__dirname, '..', 'public', 'works', req.body.name + '.' + req.params.id + '.json');

    fs.writeFile(filename, req.body.content, function (err) {

        if (err) {
            res.jsonp({
                code: 500,
                message: err
            });
        } else {
            res.jsonp({
                code: 200,
                message: 'ok',
                result: {
                    id: req.params.id
                }
            });
        }
    });
});

// WORK - Read (list)
router.get('/work', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        dir = path.join(__dirname, '..', 'public', 'works'),
        allFiles = fs.readdirSync(dir),
        filepath, fStat, matches, inx,
        files = [];

    for (inx = 0; inx < allFiles.length; inx++) {
        filepath = path.join(dir, allFiles[inx]);
        matches = allFiles[inx].match(/^(.*)\.([0-9a-zA-Z]{5})\.json$/);
        fStat = fs.statSync(filepath);
        if (matches && !fStat.isDirectory()) {
            files.push({
                filename: matches[1],
                workId: matches[2],
                size: fStat.size,
                atime: fStat.atime,
                mtime: fStat.mtime,
                ctime: fStat.ctime
            });
        }
    }

    res.jsonp({
        code: 200,
        message: 'ok',
        result: {
            files: files
        }
    });
});

// WORK - Read
router.get('/work/:id', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        dir = path.join(__dirname, '..', 'public', 'works'),
        allFiles = fs.readdirSync(dir),
        filepath, fStat, matches, inx,
        fileNotFound = true;

    for (inx = 0; inx < allFiles.length; inx++) {
        filepath = path.join(dir, allFiles[inx]);
        matches = allFiles[inx].match(/^(.*)\.([0-9a-zA-Z]{5})\.json$/);
        if (matches && matches[2] == req.params.id) {
            fileNotFound = false;
            fs.readFile(filepath, 'utf8', function (err, data) {
                if (err) {
                    res.jsonp({
                        code: 500,
                        message: err
                    });
                } else {
                    res.jsonp({
                        code: 200,
                        message: 'ok',
                        result: {
                            content: data
                        }
                    });
                }
            });
            break;
        }
    }

    if (fileNotFound) {
        res.jsonp({
            code: 500,
            message: 'file not found.'
        });
    }
});

// WORK - Delete
router.delete('/work/:id', function (req, res) {

    var fs = require("fs"),
        path = require('path'),
        dir = path.join(__dirname, '..', 'public', 'works'),
        allFiles = fs.readdirSync(dir),
        filepath, fStat, matches, inx,
        files = [];

    for (inx = 0; inx < allFiles.length; inx++) {
        filepath = path.join(dir, allFiles[inx]);
        matches = allFiles[inx].match(/^(.*)\.([0-9a-zA-Z]{5})\.json$/);
        if (matches && matches[2] == req.params.id) {
            fs.unlink(filepath, function (err, data) {
                // do nothing
            });
        }
    }

    res.jsonp({
        code: 200,
        message: 'ok'
    });
});

router.post('/upload', function (req, res) {

    console.log(req.body);
    console.log(req.files);
    console.log(req.files.uploadImage);
    //console.log(req);

    /*res.render('admin/mfarm_vert', {
        title: 'test',
        stylesheets: ['/stylesheets/mfarm-vert.css'],
        javascripts: [
            '/javascripts/mfarm-vert.js',
            '//cdn.jsdelivr.net/isotope/2.0.0/isotope.pkgd.min.js'
        ]
    });*/
});


module.exports = router;