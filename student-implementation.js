/**
 * WORDLE CLONE - STUDENT IMPLEMENTATION
 * 
 * Complete the functions below to create a working Wordle game.
 * Each function has specific requirements and point values.
 * 
 * GRADING BREAKDOWN:
 * - Core Game Functions (60 points): initializeGame, handleKeyPress, submitGuess, checkLetter, updateGameState
 * - Advanced Features (30 points): updateKeyboardColors, processRowReveal, showEndGameModal, validateInput
 */

// ========================================
// CORE GAME FUNCTIONS (60 POINTS TOTAL)
// ========================================

/**
 * Initialize a new game
 * POINTS: 10
 * 
 * Complete this function to:
 * - Reset all game state variables
 * - Get a random word from the word list
 * - Clear the game board
 * - Hide any messages or modals
 */
function initializeGame() {
    // TODO: Reset game state variables
    currentWord = WordleWords.getRandomWord().toUpperCase();  // Set this to a random word
    currentGuess = '';
    currentRow = 0;
    gameOver = false;
    gameWon = false;

    resetBoard();
    hideModal();
    
    // TODO: Get a random word from the word list
    // HINT: Use WordleWords.getRandomWord()
    
    // TODO: Reset the game board
    // HINT: Use resetBoard()
    
    // TODO: Hide any messages
    // HINT: Use hideModal() and ensure message element is hidden
    
    console.log('Game initialized!'); // Remove this line when implementing
}

/**
 * Handle keyboard input
 * POINTS: 15
 * 
 * TODO: Complete this function to:
 * - Process letter keys (A-Z)
 * - Handle ENTER key for word submission
 * - Handle BACKSPACE for letter deletion
 * - Update the display when letters are added/removed
 */
function handleKeyPress(key) {
    // TODO: Check if game is over - if so, return early
    if (!validateInput(key, currentGuess)) {
        return;
    }
    
    let pattern = /^[A-Z]$/
    if (pattern.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
            currentGuess += key;
            updateTileDisplay(getTile(currentRow, currentGuess.length - 1), key);
            return
        }
    } 
    if (key == "ENTER") {
        if (isGuessComplete()) {
            submitGuess();
        } else {
            console.warn('Please type a 5 letter word.');
            showMessage('Invalid Guess: Please type a 5 letter word', 'error', 5000);
        }
        return
    }
    if (key == "BACKSPACE") {
        if (currentGuess.length > 0) {
            currentGuess = currentGuess.substring(0, currentGuess.length - 1)
            updateTileDisplay(getTile(currentRow, currentGuess.length), '')
        }
    }

    // TODO: Handle letter keys (A-Z)
    
    // HINT: Use regex /^[A-Z]$/ to test if key is a letter
    // HINT: Check if currentGuess.length < WORD_LENGTH before adding
    // HINT: Use getTile() and updateTileDisplay() to show the letter
    
    // TODO: Handle ENTER key
    // HINT: Check if guess is complete using isGuessComplete()
    // HINT: Call submitGuess() if complete, show error message if not


    
    // TODO: Handle BACKSPACE key  
    // HINT: Check if there are letters to remove
    // HINT: Clear the tile display and remove from currentGuess
    
    console.log('Key pressed:', key); // Remove this line when implementing
}

/**
 * Submit and process a complete guess
 * POINTS: 20
 * 
 * TODO: Complete this function to:
 * - Validate the guess is a real word
 * - Check each letter against the target word
 * - Update tile colors and keyboard
 * - Handle win/lose conditions
 */
