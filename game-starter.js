/**
 * WORDLE CLONE - STARTER CODE
 * 
 * This file provides the basic structure and utility functions for the Wordle game.
 * Students will implement the core game logic in student-implementation.js
 * 
 * PROVIDED FUNCTIONALITY:
 * - DOM element references
 * - Game constants
 * - Utility functions for DOM manipulation
 * - Event listeners for keyboard input
 * - Basic animation helpers
 * - Game state management structure
 */

// ========================================
// GAME CONSTANTS
// ========================================

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;
const FLIP_ANIMATION_DURATION = 600; // milliseconds
const DANCE_ANIMATION_DURATION = 600; // milliseconds

// ========================================
// DOM ELEMENT REFERENCES
// ========================================

// Game board elements
const gameBoard = document.getElementById('game-board');
const tiles = document.querySelectorAll('.tile');
const tileRows = document.querySelectorAll('.tile-row');

// Keyboard elements
const keyboard = document.getElementById('keyboard');
const keys = document.querySelectorAll('.key');

// UI elements
const messageElement = document.getElementById('message');
const resetButton = document.getElementById('reset-button');

// Modal elements
const modal = document.getElementById('game-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalWord = document.getElementById('modal-word');
const modalClose = document.getElementById('modal-close');
const playAgainButton = document.getElementById('play-again');

// Statistics elements
const gamesPlayedElement = document.getElementById('games-played');
const winPercentageElement = document.getElementById('win-percentage');
const currentStreakElement = document.getElementById('current-streak');
const maxStreakElement = document.getElementById('max-streak');

// ========================================
// GAME STATE VARIABLES
// ========================================
// Students will use and modify these in their implementation

let currentWord = '';        // The target word for the current game
let currentGuess = '';       // The current guess being typed
let currentRow = 0;          // Current row (0-5)
let gameOver = false;        // Whether the game has ended
let gameWon = false;         // Whether the player won
let gameStats = {            // Game statistics
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0
};

// ========================================
// UTILITY FUNCTIONS FOR DOM MANIPULATION
// ========================================

/**
 * Get a specific tile element by row and column
 * @param {number} row - Row index (0-5)
 * @param {number} col - Column index (0-4)
 * @returns {HTMLElement|null} The tile element or null if not found
 */
function getTile(row, col) {
    return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
}

/**
 * Get all tiles in a specific row
 * @param {number} row - Row index (0-5)
 * @returns {NodeList} All tile elements in the row
 */
function getRowTiles(row) {
    return document.querySelectorAll(`[data-row="${row}"]`);
}

/**
 * Update a tile's display with a letter
 * @param {HTMLElement} tile - The tile element to update
 * @param {string} letter - The letter to display
 */
function updateTileDisplay(tile, letter) {
    if (!tile) return;
    
    tile.textContent = letter.toUpperCase();
    
    if (letter) {
        tile.classList.add('filled');
        // Add typing animation
        tile.classList.add('no-animation');
        tile.offsetHeight; // Force reflow
        tile.classList.remove('no-animation');
    } else {
        tile.classList.remove('filled');
    }
}

/**
 * Set a tile's color state (correct, present, absent)
 * @param {HTMLElement} tile - The tile element to update
 * @param {string} state - The state: 'correct', 'present', or 'absent'
 */
function setTileState(tile, state) {
    if (!tile) return;
    
    // Remove any existing state classes
    tile.classList.remove('correct', 'present', 'absent');
    
    // Add the new state class
    if (state) {
        tile.classList.add(state);
    }
}

/**
 * Update a keyboard key's color state
 * @param {string} key - The key letter
 * @param {string} state - The state: 'correct', 'present', or 'absent'
 */
function updateKeyboardKey(key, state) {
    const keyElement = document.querySelector(`[data-key="${key.toUpperCase()}"]`);
    if (!keyElement) return;

    // Don't downgrade key colors (correct > present > absent)
    const currentClasses = keyElement.classList;
    
    if (state === 'correct') {
        keyElement.classList.remove('present', 'absent');
        keyElement.classList.add('correct');
    } else if (state === 'present' && !currentClasses.contains('correct')) {
        keyElement.classList.remove('absent');
        keyElement.classList.add('present');
    } else if (state === 'absent' && !currentClasses.contains('correct') && !currentClasses.contains('present')) {
        keyElement.classList.add('absent');
    }
}

/**
 * Show a message to the user
 * @param {string} text - The message text
 * @param {string} type - Message type: 'success', 'error', or 'info'
 * @param {number} duration - How long to show the message (ms), default 2000
 */
function showMessage(text, type = 'info', duration = 2000) {
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    
    // Force reflow and show
    messageElement.offsetHeight;
    
    setTimeout(() => {
        messageElement.classList.add('hidden');
    }, duration);
}

/**
 * Show the game over modal
 * @param {boolean} won - Whether the player won
 * @param {string} word - The target word
 * @param {number} guesses - Number of guesses used (if won)
 */
function showModal(won, word, guesses = 0) {
    modalTitle.textContent = won ? 'Congratulations!' : 'Game Over';
    
    if (won) {
        const guessText = guesses === 1 ? 'guess' : 'guesses';
        modalMessage.textContent = `You solved it in ${guesses} ${guessText}!`;
    } else {
        modalMessage.textContent = `The word was:`;
    }
    
    modalWord.textContent = word;
    
    // Update statistics display
    updateStatsDisplay();
    
    modal.classList.remove('hidden');
}

/**
 * Hide the game over modal
 */
function hideModal() {
    modal.classList.add('hidden');
}

/**
 * Update the statistics display in the modal
 */
function updateStatsDisplay() {
    gamesPlayedElement.textContent = gameStats.gamesPlayed;
    
    const winPercentage = gameStats.gamesPlayed > 0 
        ? Math.round((gameStats.gamesWon / gameStats.gamesPlayed) * 100)
        : 0;
    winPercentageElement.textContent = winPercentage;
    
    currentStreakElement.textContent = gameStats.currentStreak;
    maxStreakElement.textContent = gameStats.maxStreak;
}

/**
 * Reset the game board to initial state
 */
function resetBoard() {
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.className = 'tile';
    });
    
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });
    
    tileRows.forEach(row => {
        row.classList.remove('shake', 'celebrate');
    });
    
    messageElement.classList.add('hidden');
}

