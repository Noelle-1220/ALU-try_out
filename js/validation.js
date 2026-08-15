/* 
   VALIDATION.JS
   This file controls the real-time validation for the
   registration form on index.html.*/


/* DOMCONTENTLOADED */
document.addEventListener("DOMContentLoaded", function () {

  /* 
     1. GRAB THE ELEMENTS WE NEED FROM THE PAGE
     this section grabs all the necessary elements from the DOM */

  var registrationForm = document.querySelector("#registrationForm");

  var nameInput = document.querySelector("#studentName");
  var idInput = document.querySelector("#studentId");
  var emailInput = document.querySelector("#studentEmail");

  var nameError = document.querySelector("#studentNameError");
  var idError = document.querySelector("#studentIdError");
  var emailError = document.querySelector("#studentEmailError");

  var startQuizBtn = document.querySelector("#startQuizBtn");

  /* 
     CONTACT FORM VALIDATION
     This section handles the real-time validation for the
     contact form on contact.html. */

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

    /* validation patterns for the contact form:
         - Name: only letters and spaces, at least 2 characters
         - Email: standard email format, any domain allowed
         - Message: at least 10 characters so it is not left blank */
    var contactNamePattern = /^[A-Za-z ]{2,50}$/;
    var contactEmailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    var CONTACT_MESSAGE_MIN_LENGTH = 10;

    /* tracks each field inserted to facilitate validation and send approval */
    var contactFieldStatus = {
      name: false,
      email: false,
      message: false
    };

    /* Marks a field as valid: green style */
    function markContactValid(inputElement, errorElement) {
      inputElement.classList.add("is-valid");
      inputElement.classList.remove("is-invalid");
      errorElement.textContent = "";
    }

    /* Marks a field as invalid: red style */
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

    /* enables smooth validation feedback though event listeners */
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

    /* Handles submitting the contact form. */
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
  /* If no registration form is found, stop here */
  if (!registrationForm) {
    return;
  }

  /* 
     2. REGISTRATION VALIDATION PATTERNS
      This section defines the patterns used to validate the registration form.
       - Name: only letters and spaces, at least 2 characters
       - Student ID: only letters and numbers, 6-15 characters
       - Email: standard email format ending in @alueducation.com
      */

  var namePattern = /^[A-Za-z ]{2,50}$/;
  var idPattern = /^[A-Za-z0-9]{6,15}$/;
  var emailPattern = /^[A-Za-z0-9._%+-]+@alueducation\.com$/;

  /* this object keeps track of whether each field is currently valid */
  var fieldStatus = {
    name: false,
    id: false,
    email: false
  };

  /* 
     3. HELPER FUNCTIONS
     this section contains small utility functions used by the validation logic
      */

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

  /* 
     4. VALIDATE STUDENT NAME
    this section contains the logic for validating the student name field
     */

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

  /* 
     5. VALIDATE STUDENT ID
     this section contains the logic for validating the student ID field
     */

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

  /* 
     6. VALIDATE INSTITUTIONAL EMAIL
     this section contains the logic for validating the institutional email field
     */

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

  /* 
     7. CHECK OVERALL FORM VALIDITY
     this section checks if all form fields are valid and enables/disables the submit button accordingly
     */

  function checkFormValidity() {
    if (fieldStatus.name === true && fieldStatus.id === true && fieldStatus.email === true) {
      startQuizBtn.disabled = false;
    } else {
      startQuizBtn.disabled = true;
    }
  }

  /* 
     8. ATTACH EVENT LISTENERS
     this section attaches event listeners to the form fields to trigger validation on user interaction
     */

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

  /* 
     9. HANDLE FORM SUBMISSION
     this section handles the form submission event
     */

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

    /* stops default reload to manage the navigation */
    event.preventDefault();

    /* Store the student's details in localStorage for full page reference */
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