function submitGuess() {
    if (isGuessComplete() && WordleWords.isValidWord(currentGuess)) {
        let guess_results = ['', '', '', '', ''];
        let current_word_array = [currentWord[0], currentWord[1], currentWord[2], currentWord[3], currentWord[4]];

        for (let guess_index = 0; guess_index < 5; guess_index++) {
            let letter_result = checkLetter(currentGuess[guess_index], guess_index, current_word_array);
            if (letter_result == 'correct') {
                guess_results[guess_index] = 'correct';
                current_word_array[guess_index] = '-';
            }
        }
        for (let guess_index = 0; guess_index < 5; guess_index++) {
            if (guess_results[guess_index] == '') {
                let letter_result = checkLetter(currentGuess[guess_index], guess_index, current_word_array);
                if (letter_result == 'present') {
                    guess_results[guess_index] = 'present';
                    current_word_array[current_word_array.indexOf(currentGuess[guess_index].toUpperCase())] = '-';
                }
                if (letter_result == 'absent') {
                    guess_results[guess_index] = 'absent';
                }
            }
        }
        //let results_debug = guess_results[0] + guess_results[1] + guess_results[2] + guess_results[3] + guess_results[4]
        //showMessage(results_debug, 'error', 5000)

        for (let col_index = 0; col_index < 5; col_index++) {
            setTileState(getTile(currentRow, col_index), guess_results[col_index]);
        }
        updateKeyboardColors(currentGuess, guess_results);

        let isCorrect = (currentGuess.toUpperCase() == currentWord.toUpperCase());
        processRowReveal(currentRow, guess_results);
        updateGameState(isCorrect);

    } else {
        console.warn('Please type a valid 5 letter word.');
        showMessage('Invalid Guess: Please type a valid 5 letter word' + currentWord, 'error', 5000);
        shakeRow(currentRow);
        return;
    }
    
    // TODO: Validate guess is complete
    // HINT: Use isGuessComplete()
    
    // TODO: Validate guess is a real word
    // HINT: Use WordleWords.isValidWord()
    // HINT: Show error message and shake row if invalid
    
    // TODO: Check each letter and get results
    // HINT: Use checkLetter() for each position
    // HINT: Store results in an array
    
    // TODO: Update tile colors immediately
    // HINT: Loop through results and use setTileState()
    
    // TODO: Update keyboard colors
    // HINT: Call updateKeyboardColors()
    
    // TODO: Check if guess was correct
    // HINT: Compare currentGuess with currentWord
    
    // TODO: Update game state
    // HINT: Call updateGameState()
    
    // TODO: Move to next row if game continues
    // HINT: Increment currentRow and reset currentGuess
    
    console.log('Guess submitted:', currentGuess); // Remove this line when implementing
}

/**
 * Check a single letter against the target word
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Return 'correct' if letter matches position exactly
 * - Return 'present' if letter exists but wrong position
 * - Return 'absent' if letter doesn't exist in target
 * - Handle duplicate letters correctly (this is the tricky part!)
 */
function checkLetter(guessLetter, position, targetWord) {
    guessLetter = guessLetter.toUpperCase();
    
    if (guessLetter == targetWord[position]) {
        return 'correct';
    }

    if (targetWord.indexOf(guessLetter) > -1) {
        return 'present';
    } else {
        return 'absent';
    }
    
    console.log('Checking letter:', guessLetter, 'at position:', position); // Remove this line
    return 'absent'; // Replace with actual logic
}

/**
 * Update game state after a guess
 * POINTS: 5
 * 
 * TODO: Complete this function to:
 * - Check if player won (guess matches target)
 * - Check if player lost (used all attempts)
 * - Show appropriate end game modal
 */
function updateGameState(isCorrect) {
    if (isCorrect) {
        gameWon = true;
        gameOver = true;
        showEndGameModal(gameWon, currentWord);
    } else {
        if (currentRow >= MAX_GUESSES - 1) {
            gameOver = true;
            showEndGameModal(gameWon, currentWord);
        } else {
            currentRow += 1;
            currentGuess = '';
        }
    }
    
    // TODO: Handle win condition
    // HINT: Set gameWon and gameOver flags, call showEndGameModal
    
    // TODO: Handle lose condition  
    // HINT: Check if currentRow >= MAX_GUESSES - 1
    
    console.log('Game state updated. Correct:', isCorrect); // Remove this line
}

