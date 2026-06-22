// --- Configuration ---
// Adjust this threshold: higher number means you have to blow harder (0-255)
const BLOW_THRESHOLD = 160; 

// --- HTML Elements ---
const candleStick = document.querySelector('.candle-stick');
const flame = document.querySelector('.flame');
const cakeContainer = document.querySelector('.cake-container');

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
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
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

    // 2. Display the message
    const message = document.createElement('div');
    message.id = 'birthday-message';
    message.textContent = 'Happy Birthday! 🎉';
    document.body.appendChild(message);

    // 3. Trigger a simple confetti effect (replace with a library for better results)
    startSimpleConfetti();
}

// Simple confetti simulation (better results require a library)
function startSimpleConfetti() {
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);

        // Remove after animation
        setTimeout(() => confetti.remove(), 5000);
    }
}

// Add CSS for the message and simple confetti (Needs to be added to your <style> in index.html)
/*
#birthday-message {
    position: fixed;
    top: 20%;
    font-size: 40px;
    font-weight: bold;
    color: #FF69B4;
    text-shadow: 2px 2px #FFFFFF;
    z-index: 100;
}
.confetti-piece {
    position: fixed;
    width: 10px;
    height: 10px;
    top: -10px;
    opacity: 0;
    transform: rotate(45deg);
    animation: fall 4s forwards;
    z-index: 99;
}
@keyframes fall {
    0% { top: -10px; opacity: 1; }
    100% { top: 100vh; transform: rotate(1080deg); opacity: 0; }
}
*/

// Start the process when the page loads
window.onload = startListening;