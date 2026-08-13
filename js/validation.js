/* ==========================================================
   VALIDATION.JS
   This file controls the real-time validation for the
   registration form on index.html. It checks the Student
   Name, Student ID, and Institutional Email fields as the
   user types, shows/hides error messages, and only enables
   the "Start Quiz" button once every field is valid.
   ========================================================== */

/* We wrap everything inside DOMContentLoaded so the script
   only runs once the whole HTML page has been loaded. This
   stops errors caused by trying to grab elements that do
   not exist yet. */
document.addEventListener("DOMContentLoaded", function () {

  /* --------------------------------------------------------
     1. GRAB THE ELEMENTS WE NEED FROM THE PAGE
     -------------------------------------------------------- */
  var registrationForm = document.querySelector("#registrationForm");

  var nameInput = document.querySelector("#studentName");
  var idInput = document.querySelector("#studentId");
  var emailInput = document.querySelector("#studentEmail");

  var nameError = document.querySelector("#studentNameError");
  var idError = document.querySelector("#studentIdError");
  var emailError = document.querySelector("#studentEmailError");

  var startQuizBtn = document.querySelector("#startQuizBtn");

  /* --------------------------------------------------------
     CONTACT FORM VALIDATION
     This block handles the real-time validation for the
     contact form on contact.html. It follows the exact same
     pattern as the registration form above: check on input
     and blur, toggle is-valid/is-invalid, show/hide error
     messages, and only enable the Send button once every
     field is valid. Wrapping it in "if (contactForm)" means
     this code only runs on pages that actually have a
     contact form, without stopping the registration form
     code elsewhere in this file from running.
     -------------------------------------------------------- */
  var contactForm = document.querySelector("#contactForm");

  if (contactForm) {

    var contactNameInput = document.querySelector("#contactName");
    var contactEmailInput = document.querySelector("#contactEmail");
    var contactMessageInput = document.querySelector("#contactMessage");

    var contactNameError = document.querySelector("#contactNameError");
    var contactEmailError = document.querySelector("#contactEmailError");
    var contactMessageError = document.querySelector("#contactMessageError");

    var contactSubmitBtn = document.querySelector("#contactSubmitBtn");
    var contactSuccessMessage = document.querySelector("#contactSuccessMessage");

    /* Simple validation patterns for the contact form:
         - Name: only letters and spaces, at least 2 characters
         - Email: standard email format, any domain allowed
         - Message: at least 10 characters so it is not left blank */
    var contactNamePattern = /^[A-Za-z ]{2,50}$/;
    var contactEmailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    var CONTACT_MESSAGE_MIN_LENGTH = 10;

    /* Tracks whether each contact field is currently valid,
       used to decide if the Send button should be enabled */
    var contactFieldStatus = {
      name: false,
      email: false,
      message: false
    };

    /* Marks a field as valid: green style, clears error text */
    function markContactValid(inputElement, errorElement) {
      inputElement.classList.add("is-valid");
      inputElement.classList.remove("is-invalid");
      errorElement.textContent = "";
    }

    /* Marks a field as invalid: red style, shows error text */
    function markContactInvalid(inputElement, errorElement, message) {
      inputElement.classList.add("is-invalid");
      inputElement.classList.remove("is-valid");
      errorElement.textContent = message;
    }

    /* Checks the Name field */
    function validateContactName() {
      var value = contactNameInput.value.trim();

      if (value === "") {
        markContactInvalid(contactNameInput, contactNameError, "Your name is required.");
        contactFieldStatus.name = false;
      } else if (!contactNamePattern.test(value)) {
        markContactInvalid(contactNameInput, contactNameError, "Name can only contain letters and spaces.");
        contactFieldStatus.name = false;
      } else {
        markContactValid(contactNameInput, contactNameError);
        contactFieldStatus.name = true;
      }
    }

    /* Checks the Email field */
    function validateContactEmail() {
      var value = contactEmailInput.value.trim();

      if (value === "") {
        markContactInvalid(contactEmailInput, contactEmailError, "Your email is required.");
        contactFieldStatus.email = false;
      } else if (!contactEmailPattern.test(value)) {
        markContactInvalid(contactEmailInput, contactEmailError, "Please enter a valid email address.");
        contactFieldStatus.email = false;
      } else {
        markContactValid(contactEmailInput, contactEmailError);
        contactFieldStatus.email = true;
      }
    }

    /* Checks the Message field */
    function validateContactMessage() {
      var value = contactMessageInput.value.trim();

      if (value === "") {
        markContactInvalid(contactMessageInput, contactMessageError, "A message is required.");
        contactFieldStatus.message = false;
      } else if (value.length < CONTACT_MESSAGE_MIN_LENGTH) {
        markContactInvalid(contactMessageInput, contactMessageError, "Message must be at least " + CONTACT_MESSAGE_MIN_LENGTH + " characters long.");
        contactFieldStatus.message = false;
      } else {
        markContactValid(contactMessageInput, contactMessageError);
        contactFieldStatus.message = true;
      }
    }

    /* Looks at all three contactFieldStatus values. If every
       field is valid, the Send button is enabled. */
    function checkContactFormValidity() {
      if (contactFieldStatus.name === true && contactFieldStatus.email === true && contactFieldStatus.message === true) {
        contactSubmitBtn.disabled = false;
      } else {
        contactSubmitBtn.disabled = true;
      }
    }

    /* Attach input and blur listeners to each contact field so
       feedback is instant while typing and double-checked when
       the student clicks or tabs away from a field */
    contactNameInput.addEventListener("input", function () {
      validateContactName();
      checkContactFormValidity();
    });
    contactNameInput.addEventListener("blur", function () {
      validateContactName();
      checkContactFormValidity();
    });

    contactEmailInput.addEventListener("input", function () {
      validateContactEmail();
      checkContactFormValidity();
    });
    contactEmailInput.addEventListener("blur", function () {
      validateContactEmail();
      checkContactFormValidity();
    });

    contactMessageInput.addEventListener("input", function () {
      validateContactMessage();
      checkContactFormValidity();
    });
    contactMessageInput.addEventListener("blur", function () {
      validateContactMessage();
      checkContactFormValidity();
    });

    /* Handles submitting the contact form. Since this project
       has no backend server to send the message to, we simply
       show a thank-you message and reset the form once every
       field has passed validation. No alert boxes are used. */
    contactForm.addEventListener("submit", function (event) {
      event.preventDefault();

      validateContactName();
      validateContactEmail();
      validateContactMessage();
      checkContactFormValidity();

      if (contactFieldStatus.name === false || contactFieldStatus.email === false || contactFieldStatus.message === false) {
        return;
      }

      /* Show the thank-you message */
      contactSuccessMessage.hidden = false;

      /* Reset the form back to its empty starting state */
      contactForm.reset();
      contactSubmitBtn.disabled = true;

      contactNameInput.classList.remove("is-valid");
      contactEmailInput.classList.remove("is-valid");
      contactMessageInput.classList.remove("is-valid");

      contactFieldStatus.name = false;
      contactFieldStatus.email = false;
      contactFieldStatus.message = false;
    });

  }
  /* If this page does not have a registration form (for example
     if this script accidentally loads on another page), we stop
     here so the rest of the code does not throw errors. */
  if (!registrationForm) {
    return;
  }

  /* --------------------------------------------------------
     2. SIMPLE VALIDATION PATTERNS
     We keep these as plain regular expressions so they are
     easy to read and explain:
       - Name: only letters and spaces, at least 2 characters
       - Student ID: only letters and numbers, 6-15 characters
       - Email: standard email format ending in @alueducation.com
     -------------------------------------------------------- */
  var namePattern = /^[A-Za-z ]{2,50}$/;
  var idPattern = /^[A-Za-z0-9]{6,15}$/;
  var emailPattern = /^[A-Za-z0-9._%+-]+@alueducation\.com$/;

  /* This object keeps track of whether each field is currently
     valid. We use it to decide if the Start Quiz button should
     be enabled. Starting values are false because the form is
     empty when the page first loads. */
  var fieldStatus = {
    name: false,
    id: false,
    email: false
  };

  /* --------------------------------------------------------
     3. HELPER FUNCTIONS
     These two small helpers keep our validation functions
     short. One marks a field as valid, the other marks a
     field as invalid with a message.
     -------------------------------------------------------- */
  function markValid(inputElement, errorElement) {
    inputElement.classList.add("is-valid");
    inputElement.classList.remove("is-invalid");
    errorElement.textContent = "";
  }

  function markInvalid(inputElement, errorElement, message) {
    inputElement.classList.add("is-invalid");
    inputElement.classList.remove("is-valid");
    errorElement.textContent = message;
  }

  /* --------------------------------------------------------
     4. VALIDATE STUDENT NAME
     Checks that the name only contains letters and spaces,
     and is not empty. Updates the styling and error text,
     then updates fieldStatus.name.
     -------------------------------------------------------- */
  function validateName() {
    var value = nameInput.value.trim();

    if (value === "") {
      markInvalid(nameInput, nameError, "Student name is required.");
      fieldStatus.name = false;
    } else if (!namePattern.test(value)) {
      markInvalid(nameInput, nameError, "Name can only contain letters and spaces.");
      fieldStatus.name = false;
    } else {
      markValid(nameInput, nameError);
      fieldStatus.name = true;
    }
  }

  /* --------------------------------------------------------
     5. VALIDATE STUDENT ID
     Checks that the ID only contains letters and numbers and
     is a reasonable length. Updates styling, error text, and
     fieldStatus.id.
     -------------------------------------------------------- */
  function validateId() {
    var value = idInput.value.trim();

    if (value === "") {
      markInvalid(idInput, idError, "Student ID is required.");
      fieldStatus.id = false;
    } else if (!idPattern.test(value)) {
      markInvalid(idInput, idError, "ID must be 6-15 letters/numbers, no spaces or symbols.");
      fieldStatus.id = false;
    } else {
      markValid(idInput, idError);
      fieldStatus.id = true;
    }
  }

  /* --------------------------------------------------------
     6. VALIDATE INSTITUTIONAL EMAIL
     Checks that the email is in a valid format AND ends with
     the required @alueducation.com domain. Updates styling,
     error text, and fieldStatus.email.
     -------------------------------------------------------- */
  function validateEmail() {
    var value = emailInput.value.trim();

    if (value === "") {
      markInvalid(emailInput, emailError, "Institutional email is required.");
      fieldStatus.email = false;
    } else if (!emailPattern.test(value)) {
      markInvalid(emailInput, emailError, "Email must be a valid @alueducation.com address.");
      fieldStatus.email = false;
    } else {
      markValid(emailInput, emailError);
      fieldStatus.email = true;
    }
  }

  /* --------------------------------------------------------
     7. CHECK OVERALL FORM VALIDITY
     Looks at all three fieldStatus values. If every field is
     true, the Start Quiz button is enabled. Otherwise it stays
     disabled. This runs after every single field check.
     -------------------------------------------------------- */
  function checkFormValidity() {
    if (fieldStatus.name === true && fieldStatus.id === true && fieldStatus.email === true) {
      startQuizBtn.disabled = false;
    } else {
      startQuizBtn.disabled = true;
    }
  }

  /* --------------------------------------------------------
     8. ATTACH EVENT LISTENERS
     We listen for "input" (fires on every keystroke) so the
     feedback feels instant, and "blur" (fires when the user
     clicks/tabs away) as a backup check. After each check we
     re-run checkFormValidity() to update the button.
     -------------------------------------------------------- */
  nameInput.addEventListener("input", function () {
    validateName();
    checkFormValidity();
  });
  nameInput.addEventListener("blur", function () {
    validateName();
    checkFormValidity();
  });

  idInput.addEventListener("input", function () {
    validateId();
    checkFormValidity();
  });
  idInput.addEventListener("blur", function () {
    validateId();
    checkFormValidity();
  });

  emailInput.addEventListener("input", function () {
    validateEmail();
    checkFormValidity();
  });
  emailInput.addEventListener("blur", function () {
    validateEmail();
    checkFormValidity();
  });

  /* --------------------------------------------------------
     9. HANDLE FORM SUBMISSION
     Even though the button is disabled until the form is
     valid, we still run one final check on submit. This is a
     safety net in case something unexpected happens (for
     example, the button being enabled by browser dev tools).
     If everything is valid, the student's details are saved
     to localStorage so later pages (like quiz.html) could use
     them, and the browser is allowed to move to quiz.html.
     No alert boxes are used anywhere in this process.
     -------------------------------------------------------- */
  registrationForm.addEventListener("submit", function (event) {
    validateName();
    validateId();
    validateEmail();
    checkFormValidity();

    if (fieldStatus.name === false || fieldStatus.id === false || fieldStatus.email === false) {
      /* Stop the form from submitting if something is invalid */
      event.preventDefault();
      return;
    }

    /* Stop the default page reload so we can control navigation
       ourselves after saving the student's details. */
    event.preventDefault();

    /* Save the student's registration details so other pages
       in the site can greet them by name or reference their ID. */
    var studentDetails = {
      name: nameInput.value.trim(),
      id: idInput.value.trim(),
      email: emailInput.value.trim()
    };
    localStorage.setItem("bseStudentDetails", JSON.stringify(studentDetails));

    /* Move on to the quiz page now that registration is complete. */
    window.location.href = "quiz.html";
  });

});