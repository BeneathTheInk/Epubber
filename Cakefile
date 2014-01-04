exec = require("child_process").exec

option '-o', '--output [file]', 'file path to save the archive, defaults ./archive.tar.gz'
option '-v', '--verbose', 'verbose output'

task 'archive', "Put everything into a single, gzipped archive.", (options) ->
	archive_name = options.output ? "archive.tar.gz"
	files = [ "." ]
	excludes = [ ".git/", "node_modules/", ".DS_Store", "logs/" ]

	build_cmd = () ->
		ret = "tar"
		excludes.forEach (e) -> ret += " --exclude #{e}"
		ret += " --exclude #{archive_name}"
		ret += " -czf #{archive_name}"
		ret += " -v" if options.verbose
		files.forEach (f) -> ret += " #{f}"
		return ret

	tar = exec build_cmd()

	tar.stdout.on 'data', (data) ->
		process.stdout.write data.toString "utf-8"

	tar.stderr.on 'data', (data) ->
		process.stderr.write data.toString "utf-8"