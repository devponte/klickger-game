// Initialize Variables
let clicks = 0;
let autoClickerCount = 0;
let clickMultiplier = 1;
let autoClickerPrice = 10;
let multiplierPrice = 20;

// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT_ID.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database(app);
const leaderboardRef = firebase.database().ref("leaderboard");

// DOM Elements
const clickButton = document.getElementById('clickButton');
const clickCountDisplay = document.getElementById('clickCount');
const autoClickerButton = document.getElementById('autoClicker');
const multiplierButton = document.getElementById('multiplier');

// Save and Load Game Data
function saveGame() {
  const gameData = {
    clicks: clicks,
    autoClickerCount: autoClickerCount,
    clickMultiplier: clickMultiplier,
    autoClickerPrice: autoClickerPrice,
    multiplierPrice: multiplierPrice
  };
  localStorage.setItem('klickgerSave', JSON.stringify(gameData));
}

function loadGame() {
  const savedData = JSON.parse(localStorage.getItem('klickgerSave'));
  if (savedData) {
    clicks = savedData.clicks || 0;
    autoClickerCount = savedData.autoClickerCount || 0;
    clickMultiplier = savedData.clickMultiplier || 1;
    autoClickerPrice = savedData.autoClickerPrice || 10;
    multiplierPrice = savedData.multiplierPrice || 20;
  }
  updateDisplay();
}

// Update Display
function updateDisplay() {
  clickCountDisplay.textContent = clicks.toLocaleString();
  autoClickerButton.textContent = `Auto Clicker (Cost: ${autoClickerPrice})`;
  multiplierButton.textContent = `Multiplier x${clickMultiplier} (Cost: ${multiplierPrice})`;

  autoClickerButton.disabled = clicks < autoClickerPrice;
  multiplierButton.disabled = clicks < multiplierPrice;
}

// Handle Clicks
clickButton.addEventListener('click', () => {
  clicks += 1 * clickMultiplier;
  updateDisplay();
});

// Auto Clicker
autoClickerButton.addEventListener('click', () => {
  if (clicks >= autoClickerPrice) {
    clicks -= autoClickerPrice;
    autoClickerCount++;
    autoClickerPrice = Math.ceil(autoClickerPrice * 1.5);

    if (autoClickerCount === 1) {
      setInterval(() => {
        clicks += autoClickerCount * clickMultiplier;
        updateDisplay();
      }, 1000);
    }
    updateDisplay();
  }
});

// Multiplier
multiplierButton.addEventListener('click', () => {
  if (clicks >= multiplierPrice) {
    clicks -= multiplierPrice;
    clickMultiplier *= 2;
    multiplierPrice = Math.ceil(multiplierPrice * 2);
    updateDisplay();
  }
});

// Leaderboard Functions
function saveScore(username) {
  leaderboardRef.push({
    username: username,
    score: clicks
  });
}

function loadLeaderboard() {
  leaderboardRef.orderByChild("score").limitToLast(10).on("value", (snapshot) => {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = "<h2>Leaderboard</h2>";
    const scores = [];
    snapshot.forEach((childSnapshot) => {
      scores.push(childSnapshot.val());
    });
    scores.reverse().forEach((entry, index) => {
      const div = document.createElement("div");
      div.textContent = `${index + 1}. ${entry.username}: ${entry.score}`;
      leaderboard.appendChild(div);
    });
  });
}

// Username Prompt and Leaderboard Initialization
let username = localStorage.getItem("klickgerUsername") || prompt("Enter your username:");
if (!username) username = "Anonymous";
localStorage.setItem("klickgerUsername", username);

window.addEventListener("beforeunload", () => saveScore(username));
loadLeaderboard();

// Save game frequently
setInterval(saveGame, 1000);
loadGame();
updateDisplay();
