'use strict'

//* gBoard – A Matrix containing cell objects

/*
//* cell: {
 minesAroundCount: 4,
 isShown: false,
 isMine: false,
 isMarked: true */

/*
//* gLevel = {
 SIZE: 4,
 MINES: 2
} */

/*
//* gGame = {
 isOn: true,
 isFirstClick : true,
 isHint : false,
 shownCount: 0,
 markedCount: 0,
 hintCount: 3,
 secsPassed: 0
 lives: 3
} */

/*//*g Leaderboard = [{
  name : Dima
  time : 05:00
}],...] */

//*--------------Global Variables---------------------*//

var gBoard
var gLevel
var gGame
var gLeaderboard
var gTimer

const BOMB = '💣'
const FLAG = '🚩'

//* INIT

/* This is called when page loads  */
function onInit(difficulty) {
  clickSound()
  gBoard = []

  gLeaderboard = []

  difficultySetup(difficulty)

  gGame = {
    isFirstClick: true,
    isOn: true,
    isHint: false,
    shownCount: 0,
    markedCount: 0,
    hintCount: gLevel.HINTS,
    livesCount: gLevel.LIVES,
  }

  gBoard = buildBoard(gLevel.SIZE)

  clearInterval(gTimer)
  gTimer = 0

  renderTimer()
  renderLives()
  renderHints()
  renderMines()
  renderResetButtonEmoji('reset')
  renderBoard(gBoard)
  renderLeaderboard()
  leaderboardRenderOperations('hide')
}

function startup(){
  const elStartUpContainer = document.querySelector('.startup-container')
  elStartUpContainer.classList.add('hidden')
}

/* Builds the board 
Set the mines
Call setMinesNegsCount()
Return the created board */
function buildBoard(rows, cols = rows) {
  const board = []
  for (var i = 0; i < rows; i++) {
    board[i] = []
    for (var j = 0; j < cols; j++) {
      const cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      }
      board[i][j] = cell
    }
  }
  generateMines(board, gLevel.MINES)
  setMinesNegsCount(board)
  return board
}

//Generates mines onto the board
function generateMines(board, numOfMines) {
  for (let i = 0; i < +numOfMines; i++) {
    const pos = findEmptyCell(board)
    board[pos.i][pos.j].isMine = true
  }
}

function findEmptyCell(board) {
  var emptyCells = []
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
      if (!board[i][j].isMine && !board[i][j].isShown) {
        emptyCells.push({
          i,
          j,
        })
      }
    }
  }
  if (emptyCells.length === 0) return null
  return emptyCells.splice(getRandomInteger(0, emptyCells.length), 1)[0]
}

function generateTdHTMLString(board, i, j) {
  var HTMLstr = ''
  HTMLstr += `<td>
      <button class="
        cell-btn 
        cell-btn-${i}-${j} 
        ${board[i][j].isShown ? 'shown' : ''}
      " 
      onclick="onCellClicked(this,${i},${j})" 
      oncontextmenu="onCellMarked(this,${i},${j})"
      >
      <div class="
        inner-cell 
        inner-cell-${i}-${j} 
        ${board[i][j].isShown ? '' : 'hidden'}">
          <p>${
            board[i][j].isMine ? `${BOMB}` : `${board[i][j].minesAroundCount}`
          }</p>
      </div></button></td>\n`
  return HTMLstr
}

/* Count mines around each cell 
and set the cell's 
minesAroundCount. */
function setMinesNegsCount(board) {
  for (let idxI = 0; idxI < board.length; idxI++) {
    for (let idxJ = 0; idxJ < board.length; idxJ++) {
      var minesCount = 0
      for (let i = idxI - 1; i <= idxI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (let j = idxJ - 1; j <= idxJ + 1; j++) {
          if (j < 0 || j >= board[i].length) continue
          if (i === idxI && j === idxJ) continue
          if (board[i][j].isMine) minesCount++
        }
      }
      const currentCell = board[idxI][idxJ]
      currentCell.minesAroundCount = minesCount === 0 ? ' ' : minesCount
    }
  }
}

