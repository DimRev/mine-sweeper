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
 isFirstClick : true
 shownCount: 0,
 markedCount: 0,
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
  }
  gGame = {}
  gGame.isFirstClick = true
  gGame.isOn = true
  gGame.shownCount = 0
  gGame.markedCount = 0
  gGame.lives = gLevel.LIVES

  gBoard = buildBoard(gLevel.SIZE)

  const elLivesCounter = document.querySelector('.lives-left span')
  const elMinesCounter = document.querySelector('.mines-left span')
  elLivesCounter.innerText = gLevel.LIVES
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
      <button class="cell ${board[i][j].isShown ? 'shown' : ''}" onclick="
      onCellClicked(this,${i},${j})
      " oncontextmenu="onCellMarked(this,${i},${j})"
      >
      <div class="inner-cell ${board[i][j].isShown ? '' : 'hidden'}">
      ${board[i][j].isMine ? '💣' : `${board[i][j].minesAroundCount}`}
      </div></button></td>\n`

  // if (board[i][j].isMine) {
  //   HTMLstr += `<td>
  //     <button class="cell" onclick="
  //     onCellClicked(this,${i},${j})
  //     " oncontextmenu="onCellMarked(this,${i},${j})"
  //     >
  //     <div class="inner-cell ${board[i][j].isShown ? '' : 'hidden'}">
  //     💣
  //     </div></button></td>\n`
  // } else {
  //   HTMLstr += `<td>
  //     <button class="cell" onclick="
  //     onCellClicked(this,${i},${j})
  //     " oncontextmenu="onCellMarked(this, ${i},${j})">
  //     <div class="inner-cell hidden">
  //     ${board[i][j].minesAroundCount}
  //     </div></button></td>\n`
  // }
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
  if (gBoard[i][j].isMarked) {
    gBoard[i][j].isMarked = false
    gGame.markedCount--
    var currMinesCount = gLevel.MINES - +gGame.markedCount
    currMinesCount = currMinesCount > 0 ? currMinesCount : 0

    elMinesCounter.innerText = currMinesCount
    elCell.classList.remove('marked')
    elCellContainer.classList.add('hidden')
    elCellContainer.innerText = gBoard[i][j].isMine
      ? '💣'
      : `${gBoard[i][j].minesAroundCount}`

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
  gGame.lives--
  elLivesCounter.innerText = gGame.lives
  if (gGame.lives > 0) {
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
  const elCellBtns = document.querySelectorAll('.cell')
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
  const elCellBtns = document.querySelectorAll('.cell')
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
