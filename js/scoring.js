/* 
   SCORING.JS
   This file runs on results.html. It reads the raw answers
   that quiz-engine.js saved to localStorage, works out how
   many points each specialisation track earned. */

document.addEventListener("DOMContentLoaded", function () {

  /* 
     1. GRAB ELEMENTS NEEDED 
     this section handles grabbing the necessary DOM elements */

  var resultsPageRoot = document.querySelector("#resultsPageRoot");

  /* if the page doesn't have the results root ement, it will stop here*/
  if (!resultsPageRoot) {
    return;
  }

  var preloaderScreen = document.querySelector("#preloaderScreen");
  var resultsContent = document.querySelector("#resultsContent");
  var noResultsMessage = document.querySelector("#noResultsMessage");

  var topTrackName = document.querySelector("#topTrackName");
  var topTrackDescription = document.querySelector("#topTrackDescription");

  var scoreLowLevel = document.querySelector("#scoreLowLevel");
  var scoreArVr = document.querySelector("#scoreArVr");
  var scoreFullStack = document.querySelector("#scoreFullStack");
  var scoreMachineLearning = document.querySelector("#scoreMachineLearning");

  var streakBonusDisplay = document.querySelector("#streakBonusDisplay");
  var speedBonusDisplay = document.querySelector("#speedBonusDisplay");

  /* 
     2. TRACK INFORMATION
     this section defines the information for each specialisation track
      */
     
  var trackInfo = {
    lowLevel: {
      name: "Low-Level Programming",
      guidance: "You think in terms of memory, hardware, and performance. Next step: try building a small project in C, and look into an Operating Systems or Computer Architecture module to see if it clicks."
    },
    arVr: {
      name: "AR/VR (Augmented Reality / Virtual Reality)",
      guidance: "You are drawn to immersive, visual, and interactive experiences. Next step: download a game engine such as Unity or Unreal Engine and build a tiny 3D scene to explore the workflow."
    },
    fullStack: {
      name: "Full-Stack Web Development",
      guidance: "You enjoy building complete products that people can use directly in a browser. Next step: build a small full project with both a front end and a back end, such as a simple to-do list app with a real database."
    },
    machineLearning: {
      name: "Machine Learning",
      guidance: "You like finding patterns in data and testing ideas with numbers. Next step: work through a beginner Python and pandas tutorial, then try training a very simple prediction model on a small dataset."
    }
  };

  /* list of specialization tracks in order */
  var categoryKeys = ["lowLevel", "arVr", "fullStack", "machineLearning"];

  /* 
     3. LOAD THE RAW QUIZ DATA SAVED BY QUIZ-ENGINE.JS
     this section handles loading the quiz results from localStorage */

  function loadRawQuizResults() {
    var savedText = localStorage.getItem("bseQuizResults");

    if (!savedText) {
      return null;
    }

    /* when JSON,parse fails */
    try {
      var parsedData = JSON.parse(savedText);
      return parsedData;
    } catch (error) {
      return null;
    }
  }

  /* 
     4. CALCULATE THE FINAL SCORES
     This section calculates the final scores based on the quiz results */

  function calculateFinalScores(quizData) {
    var totals = { lowLevel: 0, arVr: 0, fullStack: 0, machineLearning: 0 };
    var currentStreak = 0;
    var longestStreak = 0;
    var totalBonusPoints = 0;

    var halfTimeLimit = quizData.questionTimeLimit / 2;

    for (var i = 0; i < quizData.answers.length; i++) {
      var answer = quizData.answers[i];

      /* Work out if this particular answer counts as "fast" */
      var wasFastAnswer = (!answer.wasTimeout && answer.timeTakenSeconds <= halfTimeLimit);

      /* Update the streak counter based on this answer */
      if (answer.wasTimeout) {
        currentStreak = 0;
      } else if (wasFastAnswer) {
        currentStreak = currentStreak + 1;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }
      } else {
        currentStreak = 0;
      }

      /* Calculate the bonus multiplier based on the current streak */
      var streakMultiplier = 1 + (Math.min(currentStreak, 5) * 0.1);

      /* add the adjusted points to the appropriate category total */
      for (var k = 0; k < categoryKeys.length; k++) {
        var key = categoryKeys[k];
        var rawPoints = answer.points[key];
        var adjustedPoints = rawPoints * streakMultiplier;

        totals[key] = totals[key] + adjustedPoints;
        totalBonusPoints = totalBonusPoints + (adjustedPoints - rawPoints);
      }
    }

    /* Round every total and the bonus figure to one decimal place */
    for (var m = 0; m < categoryKeys.length; m++) {
      var roundKey = categoryKeys[m];
      totals[roundKey] = Math.round(totals[roundKey] * 10) / 10;
    }
    totalBonusPoints = Math.round(totalBonusPoints * 10) / 10;

    /* Work out which track scored the highest */
    var topTrackKey = categoryKeys[0];
    for (var n = 1; n < categoryKeys.length; n++) {
      if (totals[categoryKeys[n]] > totals[topTrackKey]) {
        topTrackKey = categoryKeys[n];
      }
    }

    return {
      totals: totals,
      topTrackKey: topTrackKey,
      longestStreak: longestStreak,
      totalBonusPoints: totalBonusPoints
    };
  }

  /* 
     5. SAVE THE FINAL RESULT
     this section stores the finished calculation in localStorage */

  function saveFinalResults(finalResults) {
    localStorage.setItem("bseFinalResults", JSON.stringify(finalResults));
  }

  /* 
     6. DISPLAY THE RESULTS ON THE PAGE
     this section displays the calculated results on the webpage */

  function displayResultsOnPage(finalResults) {
    var topTrack = trackInfo[finalResults.topTrackKey];

    topTrackName.textContent = topTrack.name;
    topTrackDescription.textContent = topTrack.guidance;

    scoreLowLevel.textContent = finalResults.totals.lowLevel;
    scoreArVr.textContent = finalResults.totals.arVr;
    scoreFullStack.textContent = finalResults.totals.fullStack;
    scoreMachineLearning.textContent = finalResults.totals.machineLearning;

    streakBonusDisplay.textContent = "Longest fast-answer streak: " + finalResults.longestStreak + " question(s) in a row";
    speedBonusDisplay.textContent = "Bonus points earned from quick answers: " + finalResults.totalBonusPoints;
  }

  /* 
     7. "NO RESULTS FOUND" MESSAGE
     runs when the user has not taken the quiz */
     
  function showNoResultsMessage() {
    if (preloaderScreen) {
      preloaderScreen.classList.add("preloader-hidden");
    }
    if (resultsContent) {
      resultsContent.hidden = true;
    }
    if (noResultsMessage) {
      noResultsMessage.hidden = false;
    }
  }

  /* 
     8. RUN THE RESULTS PRELOADER & SHOW RESULTS
     this section simulates a calculation by keeping the preloader visible for a few seconds before showing the results */

  function runPreloaderThenShowResults(finalResults) {
    var PRELOADER_DELAY_MS = 2500;

    setTimeout(function () {
      if (preloaderScreen) {
        preloaderScreen.classList.add("preloader-hidden");
      }
      if (resultsContent) {
        resultsContent.hidden = false;
      }
      displayResultsOnPage(finalResults);
    }, PRELOADER_DELAY_MS);
  }

  /*
     9. STARTING POINT FOR THIS SCRIPT
     this is where the script begins execution for the scoring logic */

  var rawQuizData = loadRawQuizResults();

  if (!rawQuizData || !rawQuizData.answers || rawQuizData.answers.length === 0) {
    /* No quiz data was found, so there is nothing to score */
    showNoResultsMessage();
  } else {
    var finalResults = calculateFinalScores(rawQuizData);
    saveFinalResults(finalResults);
    runPreloaderThenShowResults(finalResults);
  }

});