function difficultySetup(difficulty) {
  switch (difficulty) {
    case 'easy':
      gLevel = {
        SIZE: 6,
        MINES: 5,
        LIVES: 3,
        HINTS: 3,
        DIFFICULTY: 'EASY',
      }
      break
    case 'normal':
      gLevel = {
        SIZE: 12,
        MINES: 22,
        LIVES: 3,
        HINTS: 3,
        DIFFICULTY: 'NORM',
      }
      break
    case 'hard':
      gLevel = {
        SIZE: 14,
        MINES: 32,
        LIVES: 3,
        HINTS: 3,
        DIFFICULTY: 'HARD',
      }
      break
  }
}

//* PLAYING BOARD AND BUTTON LOGIC

/* Called when a cell is clicked */
function onCellClicked(elCell, i, j) {
  if (gGame.isFirstClick) {
    if (!gGame.isHint) startTimer()
  }

if (gGame.isHint) {
  selectCellHint(i, j)
  return
}

  if (gBoard[i][j].isMarked || !gGame.isOn || gBoard[i][j].isShown) return

  if (gGame.isFirstClick && gBoard[i][j].isMine) {
    handleFirstClick(elCell, i, j)
    // return
  }
  
  gGame.isFirstClick = false
  if (gBoard[i][j].minesAroundCount === ' ') expandShown(elCell, i, j)
  if (gBoard[i][j].isMine) {
    bombSound()
    loseState(elCell, i, j)
    return
  }

  if (!gBoard[i][j].isShown) gGame.shownCount++
  gBoard[i][j].isShown = true

  const elCellText = elCell.querySelector('.inner-cell')
  elCellText.classList.remove('hidden')
  elCellText.innerText = gBoard[i][j].minesAroundCount
  elCell.classList.add('shown')
  elCell.disabled = 'true'

  checkGameOver()
}

/* When user clicks a cell with no 
mines around, we need to open 
not only that cell, but also its 
neighbors. 
NOTE: start with a basic 
implementation that only opens 
the non-mine 1st degree 
neighbors
BONUS: if you have the time 
later, try to work more like the 
real algorithm (see description 
at the Bonuses section below)
 */
function expandShown(elCell, idxI, idxJ) {
  gGame.isFirstClick = false
  if (
    gBoard[idxI][idxJ].minesAroundCount !== ' ' ||
    gBoard[idxI][idxJ].isShown ||
    gBoard[idxI][idxJ].isMine
  )
    return

  if (!gBoard[idxI][idxJ].isShown) gGame.shownCount++
  gBoard[idxI][idxJ].isShown = true

  const elCellText = elCell.querySelector(`.inner-cell-${idxI}-${idxJ}`)
  elCellText.classList.remove('hidden')
  elCellText.innerText = gBoard[idxI][idxJ].minesAroundCount
  elCell.classList.add('shown')
  elCell.disabled = 'true'

  if (gBoard[idxI][idxJ].minesAroundCount === ' ') {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
      if (i < 0 || i > gBoard.length - 1) continue
      for (var j = idxJ - 1; j <= idxJ + 1; j++) {
        if (j < 0 || j > gBoard[i].length - 1) continue
        const targetCell = document.querySelector(`.cell-btn-${i}-${j}`)
        onCellClicked(targetCell, i, j)
      }
    }
  }
}

function handleFirstClick(elCell, i, j) {
  gGame.isFirstClick = false

  const currCell = gBoard[i][j]

  currCell.isMine = false
  currCell.isShown = true

  elCell.querySelector('.inner-cell').innerHTML = ''
  elCell.classList.remove('hidden')
  elCell.classList.add('shown')

  generateMines(gBoard, 1)
  setMinesNegsCount(gBoard)
  renderBoard(gBoard)
}

