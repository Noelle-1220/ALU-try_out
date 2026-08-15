/* ==========================================================
   QUIZ-ENGINE.JS
   This file runs the interactive quiz on quiz.html. It shows
   one question at a time, runs a countdown timer for each
   question, lets the student pick an answer (either a normal
   button, a campus hotspot marker, or after watching/listening
   to some media), tracks their progress, and finally saves
   everything to localStorage so the results page can work out
   the scoring.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* --------------------------------------------------------
     1. GRAB THE ELEMENTS WE NEED FROM THE PAGE
     -------------------------------------------------------- */
  var quizQuestionText = document.querySelector("#quizQuestionText");

  /* If this page does not have the quiz question box, this
     script must have loaded on the wrong page, so we stop
     here to avoid errors. */
  if (!quizQuestionText) {
    return;
  }

  var questionCounter = document.querySelector("#questionCounter");
  var timerDisplay = document.querySelector("#timerDisplay");
  var progressFill = document.querySelector("#progressFill");
  var timeUpMessage = document.querySelector("#timeUpMessage");
  var quizOptionsList = document.querySelector("#quizOptionsList");

  var hotspotMediaBlock = document.querySelector("#hotspotMediaBlock");
  var audioMediaBlock = document.querySelector("#audioMediaBlock");
  var videoMediaBlock = document.querySelector("#videoMediaBlock");

  var hotspotMarkers = document.querySelectorAll(".hotspot-marker");

  var quizAudioElement = document.querySelector("#quizAudioElement");
  var audioPlayBtn = document.querySelector("#audioPlayBtn");
  var audioSeekBar = document.querySelector("#audioSeekBar");
  var audioTimeLabel = document.querySelector("#audioTimeLabel");

  var quizVideoElement = document.querySelector("#quizVideoElement");

  var prevQuestionBtn = document.querySelector("#prevQuestionBtn");
  var nextQuestionBtn = document.querySelector("#nextQuestionBtn");
  var submitQuizBtn = document.querySelector("#submitQuizBtn");

  /* --------------------------------------------------------
     2. QUIZ QUESTION DATA
     Each question has a "media" type ("none", "hotspot",
     "audio", or "video") and either a list of "options" (each
     with a points object) or, for hotspot questions, a
     "hotspotPoints" object that maps each marker's ID to a
     points object. Points are added to four running totals:
     lowLevel, arVr, fullStack, and machineLearning.
     -------------------------------------------------------- */
  var quizQuestions = [
    {
      text: "Which activity sounds most enjoyable to you?",
      media: "none",
      options: [
        { label: "Digging into how a computer's memory actually works", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "Building a 3D world that people can walk around in", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "Building a website people can log into and use", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Finding hidden patterns inside a big pile of data", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "Which subject did you enjoy most back in school?",
      media: "none",
      options: [
        { label: "Physics and basic electronics", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "Art and design", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "Computer studies and building things", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Statistics and mathematics", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "Pick a tool or language you would like to master:",
      media: "none",
      options: [
        { label: "C or Assembly language", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "Unity or Unreal Engine", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "React and Node.js", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Python with pandas", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "Where on the ALCHE campus would you spend most of your free time? Click a marker on the map.",
      media: "hotspot",
      hotspotPoints: {
        "engineering-lab": { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 },
        "media-studio": { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 },
        "data-lab": { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 }
      }
    },
    {
      text: "Listen to the clip describing a class project. Which part of it appeals to you most?",
      media: "audio",
      options: [
        { label: "Working within tight hardware constraints", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "Designing the immersive visual experience", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "Building the full working application end-to-end", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Analysing the data the project collected", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "Watch the short scenario video. What would you want to do first?",
      media: "video",
      options: [
        { label: "Check what is happening at the hardware level", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "Improve how the scene looks and feels", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "Fix the feature so users can use it again", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Look for patterns in what went wrong", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "A program you wrote is running slowly. What do you check first?",
      media: "none",
      options: [
        { label: "Memory allocation and pointers", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "The frame rate and rendering pipeline", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "How long the API calls are taking", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Whether the training data is biased", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "Which student project would excite you the most?",
      media: "none",
      options: [
        { label: "Writing a tiny operating system kernel", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "A virtual reality campus tour app", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "An online student results portal", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "A tool that predicts exam results", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    },
    {
      text: "How do you prefer to work on a project?",
      media: "none",
      options: [
        { label: "Alone, deep in the technical detail", points: { lowLevel: 2, arVr: 0, fullStack: 0, machineLearning: 1 } },
        { label: "With designers, building immersive experiences", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "In a team, shipping features quickly", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Running experiments and testing ideas", points: { lowLevel: 1, arVr: 0, fullStack: 0, machineLearning: 2 } }
      ]
    },
    {
      text: "Pick the future career that appeals to you most:",
      media: "none",
      options: [
        { label: "Embedded Systems Engineer", points: { lowLevel: 3, arVr: 0, fullStack: 0, machineLearning: 0 } },
        { label: "AR/VR Developer", points: { lowLevel: 0, arVr: 3, fullStack: 0, machineLearning: 0 } },
        { label: "Full-Stack Web Developer", points: { lowLevel: 0, arVr: 0, fullStack: 3, machineLearning: 0 } },
        { label: "Machine Learning Engineer", points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 3 } }
      ]
    }
  ];

  var totalQuestions = quizQuestions.length;

  /* --------------------------------------------------------
     3. QUIZ STATE
     currentQuestionIndex tracks which question is on screen.
     studentAnswers stores one entry per question, filled in
     as the student answers (or times out). countdownTimerId
     holds the setInterval reference so we can stop it.
     -------------------------------------------------------- */
  var currentQuestionIndex = 0;
  var studentAnswers = new Array(totalQuestions).fill(null);
  var countdownTimerId = null;
  var secondsRemaining = 0;
  var QUESTION_TIME_LIMIT = 120; /* seconds allowed per question */

  /* Keeps track of which video pause-timestamps have already
     been used, so the video does not pause twice at the same
     spot if the student rewinds past it. Reset per question. */
  var videoTimestampsUsed = [];

  /* --------------------------------------------------------
     4. SMALL HELPER FUNCTIONS
     -------------------------------------------------------- */

  /* Turns a number of seconds into a "M:SS" style string,
     used for both the question timer and the audio player. */
  function formatTime(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = Math.floor(totalSeconds % 60);
    var secondsText = seconds < 10 ? "0" + seconds : "" + seconds;
    return minutes + ":" + secondsText;
  }

  /* Disables every answer control on the current question,
     used both when the timer hits zero and when reviewing an
     already-timed-out question. */
  function lockAllAnswerControls() {
    var optionButtons = quizOptionsList.querySelectorAll(".quiz-option-btn");
    for (var i = 0; i < optionButtons.length; i++) {
      optionButtons[i].disabled = true;
    }
    for (var j = 0; j < hotspotMarkers.length; j++) {
      hotspotMarkers[j].disabled = true;
    }
  }

  /* --------------------------------------------------------
     5. TIMER FUNCTIONS
     -------------------------------------------------------- */
  function stopTimer() {
    if (countdownTimerId !== null) {
      clearInterval(countdownTimerId);
      countdownTimerId = null;
    }
  }

  function startTimer() {
    stopTimer();
    secondsRemaining = QUESTION_TIME_LIMIT;
    timerDisplay.textContent = formatTime(secondsRemaining);
    timerDisplay.classList.remove("timer-warning");
    timeUpMessage.hidden = true;

    countdownTimerId = setInterval(function () {
      secondsRemaining = secondsRemaining - 1;
      timerDisplay.textContent = formatTime(secondsRemaining);

      /* Turn the timer red once 10 seconds or less are left */
      if (secondsRemaining <= 10) {
        timerDisplay.classList.add("timer-warning");
      }
      
      /* Show a "10 seconds left" message once the countdown hits zero */

      if (secondsRemaining === 0) {
        timeUpMessage.textContent = "10 seconds left! Better Hurry.";
        timeUpMessage.hidden = false;
      }

      if (secondsRemaining <= 0) {
        handleTimeUp();
      }
    }, 1000);
  }

  /* Runs automatically when the countdown reaches zero. If the
     student had not answered yet, we record a blank answer,
     lock the controls, show the "time is up" message, and
     move on (or submit) after a short pause. */
  function handleTimeUp() {
    stopTimer();
    timeUpMessage.textContent = "Time is up for this question! Moving on automatically\u2026";
    timeUpMessage.hidden = false;
    lockAllAnswerControls();

    if (studentAnswers[currentQuestionIndex] === null) {
      studentAnswers[currentQuestionIndex] = {
        selectionType: "none",
        points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 0 },
        timeTakenSeconds: QUESTION_TIME_LIMIT,
        wasTimeout: true
      };
    }

    setTimeout(function () {
      if (currentQuestionIndex < totalQuestions - 1) {
        goToNextQuestion();
      } else {
        handleSubmitQuiz();
      }
    }, 1500);
  }

  /* --------------------------------------------------------
     6. BUILDING THE ANSWER OPTIONS
     -------------------------------------------------------- */
  function buildOptionButtons(question) {
    /* Clear out any buttons left over from the last question */
    quizOptionsList.innerHTML = "";

    for (var i = 0; i < question.options.length; i++) {
      var optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "quiz-option-btn";
      optionButton.textContent = question.options[i].label;
      optionButton.setAttribute("data-option-index", i);

      /* Use a closure-safe way of passing the option index into
         the click handler by attaching it as a local variable */
      optionButton.addEventListener("click", (function (optionIndex) {
        return function (event) {
          selectStandardOption(question, optionIndex, event.currentTarget);
        };
      })(i));

      quizOptionsList.appendChild(optionButton);
    }
  }

  /* Runs when the student clicks a normal answer button */
  function selectStandardOption(question, optionIndex, clickedButton) {
    var timeTaken = QUESTION_TIME_LIMIT - secondsRemaining;

    studentAnswers[currentQuestionIndex] = {
      selectionType: "option",
      optionIndex: optionIndex,
      points: question.options[optionIndex].points,
      timeTakenSeconds: timeTaken,
      wasTimeout: false
    };

    /* Visually highlight the chosen button and un-highlight
       every other button in this question */
    var allButtons = quizOptionsList.querySelectorAll(".quiz-option-btn");
    for (var i = 0; i < allButtons.length; i++) {
      allButtons[i].classList.remove("option-selected");
    }
    clickedButton.classList.add("option-selected");
  }

  /* Runs when the student clicks one of the hotspot markers */
  function selectHotspotOption(question, hotspotId, clickedMarker) {
    var timeTaken = QUESTION_TIME_LIMIT - secondsRemaining;

    studentAnswers[currentQuestionIndex] = {
      selectionType: "hotspot",
      hotspotId: hotspotId,
      points: question.hotspotPoints[hotspotId],
      timeTakenSeconds: timeTaken,
      wasTimeout: false
    };

    /* Visually highlight the chosen marker using a simple style
       change (a thicker gold border) instead of a new CSS class */
    for (var i = 0; i < hotspotMarkers.length; i++) {
      hotspotMarkers[i].style.outline = "none";
    }
    clickedMarker.style.outline = "3px solid var(--text-heading)";
  }

  /* --------------------------------------------------------
     7. MEDIA BLOCK SETUP (hotspot / audio / video)
     -------------------------------------------------------- */

  /* Every hotspot marker gets its click listener once, since
     the markers themselves never get rebuilt between
     questions (only the question data behind them changes). */
  for (var m = 0; m < hotspotMarkers.length; m++) {
    hotspotMarkers[m].addEventListener("click", function (event) {
      var marker = event.currentTarget;
      var hotspotId = marker.getAttribute("data-hotspot-id");
      var currentQuestion = quizQuestions[currentQuestionIndex];
      selectHotspotOption(currentQuestion, hotspotId, marker);
    });
  }

  /* Resets and hides all three media blocks. loadQuestion()
     calls this first, then un-hides only the one it needs. */
  function hideAllMediaBlocks() {
    hotspotMediaBlock.hidden = true;
    audioMediaBlock.hidden = true;
    videoMediaBlock.hidden = true;

    /* Stop any audio/video from playing in the background once
       the student moves to a different question */
    quizAudioElement.pause();
    quizAudioElement.currentTime = 0;
    audioPlayBtn.innerHTML = "&#9654;";
    audioSeekBar.value = 0;
    audioTimeLabel.textContent = "0:00 / 0:00";

    quizVideoElement.pause();
    quizVideoElement.currentTime = 0;

    /* Clear any highlight left on the hotspot markers */
    for (var i = 0; i < hotspotMarkers.length; i++) {
      hotspotMarkers[i].style.outline = "none";
      hotspotMarkers[i].disabled = false;
    }
  }

  /* --- Custom audio player controls --- */
  audioPlayBtn.addEventListener("click", function () {
    if (quizAudioElement.paused) {
      quizAudioElement.play();
      audioPlayBtn.innerHTML = "&#10074;&#10074;"; /* pause icon */
    } else {
      quizAudioElement.pause();
      audioPlayBtn.innerHTML = "&#9654;"; /* play icon */
    }
  });

  /* Keeps the seek bar and time label moving as the clip plays */
  quizAudioElement.addEventListener("timeupdate", function () {
    if (quizAudioElement.duration) {
      var percentPlayed = (quizAudioElement.currentTime / quizAudioElement.duration) * 100;
      audioSeekBar.value = percentPlayed;
      audioTimeLabel.textContent = formatTime(quizAudioElement.currentTime) + " / " + formatTime(quizAudioElement.duration);
    }
  });

  /* Lets the student drag the seek bar to jump around the clip */
  audioSeekBar.addEventListener("input", function () {
    if (quizAudioElement.duration) {
      var newTime = (audioSeekBar.value / 100) * quizAudioElement.duration;
      quizAudioElement.currentTime = newTime;
    }
  });

  /* When the clip finishes on its own, reset the play button */
  quizAudioElement.addEventListener("ended", function () {
    audioPlayBtn.innerHTML = "&#9654;";
  });

  /* --- Video scenario auto-pause at set timestamps --- */
  quizVideoElement.addEventListener("timeupdate", function () {
    for (var i = 0; i < videoTimestampsUsed.length; i++) {
      var stampSeconds = videoTimestampsUsed[i].time;

      if (!videoTimestampsUsed[i].used && quizVideoElement.currentTime >= stampSeconds) {
        quizVideoElement.pause();
        videoTimestampsUsed[i].used = true;
      }
    }
  });

  /* Reads the data-pause-timestamps attribute from the video
     element (a comma separated list of seconds) and rebuilds
     the videoTimestampsUsed tracking array for a fresh question. */
  function setupVideoTimestamps() {
    videoTimestampsUsed = [];
    var rawAttribute = quizVideoElement.getAttribute("data-pause-timestamps");

    if (rawAttribute) {
      var stampStrings = rawAttribute.split(",");
      for (var i = 0; i < stampStrings.length; i++) {
        var stampNumber = parseFloat(stampStrings[i]);
        videoTimestampsUsed.push({ time: stampNumber, used: false });
      }
    }
  }

  /* --------------------------------------------------------
     8. LOADING A QUESTION ONTO THE SCREEN
     -------------------------------------------------------- */
  function loadQuestion(index) {
    var question = quizQuestions[index];

    /* Update the question counter text and question text */
    questionCounter.textContent = "Question " + (index + 1) + " of " + totalQuestions;
    quizQuestionText.textContent = question.text;

    /* Update the progress bar fill width */
    var progressPercent = ((index + 1) / totalQuestions) * 100;
    progressFill.style.width = progressPercent + "%";

    /* Reset the media blocks, then show the one this question
       actually needs (if any) */
    hideAllMediaBlocks();

    if (question.media === "hotspot") {
      hotspotMediaBlock.hidden = false;
      quizOptionsList.hidden = true;
    } else if (question.media === "audio") {
      audioMediaBlock.hidden = false;
      quizOptionsList.hidden = false;
      buildOptionButtons(question);
    } else if (question.media === "video") {
      videoMediaBlock.hidden = false;
      setupVideoTimestamps();
      quizOptionsList.hidden = false;
      buildOptionButtons(question);
    } else {
      quizOptionsList.hidden = false;
      buildOptionButtons(question);
    }

    /* If the student already answered this question before
       (they clicked Previous to look back), restore how it
       looked so their choice is still visible */
    var existingAnswer = studentAnswers[index];
    if (existingAnswer) {
      if (existingAnswer.selectionType === "option") {
        var optionButtons = quizOptionsList.querySelectorAll(".quiz-option-btn");
        optionButtons[existingAnswer.optionIndex].classList.add("option-selected");
      } else if (existingAnswer.selectionType === "hotspot") {
        for (var i = 0; i < hotspotMarkers.length; i++) {
          if (hotspotMarkers[i].getAttribute("data-hotspot-id") === existingAnswer.hotspotId) {
            hotspotMarkers[i].style.outline = "3px solid var(--text-heading)";
          }
        }
      }

      if (existingAnswer.wasTimeout) {
        lockAllAnswerControls();
        timeUpMessage.hidden = false;
      }
    }

    /* Update the Previous/Next/Submit button visibility */
    prevQuestionBtn.disabled = (index === 0);

    if (index === totalQuestions - 1) {
      nextQuestionBtn.hidden = true;
      submitQuizBtn.hidden = false;
    } else {
      nextQuestionBtn.hidden = false;
      submitQuizBtn.hidden = true;
    }

    /* Only restart the timer if this question has not already
       timed out, so re-visiting a timed-out question does not
       start counting down again */
    if (!existingAnswer || !existingAnswer.wasTimeout) {
      startTimer();
    } else {
      stopTimer();
      timerDisplay.textContent = "0:00";
    }
  }

  /* --------------------------------------------------------
     9. NAVIGATION BETWEEN QUESTIONS
     -------------------------------------------------------- */
  function goToNextQuestion() {
    stopTimer();
    if (currentQuestionIndex < totalQuestions - 1) {
      currentQuestionIndex = currentQuestionIndex + 1;
      loadQuestion(currentQuestionIndex);
    }
  }

  function goToPreviousQuestion() {
    stopTimer();
    if (currentQuestionIndex > 0) {
      currentQuestionIndex = currentQuestionIndex - 1;
      loadQuestion(currentQuestionIndex);
    }
  }

  nextQuestionBtn.addEventListener("click", goToNextQuestion);
  prevQuestionBtn.addEventListener("click", goToPreviousQuestion);

  /* --------------------------------------------------------
     10. SUBMITTING THE QUIZ
     Gathers every answer collected so far, saves it to
     localStorage as simple raw data, and sends the student to
     results.html. The actual score maths happens in
     scoring.js on the results page, not here.
     -------------------------------------------------------- */
  function handleSubmitQuiz() {
    stopTimer();

    /* If the very last question was never answered (student
       clicked Submit early), fill in a blank answer for it */
    if (studentAnswers[currentQuestionIndex] === null) {
      studentAnswers[currentQuestionIndex] = {
        selectionType: "none",
        points: { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 0 },
        timeTakenSeconds: QUESTION_TIME_LIMIT - secondsRemaining,
        wasTimeout: false
      };
    }

    var quizResultsData = {
      answers: studentAnswers,
      questionTimeLimit: QUESTION_TIME_LIMIT,
      submittedAt: new Date().toISOString()
    };

    localStorage.setItem("bseQuizResults", JSON.stringify(quizResultsData));

    window.location.href = "results.html";
  }

  submitQuizBtn.addEventListener("click", handleSubmitQuiz);

  /* --------------------------------------------------------
     11. START THE QUIZ
     Loads the very first question once the page is ready.
     -------------------------------------------------------- */
  loadQuestion(currentQuestionIndex);

});