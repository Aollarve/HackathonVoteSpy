// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

// A flag to know when start or stop the camera
var enabled = false;
// Use require to add webcamjs
var WebCamera = require("webcamjs");

const ipc = require('electron').ipcRenderer


document.getElementById("start").addEventListener('click', function(){
	// document.getElementById("camdemo").style.display = "block";
	document.getElementById("verify-box").style.display = "block";
	document.getElementById("start").style.display = "none";
  document.getElementById("voting-identification").style.display = "block";
},false)


document.getElementById("start").addEventListener('click',function(){
    ipc.send('reset-request');
   if(!enabled){ // Start the camera !
     enabled = true;
     WebCamera.attach('#camdemo');
     console.log("The camera has been started");
   }else{ // Disable the camera !
     enabled = false;
     WebCamera.reset();
    console.log("The camera has been disabled");
   }
},false);


const electron = require('electron');
//var remote = require('remote'); // Load remote component that contains the dialog dependency
var remote = electron.remote;
// document.getElementById("start").addEventListener('click',function(){
// 	console.log("SOMETHING")
// }, false);
// var dialog = remote.require('dialog'); // Load the dialogs component of the OS
var dialog = remote.dialog
var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)


// return an object with the processed base64image
function processBase64Image(dataString) {
      var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),response = {};

      if (matches.length !== 3) {
          return new Error('Invalid input string');
      }

      response.type = matches[1];
      response.data = new Buffer(matches[2], 'base64');

      return response;
}

var current_election_num = 0;

document.getElementById("savefile").addEventListener('click',function(){
     if(enabled){
            WebCamera.snap(function(data_uri) {
                // Save the image in a variable
                var imageBuffer = processBase64Image(data_uri);
                // Start the save dialog to give a name to the file
                // dialog.showSaveDialog({
                //     filters: [
                //         { name: 'Images', extensions: ['png'] },
                //     ]
                // },function (fileName) {
                //        if (fileName === undefined){
                //             console.log("You didn't save the file because you exit or didn't give a name");
                //             return;
                //        }
                //        // If the user gave a name to the file, then save it
                //        // using filesystem writeFile function
                //        fs.writeFile(fileName, imageBuffer.data, function(err) {
                //            if(err){
                //                console.log("Cannot save the file :'( time to cry !");
                //            }else{
                //                alert("Image saved succesfully");
                //            }
                //        });
                // });

                var loc = window.location.pathname;
				        var dir = loc.substring(0, loc.lastIndexOf('/'));
                var fileName = dir + "/" + document.getElementById('id-num').value + '.png'

                ipc.send('image-request', data_uri)

                fs.writeFile(fileName, imageBuffer.data, function(err) {
                           if(err){
                               console.log("Cannot save the file :'( time to cry !");
                           }else{
                               	alert("Identity Verified Succesfully");
                								document.getElementById("verify-box").style.display = "none";
                								document.getElementById("voting-identification").style.display = "none";
                								document.getElementById("start").style.display = "none";
                								document.getElementById("voting-ballot").style.display = "block";
                                enabled = false;
                                document.getElementById('id-num').value = "";
                           }
                       });
             });
     }else{
            console.log("Please enable the camera first to take the snapshot !");
     }
},false);


// var election_ballot = "";
// Asynchronous read
// fs.readFile('election_ballot.txt', function (err, data) {
//   if (err) {
//     return console.error(err);
//   }
//   // console.log("Asynchronous read: " + data.toString());
//   election_ballot = data.toString();
// });

var election_file = fs.readFileSync('election_ballot.txt');
// console.log("Synchronous read: " + data.toString());
// console.log("Program Ended")
var election_ballots = election_file.toString().split(",")

var x;
var election_name = [];
var election_candidates = [];
var election_write_ins_available = [];
for(x=3; x<election_ballots.length; x++) {
	if(x%3 == 0) {
		election_name.push(election_ballots[x]);
	} else if(x%3==1) {
		election_candidates.push(election_ballots[x]);
	} else {
		election_write_ins_available.push(election_ballots[x]);
	}
}


document.getElementById("candidate2").addEventListener('click', function(){
	document.getElementById("candidate1").checked = false;
  document.getElementById("candidate3").checked = false;
	document.getElementById("write-in").value = "";
}, false);

