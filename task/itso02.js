var timeline = [];

//getting url variables for subject id and condition
var urlvar = jsPsych.data.urlVariables();
console.log(urlvar.id)
console.log(urlvar.c)

//settings. GENERAL
var slider_width_ = "500";
var t_bye = 2500; //how long last screen is presented

//settings. RETRIEVAL
var ntrials_ret = 100; 
var fixcross_size_ret = 60;
var fixcross_time_ret = 1500;
var breaktrl_ret = [50]; //break after those trials (can be multiple)
var t_disable_btn = 2000; //time for which continue button (source screen) is disabled when item is rated as new in millisconds

//STIMULI. RETRIEVAL

var obj_ret_idx = stim_def_ret2[urlvar.id-1]; 
var obj_ret = obj_stim.filter((x,i) => obj_ret_idx.includes(i));
console.log(obj_ret)
shuffle(obj_ret) //stim are sorted when indexed

//settings. PVT
var ntrials_pvt = 25; //20trl = ~2minutes. 25trl = ~ 2.5 minutes
var fix_time_pvt = [2000, 3000, 4000, 5000, 6000]; //possible durations of fixation cross in seconds
var txt_size_feedback_pvt = 30;
var fixcross_size_pvt = 60;
 
var t_cue_pvt = 2000; //how long red fixcross is presented max
var t_feedback_pvt = 2000;     

var isi_pvt = repmat(fix_time_pvt,ntrials_pvt/fix_time_pvt.length);
shuffle(isi_pvt)


//settings. questionnaires
var bai_scale_width = 650; //width of likert scale in pixels

//------------------------- check for correct time -------------------------

var time_to_check = [[7,9], [19,21], [19,21], [7,9]]; //in dependence of condition
var time_feedback = ['7 and 10 am', '7 and 9 pm', '7 and 10 pm', '7 and 9 am']; //in dependence of condition

var check_time = {
  type: "html-keyboard-response",
  stimulus: "<p style= 'font-size:5px;color:white'>hola</p>",
  trial_duration: 500,
  on_finish: function(data){
    var d = new Date();
    var hour = d.getHours();
    if(hour < time_to_check[urlvar.c-1][0] || hour > time_to_check[urlvar.c-1][1]){
     jsPsych.endExperiment("<p style='font-size:20px'>Please start the second session between "+time_feedback[urlvar.c-1]+"</p>"+
      "<p>You can close the browser now and use the link again.</p>");
    }
  }
};

timeline.push(check_time)


//------------------------- GENERAL INFO. & subjCODE -------------------------
var subj_info = {
    type: 'survey-text',
    questions: [
      {prompt: 'Initials (just first and surname, without middle names):', placeholder: 'mp', columns: 3, required: true, name: 'init'},
      {prompt: 'Age:', placeholder: '21', columns: 3, required: true, name: 'age'},
      {prompt: 'Gender:', placeholder: 'female/male/non-binary', columns: 30, required: true, name: 'gender'}
    ],
    preamble: "<p style = 'font-size:25px;'><strong>Welcome back!</strong></p>" +
    "<p style = 'line-heigt:0;'> Before we start with the second session of the experiment, please provide the following information:</p>",
    on_finish: function(){
      var subj_resp = JSON.parse(jsPsych.data.getLastTrialData().values()[0].responses);
      var subj_init = subj_resp["init"];
      var age = subj_resp["age"];
      //var subjID = subj_init.concat(subj_resp["birth"]);
      var gender = subj_resp["gender"];
      jsPsych.data.addProperties({subject:subj_init, age:age, gender:gender})
    }
  };
  
timeline.push(subj_info)

//------------------------- START -------------------------

timeline.push({
  type: "fullscreen",
  message: "<p>The second session of the experiment is about to start…</p>" +
  "<p>You will begin with the attention task, which lasts approximately 3 minutes.</p>" +
  "<p>Afterwards, you will do the memory test, which lasts approximately 20 minutes.</p>" +
  "<p>Finally, we would like you to complete a sleep questionnaire, which takes about 2 minutes.</p>"+
  "<p>Click the 'Next' button to start (in full-screen mode).</p>",
  fullscreen_mode: true,
  button_label: "Next"
});


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

  timeline.push(fixation_pvt, trial_pvt, feedback_pvt);
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


//------------------------- intro QUESTIONNAIRES -------------------------

var intro_questionnaires = {
  type: "html-keyboard-response",
  stimulus: "<p style = 'font-size:25px;'>Questionnaire</p>" +
  "<p>Finally, we would like you to answer some questions about your sleep quality. "+
  "This part will last around 2 minutes. After that you are done with the experiment.</p>"+
  "<p>Press any key to start.</p>"
};

timeline.push(intro_questionnaires)


//------------------------- PSQI ------------------------- 

