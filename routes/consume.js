var _ = require("underscore"),
	qs = require("querystring");

app.get("/consume", function(req, res, next) {

	var col = app.db.collection("epubber")

		// app.db.dropCollection("epubber",function(){});

		col.find().toArray(function(err, docs) {
			if (err) return next(err);

			res.render("consume", {
				data: docs
			});
	});

});