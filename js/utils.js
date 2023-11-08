//Returns color #ffffff - of random color
function getRandomColor() {
  var letters = '0123456789ABCDEF'
  var color = '#'
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)]
  }
  return color
}

//Returns int - in range
function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

//Returns int - in range
function getRandomIntegerInc(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

//Returns empty matrix Mrxc
function createMat(rows, cols) {
  const mat = []
  for (var i = 0; i < rows; i++) {
    const row = []
    for (var j = 0; j < cols; j++) {
      row.push('')
    }
    mat.push(row)
  }
  return mat
}

//Returns int - of neighbor cells with value
function countNeighbors(idxI, idxJ, arr, iRange = 1, jRange = 1, value = '') {
  var count = 0
  for (let i = idxI - iRange; i < idxI + iRange; i++) {
    if (i < 0 || i >= arr.length) continue
    for (let j = idxJ - jRange; j < idxJ + jRange; j++) {
      if (j < 0 || j >= arr[i].length) continue
      if (i === idxI && j === idxJ) continue
      if (value) {
        if (arr[i][j] === value) count++
        continue
      }
      if (arr[i][j] !== '') count++
    }
  }
  return count
}

//Returns object {i,j} of random location of value
function findRandomCellWithValue(arr, value = '') {
  var emptyCells = []
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[i].length; j++) {
      if (arr[i][j] === value) {
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
