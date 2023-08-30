var timeline = [];

// getting url variables for subject id and condition
var urlvar = jsPsych.data.urlVariables();
//console.log(urlvar.id)
//console.log(urlvar.c)

//settings. GENERAL
var slider_width_ = "500";
var t_bye = 2500; //how long last screen is presented

//settings. ENCODING
var ntrials_enc = 100;
var ntrials_practice_enc = 4;
var fixcross_size_enc = 60;
var fixcross_time_enc = 1500;

var breaktrl_practice_enc = 2;
var breaktrl_enc = [50]; //break after those trials (can be multiple)

//settings. RETRIEVAL
var ntrials_ret = 100; 
var ntrials_practice_ret = 6;
var fixcross_size_ret = 60;
var fixcross_time_ret = 1500;

var breaktrl_practice_ret = 3;
var breaktrl_ret = [50]; //break after those trials (can be multiple)

var t_disable_btn = 2000; //source screen if new trial. time the continue button is disabled


//STIMULI. ENCODING & RETRIEVAL
var obj_enc_idx = stim_def_enc[urlvar.id-1]; //get subj specific enc, ret1 and ret2 stim 
var obj_enc = obj_stim.filter((x,i) => obj_enc_idx.includes(i));
//console.log(obj_enc)

var obj_ret_idx = stim_def_ret1[urlvar.id-1]; //get subj specific ret1 lures stim
var obj_ret = obj_stim.filter((x,i) => obj_ret_idx.includes(i));
//console.log(obj_ret)
shuffle(obj_enc) //stim are sorted when indexed
shuffle(obj_ret)

var sc_enc = repmat(sc_stim,ntrials_enc/4);
shuffle(sc_enc)


//settings. PVT
var ntrials_practice_pvt = 3;

var ntrials_pvt = 25; //20trl = ~2minutes. 25trl = ~ 2.5 minutes
var fix_time_pvt = [2000, 3000, 4000, 5000, 6000]; //possible durations of fixation cross in seconds
var txt_size_feedback_pvt = 30;
var fixcross_size_pvt = 60;
 
var t_cue_pvt = 2000; //how long red fixcross is presented max
var t_feedback_pvt = 2000;   

var isi_pvt = repmat(fix_time_pvt,ntrials_pvt/fix_time_pvt.length);
shuffle(isi_pvt)

//------------------------- check for correct time -------------------------

var time_to_check = [[19,21], [7,9], [19,21], [7,9]]; //in dependence of condition
var time_feedback = ['7 and 10 pm', '7 and 9 am', '7 and 10 pm', '7 and 9 am']; //in dependence of condition
//console.log(time_to_check[urlvar.c-1][0])

var check_time = {
  type: "html-keyboard-response",
  stimulus: "<p style= 'font-size:5px;color:white'>hola</p>",
  trial_duration: 500,
  on_finish: function(data){
    var d = new Date();
    var t = d.getTime();
    console.log(t)
    var hour = d.getHours();
    if(hour < time_to_check[urlvar.c-1][0] || hour > time_to_check[urlvar.c-1][1]){
     jsPsych.endExperiment("<p style='font-size:20px'>Please start the first session between "+time_feedback[urlvar.c-1]+"</p>"+
     "<p>You can close the browser now and use the link again.</p>");
    }
  }
};

timeline.push(check_time)

//------------------------- INSTRUCTIONs -------------------------

var delay_hours = [12,12,24,24]; 
var time_session1 = ['8pm', '8am', '8pm', '8am'];
var time_session2 = ['8am', '8pm', '8pm the next day', '8am the next day'];


