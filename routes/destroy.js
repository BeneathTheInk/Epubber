app.post("/destroy", function(req, res) {
	if(req.body.destroy==='true'){
		app.db.dropCollection("epubber",function(){
			console.log("destroyed!!!")
		});
	};
});