function selectCellHint(idxI, idxJ) {
  gGame.hintCount--
  for (let i = idxI - 1; i <= idxI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue

    for (let j = idxJ - 1; j <= idxJ + 1; j++) {
      if (j < 0 || j >= gBoard[i].length) continue
      const elCurrInnerCell = document.querySelector(`.inner-cell-${i}-${j}`)
      const elCurrCellbtn = document.querySelector(`.cell-btn-${i}-${j}`)
      clearTimeout(highlightTimer1)
      clearTimeout(highlightTimer2)
      var highlightTimer1 = 0
      var highlightTimer2 = 0
      if (elCurrInnerCell.classList.contains('hidden')) {
        elCurrInnerCell.classList.remove('hidden')
        elCurrCellbtn.classList.add('selected')
        setTimeout(() => {
          elCurrInnerCell.classList.add('hidden')
          elCurrCellbtn.classList.remove('selected')
        }, 1500)
      }
      if (elCurrCellbtn.classList.contains('marked')) {
        console.log('test')
        elCurrCellbtn.classList.remove('marked')
        elCurrCellbtn.classList.add('selected')
        elCurrInnerCell.innerText = gBoard[i][j].isMine
          ? '💣'
          : gBoard[i][j].minesAroundCount

        setTimeout(() => {
          elCurrCellbtn.classList.add('marked')
          elCurrCellbtn.classList.remove('selected')
          elCurrInnerCell.innerText = `${FLAG}`
        }, 1500)
      }
    }
  }
  renderHints()
}

/* Called when a cell is right clicked
See how you can hide the context 
menu on right click */
function onCellMarked(elCellBtn, i, j) {
  if (gBoard[i][j].isShown || !gGame.isOn) return

  const elInnerCell = elCellBtn.querySelector('.inner-cell')
  const elInnerText = elCellBtn.querySelector('.inner-cell p')
  const currentCell = gBoard[i][j]

  if (currentCell.isMarked) {
    currentCell.isMarked = false

    gGame.markedCount--
    renderMines()

    elCellBtn.classList.remove('marked')
    elInnerCell.classList.add('hidden')
    elInnerText.innerText = currentCell.isMine
      ? `${BOMB}`
      : `${currentCell.minesAroundCount}`

    checkGameOver()
    return
  }

  gBoard[i][j].isMarked = true
  gGame.markedCount++
  renderMines()

  elCellBtn.classList.add('marked')
  elInnerCell.classList.remove('hidden')
  elInnerText.innerText = `${FLAG}`

  checkGameOver()
  return
}

function onHintActivate() {
  if (gGame.hintCount > 0) {
    const elHintBtn = document.querySelector('.hint-btn')
    elHintBtn.classList.toggle('selected')
    gGame.isHint = !gGame.isHint
  }
}

//*RENDER FUNCTIONS

function renderResetButtonEmoji(state) {
  const elRstBtn = document.querySelector('.rst-btn')
  switch (state) {
    case 'lose':
      elRstBtn.innerText = '😔'
      break
    case 'reset':
      elRstBtn.innerText = '😁'
      break
    case 'win':
      elRstBtn.innerText = '😎'
      break
  }
}
function renderMines() {
  const elMinesCounter = document.querySelector('.mines-left span')
  var currMinesCount = gLevel.MINES - gGame.markedCount
  currMinesCount = currMinesCount < 0 ? 0 : currMinesCount
  elMinesCounter.innerText = currMinesCount
}
function renderTimer() {
  const elTimer = document.querySelector('.timer span')
  elTimer.innerText = '00:00'
}
function renderLives() {
  var livesStr = ''
  if(gGame.livesCount === 0 ) livesStr += '❌'
  for (let i = 0; i < gGame.livesCount; i++) {
    livesStr += '❤'
  }
  const elLivesCounter = document.querySelector('.lives-left span')
  elLivesCounter.innerText = livesStr
}
function renderHints() {
  gGame.isHint = false
  var hintsStr = ''
  for (let i = 0; i < gGame.hintCount; i++) {
    hintsStr += '💡'
  }

  const elHintsbtn = document.querySelector('.hint-btn')
  elHintsbtn.classList.remove('selected')
  const elHintsbtnStr = document.querySelector('.hint-btn span')
  elHintsbtnStr.innerText = hintsStr
}
/* Render the board as a <table> 
to the page */
function renderBoard(board) {
  var HTMLstr = ''
  for (let i = 0; i < board.length; i++) {
    HTMLstr += '<tr>\n'

    for (let j = 0; j < board.length; j++) {
      HTMLstr += generateTdHTMLString(board, i, j)
    }
    HTMLstr += '</tr>\n'
  }
  const elTable = document.querySelector('.gameboard')
  elTable.innerHTML = HTMLstr
}