var psqi_trial01 = {
    type: 'survey-text',
    questions: [
      {prompt: '...when have you usually gone to bed?', placeholder: '11pm', columns: 5, required: true, name: 'bed time'},
      {prompt: '...how long(in minutes) has it taken you to fall asleep each night?', placeholder: '20', columns: 3, required: true, name: 'minutes to sleep'},
      {prompt: '...when have you usually gotten up in the morning?', placeholder: '8am', columns: 5, required: true, name: 'out of bed time'},
      {prompt: '...how many hours of actual sleep do you get at night? (This may be different than the number of hours you spend in bed)', placeholder: '8.5', columns: 3, required: true, name: 'hours sleep a night'}
    ],
    preamble: "<p>The following questions relate to your <u>usual sleep habits during the past month only</u>. "+
    "Your answers should indicate the most accurate reply for the majority of days and nights in the past month.</p>" +
    "<p> <strong>During the past month,... </strong></p>"
  };
  
  
var scale_psqi01 = ["Not during the past month", "Less than once a week", "Once or twice a week", "Three or more times a week"];  
var scale_psqi02 = ["Very good", "Fairly good", "Fairly bad", "Very bad"];  
  
var psqi_trial02 = {
  type: 'survey-likert',
  questions: [
    {prompt: '...cannot get to sleep within 30 minutes', name: 'q5a', labels: scale_psqi01, required: true},
    {prompt: '...wake up in the middle of the night or early morning', name: 'q5b', labels: scale_psqi01, required: true},
    {prompt: '...have to get up to use the bathroom', name: 'q5c', labels: scale_psqi01, required: true},
    {prompt: '...cannot breathe comfortably', name: 'q5d', labels: scale_psqi01, required: true},
    {prompt: '...cough or snore loudly', name: 'q5e', labels: scale_psqi01, required: true}
  ],
  required: true,
  preamble: "<p>During the past month, how often have you had trouble sleeping because you... </p>"
};

var psqi_trial03 = {
  type: 'survey-likert',
  questions: [
    {prompt: '...feel too cold', name: 'q5f', labels: scale_psqi01, required: true},
    {prompt: '...feel too hot', name: 'q5g', labels: scale_psqi01, required: true},
    {prompt: '...have bad dreams', name: 'q5h', labels: scale_psqi01, required: true},
    {prompt: '...have pain', name: 'q5i', labels: scale_psqi01, required: true}
  ],
  required: true,
  preamble: "<p>During the past month, how often have you had trouble sleeping because you... </p>"
};

var psqi_trial04 = {
  type: 'survey-likert',
  questions: [
    {prompt: '...how often have you taken medicine to help you sleep?', name: 'q6', labels: scale_psqi01, required: true},
    {prompt: '...how often have you had trouble staying awake while driving, eating meals or engaging in social activity?', name: 'q7', labels: scale_psqi01, required: true},
    {prompt: '...how much of a problem has it been for you to keep up enthusiasm to get things done?', name: 'q8', labels: scale_psqi01, required: true},
    {prompt: '...how would you rate your sleep quality overall?', name: 'q9', labels: scale_psqi02, required: true}
    ],
    preamble: "<p>During the past month,... </p>"
};

timeline.push(psqi_trial01, psqi_trial02, psqi_trial03, psqi_trial04)

//------------------------- BDI -------------------------
/*
var bdi_trial01 = {
  type: "survey-multi-select",
  preamble: ""
}
*/


//------------------------- BAI ------------------------- 


var scale_bai01 = ["Not at all", "Mildly, but it didn't bother me much", "Moderately - it wasn't pleasant at times", "Severely - it bothered me a lot"];
var scale_bai02 = ["Not at all", "Mildly", "Moderately", "Severely"];

  var bai_trial01 = {
      type: 'survey-likert',
      questions: [
        {prompt: "Numbness or tingling", name: 'q1.numbness', labels: scale_bai01, required: true}, 
        {prompt: "Feeling hot", name: 'q2.hot', labels: scale_bai02, required: true},
        {prompt: "Wobbliness in legs", name: 'q3.wobbliness', labels: scale_bai02, required: true},
        {prompt: "Unable to relax", name: 'q4.relax', labels: scale_bai02, required: true},
        {prompt: "Fear of worst happening", name: 'q5.fear', labels: scale_bai02, required: true}],
        preamble: "Below is a list of common symptoms of anxiety. Please carefully read each item in the list."+
        "Indicate how much you have been bothered by that symptom during the past month, including today.",
        scale_width: bai_scale_width
  };
  
  var bai_trial02 = {
      type: 'survey-likert',
      questions: [
        {prompt: "Dizzy or lightheaded", name: 'q6.dizzy', labels: scale_bai01, required: true},
        {prompt: "Heart pounding/racing", name: 'q7.heart', labels: scale_bai02, required: true},
        {prompt: "Unsteady", name: 'q8.unsteady', labels: scale_bai02, required: true},
        {prompt: "Terrified or afraid", name: 'q9.afraid', labels: scale_bai02, required: true},
         {prompt: "Nervous", name: 'q10.nervous', labels: scale_bai02, required: true},
          {prompt: "Feeling of choking", name: 'q11.choking', labels: scale_bai02, required: true}],
        scale_width: bai_scale_width
  };
  
  var bai_trial03 = {
      type: 'survey-likert',
      questions: [
        {prompt: "Hands trembling", name: 'q12.hands', labels: scale_bai01, required: true},
        {prompt: "Shaky/unsteady", name: 'q13.unsteady', labels: scale_bai02, required: true},
        {prompt: "Fear of losing control", name: 'q14.fear_control', labels: scale_bai02, required: true},
         {prompt: "Difficulty in breathing", name: 'q15.breathing', labels: scale_bai02, required: true},
        {prompt: "Fear of dying", name: 'q16.dying', labels: scale_bai02, required: true},],
        scale_width: bai_scale_width
  };
  
  var bai_trial04 = {
      type: 'survey-likert',
      questions: [{prompt: "Scared", name: 'q17.scared', labels: scale_bai01, required: true},
        {prompt: "Indigestion", name: 'q18.indigestion', labels: scale_bai02, required: true},
        {prompt: "Faint/lightheaded", name: 'q19.faint', labels: scale_bai02, required: true},
        {prompt: "Face flushed", name: 'q20.face', labels: scale_bai02, required: true},
        {prompt: "Hot/cold sweats", name: 'q21.sweats', labels: scale_bai02, required: true}],
        scale_width: bai_scale_width
  };
  
  
