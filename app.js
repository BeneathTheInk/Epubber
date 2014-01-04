process.title = "epubber"

require("sugar");

var express = require("express"),
	http = require("http"),
	fs = require("fs"),
	path = require("path"),
	_ = require("underscore"),
	MongoClient = require('mongodb').MongoClient;

global.app = express();

app.use(express.bodyParser());

app.enable('trust proxy');
app.use(express.static(__dirname + "/public"))
	.use(express.query());

// custom render func
app.use(function(req, res, next) {
	function render(view, data) {
		var filename = path.join(__dirname, "views", view + ".html"),
			raw = fs.readFileSync(filename, { encoding: "utf-8" });
		
		return _.template(raw, data);
	}
	
	res.render = function(view, data) {
		var body, e, full;
		if (data == null) data = {};
		
		try {
			_.extend(data, { $req: req, $res: res });
			
			body = render(view, data);
			full = render("layout", _.extend(data, {
				body: body,
				view: view
			}));

			res.type("html");
			return res.send(full);
		
		} catch (e) {
			return next(e);
		}
	}

	next();
});

var routesDir = path.join(__dirname, "routes");
fs.readdirSync(routesDir).forEach(function(f) {
	if (path.extname(f) == ".js") require(path.join(routesDir, f));
});

var server = http.createServer(app);

MongoClient.connect(process.env.MONGO_URL, function(err, database) {
	if (err != null) return console.error(err);
	console.log("Connected to " + process.env.MONGO_URL);
	app.db = database;

	server.listen(process.env.PORT, function() {
		console.log('Listening on port ' + process.env.PORT + '.');
	});
});