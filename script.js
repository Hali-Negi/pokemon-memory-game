let flippedCards = [];
let lockBoard = false;

let clickCount = 0;
let matchedCount = 0;
let totalPairs = 3; 

let timer; 
let timeLeft = 0; 

const clicksDisplay = document.getElementById("clicks");
const matchedDisplay = document.getElementById("matched");
const leftDisplay = document.getElementById("left");
const timerDisplay = document.getElementById("timer");
const message = document.getElementById("message");

const difficultySelect = document.getElementById("difficulty");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const gameBoard = document.getElementById("gameBoard");
const powerUpBtn = document.getElementById("powerUpBtn"); 
const themeSwitch = document.getElementById("themeSwitch"); 
let powerUpUsed = false; 

// Reusable message function
function showMessage(text, bg, border, color = "#000") {
  message.textContent = text;
  message.style.background = bg;
  message.style.borderColor = border;
  message.style.color = color;
  message.classList.remove("hidden");
}

// Shuffle an array 
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

//  ResetGame 
function resetGame() {
  clearInterval(timer); 
  gameBoard.innerHTML = ""; 
  message.classList.add("hidden"); 
  lockBoard = false; 
  flippedCards = []; 

  // Reset game statistics
  clickCount = 0;
  matchedCount = 0;


  const currentDifficulty = difficultySelect.value;
  if (currentDifficulty === "easy") {
    totalPairs = 3;
  } else if (currentDifficulty === "medium") {
    totalPairs = 6;
  } else if (currentDifficulty === "hard") {
    totalPairs = 9;
  } else {
    totalPairs = 3; 
  }

  clicksDisplay.textContent = clickCount;
  matchedDisplay.textContent = matchedCount;
  leftDisplay.textContent = totalPairs; 
  
  // Set time to 0 
  timeLeft = 0; 
  timerDisplay.textContent = timeLeft; 
  

  powerUpUsed = false; 
  console.log("Game has been reset. Timer set to 0. Cards cleared.");
}

// startGame 
async function startGame(difficulty = "easy") {
 
  clearInterval(timer);
  gameBoard.innerHTML = ""; 
  lockBoard = false;
  flippedCards = [];
  message.classList.add("hidden");
  powerUpUsed = false; 

  // Set game parameters based on difficulty
  if (difficulty === "easy") {
    totalPairs = 3;
    timeLeft = 60; 
  } else if (difficulty === "medium") {
    totalPairs = 6;
    timeLeft = 90; 
  } else if (difficulty === "hard") {
    totalPairs = 9;
    timeLeft = 120; 
  }

  // Reset and update displays for the new game
  clickCount = 0;
  matchedCount = 0;
  clicksDisplay.textContent = clickCount;
  matchedDisplay.textContent = matchedCount;
  leftDisplay.textContent = totalPairs;
  timerDisplay.textContent = timeLeft;

  console.log("Starting game. Timer set to:", timeLeft);

  // Start the game timer
  timer = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      showMessage(
        "Time's up! Try again!",
        "linear-gradient(to right, #f44336, #e57373)",
        "#c62828",
        "#ffffff"
      );
      lockBoard = true;
    }
  }, 1000);

  // Fetch Pokémon and create cards
  const pokemonIndexes = [];
  while (pokemonIndexes.length < totalPairs) {
    const rand = Math.floor(Math.random() * 150) + 1; 
    if (!pokemonIndexes.includes(rand)) {
      pokemonIndexes.push(rand);
    }
  }

  const cardData = [];
  try {
    for (const id of pokemonIndexes) {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch Pokémon ${id}: ${res.statusText}`);
      }
      const data = await res.json();
      const img = data.sprites.other["official-artwork"].front_default;
      if (!img) {
        console.warn(`No official-artwork found for Pokémon ID ${id}, using default sprite.`);
        continue;
      }
      cardData.push({ id, img });
      cardData.push({ id, img }); 
    }
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);
    showMessage("Error loading Pokémon! Please try again.", "red", "darkred", "white");
    return; 
  }


  shuffleArray(cardData);

  cardData.forEach((poke) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.setAttribute("data-pokemon", poke.id);

    card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <img src="${poke.img}" alt="Pokemon">
                </div>
                <div class="card-back">
                    <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/509.png" alt="Purrloin Card Back">
                </div>
            </div>
        `;

    card.addEventListener("click", handleCardClick);
    gameBoard.appendChild(card);
  });
}

