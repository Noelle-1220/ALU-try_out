/* ==========================================================
   SCORING.JS
   This file runs on results.html. It reads the raw answers
   that quiz-engine.js saved to localStorage, works out how
   many points each specialisation track earned (including a
   bonus for fast, non-timed-out answers in a row), decides
   which track scored the highest, and then shows all of this
   on the page after a short simulated "calculating" preloader.

   HTML ELEMENTS THIS FILE EXPECTS ON results.html:
   #resultsPageRoot        - wraps the whole results section (used
                              as a guard so this script only runs
                              on the results page)
   #preloaderScreen         - the "calculating your result" overlay
   #resultsContent          - the container revealed once loading ends
   #noResultsMessage        - shown instead if no quiz data is found
   #topTrackName            - heading showing the winning track name
   #topTrackDescription     - paragraph with next-step guidance
   #scoreLowLevel           - number display for Low-Level Programming
   #scoreArVr               - number display for AR/VR
   #scoreFullStack          - number display for Full-Stack Web Dev
   #scoreMachineLearning    - number display for Machine Learning
   #streakBonusDisplay      - text showing the longest fast-answer streak
   #speedBonusDisplay       - text showing total bonus points earned
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* --------------------------------------------------------
     1. GRAB THE ELEMENTS WE NEED FROM THE PAGE
     -------------------------------------------------------- */
  var resultsPageRoot = document.querySelector("#resultsPageRoot");

  /* If this page does not have the results root element, this
     script must have loaded on the wrong page, so we stop
     here to avoid errors. */
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

  /* --------------------------------------------------------
     2. TRACK INFORMATION
     Holds the friendly display name and the "what to do next"
     guidance text for each of the four specialisation tracks.
     -------------------------------------------------------- */
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

  /* The four category keys, listed once here so every function
     below can loop over them the same way. */
  var categoryKeys = ["lowLevel", "arVr", "fullStack", "machineLearning"];

  /* --------------------------------------------------------
     3. LOAD THE RAW QUIZ DATA SAVED BY QUIZ-ENGINE.JS
     -------------------------------------------------------- */
  function loadRawQuizResults() {
    var savedText = localStorage.getItem("bseQuizResults");

    if (!savedText) {
      return null;
    }

    /* JSON.parse can throw an error if the saved text is broken,
       so we wrap it in a try/catch to stay safe. */
    try {
      var parsedData = JSON.parse(savedText);
      return parsedData;
    } catch (error) {
      return null;
    }
  }

  /* --------------------------------------------------------
     4. CALCULATE THE FINAL SCORES
     This is the main "scoring breakdown engine". It loops
     through every answer once and:
       - adds that answer's points into the four running totals
       - tracks a "streak" of fast, non-timed-out answers in a row
       - gives a small bonus multiplier that grows with the streak
     A fast answer is one where the student answered using half
     the time limit or less. A timeout always breaks the streak.
     -------------------------------------------------------- */
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

      /* Every fast answer in a row adds another 10% bonus,
         capped at 5 in a row (a maximum of +50%) so the bonus
         cannot grow without limit. */
      var streakMultiplier = 1 + (Math.min(currentStreak, 5) * 0.1);

      /* Add this answer's points into the four totals, scaled
         up by the streak multiplier worked out above */
      for (var k = 0; k < categoryKeys.length; k++) {
        var key = categoryKeys[k];
        var rawPoints = answer.points[key];
        var adjustedPoints = rawPoints * streakMultiplier;

        totals[key] = totals[key] + adjustedPoints;
        totalBonusPoints = totalBonusPoints + (adjustedPoints - rawPoints);
      }
    }

    /* Round every total and the bonus figure to one decimal
       place so the numbers displayed on screen look clean */
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

  /* --------------------------------------------------------
     5. SAVE THE FINAL RESULT
     Stores the finished calculation in localStorage so the
     canvas graph on this same page (built by canvas-charts.js)
     can read the same numbers without recalculating them.
     -------------------------------------------------------- */
  function saveFinalResults(finalResults) {
    localStorage.setItem("bseFinalResults", JSON.stringify(finalResults));
  }

  /* --------------------------------------------------------
     6. DISPLAY THE RESULTS ON THE PAGE
     -------------------------------------------------------- */
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

  /* --------------------------------------------------------
     7. SHOW THE "NO RESULTS FOUND" MESSAGE
     Runs if a visitor opens results.html without ever taking
     the quiz, so the page does not just look broken.
     -------------------------------------------------------- */
  function showNoResultsMessage() {
    if (preloaderScreen) {
      preloaderScreen.hidden = true;
    }
    if (resultsContent) {
      resultsContent.hidden = true;
    }
    if (noResultsMessage) {
      noResultsMessage.hidden = false;
    }
  }

  /* --------------------------------------------------------
     8. RUN THE PRELOADER, THEN REVEAL THE RESULTS
     Keeps the preloader screen visible for a couple of
     seconds (simulating a calculation) before switching over
     to the finished results view.
     -------------------------------------------------------- */
  function runPreloaderThenShowResults(finalResults) {
    var PRELOADER_DELAY_MS = 2500;

    setTimeout(function () {
      if (preloaderScreen) {
        preloaderScreen.hidden = true;
      }
      if (resultsContent) {
        resultsContent.hidden = false;
      }
      displayResultsOnPage(finalResults);
    }, PRELOADER_DELAY_MS);
  }

  /* --------------------------------------------------------
     9. MAIN STARTING POINT FOR THIS SCRIPT
     -------------------------------------------------------- */
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