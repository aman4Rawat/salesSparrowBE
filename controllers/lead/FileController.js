const express = require('express');
const router = express.Router();
const multer = require('multer');

var storage = multer.diskStorage({
	destination : function(request, file, callback)
	{
		console.log('..destination')
		callback(null, './uploads');
	},
	filename : function(request, file, callback)
	{
		console.log('..filename')
		var temp_file_arr = file.originalname.split(".");
		var temp_file_name = temp_file_arr[0];
		var temp_file_extension = temp_file_arr[1];
		callback(null, temp_file_name + '-' + Date.now() + '.' + temp_file_extension);
	}
});
var upload = multer({storage}).single('file');

router.post("/", function(request, response, next){
	upload(request, response, function(error){
        console.log(request.file)
        console.log(request.files)
		if(error)
		{
			return response.end('Error Uploading File');
		}
		else
		{
			return response.end('File is uploaded successfully');
		}
	});
});

module.exports = router;