var welcome_general = {
  type: "instructions",
  pages: ["<p style = 'font-size:25px;'><strong>Welcome to our experiment.</strong></p>" +
    "<p>The experiment comprises <strong>two sessions</strong>:</p>" +
    "<p><strong>Session 1</strong> (~40 minutes) entails a learning phase, a short attention task and a memory test.</p>" +
    "<p><strong>Session 2</strong> (~20 minutes) only entails the short attention task, another memory test and a short questionnaire.</p>"+
    "Session 2 <u>must</u> be started <u>"+delay_hours[urlvar.c-1]+" hours</u> after you begin session 1! "+
    "For example, if you start session 1 at "+time_session1[urlvar.c-1]+", you have to return for session 2 at "+time_session2[urlvar.c-1]+".</p>" +
    "<p>Please make sure that you start session 2 at the correct time <u>or we will not be able to use your data</u>. "+ 
    "Starting a few minutes before or after the start time is OK.</p>" +
    "<p>Click the 'Next' button for instructions on the learning phase.</p>",
    "<p style = 'font-size:25px;'>Learning Phase</p>"+
    "<p>During the learning phase, you will be presented with several pairs of images. "+
    "In each pair, one of the images will be an object and the other image will be a scene. " +
    "<strong>Your task is to learn these image pairings for a later memory test.</strong></p>"+
    "<p>To help you learn, try to imagine the object and scene interacting. "+
    "For example, if a loaf of bread (object) and a wheat field (scene) were presented, you could think about the wheat being used to produce the loaf of bread.</p>" +
    "<p>The object of every pair is always different, but the scenes repeat (there are four scenes: wheat field, sauna, lighthouse, ballroom).</p>" +
    "<p>Later, during the memory test, only the object will be presented and you will be asked to indicate which scene it was associated with.</p>",
    "<p>After you learn each object-scene pairing, we would like you to provide a rating of <strong>how strongly the object is associated with the scene.</strong></p>"+ 
    "<p>To make your rating, use the slider beneath the object-scene pair. Please use the whole slider range to give the most accurate response.</p>"+
    "<p>In the previous example, you might think that the loaf of bread and the wheat field are strongly associated as bread is made of wheat.</p>"+ 
    "Note that there are no right or wrong answers here; we just want to know your opinion about how strongly the object and scene are associated.</p>" +
    "<p>Click the 'Next' button to try a practice of the learning phase.</p>"
    ],
    show_clickable_nav: true
};

timeline.push(welcome_general)

obj_practice_enc = ['bread.jpg', 'witchhat.jpg', 'bowlingball.jpg', 'mango02c.jpg'];
sc_practice_enc  = ['wheat_field.jpg', 'sauna.jpg', 'lighthouse.jpg', 'ballroom.jpg'];

for(var i = 0; i<ntrials_practice_enc; i++){
  
  var fixation_enc = {
    type: "html-keyboard-response",
    stimulus: "<span style='font-size:"+fixcross_size_enc+"px;'> + </span>", 
    choices: jsPsych.NO_KEYES,
    trial_duration: fixcross_time_enc
  };

  var trial_practice_enc = {
    type: "html-slider-response-adap",
    stimulus: "<div class ='row'>" +
      "<div class = 'column'> <img src= ' "+obj_practice_enc[i]+" 'style = 'width:60%' class = 'center'> </div>" +
      "<div class = 'column'>  <img src=' "+sc_practice_enc[i]+" ' style = 'width:60%' class = 'center'> </div>" +
      "</div>",
    labels: ["unrelated", "related"],
    slider_width: slider_width_,
    require_movement: true,
    response_ends_trial: true,
    data: {
      task: "practice_enc",
      obj_: obj_practice_enc[i],
      sc_: sc_practice_enc[i]
    }
  };

//--------- break -------
if (i == breaktrl_practice_enc){
  var break_practice_enc = {
    type: "html-keyboard-response",
    stimulus: "<p style = 'font-size:25px;'>Break</p>" +
    "<p>After completing half of the learning phase, you will be given a short break. Please use this time to relax and take a rest.</p>"+
    "<p><strong>The breaks should <u>not</u> last any longer than 5 minutes</strong>.</p>"+
    "<p>When you are ready to continue, press any key.</p>"
  };
  timeline.push(break_practice_enc)
};

timeline.push(fixation_enc, trial_practice_enc)
};

var instruction_practice_pvt = {
  type: "instructions",
  pages: [
  "<p style = 'font-size:25px;'>Attention Task</p>" +
  "<p>During the attention task, you will see a black crosshair.</p>"+
  "<p>Your task is to <strong>press the space bar</strong> with your right hand <strong>whenever the crosshair turns red</strong>.</p>" +
  "<p>Please make your response as <strong>quickly as possible</strong>.</p>"+
  "<p>You will get feedback about your reaction time.</p>" +
  "<p>Click the 'Next' button to do a practice of the attention task.</p>"
  ],
  show_clickable_nav: true
};

timeline.push(instruction_practice_pvt)

