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

// WORK - Create
router.post('/work', function(req, res) {

    console.log(req.body);

    res.jsonp({});
});

// WORK - Update
router.post('/work/:id', function(req, res) {

    console.log(req.params.id);
    console.log(req.body);

    res.jsonp({});
});

// WORK - Read
router.get('/work', function (req, res) {

    console.log(req.body);

    res.jsonp({});
});

// WORK - Delete
router.delete('/work/:id', function (req, res) {

    console.log(req.params.id);
    console.log(req.body);

    res.jsonp({});
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