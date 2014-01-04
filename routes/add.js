var _ = require("underscore"),
	fs = require("fs"),
	path = require("path"),
	archiver = require('node-archiver');
	Logger = require("../lib/logger");

var projectPath="generated/";

function renderFile(view, data) {
	var filename = path.join(__dirname, "../views/BTI/", view),
	raw = fs.readFileSync(filename, { encoding: "utf-8" });
	return _.template(raw, data);
}
app.post('/add',function(req,res){
	projectPath="generated/";
	console.log(req.body);
	if(!req.body.title){
		console.log('Need a title!');
		return;
	}
	projectPath+=req.body.title+'/';
	fs.mkdir(projectPath,function(){
		fs.mkdir(projectPath+'META-INF/');
		createFile("iTunesMetadata.plist",renderFile("iTunesMetadata.plist", {data: req.body}));
		projectPath+='OEBPS/';
		fs.mkdir(projectPath);
		createFile("content.opf",renderFile("content.opf", {data: req.body}));
		createFile("toc.xhtml",renderFile("toc.xhtml", {data: req.body}));
		createFile("toc.ncx",renderFile("toc.ncx", {data: req.body}));

		if(!req.body.chapters){
			console.log("No Chapters!")
			return;
		}
		for ( var i = 0, l = req.body.chapters.length; i < l; i++ ) {
			var cleanedChapter=cleanText(req.body.chapters[i])
		    createFile("chapter"+i+".xhtml",renderFile("chapter.xhtml", {data: cleanedChapter}));
		}
		addFiles('cover.jpg',projectPath);
		addFiles('styles.css',projectPath);
		addFiles('Tangerine_Bold.ttf',projectPath);

		addFiles('mimetype','generated/'+req.body.title+'/');
		addFiles('container.xml','generated/'+req.body.title+'/META-INF/');
		addToDB(req.body);
		// archiver('generated/'+req.body.title, 'generated/'+req.body.title+'my-archive.zip');
	});
});

function createFile(name,content){
	fs.writeFile(projectPath+name,content,function(err){
		console.log(name+' created');
	});
};

function addFiles(fileName,path){
	var is = fs.createReadStream('files/'+fileName);
	var os = fs.createWriteStream(path+fileName);
	is.pipe(os);
}
function addToDB(data){
	var col = app.db.collection("epubber");
	col.insert(data, function(err, docs) {
		console.log(err);
	});
};
function cleanText(text){
	var cleaned=text;
	return(cleaned);
}