for(var i = 0; i<ntrials_practice_pvt; i++){

  var fixation_pvt = {
    type: "html-keyboard-response",
    stimulus: "<span style='font-size:"+fixcross_size_pvt+"px;'> + </span>", 
    choices: jsPsych.NO_KEYS,
    trial_duration: isi_pvt[i]
  };

  var trial_pvt = {
    type: "html-keyboard-response",
    stimulus: "<span style='font-size:"+fixcross_size_pvt+"px; color:red'> + </span>",
    choices: ["space"],
    trial_duration: t_cue_pvt,
    data: {
      task: "practice_pvt",
      isi: isi_pvt[i]
    }
  };

  var feedback_pvt = {
    type: "html-keyboard-response",
    stimulus: function(){
      var rt = Math.round(jsPsych.data.getLastTrialData().values()[0].rt);
      var feedback_txt_pvt = "<span style = 'font-size:"+txt_size_feedback_pvt+"px;color:green'> reaction time = "+rt+" ms</span>";
      if (rt == 0) {
          feedback_txt_pvt = "<span style = 'font-size:"+txt_size_feedback_pvt+"px;color:red'> please pay attention </span>";
      };
      return feedback_txt_pvt;
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: t_feedback_pvt
  };

timeline.push(fixation_pvt, trial_pvt, feedback_pvt)
};


var instruction_practice_ret = {
  type: "instructions",
  pages: [
  "<p style = 'font-size:25px;'>Memory Test</p>" +
  "<p>During the memory test, you will see the same objects as during the learning phase. "+ 
  "You will also see some new objects that were not presented during the learning phase.</p>" +
  "<p><strong>Step one:</strong> For each object, we would like to know whether you think it was presented during the learning phase (i.e. it is <strong>old</strong>) "+ 
  "or you think it is <strong>new</strong>.</p>" +
  "<p>Please use the slider beneath the object to indicate how certain you are that the object is old or new. "+
  "Please use the entire range of the slider to give the most accurate response.</p>",
  "<p><strong>Step two:</strong> If you think the object is <strong>old</strong>, we would like you to indicate <strong>which scene</strong> the object was presented with. "+
  "Please choose <strong>one</strong> of the four scenes (wheat field, sauna, lighthouse or ballroom).</p>"+
  "<p>Please indicate how certain you are that this is the associated scene by using the slider beneath the image. "+
  "Again, please use the entire range of the slider.</p>" +
  "<p>If you think the object is <strong>new</strong>, you don’t need to make any response on step two. Simply click the continue button at the bottom of the screen. "+
  "Please note that the continue button will be greyed out for a couple of seconds on these occasions.</p>" +
  "<p>Click the 'Next' button to do a practice of the memory test.</p>"
  ],
  show_clickable_nav: true
};

timeline.push(instruction_practice_ret)


obj_practice_ret = ['cementtruck.jpg', 'bread.jpg', 'witchhat.jpg', 'boxingglove01.jpg', 'cauliflower02.jpg', 'mango02c.jpg'];

for (var i = 0; i < ntrials_practice_ret; i++){

  var fixation_ret = {
      type: "html-keyboard-response",
      stimulus: "<span style='font-size:"+fixcross_size_ret+"px;'> + </span>", 
      choices: jsPsych.NO_KEYS,
      trial_duration: fixcross_time_ret
    };

  var trial_practice_ret_item = {
    type: "html-slider-response-adap",
    stimulus: "<img src = ' "+obj_practice_ret[i]+" ' style = 'width:50%'> </img>",
    labels: ["new", "old"],
    slider_width: slider_width_,
    require_movement: true,
    response_ends_trial: true,
     data: {
       task: "practice_ret",
       obj_: obj_practice_ret[i],
       sc_: "null"
      }
  };
  
  var feedback_practice_ret = {
    type: "multiple-slider-adap",
    questions: function(){
      resp_old_new = [];
      resp_old_new = jsPsych.data.getLastTrialData().values()[0].response;
      if (resp_old_new > 50){
        var col_prompt = 'black';
      } else {
        var col_prompt = 'lightgrey';
      }
      question_labels = [{prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>ballroom", name: "ballroom", labels: ["unsure", "sure"]},
      {prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>sauna", name: "sauna", labels: ["unsure", "sure"]},
      {prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>lighthouse", name: "lighthouse", labels: ["unsure", "sure"]},
      {prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>wheat field", name: "wheat_field", labels: ["unsure", "sure"]}]
      return question_labels
    },
    require_movement: function(){
      if (resp_old_new > 50){
         return true
      } else {
        return false
      }
    },
    disable_all_sliders: function(){
      if(resp_old_new > 50){
        return false
      } else {
        return true
      }
    },
    t_before_button: function(){
       if(resp_old_new > 50){
         a = 0;
        } else {
         a = t_disable_btn;
        }
       return a
    },
    randomize_question_order: true,
    slider_width: slider_width_
  };

  
  //--------- break -------
  if (i == breaktrl_practice_ret){
    var break_practice_ret = {
     type: "html-keyboard-response",
      stimulus: "<p style = 'font-size:25px;'>Break</p>" +
      "<p>After completing half of the memory test, you will be given a short break. Please use this time to relax and take a rest.</p>"+
      "<p><strong>The break should <u>not</u> last any longer than 5 minutes</strong>.</p>"+
      "<p>When you are ready to continue, press any key.</p>"
    }
   timeline.push(break_practice_ret)
  };

timeline.push(fixation_ret, trial_practice_ret_item, feedback_practice_ret)


};


//------------------------- START & consent -------------------------

timeline.push({
  type: "fullscreen",
  message: "<p>The real experiment is about to start…</p>" +
  "<p>The learning phase lasts approximately 20 minutes.</p>" +
  "<p>The attention task lasts approximately 3 minutes.</p>" +
  "<p>The memory test lasts approximately 20 minutes.</p>" +
  "<p>Please make sure that you are in a <strong>quiet environment without any distractions</strong>. The task will run in full-screen mode.</p>"+
  "<p><br></p>" +
  "<p style = 'font-size:20px;'><strong>Your Consent</strong></p>" +
  "<p>By clicking the 'Next' button below, you are providing your consent to taking part in this experiment. " +
  "Your participation is voluntary and you have the right to withdraw your consent or discontinue participation " +
  "(by exiting the full-screen mode and closing the window) at any time without giving a reason, and without penalty. " +
  "You agree that your anonymised data may be used for scientific purposes (e.g. journal articles and presentations) and " +
  "may be shared with researchers outside of this study.</p>" +
  "<p><strong> Only click the 'Next' button if you agree to take part in this study and to start the experiment.</strong></p>",
  fullscreen_mode: true,
  button_label: "Next"
});

//------------------------- ENCODING -------------------------

var breaktrl_count = 0;

for(var i = 0; i<ntrials_enc; i++){
  
  var fixation_enc = {
    type: "html-keyboard-response",
    stimulus: "<span style='font-size:"+fixcross_size_enc+"px;'> + </span>", 
    choices: jsPsych.NO_KEYS,
    trial_duration: fixcross_time_enc
  };

  var trial_enc = {
    type: "html-slider-response-adap",
    stimulus: "<div class ='row'>" +
      "<div class = 'column'> <img src= ' "+obj_enc[i]+" ' style = 'width:60%' class = 'center'> </div>" +
      "<div class = 'column'>  <img src=' "+sc_enc[i]+" ' style = 'width:60%' class = 'center'> </div>" +
      "</div>",
    labels: ["unrelated", "related"],
    slider_width: slider_width_,
    require_movement: true,
    response_ends_trial: true,
    data: {
      task: "enc",
      obj_: obj_enc[i],
      sc_: sc_enc[i]
    }
  };

  //--------- break -------
  if (i == breaktrl_enc[breaktrl_count]){
    var break_enc = {
      type: "html-keyboard-response",
      stimulus: "<p style = 'font-size:25px;'>Break</p>" +
      "<p>You are halfway through the learning phase and can take a short break.</p>"+
      "<p><strong>The break should <u>not</u> last any longer than 5 minutes</strong>.</p>"+
      "<p>When you are ready to continue, press any key.</p>"
    };
  timeline.push(break_enc)
  var breaktrl_count = breaktrl_count + 1;
  };

  timeline.push(fixation_enc, trial_enc)
};


//------------------------- SSS -------------------------

var options_sss = ["Feeling active and vital; alert; wide awake",
"Functioning at a high level, but not at peak; able to concentrate",
"Relaxed; awake; not at full alertness; responsive",
"A little foggy; not at peak; let down",
"Fogginess; beginning to lose interest in remaining awake; slowed down",
"Sleepiness; prefer to be lying down; fighting sleep; woozy",
"Almost in reverie; sleep onset soon; lost struggle to remain awake"];


var sss = {
  type: "survey-multi-choice",
  questions: [{prompt: "Before you start with the attention task, "+ 
  "please indicate your current level of sleepiness by selecting the most true statement.", options: options_sss, required:true}],
};

timeline.push(sss)


//------------------------- PVT -------------------------

var instruction_pvt = {
  type: "html-keyboard-response",
  stimulus: "<p style = 'font-size:25px;'>Attention Task</p>" +
  "<p>During the attention task, you will see a black crosshair.</p>"+
  "<p>Your task is to <strong>press the space bar</strong> with your right hand <strong>whenever the crosshair turns red</strong>.</p>" +
  "<p>Please make your response as <strong>quickly as possible</strong>.</p>"+
  "<p>You will get feedback about your reaction time.</p>" +
  "<p>Press any key to start.</p>"
};

timeline.push(instruction_pvt)

for(var i = 0; i<ntrials_pvt; i++){

  var fixation_pvt = {
    type: "html-keyboard-response",
    stimulus: "<span style='font-size:"+fixcross_size_pvt+"px;'> + </span>", 
    choices: jsPsych.NO_KEYS,
    trial_duration: isi_pvt[i]
  };

  var trial_pvt = {
    type: "html-keyboard-response",
    stimulus: "<span style='font-size:"+fixcross_size_pvt+"px; color:red'> + </span>",
    choices: ["space"],
    trial_duration: t_cue_pvt,
    data: {
      task: "pvt",
      isi: isi_pvt[i]
    }
  };

  var feedback_pvt = {
    type: "html-keyboard-response",
    stimulus: function(){
      var rt = Math.round(jsPsych.data.getLastTrialData().values()[0].rt);
      var feedback_txt_pvt = "<span style = 'font-size:"+txt_size_feedback_pvt+"px;color:green'> reaction time = "+rt+" ms</span>";
      if (rt == 0) {
          feedback_txt_pvt = "<span style = 'font-size:"+txt_size_feedback_pvt+"px;color:red'> please pay attention </span>";
      };
      return feedback_txt_pvt;
    },
    choices: jsPsych.NO_KEYS,
    trial_duration: t_feedback_pvt
  };

  timeline.push(fixation_pvt, trial_pvt, feedback_pvt)
};


//------------------------- RETRIEVAL -------------------------

var instruction_ret = {
  type: "instructions",
  pages: [
  "<p style = 'font-size:25px;'>Memory Test</p>" +
  "<p>During the memory test, you will see the same objects as during the learning phase. "+ 
  "You will also see some new objects that were not presented during the learning phase.</p>" +
  "<p><strong>Step one:</strong> For each object, we would like to know whether you think it was presented during the learning phase (i.e. it is <strong>old</strong>) "+ 
  "or you think it is <strong>new</strong>.</p>" +
  "<p>Please use the slider beneath the object to indicate how certain you are that the object is old or new. "+
  "Please use the entire range of the slider to give the most accurate response.</p>",
  "<p><strong>Step two:</strong> If you think the object is <strong>old</strong>, we would like you to indicate <strong>which scene</strong> the object was presented with. "+
  "Please choose <strong>one</strong> of the four scenes (wheat field, sauna, lighthouse or ballroom).</p>"+
  "<p>Please indicate how certain you are that this is the associated scene by using the slider beneath the image. "+
  "Again, please use the entire range of the slider.</p>" +
  "<p>If you think the object is <strong>new</strong>, you don’t need to make any response on step two. Simply click the continue button at the bottom of the screen. "+
  "Please note that the continue button will be greyed out for a couple of seconds on these occasions.</p>" +
  "<p>Click the 'Next' button to start with the memory test.</p>"
  ],
  show_clickable_nav: true
};

timeline.push(instruction_ret)

var breaktrl_count_ret = 0;

for (var i = 0; i<ntrials_ret; i++){

  var fixation_ret = {
      type: "html-keyboard-response",
      stimulus: "<span style='font-size:"+fixcross_size_ret+"px;'> + </span>", 
      choices: jsPsych.NO_KEYS,
      trial_duration: fixcross_time_ret
    };

  var trial_ret_item = {
    type: "html-slider-response-adap",
    stimulus: "<img src = ' "+obj_ret[i]+" ' style = 'width:50%'> </img>",
    labels: ["new", "old"],
    slider_width: slider_width_,
    require_movement: true,
    response_ends_trial: true,
     data: {
       task: "ret",
       obj_: obj_ret[i],
       sc_: "null"
      }
  };
  
  var feedback_ret = {
    type: "multiple-slider-adap",
    questions: function(){
      resp_old_new = [];
      resp_old_new = jsPsych.data.getLastTrialData().values()[0].response;
      if (resp_old_new > 50){
        var col_prompt = 'black';
      } else {
        var col_prompt = 'lightgrey';
      }
      question_labels = [{prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>ballroom", name: "ballroom"},
      {prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>sauna", name: "sauna"},
      {prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>lighthouse", name: "lighthouse"},
      {prompt: "<p style= 'font-size:20px;color:"+col_prompt+"'>wheat field", name: "wheat_field"}]
      return question_labels
    },
    require_movement: function(){
      if (resp_old_new > 50){
         return true
      } else {
        return false
      }
    },
    disable_all_sliders: function(){
      if(resp_old_new > 50){
        return false
      } else {
        return true
      }
    },
    t_before_button: function(){
      if(resp_old_new > 50){
        a = 0;
      } else {
       a = t_disable_btn;
      }
      return a
    },
    randomize_question_order: true,
    slider_width: slider_width_
  };
  
  
  //--------- break -------
  if (i == breaktrl_ret[breaktrl_count_ret]){
    var break_ret = {
     type: "html-keyboard-response",
     stimulus: "<p style = 'font-size:25px;'>Break</p>" +
    "<p>You are halfway through the memory test and can take a short break.</p>"+
    "<p><strong>The break should <u>not</u> last any longer than 5 minutes</strong>.</p>"+
    "<p>When you are ready to continue, press any key.</p>"
    };
    var breaktrl_count_ret = breaktrl_count_ret +1;
    timeline.push(break_ret)
  };

  timeline.push(fixation_ret, trial_ret_item, feedback_ret)
};

//------------------------- bye -------------------------

var subj_info = {
    type: 'survey-text',
    questions: [
      {prompt: 'Initials (just first and surname, without middle names):', placeholder: 'mp', columns: 3, required: true, name: 'init'},
      {prompt: 'Age:', placeholder: '21', columns: 3, required: true, name: 'age'},
      {prompt: 'Gender:', placeholder: 'female/male/non-binary', columns: 30, required: true, name: 'gender'},
      {prompt: 'First language:', placeholder: 'english/dutch/spanish', columns: 30, required: true, name: 'language'},
      {prompt: 'Dominant hand:', placeholder: 'left/right/both', columns: 30, required: true, name: 'hand'}
    ],
    preamble: "<p style = 'font-size:25px;'>That was great!</p>" +
    "<p style = 'line-heigt:0;'> Lastly, please provide the following information and answer the questions on the next page. After that you are done with the first session.</p>",
    on_finish: function(){
      var subj_resp = JSON.parse(jsPsych.data.getLastTrialData().values()[0].responses);
      var subj_init = subj_resp["init"];
      //var subjID = subj_init.concat(subj_resp["birth"]);
      var age = subj_resp["age"];
      var gender = subj_resp["gender"];
      var language = subj_resp["language"];
      var hand = subj_resp["hand"];
      jsPsych.data.addProperties({ subject:subj_init, age:age, gender:gender, language:language, hand:hand})
    }
  };
  
timeline.push(subj_info)

//--------------------- bye2 -------------------------------

var sleep_info = {
    type: 'survey-text',
    questions: [
      {prompt: 'When did you go to bed?', placeholder: '10pm', columns: 5, required: true, name: 'bedtime'},
      {prompt: 'How many hours of sleep did you get?', placeholder: '8', columns: 3, required: true, name: 'hours'},
      {prompt: 'When did you get out of bed?', placeholder: '8am', columns: 5, required: true, name: 'outtime'}
    ],
    preamble: "<p>Please answer the questions relating to <strong>last night</strong>.</p>"+
    "<p>Please be honest with your answers. For example, if you did not get enough sleep, "+
    "that is completely fine. Just be honest.</p>"
  };
  
timeline.push(sleep_info)

//--------------------- bye3 -------------------------------

var general_ = {
    type: 'survey-text',
    questions: [
      {prompt: 'When did you have your last coffee/alcoholic drink? Please be honest. Your response will not affect your reimbursement.', rows: 5, columns: 60, name: 'coffee/alcohol'},
      {prompt: 'Are there any comments you want to make?', rows: 15, columns: 60, name: 'comments'}
      ],
  
};
  
timeline.push(general_)

//--------------------- bye4 -------------------------------

var bye = {
  type: "html-keyboard-response",
  stimulus: 
  "<p> <strong> Thanks!!! </strong> </p>"+ 
  "<p>You can close the window now.</p>",
  trial_duration: t_bye
};

timeline.push(bye)


jsPsych.init({timeline: timeline,
  exclusions: {
    min_width: 600,
    min_height: 400
  },
  on_interaction_data_update: function(data){
    screen_focus = data.event;
  },
  on_data_update: function(data){
    data.screen = screen_focus;
    screen_focus = [];
    //data.screen_trl = trial_focus;
  }
})