/**
 * Add shake animation to current row (for invalid words)
 */
function shakeRow(rowIndex) {
    const row = tileRows[rowIndex];
    if (row) {
        row.classList.add('shake');
        setTimeout(() => {
            row.classList.remove('shake');
        }, 600);
    }
}

/**
 * Add celebration animation to a row (for correct guesses)
 */
function celebrateRow(rowIndex) {
    const row = tileRows[rowIndex];
    if (row) {
        row.classList.add('celebrate');
        // Animation will be removed by CSS after completion
    }
}

/**
 * Add flip animation to tiles in a row
 * @param {number} rowIndex - The row to animate
 * @param {Array} states - Array of states for each tile ['correct', 'present', 'absent']
 * @param {Function} callback - Function to call when animation completes
 */
function flipRowTiles(rowIndex, states, callback) {
    const rowTiles = getRowTiles(rowIndex);
    let completedAnimations = 0;
    
    rowTiles.forEach((tile, index) => {
        // Delay each tile's animation slightly
        setTimeout(() => {
            tile.classList.add('flip');
            
            // Set the final state halfway through the flip
            setTimeout(() => {
                if (states[index]) {
                    setTileState(tile, states[index]);
                }
                
                // Remove flip class when animation completes
                setTimeout(() => {
                    tile.classList.remove('flip');
                    completedAnimations++;
                    
                    // Call callback when all animations complete
                    if (completedAnimations === rowTiles.length && callback) {
                        callback();
                    }
                }, FLIP_ANIMATION_DURATION / 2);
                
            }, FLIP_ANIMATION_DURATION / 2);
            
        }, index * 100); // Stagger the animations
    });
}

/**
 * Load game statistics from localStorage
 */
function loadStats() {
    const saved = localStorage.getItem('wordle-stats');
    if (saved) {
        try {
            gameStats = { ...gameStats, ...JSON.parse(saved) };
        } catch (e) {
            console.warn('Could not load saved statistics');
        }
    }
}

/**
 * Save game statistics to localStorage
 */
function saveStats() {
    try {
        localStorage.setItem('wordle-stats', JSON.stringify(gameStats));
    } catch (e) {
        console.warn('Could not save statistics');
    }
}

/**
 * Update game statistics after a game ends
 * @param {boolean} won - Whether the player won
 */
