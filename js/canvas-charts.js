/*
   CANVAS-CHARTS.JS
   This file runs on results.html. It draws a bar chart showing the
   student's scores in each of the four specialisation tracks. 
   */

document.addEventListener("DOMContentLoaded", function () {

  /* 
     1. GRAB THE CANVAS AND ITS DRAWING CONTEXT
     this section gets the canvas element and its 2D drawing context */

  var resultsCanvas = document.querySelector("#resultsCanvas");

  /* for when the canvas is not found */
  if (!resultsCanvas) {
    return;
  }

  var ctx = resultsCanvas.getContext("2d");

  /* if the version does not support canvas */
  if (!ctx) {
    return;
  }

  var canvasWidth = resultsCanvas.width;
  var canvasHeight = resultsCanvas.height;

  /* 
     2. LOAD THE FINAL SCORES SAVED BY SCORING.JS
     this section loads the final scores from localStorage */

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

  function getCanvasTextColor() {
    if (document.body.classList.contains("dark-theme")) {
      return "#FFFFFF";
    } else {
      return "#1A1A1A";
    }
  }

  var finalResults = loadFinalResults();

  /* when no final results are saved, this script makes sure to stop */
  if (!finalResults || !finalResults.totals) {
    return;
  }

  /* 
     3. CHART SETUP
     this section sets up the chart dimensions and data */

  var categoryData = [
    { key: "lowLevel", label: "Low-Level", color: "#0D2B45" },
    { key: "arVr", label: "AR/VR", color: "#D4AF37" },
    { key: "fullStack", label: "Full-Stack", color: "#0D7A5C" },
    { key: "machineLearning", label: "Machine Learning", color: "#3B82C4" }
  ];

  var chartTopPadding = 70;
  var chartBottomPadding = 60;
  var chartSidePadding = 50;

  var drawableHeight = canvasHeight - chartTopPadding - chartBottomPadding;
  var drawableWidth = canvasWidth - (chartSidePadding * 2);

  var barGap = 30;
  var barWidth = (drawableWidth - (barGap * (categoryData.length - 1))) / categoryData.length;

  /* Work out the tallest score so every bar can be scaled to
     fit inside the canvas. */
  var maxScore = 10;
  for (var i = 0; i < categoryData.length; i++) {
    var scoreValue = finalResults.totals[categoryData[i].key];
    if (scoreValue > maxScore) {
      maxScore = scoreValue;
    }
  }

  /*
     4. DRAW THE BAR CHART
     this function draws the bar chart on the canvas */

  function drawBarChart() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    /* Chart title */
    ctx.fillStyle = getCanvasTextColor();
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
        ctx.strokeStyle = getCanvasTextColor();
        ctx.strokeRect(barX, barY, barWidth, barHeight);
      }

      /* Value label shown above the bar */
      ctx.fillStyle = getCanvasTextColor();
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(String(value), barX + (barWidth / 2), barY - 8);

      /* Category label shown below the bar */
      ctx.fillText(category.label, barX + (barWidth / 2), chartTopPadding + drawableHeight + 20);
    }
  }

  /* 
     5. CONFETTI PARTICLE SETUP
     this section sets up the confetti particles that will fall down over the chart
      */

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

  /* this function updates the position and rotation of each confetti particle */
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

  /* 
     6. RUN THE ANIMATION
     this section runs the animation loop that draws the chart and confetti particles frame by frame
      */

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
      /* draws the chart one last time
         on its own so the confetti does not just cut off mid-fall */
      drawBarChart();
    }
  }

  createConfettiParticles();
  animateConfetti();

});