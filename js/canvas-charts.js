/* ==========================================================
   CANVAS-CHARTS.JS
   This file runs on results.html. It reads the final scored
   results that scoring.js already saved to localStorage, then
   draws a simple bar chart of the four specialisation scores
   straight onto the HTML5 canvas using the Canvas 2D API. It
   also plays a short confetti particle animation to celebrate
   the student's result. No chart libraries are used, only the
   built-in canvas drawing functions.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* --------------------------------------------------------
     1. GRAB THE CANVAS AND ITS DRAWING CONTEXT
     -------------------------------------------------------- */
  var resultsCanvas = document.querySelector("#resultsCanvas");

  /* If this page does not have the results canvas, this script
     must have loaded on the wrong page, so we stop here. */
  if (!resultsCanvas) {
    return;
  }

  var ctx = resultsCanvas.getContext("2d");

  /* Some very old browsers do not support canvas at all, so we
     check that we actually got a drawing context back. */
  if (!ctx) {
    return;
  }

  var canvasWidth = resultsCanvas.width;
  var canvasHeight = resultsCanvas.height;

  /* --------------------------------------------------------
     2. LOAD THE FINAL SCORES SAVED BY SCORING.JS
     -------------------------------------------------------- */
  function loadFinalResults() {
    var savedText = localStorage.getItem("bseFinalResults");

    if (!savedText) {
      return null;
    }

    try {
      var parsedData = JSON.parse(savedText);
      return parsedData;
    } catch (error) {
      return null;
    }
  }

  var finalResults = loadFinalResults();

  /* If there is no saved result (for example, the student never
     took the quiz), there is nothing to draw, so we stop here. */
  if (!finalResults || !finalResults.totals) {
    return;
  }

  /* --------------------------------------------------------
     3. CHART SETUP
     Holds the label and bar colour for each of the four
     specialisation tracks, plus the layout numbers used to
     position everything on the canvas.
     -------------------------------------------------------- */
  var categoryData = [
    { key: "lowLevel", label: "Low-Level", color: "#0D2B45" },
    { key: "arVr", label: "AR/VR", color: "#D4AF37" },
    { key: "fullStack", label: "Full-Stack", color: "#0D7A5C" },
    { key: "machineLearning", label: "Machine Learning", color: "#3B82C4" }
  ];

  var chartTopPadding = 40;
  var chartBottomPadding = 60;
  var chartSidePadding = 50;

  var drawableHeight = canvasHeight - chartTopPadding - chartBottomPadding;
  var drawableWidth = canvasWidth - (chartSidePadding * 2);

  var barGap = 30;
  var barWidth = (drawableWidth - (barGap * (categoryData.length - 1))) / categoryData.length;

  /* Work out the tallest score so every bar can be scaled to
     fit inside the canvas. A minimum of 10 is used so the
     chart does not look strange if every score is very low. */
  var maxScore = 10;
  for (var i = 0; i < categoryData.length; i++) {
    var scoreValue = finalResults.totals[categoryData[i].key];
    if (scoreValue > maxScore) {
      maxScore = scoreValue;
    }
  }

  /* --------------------------------------------------------
     4. DRAW THE BAR CHART
     Clears the canvas and redraws the title, all four bars,
     their value labels, and their category labels. This
     function is called every animation frame so the confetti
     always has a freshly drawn chart underneath it.
     -------------------------------------------------------- */
  function drawBarChart() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    /* Chart title */
    ctx.fillStyle = "#1A1A1A";
    ctx.font = "bold 18px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Your Specialisation Score Breakdown", canvasWidth / 2, 25);

    for (var i = 0; i < categoryData.length; i++) {
      var category = categoryData[i];
      var value = finalResults.totals[category.key];

      var barHeight = (value / maxScore) * drawableHeight;
      var barX = chartSidePadding + (i * (barWidth + barGap));
      var barY = chartTopPadding + (drawableHeight - barHeight);

      /* Draw the bar itself */
      ctx.fillStyle = category.color;
      ctx.fillRect(barX, barY, barWidth, barHeight);

      /* Give the winning track's bar a thicker outline so it
         stands out clearly from the other three */
      if (category.key === finalResults.topTrackKey) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#1A1A1A";
        ctx.strokeRect(barX, barY, barWidth, barHeight);
      }

      /* Value label shown above the bar */
      ctx.fillStyle = "#1A1A1A";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(String(value), barX + (barWidth / 2), barY - 8);

      /* Category label shown below the bar */
      ctx.fillText(category.label, barX + (barWidth / 2), chartTopPadding + drawableHeight + 20);
    }
  }

  /* --------------------------------------------------------
     5. CONFETTI PARTICLE SETUP
     Builds a list of small squares that will fall down the
     canvas like confetti, each with its own position, speed,
     colour, and rotation.
     -------------------------------------------------------- */
  var confettiColors = ["#0D2B45", "#D4AF37", "#0D7A5C", "#3B82C4"];
  var confettiParticles = [];
  var totalConfettiParticles = 60;

  function createConfettiParticles() {
    confettiParticles = [];

    for (var i = 0; i < totalConfettiParticles; i++) {
      var newParticle = {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight * -1,
        size: Math.random() * 6 + 4,
        speedY: Math.random() * 2 + 2,
        speedX: (Math.random() - 0.5) * 2,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      };
      confettiParticles.push(newParticle);
    }
  }

  /* Draws every confetti particle at its current position */
  function drawConfettiParticles() {
    for (var i = 0; i < confettiParticles.length; i++) {
      var particle = confettiParticles[i];

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.size / -2, particle.size / -2, particle.size, particle.size);
      ctx.restore();
    }
  }

  /* Moves every particle down and sideways a little, spins it,
     and sends it back to the top once it falls off the bottom
     so the confetti keeps flowing for the whole animation */
  function updateConfettiParticles() {
    for (var i = 0; i < confettiParticles.length; i++) {
      var particle = confettiParticles[i];

      particle.y = particle.y + particle.speedY;
      particle.x = particle.x + particle.speedX;
      particle.rotation = particle.rotation + particle.rotationSpeed;

      if (particle.y > canvasHeight) {
        particle.y = Math.random() * -40;
        particle.x = Math.random() * canvasWidth;
      }
    }
  }

  /* --------------------------------------------------------
     6. RUN THE ANIMATION
     Uses requestAnimationFrame to redraw the chart and the
     confetti roughly 60 times a second. The animation runs
     for a fixed number of frames (about 3-4 seconds) and then
     stops, leaving a clean, finished bar chart on screen.
     -------------------------------------------------------- */
  var totalAnimationFrames = 200;
  var currentFrame = 0;

  function animateConfetti() {
    drawBarChart();
    drawConfettiParticles();
    updateConfettiParticles();

    currentFrame = currentFrame + 1;

    if (currentFrame < totalAnimationFrames) {
      requestAnimationFrame(animateConfetti);
    } else {
      /* Animation is finished: draw the chart one last time
         on its own so the confetti does not just cut off mid-fall */
      drawBarChart();
    }
  }

  createConfettiParticles();
  animateConfetti();

});