function updateStats(won) {
    gameStats.gamesPlayed++;
    
    if (won) {
        gameStats.gamesWon++;
        gameStats.currentStreak++;
        gameStats.maxStreak = Math.max(gameStats.maxStreak, gameStats.currentStreak);
    } else {
        gameStats.currentStreak = 0;
    }
    
    saveStats();
}

// ========================================
// EVENT LISTENERS
// ========================================

/**
 * Handle physical keyboard input
 */
document.addEventListener('keydown', (event) => {
    if (gameOver) return;
    
    const key = event.key.toUpperCase();
    
    // Handle letter keys
    if (/^[A-Z]$/.test(key)) {
        // Add visual feedback to physical key press
        const keyElement = document.querySelector(`[data-key="${key}"]`);
        if (keyElement) {
            keyElement.classList.add('pressed');
            setTimeout(() => keyElement.classList.remove('pressed'), 100);
        }
        
        // Students will implement this function
        if (typeof handleKeyPress === 'function') {
            handleKeyPress(key);
        }
    }
    // Handle Enter key
    else if (key === 'ENTER') {
        event.preventDefault();
        const enterKey = document.querySelector('[data-key="ENTER"]');
        if (enterKey) {
            enterKey.classList.add('pressed');
            setTimeout(() => enterKey.classList.remove('pressed'), 100);
        }
        
        if (typeof handleKeyPress === 'function') {
            handleKeyPress('ENTER');
        }
    }
    // Handle Backspace key
    else if (key === 'BACKSPACE') {
        event.preventDefault();
        const backspaceKey = document.querySelector('[data-key="BACKSPACE"]');
        if (backspaceKey) {
            backspaceKey.classList.add('pressed');
            setTimeout(() => backspaceKey.classList.remove('pressed'), 100);
        }
        
        if (typeof handleKeyPress === 'function') {
            handleKeyPress('BACKSPACE');
        }
    }
});

/**
 * Handle on-screen keyboard clicks
 */
keyboard.addEventListener('click', (event) => {
    if (gameOver) return;
    
    const key = event.target.closest('.key');
    if (!key) return;
    
    const keyValue = key.dataset.key;
    
    // Add visual feedback
    key.classList.add('pressed');
    setTimeout(() => key.classList.remove('pressed'), 100);
    
    // Students will implement this function
    if (typeof handleKeyPress === 'function') {
        handleKeyPress(keyValue);
    }
});

/**
 * Handle reset button click
 */
resetButton.addEventListener('click', () => {
    // Students will implement this function
    if (typeof initializeGame === 'function') {
        initializeGame();
    }
});

/**
 * Handle modal close button
 */
modalClose.addEventListener('click', hideModal);

/**
 * Handle play again button
 */
playAgainButton.addEventListener('click', () => {
    hideModal();
    // Students will implement this function
    if (typeof initializeGame === 'function') {
        initializeGame();
    }
});

/**
 * Close modal when clicking outside of it
 */
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        hideModal();
    }
});

// ========================================
// INITIALIZATION
// ========================================

/**
 * Initialize the game when the page loads
 */
document.addEventListener('DOMContentLoaded', () => {
    loadStats();

    // Students will implement this function
    if (typeof initializeGame === 'function') {
        initializeGame();
    } else {
        console.warn('initializeGame function not found. Students need to implement this in student-implementation.js');
        showMessage('Game functions not implemented yet!', 'error', 5000);
    }
});

// ========================================
// HELPER FUNCTIONS FOR STUDENTS
// ========================================

/**
 * Check if the current guess is complete (5 letters)
 * @returns {boolean} True if current guess has 5 letters
 */
function isGuessComplete() {
    return currentGuess.length === WORD_LENGTH;
}

/**
 * Check if there are more guesses available
 * @returns {boolean} True if more guesses are available
 */
function hasGuessesLeft() {
    return currentRow < MAX_GUESSES;
}

/**
 * Get the current guess as an uppercase string
 * @returns {string} The current guess in uppercase
 */
function getCurrentGuess() {
    return currentGuess.toUpperCase();
}

/**
 * Get the target word for the current game
 * @returns {string} The target word in uppercase
 */
function getTargetWord() {
    return currentWord.toUpperCase();
}

// Log that starter code has loaded
console.log('Wordle starter code loaded successfully!');
console.log('Students should implement functions in student-implementation.js'); 