// ========================================
// ADVANCED FEATURES (30 POINTS TOTAL)
// ========================================

/**
 * Update keyboard key colors based on guessed letters
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Update each key with appropriate color
 * - Maintain color priority (green > yellow > gray)
 * - Don't downgrade key colors
 */
function updateKeyboardColors(guess, results) {
    for (let col_index = 0; col_index < 5; col_index++) {
        updateKeyboardKey(guess[col_index], results[col_index]);
    }
    
    // TODO: Loop through each letter in the guess
    
    // TODO: Get the keyboard key element
    // HINT: Use document.querySelector with [data-key="LETTER"]
    
    // TODO: Apply color with priority system
    // HINT: Don't change green keys to yellow or gray
    // HINT: Don't change yellow keys to gray
    
    console.log('Updating keyboard colors for:', guess); // Remove this line
}

/**
 * Process row reveal (simplified - no animations needed)
 * POINTS: 5 (reduced from 15 since animations removed)
 * 
 * TODO: Complete this function to:
 * - Check if all letters were correct
 * - Trigger celebration if player won this round
 */
function processRowReveal(rowIndex, results) {
    let matches = true;
    for (let i = 0; i < 5; i++) {
        if (results[i] != 'correct') {
            matches = false;
        }
    }
    if (matches) { 
        celebrateRow(currentRow);
    }
    // TODO: Check if all results are 'correct'
    // HINT: Use results.every() method
    
    // TODO: If all correct, trigger celebration
    // HINT: Use celebrateRow() function
    
    console.log('Processing row reveal for row:', rowIndex); // Remove this line
}

/**
 * Show end game modal with results
 * POINTS: 10
 * 
 * TODO: Complete this function to:
 * - Display appropriate win/lose message
 * - Show the target word
 * - Update game statistics
 */
function showEndGameModal(won, targetWord) {
    updateStats(won);
    showModal(won, targetWord, currentRow + 1);
    
    
    // TODO: Create appropriate message based on won parameter
    // HINT: For wins, include number of guesses used
    // HINT: For losses, reveal the target word
    
    // TODO: Update statistics
    // HINT: Use updateStats() function
    
    // TODO: Show the modal
    // HINT: Use showModal() function
    
    console.log('Showing end game modal. Won:', won, 'Word:', targetWord); // Remove this line
}

/**
 * Validate user input before processing
 * POINTS: 5
 * 
 * TODO: Complete this function to:
 * - Check if game is over
 * - Validate letter keys (only if guess not full)
 * - Validate ENTER key (only if guess complete)
 * - Validate BACKSPACE key (only if letters to remove)
 */
function validateInput(key, currentGuess) {
    if (gameOver) {
        return false;
    } 

    let pattern = /^[A-Z]$/
    if (pattern.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
            return true;
        }
    } 
    if (key == "ENTER") {
        if (isGuessComplete()) {
            return true;
        } 
    }
    if (key == "BACKSPACE") {
        if (currentGuess.length > 0) {
            return true;
        }
    }
    return false;
    // TODO: Return false if game is over
    
    // TODO: Handle letter keys
    // HINT: Check if currentGuess.length < WORD_LENGTH
    
    // TODO: Handle ENTER key
    // HINT: Check if currentGuess.length === WORD_LENGTH
    
    // TODO: Handle BACKSPACE key
    // HINT: Check if currentGuess.length > 0
    
    console.log('Validating input:', key); // Remove this line
    return true; // Replace with actual validation logic
}

// ========================================
// DEBUGGING HELPERS (REMOVE BEFORE SUBMISSION)
// ========================================

// Uncomment these lines for debugging help:
// console.log('Current word:', currentWord);
// console.log('Current guess:', currentGuess);
// console.log('Current row:', currentRow);

console.log('Student implementation template loaded. Start implementing the functions above!'); 