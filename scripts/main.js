const gameBoard = (() => {
  const size = 3;
  const cells = [];

  const Cell = (symbol) => {
    const isEmpty = () => symbol === undefined;
    const readSymbol = () => symbol;
    return {
      isEmpty,
      readSymbol,
    };
  };
  const resetCells = () => {
    for (let i = 0; i < size; i++) {
      cells[i] = [];
      for (let j = 0; j < size; j++) {
        cells[i][j] = Cell();
      }
    }
  };
  const getCells = () => cells;
  const getSize = () => size;

  return {
    Cell,
    resetCells,
    getCells,
    getSize,
  };
})();

const Player = (symbol, cpuFlag) => {
  const getSymbol = () => symbol;
  const isCpu = () => !!cpuFlag;
  const playTurn = (cell) => {
    if(cell.isEmpty()) {
      Object.assign(cell, gameBoard.Cell(symbol));
      return true;
    }
    return false;
  };
  const playCpuTurn = (board) => {
    const thinkingTime = 1500;
    setTimeout(playTurn.bind(chooseEmptyCell(board)), thinkingTime);
    return true;
  };
  const chooseEmptyCell = (board) => {
    const size = board.getSize();
    const cells = board.getCells();
    let chosenCell = cells[randomInt(size)][randomInt(size)];
    while (!chosenCell.isEmpty()) {
      chosenCell = cells[randomInt(size)][randomInt(size)];
    }
    return chosenCell;
  }
  const randomInt = (max) => Math.floor(Math.random() * max);

  return {
    getSymbol,
    isCpu,
    playTurn,
    playCpuTurn,
  };
};