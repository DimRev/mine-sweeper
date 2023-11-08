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

//*--------------Global Variables---------------------*//
var gBoard
var gLevel
var gGame

/* This is called when page loads  */
function onInit() {
  gBoard = []
  gLevel = {
    SIZE: 4,
    MINES: 2,
    LIVES: 3,
    HINTS: 3,
  }
  gGame = {}
  gGame.isFirstClick = true
  gGame.isOn = true
  gGame.isHint = false
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.hintCount = gLevel.HINTS
  gGame.livesCount = gLevel.LIVES

  

  gBoard = buildBoard(gLevel.SIZE)

  const elLivesCounter = document.querySelector('.lives-left span')
  const elMinesCounter = document.querySelector('.mines-left span')
  const elRstBtn = document.querySelector('.rst-btn')

  
  elRstBtn.innerText = '😁'
  var livesStr = ''
  for(let i = 0; i < gLevel.LIVES ; i++){
    livesStr+= '❤'
  }
  elLivesCounter.innerText = livesStr
  elMinesCounter.innerText = gLevel.MINES


  renderBoard(gBoard)
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
  //!Random mines ARE working, but disabled for now
  if (!gGame.isFirstClick) {
    for (let i = 0; i < +numOfMines; i++) {
      const pos = findEmptyCell(board)
      board[pos.i][pos.j].isMine = true
    }
  } else {
    board[0][0].isMine = true
    board[2][2].isMine = true
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
  const elTable = document.querySelector('table')
  elTable.innerHTML = HTMLstr
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
      ${board[i][j].isMine ? '💣' : `${board[i][j].minesAroundCount}`}
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
      board[idxI][idxJ].minesAroundCount = minesCount === 0 ? ' ' : minesCount
    }
  }
}

/* Called when a cell is clicked */
function onCellClicked(elCell, i, j) {
  if (gGame.isHint) {
    selectCellHint(elCell, i, j)
    return
  }
  if (gBoard[i][j].isMarked || !gGame.isOn) return
  if (gGame.isFirstClick && gBoard[i][j].isMine) {
    handleFirstClick(elCell, i, j)
    // return
  }
  gGame.isFirstClick = false
  if (gBoard[i][j].isMine) {
    loseState(elCell, i, j)
    return
  }

  gBoard[i][j].isShown = true
  gGame.shownCount++

  const elCellText = elCell.querySelector('.inner-cell')
  elCellText.classList.remove('hidden')
  elCellText.innerText = gBoard[i][j].minesAroundCount
  elCell.classList.add('shown')
  elCell.disabled = 'true'

  checkGameOver()
}

/* Called when a cell is right clicked
See how you can hide the context 
menu on right click */
function onCellMarked(elCell, i, j) {
  if (gBoard[i][j].isShown || !gGame.isOn) return

  const elCellContainer = elCell.querySelector('.inner-cell')
  const elMinesCounter = document.querySelector('.mines-left span')
  const currCell = gBoard[i][j]
  if (currCell.isMarked) {
    currCell.isMarked = false
    gGame.markedCount--
    var currMinesCount = gLevel.MINES - +gGame.markedCount
    currMinesCount = currMinesCount > 0 ? currMinesCount : 0

    elMinesCounter.innerText = currMinesCount
    elCell.classList.remove('marked')
    elCellContainer.classList.add('hidden')
    elCellContainer.innerText = currCell.isMine
      ? '💣'
      : `${currCell.minesAroundCount}`

    checkGameOver()
    return
  }

  gBoard[i][j].isMarked = true
  gGame.markedCount++
  var currMinesCount = gLevel.MINES - +gGame.markedCount
  currMinesCount = currMinesCount > 0 ? currMinesCount : 0

  elMinesCounter.innerText = currMinesCount
  elCell.classList.add('marked')
  elCellContainer.classList.remove('hidden')
  elCellContainer.innerText = '🚩'

  checkGameOver()
  return
}

function loseState(elCell, i, j) {
  const elLivesCounter = document.querySelector('.lives-left span')
  gGame.livesCount--
  var livesStr = ''
  for(let i = 0; i < gGame.livesCount ; i++){
    livesStr+= '❤'
  }
  elLivesCounter.innerText = livesStr
  if (gGame.livesCount > 0) {
    onCellMarked(elCell, i, j)
    return
  }
  elCell.classList.add('losing-bomb')
  gGame.isOn = false

  elCell.classList.add('losing-bomb')
  const elHiddenCells = document.querySelectorAll('.hidden')
  elHiddenCells.forEach((elHiddenCell) => {
    elHiddenCell.classList.remove('hidden')
  })
  const elCellBtns = document.querySelectorAll('.cell-btn')
  elCellBtns.forEach((elCellBtn) => {
    elCellBtn.disabled = 'true'
  })
  const elRstBtn = document.querySelector('.rst-btn')
  elRstBtn.innerText = '😫'
}

function victoryState() {
  gGame.isOn = false

  const elMarkedCells = document.querySelectorAll('.shown')
  elMarkedCells.forEach((elMarkedCell) => {
    elMarkedCell.classList.add('win-marked')
    elMarkedCell.classList.remove('shown')
  })
  const elCellBtns = document.querySelectorAll('.cell-btn')
  elCellBtns.forEach((elCellBtn) => {
    elCellBtn.disabled = 'true'
  })
  const elRstBtn = document.querySelector('.rst-btn')
  elRstBtn.innerText = '😎'
}

/* Game ends when all mines are 
marked, and all the other cells 
are shown */
function checkGameOver() {
  const BOARD_SIZE = gLevel.SIZE ** 2
  const BOARD_SHOWN_SIZE = BOARD_SIZE - gLevel.MINES

  console.log(BOARD_SHOWN_SIZE, gGame.shownCount, gGame.markedCount)
  if (gGame.shownCount === BOARD_SHOWN_SIZE) victoryState()
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
function expandShown(board, elCell, i, j) {}

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

function onHintActivate() {
  if (gGame.hintCount > 0) {
    const elHintBtn = document.querySelector('.hint-btn')
    elHintBtn.classList.toggle('selected')
    gGame.isHint = !gGame.isHint
  }
}

function selectCellHint(elCell, idxI, idxJ) {
  gGame.hintCount--
  for (let i = idxI - 1; i <= idxI + 1; i++) {
    if (i < 0 || i > gBoard.length) continue

    for (let j = idxJ - 1; j <= idxJ + 1; j++) {
      if (j < 0 || j > gBoard[i].length) continue
      const elCurrInnerCell = document.querySelector(`.inner-cell-${i}-${j}`)
      const elCurrCellbtn = document.querySelector(`.cell-btn-${i}-${j}`)
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
          elCurrInnerCell.innerText = '🚩'
        }, 1500)
      }
    }
  }
  gGame.isHint = false
  const elHintBtn = document.querySelector('.hint-btn')
  elHintBtn.classList.remove('selected')
  elHintBtn.innerText = ''
  var lights = ''
  for (let i = 0; i < gGame.hintCount; i++) {
    lights += '💡'
  }
  elHintBtn.innerText += lights
}
