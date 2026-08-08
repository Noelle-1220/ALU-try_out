/* ==========================================================================
   AuraVelve Engineering Platform - Core JavaScript Engine
   File: js/main.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ----------------------------------------------------------------------
       1. GLOBAL UTILITIES & CORE NAVIGATION SETUP
       ---------------------------------------------------------------------- */

    // Preloader Dismissal Functionality
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            preloader.classList.add('hidden');
        });
        // Fallback dismissal in case load event fires early
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1200);
    }

    // Light / Dark Theme Management Mode
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load saved preference or default to light
    const savedTheme = localStorage.getItem('auravelve_theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('auravelve_theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }

    function updateThemeIcon(theme) {
        if (themeToggleBtn) {
            themeToggleBtn.textContent = theme === 'light' ? '🌙' : '☀️';
        }
    }

    // Responsive Mobile Hamburger Drawer Toggle
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (hamburgerToggle && navMenu) {
        hamburgerToggle.addEventListener('click', () => {
            hamburgerToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // Scroll-To-Top System Action Button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }


    /* ----------------------------------------------------------------------
       2. QUIZ ENGINE & SCORING MATRIX SYSTEM (For quiz.html)
       ---------------------------------------------------------------------- */

    const quizWrapper = document.getElementById('quiz-dynamic-wrapper');
    
    if (quizWrapper) {

        // Question Matrix Definition Structure
        const questions = [
            {
                q: "When faced with a complex software problem, your initial impulse is to...",
                options: [
                    { text: "Build a flexible, end-to-end interface to let users query data.", track: "fs" },
                    { text: "Analyze data distributions and look for hidden statistical patterns.", track: "ml" },
                    { text: "Optimize memory structures and control hardware resources directly.", track: "sys" },
                    { text: "Map out spatial interactions and 3D geometric relationships.", track: "xr" }
                ]
            },
            {
                q: "Which type of data structure feels most satisfying to work with?",
                options: [
                    { text: "High-dimensional matrices, tensors, and probabilistic vectors.", track: "ml" },
                    { text: "Relational database tables linked with nested object keys.", track: "fs" },
                    { text: "Pure bit-fields, buffers, and pointer chains in memory addresses.", track: "sys" },
                    { text: "Spatial scene graphs, polygon vertex meshes, and transformation coordinate matrices.", track: "xr" }
                ]
            },
            {
                q: "Imagine you are designing a high-traffic system. Your main priority is...",
                options: [
                    { text: "Minimizing CPU instruction cycles and cache misses at the hardware level.", track: "sys" },
                    { text: "Keeping user inputs running smoothly at a consistent 90+ FPS refresh rate.", track: "xr" },
                    { text: "Managing horizontal server scaling, caching layers, and load balancing.", track: "fs" },
                    { text: "Ensuring accurate convergence rates and avoiding model over-fitting.", track: "ml" }
                ]
            },
            {
                q: "Choose your preferred playground environment:",
                options: [
                    { text: "A web browser engine or a distributed cloud environment.", track: "fs" },
                    { text: "An interactive 3D rendering context or game engine ecosystem.", track: "xr" },
                    { text: "A Jupyter notebook or Python mathematical modeling environment.", track: "ml" },
                    { text: "A bare-metal microcontroller or an isolated command-line terminal environment.", track: "sys" }
                ]
            },
            {
                q: "You are building a simulation of a crowded city. How do you approach the logic?",
                options: [
                    { text: "Train deep neural networks to approximate citizen behavior curves.", track: "ml" },
                    { text: "Construct a central dashboard system using structured relational databases.", track: "fs" },
                    { text: "Program custom shaders to render thousands of dynamic visual assets instantly.", track: "xr" },
                    { text: "Optimize low-level multi-threading arrays to execute operations fast.", track: "sys" }
                ]
            },
            {
                q: "What type of bug sounds the most interesting to track down and solve?",
                options: [
                    { text: "A memory leak causing segmentation faults or hardware buffer overflows.", track: "sys" },
                    { text: "A data distribution drift causing a predictive model to decline in accuracy.", track: "ml" },
                    { text: "An erratic asynchronous race condition between front-end UI and state handlers.", track: "fs" },
                    { text: "A physical collision clip bug or a spatial rendering camera calculation error.", track: "xr" }
                ]
            },
            {
                q: "If you were to publish a tech article tomorrow, what would the headline be?",
                options: [
                    { text: "Building Micro-Frontends and Event-Driven APIs at Massive Scale", track: "fs" },
                    { text: "Writing a Custom Operating System Kernel from Scratch", track: "sys" },
                    { text: "Demystifying Latent Diffusion Architectures and Generative Models", track: "ml" },
                    { text: "Optimizing Real-Time Matrix Calculus for Spatial Computing Spaces", track: "xr" }
                ]
            },
            {
                q: "Ultimately, what kind of value do you want your code to deliver?",
                options: [
                    { text: "Providing deep analytical intelligence and predictive automations.", track: "ml" },
                    { text: "Creating highly responsive, accessible web applications used globally.", track: "fs" },
                    { text: "Delivering tactile, fully immersive virtual interactions.", track: "xr" },
                    { text: "Securing robust, fast, and resilient core system operations.", track: "sys" }
                ]
            }
        ];

        // State Machine Storage
        let currentQuestionIdx = 0;
        let selectedAnswers = new Array(questions.length).fill(null);
        let timeRemaining = 120; // 2 minutes countdown
        let timerInterval = null;

        // UI DOM Elements Setup
        const progressText = document.getElementById('progress-text');
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        const timerDisplay = document.getElementById('timer-display');
        const btnPrev = document.getElementById('btn-prev');
        const btnNext = document.getElementById('btn-next');
        const completionOverlay = document.getElementById('completion-overlay');

        // Initializer Execution
        startTimer();
        renderQuestion(currentQuestionIdx);

        // Core Render Method
        function renderQuestion(index) {
            const currentQ = questions[index];

            // Build dynamic markup
            let optionsHTML = '';
            currentQ.options.forEach((opt, optIndex) => {
                const isSelected = selectedAnswers[index] === opt.track;
                optionsHTML += `
                    <button class="option-pill ${isSelected ? 'selected' : ''}" data-track="${opt.track}">
                        ${opt.text}
                    </button>
                `;
            });

            quizWrapper.innerHTML = `
                <div class="glass-card question-card active">
                    <h2 style="color: var(--color-accent); font-size: 1.35rem; margin-bottom: 1.5rem;">
                        ${index + 1}. ${currentQ.q}
                    </h2>
                    <div class="options-grid">
                        ${optionsHTML}
                    </div>
                </div>
            `;

            // Update Progress Tracking Metrics
            if (progressText) progressText.textContent = `Question ${index + 1} of ${questions.length}`;
            if (scrollProgressBar) {
                const percent = ((index + 1) / questions.length) * 100;
                scrollProgressBar.style.width = `${percent}%`;
            }

            // Update Navigation Controllers State
            if (btnPrev) btnPrev.disabled = index === 0;
            if (btnNext) {
                btnNext.textContent = index === questions.length - 1 ? "Submit Diagnostic" : "Next Question →";
            }

            // Attach Option Click Events
            const optionPills = quizWrapper.querySelectorAll('.option-pill');
            optionPills.forEach(pill => {
                pill.addEventListener('click', () => {
                    optionPills.forEach(p => p.classList.remove('selected'));
                    pill.classList.add('selected');
                    selectedAnswers[index] = pill.getAttribute('data-track');
                });
            });
        }

        // Timer Countdown Mechanism
        function startTimer() {
            timerInterval = setInterval(() => {
                timeRemaining--;
                const minutes = Math.floor(timeRemaining / 60);
                const seconds = timeRemaining % 60;
                
                if (timerDisplay) {
                    timerDisplay.textContent = `Time Remaining: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }

                if (timeRemaining <= 0) {
                    clearInterval(timerInterval);
                    processResults(); // Auto-submit when time expires
                }
            }, 1000);
        }

        // Button Controls Interaction Hooks
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (currentQuestionIdx > 0) {
                    currentQuestionIdx--;
                    renderQuestion(currentQuestionIdx);
                }
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', () => {
                if (selectedAnswers[currentQuestionIdx] === null) {
                    alert("Please select an answer parameter before advancing.");
                    return;
                }

                if (currentQuestionIdx < questions.length - 1) {
                    currentQuestionIdx++;
                    renderQuestion(currentQuestionIdx);
                } else {
                    processResults();
                }
            });
        }

        // Process Assessment & Save Metrics
        function processResults() {
            clearInterval(timerInterval);

            // Calculate track totals
            const scores = { ml: 0, fs: 0, xr: 0, sys: 0 };
            selectedAnswers.forEach(track => {
                if (track && scores.hasOwnProperty(track)) {
                    scores[track]++;
                }
            });

            // Save metrics array to LocalStorage for result.html
            localStorage.setItem('auravelve_scores', JSON.stringify(scores));

            // Display completion overlay modal
            if (completionOverlay) {
                completionOverlay.classList.add('active');
            }

            // Redirect to results after slight delay
            setTimeout(() => {
                window.location.href = 'result.html';
            }, 1800);
        }
    }


    /* ----------------------------------------------------------------------
       3. RESULT METRICS COMPUTATION ENGINE (For result.html)
       ---------------------------------------------------------------------- */

    const verdictTitle = document.getElementById('verdict-title');
    if (verdictTitle) {
        const rawScores = localStorage.getItem('auravelve_scores');
        const completionBadge = document.getElementById('completion-badge');
        
        // IF NO SCORES EXIST: The user bypassed the quiz!
        if (!rawScores) {
            verdictTitle.textContent = "No Diagnostic Data Found";
            const verdictDescription = document.getElementById('verdict-description');
            if (verdictDescription) {
                verdictDescription.textContent = "Please complete the interactive assessment track before viewing profile results.";
            }
            if (completionBadge) {
                completionBadge.style.display = "none"; // Hide the 100% complete badge
            }
            
            // Zero out progress bars since no quiz was taken
            ['bar-ml', 'bar-fs', 'bar-xr', 'bar-sys'].forEach(id => {
                const bar = document.getElementById(id);
                if (bar) bar.style.width = "0%";
            });
            ['text-ml', 'text-fs', 'text-xr', 'text-sys'].forEach(id => {
                const text = document.getElementById(id);
                if (text) text.textContent = "0%";
            });
            return; // Stop running the rest of the file
        }

        // IF SCORES DO EXIST: Process normally
        let scores = JSON.parse(rawScores);

        const trackDetails = {
            ml: { title: "Machine Learning & AI Architect", desc: "Your cognitive profile leans strongly toward statistical inference, algorithmic model building, and predictive pattern identification." },
            fs: { title: "Full-Stack Web Architect", desc: "You prioritize cohesive user experiences, seamless asynchronous API flows, and scalable cloud application structures." },
            xr: { title: "Spatial Tech & AR/VR Specialist", desc: "Your affinity points heavily toward geometric matrices, high-frame-rate rendering loops, and immersive 3D graphics environments." },
            sys: { title: "Low-Level Systems Engineer", desc: "You excel at bare-metal computing optimization, fine-grained memory lifecycle control, and instruction cycle efficiency." }
        };

        const hierarchy = ['ml', 'sys', 'xr', 'fs'];
        let winningTrack = 'ml';
        let maxPoints = -1;

        hierarchy.forEach(track => {
            if (scores[track] > maxPoints) {
                maxPoints = scores[track];
                winningTrack = track;
            }
        });

        const verdictDescription = document.getElementById('verdict-description');
        verdictTitle.textContent = trackDetails[winningTrack].title;
        if (verdictDescription) verdictDescription.textContent = trackDetails[winningTrack].desc;

        const totalAnswers = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
        const pML = Math.round((scores.ml / totalAnswers) * 100);
        const pFS = Math.round((scores.fs / totalAnswers) * 100);
        const pXR = Math.round((scores.xr / totalAnswers) * 100);
        const pSYS = Math.round((scores.sys / totalAnswers) * 100);

        const barML = document.getElementById('bar-ml');
        const barFS = document.getElementById('bar-fs');
        const barXR = document.getElementById('bar-xr');
        const barSYS = document.getElementById('bar-sys');

        if (barML) barML.style.width = `${pML}%`;
        if (barFS) barFS.style.width = `${pFS}%`;
        if (barXR) barXR.style.width = `${pXR}%`;
        if (barSYS) barSYS.style.width = `${pSYS}%`;

        const textML = document.getElementById('text-ml');
        const textFS = document.getElementById('text-fs');
        const textXR = document.getElementById('text-xr');
        const textSYS = document.getElementById('text-sys');

        if (textML) textML.textContent = `${pML}%`;
        if (textFS) textFS.textContent = `${pFS}%`;
        if (textXR) textXR.textContent = `${pXR}%`;
        if (textSYS) textSYS.textContent = `${pSYS}%`;
    }

    /* ----------------------------------------------------------------------
       4. SUPPORT ACCORDION & CONTACT FORM ENGINE (For contact.html)
       ---------------------------------------------------------------------- */

    // FAQ Accordion Toggle Interaction
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const faqItem = trigger.parentElement;
            const isOpen = faqItem.classList.contains('active');

            // 1. Close ALL items first, reset icons to "+"
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                
                const btn = item.querySelector('.faq-trigger');
                if (btn) btn.setAttribute('aria-expanded', 'false');
                
                const icon = item.querySelector('.faq-icon');
                if (icon) icon.textContent = '+';
            });

            // 2. If the clicked item wasn't open, open it now and set icon to "-"
            if (!isOpen) {
                faqItem.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
                
                const currentIcon = trigger.querySelector('.faq-icon');
                if (currentIcon) currentIcon.textContent = '-';
            }
        });
    });

    // Contact Form Front-End Validation
    const contactForm = document.getElementById('advisor-contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            let isValid = true;

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const messageInput = document.getElementById('contact-message');

            const errName = document.getElementById('err-name');
            const errEmail = document.getElementById('err-email');
            const errMessage = document.getElementById('err-message');

            // Name Validation
            if (!nameInput.value.trim()) {
                if (errName) errName.style.display = 'block';
                isValid = false;
            } else {
                if (errName) errName.style.display = 'none';
            }

            // Email Validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value.trim())) {
                if (errEmail) errEmail.style.display = 'block';
                isValid = false;
            } else {
                if (errEmail) errEmail.style.display = 'none';
            }

            // Message Validation
            if (!messageInput.value.trim()) {
                if (errMessage) errMessage.style.display = 'block';
                isValid = false;
            } else {
                if (errMessage) errMessage.style.display = 'none';
            }

            // Successful Submission Confirmation
            if (isValid) {
                alert("Transmission Successful! A track advisor has received your message and will get back to you shortly.");
                contactForm.reset();
            }
        });
    }

});