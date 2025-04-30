document.addEventListener("DOMContentLoaded", function() {
    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 50,
                    behavior: "smooth"
                });
            }
        });
    });
  
    // Ensure dark mode button exists before adding an event listener
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", function() {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("darkMode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
        });
        if (localStorage.getItem("darkMode") === "enabled") {
            document.body.classList.add("dark-mode");
        }
    }
  
    // Ensure contact form exists before adding an event listener
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function(event) {
            event.preventDefault();
            fetch(this.action, {
                method: "POST",
                body: new FormData(this),
                headers: { 'Accept': 'application/json' }
            }).then(response => {
                document.getElementById("statusMessage").innerText = response.ok ? "Message Sent!" : "Error sending message.";
                if (response.ok) this.reset();
            }).catch(() => {
                document.getElementById("statusMessage").innerText = "Error sending message.";
            });
        });
    }
  
    // Typewriter Effect
    const words = ["Software Engineer", "AI/ML Enthusiast", "Full-Stack Developer"];
    let wordIndex = 0;
    let charIndex = 0;
    const typewriterElement = document.getElementById("typewriter");
  
    function typeEffect() {
        if (!typewriterElement) return;
        if (charIndex < words[wordIndex].length) {
            typewriterElement.textContent += words[wordIndex].charAt(charIndex);
            charIndex++;
            setTimeout(typeEffect, 100);
        } else {
            setTimeout(eraseEffect, 1500);
        }
    }
  
    function eraseEffect() {
        if (charIndex > 0) {
            typewriterElement.textContent = words[wordIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(eraseEffect, 50);
        } else {
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(typeEffect, 500);
        }
    }
    typeEffect();
  
    // Project Modal Functionality
    window.openModal = id => document.getElementById(id).style.display = "flex";
    window.closeModal = id => document.getElementById(id).style.display = "none";
  
    // Voice Assistant Integration
    const assistantBtn = document.getElementById("voiceAssistant");
    const responseText = document.getElementById("assistantResponse");
    const aiAvatar = document.getElementById("aiAvatar");
  
    if ("webkitSpeechRecognition" in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
  
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            responseText.innerText = `You said: "${transcript}"`;
            if (aiAvatar) aiAvatar.classList.add("talking");
  
            fetch(`http://127.0.0.1:5000/ask?query=${encodeURIComponent(transcript)}`)
            .then(response => response.json())
            .then(data => {
                responseText.innerText = data.answer;
                speak(data.answer);
                if (aiAvatar) aiAvatar.classList.remove("talking");
            })
            .catch(() => {
                responseText.innerText = "Error connecting to AI.";
                if (aiAvatar) aiAvatar.classList.remove("talking");
            });
        };
  
        recognition.onerror = function() {
            responseText.innerText = "Speech recognition error.";
        };
  
        assistantBtn.addEventListener("click", function() {
            responseText.innerText = "Listening...";
            recognition.start();
        });
    } else {
        responseText.innerText = "Sorry, voice recognition is not supported in this browser.";
    }
  
    function speak(text) {
        const speech = new SpeechSynthesisUtterance();
        speech.text = text;
        speech.volume = 1;
        speech.rate = 1;
        speech.pitch = 1;
        window.speechSynthesis.speak(speech);
    }
  });
  