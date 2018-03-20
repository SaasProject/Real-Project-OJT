//var mongo = require('mongodb');

var possibleLocation = ["MKT","ALB","CBU","JPN"];
var possibleType = ["Parcel","Box","Package"];
var possibleStatus = ["Not Ok","Ok"];
var possibleLocationNumbers = "012";
var possibleWarehouse = "1234567890";

var tag = "";
var lctn = "device ";
var typeR = ""
var statusR = "";

//var displayDate;



	setInterval(function(){ 
		/*var start = new Date();
		var year = start.getFullYear();
		var month = ''+(start.getMonth()+1);
		var date = ''+start.getDate();
		var hour = ''+start.getHours();
		var minutes = ''+start.getMinutes();
		var seconds = ''+start.getSeconds();

		if (month.length < 2) month = '0' + month;
		if (date.length < 2) date = '0' + date;
		if (hour.length < 2) hour = '0' + hour;
		if (minutes.length < 2) minutes = '0' + minutes;
		if (seconds.length < 2) seconds = '0' + seconds;

		displayDate = year+"-"+month+"-"+date+" "+hour+":"+minutes+":"+seconds;*/
		
		var psbllctn = "";
		psbllctn = possibleLocation[Math.floor(Math.random() * possibleLocation.length)];
		var x="";
		for (var i = 0; i < 3; i++){
		     x += possibleLocationNumbers.charAt(Math.floor(Math.random() * possibleLocationNumbers.length));
		}
		var y = ""
		for (var z = 0; z < 2; z++){
		     y += possibleLocationNumbers.charAt(Math.floor(Math.random() * possibleLocationNumbers.length));
		}

		var o = possibleWarehouse.charAt(Math.floor(Math.random() * possibleWarehouse.length));

		typeR = possibleType[Math.floor(Math.random() * possibleType.length)];
		statusR = possibleStatus[Math.floor(Math.random() * possibleStatus.length)];

		tagR = psbllctn+"-"+x+"-"+y;
		lctnR=lctn+o;

		go();
		console.log(tagR+" "+lctnR+" "+typeR+" "+statusR/*+" "+displayDate*/);

	}, 1000/*Math.floor(Math.random()*10000)*/);



function go(){

	var net = require('net'),
	    JsonSocket = require('json-socket');

	var port = 3001; //The same port that the server is listening on
	var host = 'localhost';
	//var host = '192.168.223.65';
	var socket = new JsonSocket(new net.Socket()); //Decorate a standard net.Socket with JsonSocket
	socket.connect(port, host);
	socket.on('connect', function() { //Don't send until we're connected
		var hehe = {asset_tag: tagR,
					device_id: lctnR,
					/*type: typeR,
					status: statusR,
					created_date: displayDate,
					updated_date: displayDate*/}

	    socket.sendMessage(hehe);
	   
	});
}
