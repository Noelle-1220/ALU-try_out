/* ==========================================================
   MAIN.JS
   This file controls every small interactive behaviour that
   appears on more than one page of the site: the dark/light
   theme toggle, the mobile hamburger menu, the specialisation
   accordion cards, the "back to top" button, and the magnetic
   hover effect on buttons. It is linked on every page so all
   of these behaviours work everywhere, not just on one page.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {

  /* ==========================================================
     1. THEME TOGGLE (LIGHT / DARK MODE)
     Clicking the button adds or removes the "dark-theme" class
     on <body>, which the CSS file uses to swap all the colours.
     The chosen theme is saved in localStorage so it is
     remembered the next time the student visits any page.
     ========================================================== */
  var themeToggleBtn = document.querySelector("#themeToggleBtn");

  /* Swaps the button's icon between a moon and a sun depending
     on which theme is currently active */
  function updateThemeToggleIcon() {
    if (document.body.classList.contains("dark-theme")) {
      themeToggleBtn.textContent = "☀️";
    } else {
      themeToggleBtn.textContent = "🌙";
    }
  }

  /* Runs once when the page first loads. If the student chose
     dark mode on a previous visit, apply it straight away so
     the page does not flash light mode first. */
  function applySavedTheme() {
    var savedTheme = localStorage.getItem("bseSiteTheme");

    if (savedTheme === "dark") {
      document.body.classList.add("dark-theme");
    }
  }

  if (themeToggleBtn) {
    applySavedTheme();
    updateThemeToggleIcon();

    themeToggleBtn.addEventListener("click", function () {
      document.body.classList.toggle("dark-theme");

      if (document.body.classList.contains("dark-theme")) {
        localStorage.setItem("bseSiteTheme", "dark");
      } else {
        localStorage.setItem("bseSiteTheme", "light");
      }

      updateThemeToggleIcon();
    });
  }

  /* ==========================================================
     2. HAMBURGER MENU (MOBILE NAVIGATION)
     Clicking the hamburger button opens a full-screen overlay
     menu on small screens. Clicking it again, or clicking a
     link inside the menu, closes it.
     ========================================================== */
  var hamburgerBtn = document.querySelector("#hamburgerBtn");
  var mobileOverlay = document.querySelector("#mobileOverlay");

  if (hamburgerBtn && mobileOverlay) {

    function openMobileMenu() {
      hamburgerBtn.classList.add("menu-open");
      mobileOverlay.classList.add("overlay-visible");
    }

    function closeMobileMenu() {
      hamburgerBtn.classList.remove("menu-open");
      mobileOverlay.classList.remove("overlay-visible");
    }

    hamburgerBtn.addEventListener("click", function () {
      /* If the menu is already open, close it. Otherwise open it. */
      if (mobileOverlay.classList.contains("overlay-visible")) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    /* Closes the menu automatically whenever a link inside it
       is clicked, so it does not stay open after navigating */
    var mobileMenuLinks = mobileOverlay.querySelectorAll("a");
    for (var i = 0; i < mobileMenuLinks.length; i++) {
      mobileMenuLinks[i].addEventListener("click", function () {
        closeMobileMenu();
      });
    }
  }

  /* ==========================================================
     3. ACCORDION CARDS (Specialisation Overview)
     Clicking a card's header expands or collapses its detail
     panel by toggling the "is-open" class on the whole card.
     ========================================================== */
  var accordionTriggers = document.querySelectorAll("[data-accordion-trigger]");

  for (var t = 0; t < accordionTriggers.length; t++) {
    accordionTriggers[t].addEventListener("click", function (event) {
      /* The card itself is the closest parent with class "accordion-card" */
      var clickedCard = event.currentTarget.closest(".accordion-card");

      if (clickedCard) {
        clickedCard.classList.toggle("is-open");

        /* Swap the plus/minus icon to match the open/closed state */
        var toggleIcon = clickedCard.querySelector("[data-accordion-icon]");
        if (toggleIcon) {
          if (clickedCard.classList.contains("is-open")) {
            toggleIcon.textContent = "-";
          } else {
            toggleIcon.textContent = "+";
          }
        }
      }
    });
  }

  /* ==========================================================
     4. BACK TO TOP FLOATING BUTTON
     The button stays hidden until the student scrolls down
     300px, then fades in. Clicking it smoothly scrolls back
     to the top of the page.
     ========================================================== */
  var backToTopFab = document.querySelector("#backToTopFab");

  if (backToTopFab) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 300) {
        backToTopFab.classList.add("fab-visible");
      } else {
        backToTopFab.classList.remove("fab-visible");
      }
    });

    backToTopFab.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ==========================================================
     5. MAGNETIC BUTTON EFFECT
     While the mouse hovers over a button with the "magnetic-btn"
     class, the button shifts slightly toward the cursor. When
     the mouse leaves, the button moves back to its normal spot.
     ========================================================== */
  var magneticButtons = document.querySelectorAll(".magnetic-btn");

  for (var b = 0; b < magneticButtons.length; b++) {
    var currentButton = magneticButtons[b];

    currentButton.addEventListener("mousemove", function (event) {
      var buttonBounds = event.currentTarget.getBoundingClientRect();

      /* Work out how far the mouse is from the button's centre */
      var buttonCenterX = buttonBounds.left + (buttonBounds.width / 2);
      var buttonCenterY = buttonBounds.top + (buttonBounds.height / 2);
      var distanceX = event.clientX - buttonCenterX;
      var distanceY = event.clientY - buttonCenterY;

      /* Only move the button a small fraction of that distance
         so the effect feels gentle rather than jumping around */
      var moveX = distanceX * 0.2;
      var moveY = distanceY * 0.2;

      event.currentTarget.style.transform = "translate(" + moveX + "px, " + moveY + "px)";
    });

    currentButton.addEventListener("mouseleave", function (event) {
      /* Move the button back to its original resting position */
      event.currentTarget.style.transform = "translate(0px, 0px)";
    });
  }

});