function leaderboardRenderOperations(operation) {
  const elLeaderboard = document.querySelector('.leaderboard')
  switch (operation) {
    case 'hide':
      elLeaderboard.classList.add('hidden')
      break
    case 'show':
      elLeaderboard.classList.remove('hidden')
      break
    case 'toggle':
      elLeaderboard.classList.toggle('hidden')
      break
  }
}

function renderLeaderboard() {
  gLeaderboard = []
  for (let i = 1; i <= 10; i++) {
    var playerStr = leaderboardRetrieve(i)
    var playerObj = leaderboardStrObjectFactory(playerStr)
    gLeaderboard.push(playerObj)
  }
  var leaderboardHTMLStr = '<table class="leaderboard">'
  for (let i = 0; i < gLeaderboard.length; i++) {
    leaderboardHTMLStr += `<tr>
    <td>${i + 1}</td>
    <td>${gLeaderboard[i].name}</td>
    <td>${gLeaderboard[i].time}</td>
    </tr>\n`
  }
  leaderboardHTMLStr += '</table>'
  const elLeaderboard = document.querySelector('.leaderboard')
  elLeaderboard.innerHTML = leaderboardHTMLStr
}

//*LEADERBOARD LOCALSTORAGE

function updateLeaderboard(player) {
  if (player === null) return
  const playerMinutes = +player.time.split(':')[0]
  const playerSeconds = +player.time.split(':')[1]

  for (let i = 0; i < 10; i++) {
    var currMinutes = +gLeaderboard[i].time.split(':')[0]
    var currSeconds = +gLeaderboard[i].time.split(':')[1]
    if (playerMinutes >= currMinutes) continue
    if (playerSeconds > currSeconds && playerMinutes >= currMinutes) continue
    gLeaderboard.splice(i, 0, player)
    gLeaderboard.slice(0, 10)
    for (let j = 0; j < 10; j++) {
      leaderboardStore(gLeaderboard[j], j + 1)
    }
    break
  }
  renderLeaderboard()
}

function leaderboardStrObjectFactory(playerStr) {
  const playerArr = playerStr.split('-')
  const player = {
    name: playerArr[0],
    time: playerArr[1],
  }
  return player
}

function leaderboardStore(playerObj, position) {
  if (playerObj === null) return
  position = `${gLevel.DIFFICULTY}` + position
  const playerStr = Object.values(playerObj).join('-')
  localStorage.setItem(position, playerStr)
}

function leaderboardRetrieve(position) {
  position = `${gLevel.DIFFICULTY}` + position
  return localStorage.getItem(position)
}

