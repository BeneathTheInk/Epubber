var _ = require("underscore"),
	EventEmitter = require("events").EventEmitter,
	async = require("async"),
	fs = require("fs"),
	path = require("path");

Logger =
module.exports = (function() {

	function Logger (options) {
		if (options == null) options = {};

		this.options = _.defaults(options, {
			folder: "./logs",
			prepend: "",
			max_size: 1024 * 1024 // 1MB
		});

		this.state = "init";
		this.queue = [];
		this.running = false;

		this.mkdirp(function(err) {
			if (err) return this.emit("error", err);
			this.refresh(function(err) {
				if (err) this.emit("error", err);
				else this.emit(this.state = "ready");
			});
		});
	}

	_.extend(Logger.prototype, EventEmitter.prototype);

	Logger.prototype.write = function(msg) {
		if (!_.isString(msg) || msg == "")
			throw new Error("Invalid arguments passed to write method.");

		this.queue.push(msg);
		this.invalidate();

		return this;
	}

	Logger.prototype.invalidate = function() {
		if (this.running) return;
		this.running = true;

		var self = this;

		function doWrite() {
			async.whilst(
				function() { return self.queue.length > 0; },
				function(cb) { self.push(cb); },
				function(err) {
					if (err) self.emit("error", err);
					else self.running = false;
				}
			)
		}

		if (this.state != "ready") this.once("ready", doWrite);
		else doWrite();

		return this;
	}

	Logger.prototype.push = function(callback) {
		if (!_.isFunction(callback)) callback = function(){};
		callback = _.bind(callback, this);

		var msg = this.queue.shift() + "\n",
			self = this;

		this.file.write(msg, function() {
			self.refresh(callback);
		});

		return this;
	}

	Logger.prototype.refresh = function(callback) {
		if (!_.isFunction(callback)) callback = function(){};
		callback = _.bind(callback, this);

		var nd = Date.create().format(Date.ISO8601_DATE);
		if (this.date !== nd) {
			this.date = nd;
			this.index = 1;
		}

		var done = false,
			self = this;

		async.whilst(
			function() { return !done; },
			function(cb) {
				self.fileSize(function(err, size) {
					if (err) cb(err);
					else if (size < self.options.max_size) {
						done = true;
						cb();
					} else {
						self.index++;
						cb();
					}
				});
			},
			function(err) {
				if (err) callback(err);
				else {
					self.file = self._fileStream();
					callback();
				}
			}
		);

		return this;
	}

	Logger.prototype.fileSize = function(callback) {
		if (!_.isFunction(callback)) callback = function(){};
		callback = _.bind(callback, this);

		var file = this.filename();

		fs.exists(file, function(exists) {
			if (!exists) return callback(null, 0);

			fs.stat(file, function(err, stat) {
				if (err != null) callback(err);
				else callback(null, stat.size);
			});
		});
	}

	Logger.prototype.mkdirp = function(callback) {
		if (!_.isFunction(callback)) callback = function(){};
		callback = _.bind(callback, this);

		var dir = path.resolve(this.options.folder);

		fs.exists(dir, function(exists) {
			if (exists) callback();
			else fs.mkdir(dir, callback);
		});

		return this;
	}

	Logger.prototype._fileStream = function() {
		return fs.createWriteStream(this.filename(), { flags: "a", encoding: "utf-8" });
	}

	Logger.prototype.filename = function() {
		return path.join(path.resolve(this.options.folder), this.options.prepend + this.date + "_(" + this.index + ").log");
	}

	return Logger;

})();