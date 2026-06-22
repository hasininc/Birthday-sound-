// --- Configuration ---
// Adjust this threshold: higher number means you have to blow harder (0-255)
const BLOW_THRESHOLD = 160; 

// --- HTML Elements ---
const candleStick = document.querySelector('.candle-stick');
const flame = document.querySelector('.flame');
const cakeContainer = document.querySelector('.cake-container');

// Global audio context reference to handle browser autoplay policies
let audioContext;

// --- Main Audio Logic ---
function startListening() {
    // 1. Request microphone access
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia not supported in this browser.');
        alert('Your browser does not support the Web Audio API for microphone input.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            // 2. Set up the Audio Context and Analyser
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            
            // Connect the parts
            microphone.connect(analyser);

            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            
            // 3. Start checking sound level repeatedly
            detectBlow(analyser, dataArray);
        })
        .catch(err => {
            console.error('Error accessing the microphone:', err);
            // Inform the user if permission is denied
            alert('Microphone access is required to blow out the candle! Please refresh and grant permission.');
        });
}

// Helper to resume the AudioContext on user gesture (required by Chrome/Safari/Firefox)
function resumeAudioContext() {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext resumed successfully on user interaction.');
        });
    }
}

// Add event listeners for interaction to unlock the AudioContext
window.addEventListener('click', resumeAudioContext);
window.addEventListener('touchstart', resumeAudioContext);

// Function that constantly checks the sound level
function detectBlow(analyser, dataArray) {
    let animationId; // To control the loop

    function check() {
        // Stop checking if the candle is already blown out
        if (cakeContainer.classList.contains('blown')) {
            cancelAnimationFrame(animationId);
            return;
        }

        // Get the sound frequency data
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate the average sound level
        let sum = dataArray.reduce((a, b) => a + b, 0);
        let average = sum / dataArray.length;

        // Check if the sound level exceeds the threshold
        if (average > BLOW_THRESHOLD) {
            putOutCandle();
        }

        // Continue the loop
        animationId = requestAnimationFrame(check);
    }
    
    // Start the first check
    animationId = requestAnimationFrame(check);
}

// Function to handle the blow-out action
function putOutCandle() {
    // 1. Visually extinguish the flame
    flame.style.display = 'none';
    cakeContainer.classList.add('blown');

    // 2. Display the message by modifying the existing element in the HTML
    const message = document.getElementById('birthday-message');
    if (message) {
        message.textContent = 'Happy Birthday! 🎉';
        message.classList.add('show');
    }

    // 3. Trigger a simple confetti effect
    startSimpleConfetti();
}

// Simple confetti simulation
function startSimpleConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        
        // Generate a random drift offset on X axis and set the CSS variable used in keyframes
        const randX = (Math.random() * 200 - 100).toFixed(0);
        confetti.style.setProperty('--rand-x', randX);
        
        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Start the process when the page loads
window.onload = startListening;