function resetLeaderboard() {
  localStorage.clear()
  var diffArr = ['EASY', 'NORM', 'HARD']
  for (let i = 0; i < 3; i++) {
    gLevel.DIFFICULTY = diffArr[i]
    var player1 = { name: `player1${gLevel.DIFFICULTY}`, time: '10:00' }
    var player2 = { name: `player2${gLevel.DIFFICULTY}`, time: '15:00' }
    var player3 = { name: `player3${gLevel.DIFFICULTY}`, time: '20:00' }
    var player4 = { name: `player4${gLevel.DIFFICULTY}`, time: '25:00' }
    var player5 = { name: `player5${gLevel.DIFFICULTY}`, time: '30:00' }
    var player6 = { name: `player6${gLevel.DIFFICULTY}`, time: '35:00' }
    var player7 = { name: `player7${gLevel.DIFFICULTY}`, time: '40:00' }
    var player8 = { name: `player8${gLevel.DIFFICULTY}`, time: '45:00' }
    var player9 = { name: `player9${gLevel.DIFFICULTY}`, time: '50:00' }
    var player10 = { name: `player10${gLevel.DIFFICULTY}`, time: '55:00' }
    leaderboardStore(player1, 1)
    leaderboardStore(player2, 2)
    leaderboardStore(player3, 3)
    leaderboardStore(player4, 4)
    leaderboardStore(player5, 5)
    leaderboardStore(player6, 6)
    leaderboardStore(player7, 7)
    leaderboardStore(player8, 8)
    leaderboardStore(player9, 9)
    leaderboardStore(player10, 10)
    renderLeaderboard()
    onInit('easy')
  }
}

//* TIMER

function startTimer() {
  var miliseconds = 0
  var seconds = 0
  var minutes = 0
  gTimer = setInterval(() => {
    miliseconds += 500
    if (miliseconds >= 1000) {
      miliseconds -= 1000
      seconds++
    }
    if (seconds >= 60) {
      seconds -= 60
      minutes++
    }
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    const secondsStr = seconds < 10 ? '0' + seconds : seconds
    const timerStr = `${minutesStr}:${secondsStr}`
    const elTimer = document.querySelector('.timer span')
    elTimer.innerText = timerStr
  }, 500)
}

function stopTimer() {
  clearInterval(gTimer)
  gTimer = 0
}

//* ENDGAME STATES

function loseState(elCellBtn, i, j) {
  gGame.livesCount--
  renderLives()

  if (gGame.livesCount > 0) {
    onCellMarked(elCellBtn, i, j)
    return
  }

  stopTimer()
  elCellBtn.classList.add('losing-bomb')
  gGame.isOn = false

  elCellBtn.classList.add('losing-bomb')
  const elHiddenInnerCells = document.querySelectorAll('.hidden')
  elHiddenInnerCells.forEach((elHiddenCell) => {
    elHiddenCell.classList.remove('hidden')
  })
  const elCellBtns = document.querySelectorAll('.cell-btn')
  elCellBtns.forEach((elCellBtn) => {
    elCellBtn.disabled = 'true'
  })
  renderResetButtonEmoji('lose')
}

function victoryState() {
  gGame.isOn = false
  const elTimer = document.querySelector('.timer span')

  const elMarkedCells = document.querySelectorAll('.shown')
  elMarkedCells.forEach((elMarkedCell) => {
    elMarkedCell.classList.add('win-marked')
    elMarkedCell.classList.remove('shown')
  })
  const elCellBtns = document.querySelectorAll('.cell-btn')
  elCellBtns.forEach((elCellBtn) => {
    elCellBtn.disabled = 'true'
  })
  renderResetButtonEmoji('win')

  const player = {
    name: prompt('Type your name:'),
    time: elTimer.innerText,
  }
  revealSound()
  updateLeaderboard(player)
  leaderboardRenderOperations('show')
}

/* Game ends when all mines are 
marked, and all the other cells 
are shown */
function checkGameOver() {
  const BOARD_SIZE = gLevel.SIZE ** 2
  const BOARD_SHOWN_SIZE = BOARD_SIZE - gLevel.MINES

  if (gGame.shownCount === BOARD_SHOWN_SIZE) {
    victoryState()
    stopTimer()
  }
}


//* SOUNDS
function bombSound(){
  var bombAudio = new Audio('audio/bomb.wav')
  bombAudio.play()
}
function clickSound(){
  var bombAudio = new Audio('audio/click.wav')
  bombAudio.play()
}
function revealSound(){
  var bombAudio = new Audio('audio/reveal.wav')
  bombAudio.play()
}