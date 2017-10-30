var express = require('express');
var router = express.Router();
var fs = require('fs');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'public' });
});

router.get('/images/logo.png', function(req, res, next) {
  res.sendFile('images/logo.png', { root: 'public' });
});

//set up routes for all icons - this is necessary when using the doTjs css template
fs.readdir("./public/images/base", function (err, iconFileNames) {
	for (var i = 0; i < iconFileNames.length; i++) {
		(function () {
			var requestedPath = "/images/base/" + iconFileNames[i];
			var sentPath = "images/base/" + iconFileNames[i];
			router.get(requestedPath, function(req, res, next) {
			  	res.sendFile(sentPath, { root: 'public' });
			});
		})();
	}
})





module.exports = router;
