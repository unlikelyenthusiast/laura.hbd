// ============================================================
// BIRTHDAY CANDLE SYSTEM
// ============================================================

const musicButton = document.getElementById("musicButton");

const audio = new Audio("hbd.mp3");

audio.loop = false;

let analyser = null;
let audioContext = null;
let microphone = null;

let celebrationStarted = false;
let confettiStarted = false;

const candles = [];


// ============================================================
// BLOW SENSITIVITY
// ============================================================

// Higher = harder to blow out
// Lower = easier to blow out
const BLOW_THRESHOLD = 45;


// ============================================================
// CREATE CANDLE
// ============================================================

function addCandle(x, y) {

    console.log("Creating candle at:", x, y);

    const candle = document.createElement("div");

    candle.className = "candle";


    // IMPORTANT:
    // Fixed positioning means these coordinates are directly
    // related to the user's screen click.
    candle.style.position = "fixed";

    candle.style.left = x + "px";
    candle.style.top = y + "px";


    // Create flame
    const flame = document.createElement("div");

    flame.className = "flame";


    // Put flame inside candle
    candle.appendChild(flame);


    // Add directly to body
    document.body.appendChild(candle);


    // Store candle
    candles.push(candle);


    console.log("Candle added. Total candles:", candles.length);

}


// ============================================================
// CLICK ANYWHERE TO CREATE A CANDLE
// ============================================================

document.addEventListener("click", function (event) {

    console.log("Page clicked:", event.clientX, event.clientY);


    // Don't add candles after celebration
    if (celebrationStarted) {
        return;
    }


    // Don't add another candle when clicking an existing candle
    if (event.target.closest(".candle")) {
        return;
    }


    // Get exact click position
    const x = event.clientX;
    const y = event.clientY;


    // Create candle
    addCandle(x, y);

});


// ============================================================
// MICROPHONE / BLOW DETECTION
// ============================================================

function isBlowing() {

    if (!analyser) {
        return false;
    }


    const bufferLength = analyser.frequencyBinCount;

    const dataArray = new Uint8Array(bufferLength);


    analyser.getByteFrequencyData(dataArray);


    let sum = 0;


    for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
    }


    const average = sum / bufferLength;


    // Uncomment this if you want to see microphone volume
    // console.log("Mic volume:", average);


    return average > BLOW_THRESHOLD;

}


// ============================================================
// BLOW OUT CANDLES
// ============================================================

function blowOutCandles() {

    // No candles
    if (candles.length === 0) {
        return;
    }


    // Celebration already happened
    if (celebrationStarted) {
        return;
    }


    // User isn't blowing
    if (!isBlowing()) {
        return;
    }


    // Find candles that are still lit
    const activeCandles = candles.filter(function (candle) {

        return !candle.classList.contains("out");

    });


    if (activeCandles.length === 0) {
        return;
    }


    // ========================================================
    // BLOW OUT SOME CANDLES
    // ========================================================

    // If there are lots of candles, blow out several at once.
    // If there are only a few, blow them all out.
    const amountToBlow = Math.max(
        1,
        Math.ceil(activeCandles.length / 3)
    );


    // Randomize candles
    const shuffledCandles = [...activeCandles].sort(
        () => Math.random() - 0.5
    );


    // Blow out selected candles
    shuffledCandles
        .slice(0, amountToBlow)
        .forEach(function (candle) {

            candle.classList.add("out");

        });


    // ========================================================
    // CHECK IF ALL CANDLES ARE OUT
    // ========================================================

    const allCandlesOut = candles.every(function (candle) {

        return candle.classList.contains("out");

    });


    if (allCandlesOut) {

        setTimeout(function () {

            celebrate();

        }, 500);

    }

}


// ============================================================
// START MICROPHONE
// ============================================================

async function startMic() {

    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        console.log(
            "Microphone access is not supported."
        );

        return;
    }


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                audio: true
            });


        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();


        analyser =
            audioContext.createAnalyser();


        analyser.fftSize = 256;


        microphone =
            audioContext.createMediaStreamSource(stream);


        microphone.connect(analyser);


        console.log("Microphone is ready!");


        // Check microphone every 200ms
        setInterval(function () {

            blowOutCandles();

        }, 200);


    } catch (error) {

        console.log(
            "Could not access microphone:",
            error
        );

    }

}


// ============================================================
// CELEBRATION
// ============================================================

function celebrate() {

    if (celebrationStarted) {
        return;
    }

    celebrationStarted = true;

    console.log("🎉 ALL CANDLES ARE OUT!");

    // Confetti
    triggerConfetti();

    // Endless confetti
    endlessConfetti();

    // Play music ONCE
    audio.play().catch(function (error) {
        console.log("Music playback was blocked:", error);
    });
}


// ============================================================
// CONFETTI
// ============================================================

function triggerConfetti() {

    confetti({

        particleCount: 200,

        spread: 100,

        startVelocity: 40,

        origin: {
            x: 0.5,
            y: 0.6
        }

    });

}


// ============================================================
// ENDLESS CONFETTI
// ============================================================

function endlessConfetti() {

    if (confettiStarted) {
        return;
    }


    confettiStarted = true;


    setInterval(function () {

        confetti({

            particleCount: 80,

            spread: 90,

            startVelocity: 30,

            origin: {
                x: Math.random(),
                y: 0
            }

        });

    }, 1000);

}


// ============================================================
// START MICROPHONE
// ============================================================

startMic();