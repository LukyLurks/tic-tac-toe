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

  return {
    Cell,
    resetCells,
    getCells,
  };
})();