document.getElementById("candidate1").addEventListener('click', function(){
	document.getElementById("candidate2").checked = false;
  document.getElementById("candidate3").checked = false;
	document.getElementById("write-in").value = "";
}, false);

document.getElementById("candidate3").addEventListener('click', function(){
  document.getElementById("candidate1").checked = false;
  document.getElementById("candidate2").checked = false;
  document.getElementById("write-in").value = "";
}, false);

document.getElementById("write-in").oninput = function() {
  document.getElementById("candidate1").checked = false;
	document.getElementById("candidate2").checked = false;
  document.getElementById("candidate3").checked = false;
};

if(election_candidates[current_election_num].split(";").length < 3) {
  document.getElementById("cand_3").style.display = "none";
}

candidates = election_candidates[current_election_num].split(";");
var i;
for(i=0; i < candidates.length; i++) {
  var cand = candidates[i];
  console.log(cand);
  var id = "candidate_"+(i+1).toString();
  console.log(id)
  document.getElementById(id).innerHTML = cand;
}

if(election_write_ins_available[current_election_num] == "false") {
  document.getElementById("cand_write").style.display = "none";
}

var information = "";

document.getElementById("submit").addEventListener('click', function(){
	  var cand_1_checked = document.getElementById("candidate1").checked;
	  var cand_2_checked = document.getElementById("candidate2").checked;
    var cand_3_checked = document.getElementById("candidate3").checked;
	  var write_in_cand = document.getElementById("write-in").value;

    var votes = {
        "cand1": "",
        "cand2": "",
        "cand3": "",
        "writein": ""
    }

	if(!cand_1_checked && !cand_2_checked && !cand_3_checked && (write_in_cand == "")) {
		alert("No Candidate Selected");
	} else {
		fileName = "vote.txt"
		if(cand_1_checked) {
        votes["cand1"] = document.getElementById("candidate_1").innerHTML;
		} else if(cand_2_checked) {
			  votes["cand2"] = document.getElementById("candidate_2").innerHTML;
		} else if(cand_3_checked) {
			  votes["cand3"] = document.getElementById("candidate_3").innerHTML;
    } else {
       votes["writein"] = write_in_cand;
		}

    document.getElementById("candidate1").checked = false;
    document.getElementById("candidate2").checked = false;
    document.getElementById("candidate3").checked = false;
    document.getElementById("write-in").value = "";

    if(current_election_num+1 == election_name.length) {
  		document.getElementById("voting-ballot").style.display = "none";
  		document.getElementById("voting-receipt").style.display = "block";
      current_election_num = 0;
      
      if(election_write_ins_available[current_election_num] == "false") {
        document.getElementById("cand_write").style.display = "none";
      } else {
        document.getElementById("cand_write").style.display = "block";
      }

  		/*fs.writeFile(fileName, information, function(err) {
                             if(err){
                                 console.log("Cannot save the file :'( time to cry !");
                             }else{
                                alert("Vote succesful");
                             }
                         }); //write to vote.txt
      */

        /*var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "localhost:8000/vote/1", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(JSON.stringify(votes));
        console.log(this.responseText);*/

        ipc.send('vote-request', votes)


  		setTimeout(function() {
  			document.getElementById("voting-receipt").style.display = "none";
  			document.getElementById("verify-box").style.display = "none";
  			document.getElementById("voting-identification").style.display = "block";
  			document.getElementById("start").style.display = "inline";
  		}, 5000);

    } else {
      current_election_num++;
      if(election_candidates[current_election_num].split(";").length < 3) {
        document.getElementById("cand_3").style.display = "none";
      }

      candidates = election_candidates[current_election_num].split(";");
      var i;
      for(i=0; i < candidates.length; i++) {
        var cand = candidates[i];
        console.log(cand);
        var id = "candidate_"+(i+1).toString();
        console.log(id)
        document.getElementById(id).innerHTML = cand;
      }

      if(election_write_ins_available[current_election_num] == "false") {
        document.getElementById("cand_write").style.display = "none";
      } else {
        document.getElementById("cand_write").style.display = "block";
      }

    }


	}
}, false);




