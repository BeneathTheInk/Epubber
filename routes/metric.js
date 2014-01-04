var _ = require("underscore"),
	Logger = require("../lib/logger");

// Generates uniqueId based on timestamp
// Faster, smaller source, produces a 14 character string
var uniqueId = (function() {
	var lastTimestamp = null,
		counter = 0;

	return function(prepend) {
		if (prepend == null) prepend = "";
		
		var ts = Date.now().toString(16);
		if (lastTimestamp !== ts) {
			counter = 0;
			lastTimestamp = ts;
		}
		
		counter++;
		var cnt = counter.toString(16);
		while (cnt.length < 3) { cnt = 0 + cnt; }

		return prepend + ts + cnt;
	}
})();

var log = new Logger;

var ACTION_MAP = { "o": "open", "c": "close", "l": "load" },
	OBJECT_MAP = { "b": "bink", "c": "chapter" };

app.get('/', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.type("m4a");
	res.sendfile(process.cwd() + '/public/t.m4a');
	console.log('request');
	var query = _.chain(req.query)
		.map(function(v, k) { return [k.toLowerCase(), v]; })
		.object()
		.value();

	var data = {
		book: req.params[0],
		data: _.omit(query, "a", "o", "u"),
		ip: req.ip,
		useragent: req.get("user-agent"),
		date: new Date
	};

	var params = _.chain(query)
		.pick("a", "o", "u")
		.map(function(v, k) {
			v = v.toLowerCase();

			if (k == "a") {
				k = "action";
				v = v != null ? ACTION_MAP[v] : null;
			} else if (k == "o") {
				k = "object";
				v = v != null ? OBJECT_MAP[v] : null;
			} else if (k == "u") {
				k = "signature";
				if (!/^[a-f0-9]{14}$/.test(v)) v = null;
			} else return null;

			return [k, v];
		})
		.compact()
		.object()
		.defaults({ action: null, object: null, signature: uniqueId() })
		.value();

	_.extend(data, params);

	var col = app.db.collection("epubber");
	col.count({ signature: data.signature, book: data.book }, function(err, count) {
		if (err) return console.error(err.stack);
		if (count > 0) return;

		col.insert(data, function(err, docs) {
			if (err) return console.error(err.stack);
			
			str = "====\n";
			_.each(docs[0], function(v, k) {
				var out = "  " + k + ":";
				_.times(12 - k.length, function(n) { out += " "; });

				switch (typeof v) {
					case "object":
						out += JSON.stringify(v);
						break;

					case "function":
						out += v.toString();
						break;

					default:
						out += v;
						break;
				}
				str += out + "\n";
			});
			log.write(str);

		});
	});
});