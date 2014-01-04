var _ = require("underscore"),
	qs = require("querystring");

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



app.get("/create", function(req, res, next) {

	var query = {}
	query.book={
		'id':uniqueId()
	};
	res.render("create", {
		query: query,
		url: qs.stringify(query)
	});
});