// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const electron = require('electron');
var remote = electron.remote;
var dialog = remote.dialog;
var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)

var election_file = fs.readFileSync('election_ballot.txt');
var election_ballots = election_file.toString().split(",");

var x;
var election_name = [];
for(x=3; x<election_ballots.length; x++) {
	if(x%3 == 0) {
		election_name.push(election_ballots[x]);
	}
}

var ballots_file = fs.readFileSync('votes.txt');
var ballots = ballots_file.toString().split(";");

var y;
var votes = {};
for(y=0; y<ballots.length; y++) {
	single_ballot = ballots[y].split(",");
	// votes[single_ballot[0]] = single_ballot.slice(1);
	var keyt = single_ballot[0].split(" ")[1];
	votes[keyt] = single_ballot.slice(1,ballots.length);
}


document.getElementById("search").addEventListener('click',function(){
	var id = document.getElementById("vote-key").value;
   	if(id in votes) {
   		document.getElementById("voting-verification-search").style.display = "none";
   		document.getElementById("voting-ballot").style.display = "block";

   		var i;
		for(i=0; i<election_name.length; i++) {
			var n = "selection_title_" + (i+1).toString();
			document.getElementById(n).innerHTML = election_name[i];
		}

		if(i<4){
			for(i; i<5; i++) {
				var n = "e_" + (i+1).toString();
				document.getElementById(n).style.visibility = "hidden";
			}
		}

		var e;
		var specific_votes = votes[id];
		for(e=0; e<specific_votes.length; e++) {
			var v = specific_votes[e];
			var n = "selection_"+(e+1).toString();
			document.getElementById(n).innerHTML = v;
		}
   	} else {
   		alert("Voting Key Not Found");
   	}
},false);

document.getElementById("download").addEventListener('click', function(){
	dialog.showSaveDialog({
        filters: [
            { name: 'Text', extensions: ['txt'] },
        ]
    },function (fileName) {
           if (fileName === undefined){
                console.log("You didn't save the file because you exit or didn't give a name");
                return;
           }
           // If the user gave a name to the file, then save it
           // using filesystem writeFile function
           fs.writeFile(fileName, ballots_file.toString(), function(err) {
               if(err){
                   console.log("Cannot save the file :'( time to cry !");
               }else{
                   alert("Voting Record Saved Succesfully");
               }
           });
    });
},false);

document.getElementById("goback").addEventListener('click',function(){
	document.getElementById("voting-verification-search").style.display = "block";
   	document.getElementById("voting-ballot").style.display = "none";
   	document.getElementById("vote-key").value = "";
},false);


// var myConfig = {
//   "type":"pie",
//   "title":{
//     "text":"Pie Chart"
//   },
//   "series":[
//     {"values":[59]},
//     {"values":[55]},
//     {"values":[30]},
//     {"values":[28]},
//     {"values":[15]}
//   ]
// };
 
// zingchart.render({ 
// 	id : 'myChart', 
// 	data : myConfig, 
// 	height: 400, 
// 	width: "100%" 
// });