//timeline.push(bai_trial01, bai_trial02, bai_trial03,bai_trial04)

//--------------------- bye -------------------------------

var sleep_info = {
    type: 'survey-text',
    questions: function(){
      if (urlvar.c == 2){
        var a = [{prompt: 'Did you take a nap during the day?', placeholder: 'yes/no', columns: 8, required: true, name: 'nap'},
        {prompt: 'If so, for how long?', placeholder: '40min', columns: 8, name: 'nap_length'}]
      } else if (urlvar.c == 3 || urlvar.c == 4) {
        var a = [{prompt: 'When did you go to bed?', placeholder: '10pm', columns: 5, required: true, name: 'bedtime'},
        {prompt: 'How many hours of sleep did you get?', placeholder: '8', columns: 3, required: true, name: 'hours'},
        {prompt: 'When did you get out of bed?', placeholder: '8am', columns: 5, required: true, name: 'outtime'},
        {prompt: 'Did you take a nap during the day?', placeholder: 'yes/no', columns: 8, required: true, name: 'nap'},
        {prompt: 'If so, for how long?', placeholder: '40min', columns: 8, name: 'nap_length'}]
      } else {
        var a = [{prompt: 'When did you go to bed?', placeholder: '10pm', columns: 5, required: true, name: 'bedtime'},
        {prompt: 'How many hours of sleep did you get?', placeholder: '8', columns: 3, required: true, name: 'hours'},
        {prompt: 'When did you get out of bed?', placeholder: '8am', columns: 5, required: true, name: 'outtime'}]
      }
      return a
    },
    preamble: function(){
    if (urlvar.c ==2){
    var b = "<p>Finally, we would like you to answer some questions about your day.</p>"+
    "<p>Please be honest with your answers.</p>"
    } else if (urlvar.c == 3 || urlvar.c == 4) {
    var b = "<p>Finally, we would like you to answer some questions about your day and your <strong>last night</strong>.</p>"+
    "<p>Please be honest with your answers. For example, if you did not get enough sleep, "+
    "that is completely fine. Just be honest.</p>"
    } else {
     var b = "<p>Finally, we would like you to answer some questions about your <strong>last night</strong>.</p>"+
    "<p>Please be honest with your answers. For example, if you did not get enough sleep, "+
    "that is completely fine. Just be honest.</p>" 
    }
    return b
    }
  };
  
timeline.push(sleep_info)

//--------------------- bye2 -------------------------------

var general_ = {
    type: 'survey-text',
    questions: [
      {prompt: 'When did you have your last coffee/alcoholic drink? Please be honest. Your response will not affect your reimbursement.', rows: 5, columns: 60, name: 'coffee/alcohol'},
      {prompt: 'Which strategy did you use to memorise the pairs? Did you use any aids? Also this time please be honest. Your response will not affect your reimbursement.', rows: 10, columns: 60, name: 'strategy'},
      {prompt: 'Are there any comments you want to make?', rows: 15, columns: 60, name: 'comments'}],
  
};
  
timeline.push(general_)



//------------------------- bye3 -------------------------
var bye3 = {
  type: "html-keyboard-response",
  stimulus: 
  "<p>Many thanks for taking part in this experiment. "+
  "We really appreciate the time you have given us and your contribution to science.</p>" +
  "<p>Our study is concerned with the role of sleep in memory. As such, we had people learn new "+
  "information before a delay containing daytime wakefulness or overnight sleep. "+
  "We then tested memories after this delay to see how well they were remembered after sleep relative to wake.</p>"+
  "<p>Thank you again for your time.</p>" +
  "<p>Click any key to exit the experiment.</p>"
};

timeline.push(bye3)


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