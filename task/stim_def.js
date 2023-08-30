var stim_def_enc = [];
var stim_def_ret1 = [];
var stim_def_ret2 = [];

var stim_ = [...Array(200).keys()];

var a = stim_.length;

var vp = 320;
        
for (var i = 0; i<vp; i++){

    shuffle(stim_);
            
    stim_def_enc[i] = stim_.slice(0,100);

    stim_def_ret1_lures = stim_.slice(100,150);
    stim_def_ret1_enc = stim_def_enc[i].slice(0,50);
    stim_def_ret1[i] = stim_def_ret1_lures.concat(stim_def_ret1_enc);

    stim_def_ret2_lures = stim_.slice(150,200);
    stim_def_ret2_enc = stim_def_enc[i].slice(50,100);
    stim_def_ret2[i] = stim_def_ret2_lures.concat(stim_def_ret2_enc);

}

const fs = require('fs');
const jsonContent = JSON.stringify(stim_def_enc);

fs.writeFile("./stim_def_enc.js", jsonContent, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 

const fs1 = require('fs');
const jsonContent1 = JSON.stringify(stim_def_ret1);

fs.writeFile("./stim_def_ret1.js", jsonContent1, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 


const fs2 = require('fs');
const jsonContent2 = JSON.stringify(stim_def_ret2);

fs.writeFile("./stim_def_ret2.js", jsonContent2, 'utf8', function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
}); 



function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      // same can be written as:
      // let t = array[i]; array[i] = array[j]; array[j] = t
      [array[i], array[j]] = [array[j], array[i]];
    }
  }