// Card Click Handler
function handleCardClick() {
  if (lockBoard) return; 

  const card = this; 
  const inner = card.querySelector(".card-inner");

  // If card is already flipped or matched, do nothing
  if (flippedCards.includes(card) || inner.classList.contains("flipped")) {
    return;
  }

  inner.classList.add("flipped");
  flippedCards.push(card);

  clickCount++;
  clicksDisplay.textContent = clickCount;

  if (flippedCards.length === 2) {
    lockBoard = true; 
    const card1 = flippedCards[0];
    const card2 = flippedCards[1];

    const type1 = card1.getAttribute("data-pokemon");
    const type2 = card2.getAttribute("data-pokemon");

    if (type1 === type2) { 
      matchedCount++;
      matchedDisplay.textContent = matchedCount;
      leftDisplay.textContent = totalPairs - matchedCount;

 
      card1.classList.add("matched"); 
      card2.classList.add("matched");

      flippedCards = []; 
      lockBoard = false; 

      if (matchedCount === totalPairs) { 
        clearInterval(timer); 
        setTimeout(() => {
          showMessage(
            "You win! All pairs matched!",
            "linear-gradient(to right, #81c784, #aed581)",
            "#2e7d32",
            "#1b5e20"
          );
        }, 300); 
      }
    } else { 
    
      setTimeout(() => {
        card1.querySelector(".card-inner").classList.remove("flipped");
        card2.querySelector(".card-inner").classList.remove("flipped");
        flippedCards = []; 
        lockBoard = false; 
      }, 1000); 
    }
  }
}



startBtn.addEventListener("click", () => {
  const selectedDifficulty = difficultySelect.value;
  startGame(selectedDifficulty);
});

resetBtn.addEventListener("click", () => {
  resetGame(); 
});


document.body.classList.add("light-mode"); 

themeSwitch.addEventListener("change", () => {
  document.body.classList.toggle("dark-mode");
  document.body.classList.toggle("light-mode");
});

powerUpBtn.addEventListener("click", () => {
  if (powerUpUsed) {
    showMessage(
      "Power-up already used!",
      "linear-gradient(to right, #ffeb3b, #ffc107)",
      "#ff9800",
      "#212121"
    );
    setTimeout(() => {
      message.classList.add("hidden");
    
    }, 3000);
    return;
  }

  if (timeLeft <= 0 && matchedCount < totalPairs) { 
      showMessage(
        "Start a game to use the power-up!",
        "linear-gradient(to right, #ffeb3b, #ffc107)",
        "#ff9800",
        "#212121"
      );
      setTimeout(() => message.classList.add("hidden"), 3000);
      return;
  }


  const allCardsInner = document.querySelectorAll(".card-inner");
  allCardsInner.forEach((cardInner) => {
   
    if (!cardInner.parentElement.classList.contains("matched")) {
        cardInner.classList.add("flipped");
    }
  });

  powerUpUsed = true;
  lockBoard = true;

  setTimeout(() => {
    allCardsInner.forEach((cardInner) => {
    
      if (!cardInner.parentElement.classList.contains("matched")) {
        cardInner.classList.remove("flipped");
      }
    });
    if (matchedCount < totalPairs && timeLeft > 0) { 
        lockBoard = false;
    }
  }, 3000); 
});


function initializeGameDisplay() {
    const initialDifficulty = difficultySelect.value;
    if (initialDifficulty === "easy") totalPairs = 3;
    else if (initialDifficulty === "medium") totalPairs = 6;
    else if (initialDifficulty === "hard") totalPairs = 9;
    leftDisplay.textContent = totalPairs;
    timerDisplay.textContent = "--"; 
    clicksDisplay.textContent = 0;
    matchedDisplay.textContent = 0;
}


initializeGameDisplay();
difficultySelect.addEventListener("change", initializeGameDisplay);