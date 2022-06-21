'use strict';

const appPuzzle = () => {
  const $appNode = document.getElementById('app__puzzle');
  const $appShuffle = document.getElementById('app__shuffle');
  const $itemsNodes = Array.from($appNode.querySelectorAll('.app__puzzle--btn'));

  const winFlatArr = new Array(16).fill(0).map((_item, index) => index + 1);

  const blankNumber = 16;
  const countItems = 16;
  const countLine = 4;

  let matrix = [];

  const checkCountItems = () => {
    if ($itemsNodes.length < countItems) {
      throw new Error(`Должно быть ровно ${countItems} items in HTML`);
    }
  };

  const hideItemsLast = () => {
    $itemsNodes[countItems - 1].style.display = 'none';
  };

  const checkDatasetItems = () => $itemsNodes.map(item => Number(item.dataset.matrixId));

  /** Matrix */
  const getMatrix = arr => {
    const matrix = [[], [], [], []];
    let y = 0,
        x = 0;

    for (let item of arr) {
      if (x >= countLine) {
        y++;
        x = 0;
      }
      matrix[y][x] = item;
      x++;
    }

    return matrix;
  };

  /** Show won */
  const isWon = matrix => {
    const flatMatrix = matrix.flat();
    for (let i = 0; i < winFlatArr.length; i++) {
      if (flatMatrix[i] !== winFlatArr[i]) {
        return false;
      }
    }
    return true;
  };

  const addWonClass = () => {
    if (isWon(matrix)) {
      setTimeout(() => $appNode.classList.remove('won'), 500);
    }
    else {
      setTimeout(() => $appNode.classList.add('won'), 500);
    }
  };

  /** Position */
  const setNodeStyles = (node, x, y) => {
    const shiftPs = 100;
    node.style.transform = `translate3D(${x * shiftPs}%, ${y * shiftPs}%, 0)`;
  };


  const setPositionItems = matrix => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const value = matrix[y][x];
        const node = $itemsNodes[value - 1];
        
        setNodeStyles(node, x, y);
      }
    }
  };

  const findCoordinatesByNumber = (number, matrix) => {
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        if (matrix[y][x] === number) return {y, x};
      }
    }

    return null;
  };

  const isValidForSwap = (coord01, coord02) => {
    const diffX = Math.abs(coord01.x - coord02.x);
    const diffY = Math.abs(coord01.y - coord02.y);

    return (
      (diffX === 1 || diffY === 1) && 
      (coord01.x === coord02.x || coord01.y === coord02.y)
    );
  };

  const swapItems = (coords01, coords02, matrix) => {
    const tempCoords = matrix[coords01.y][coords01.x];
    matrix[coords01.y][coords01.x] = matrix[coords02.y][coords02.x];
    matrix[coords02.y][coords02.x] = tempCoords;

    addWonClass();
  };

  const getСoordinatesNumber = (btnCoords, blankCoords) => {
    const isValid = isValidForSwap(btnCoords, blankCoords);
  
    if (isValid) {
      swapItems(btnCoords, blankCoords, matrix);
      setPositionItems(matrix);
    }
  };

  /** Shuffle */
  const shuffleArray = arr => {
    return arr
      .map( value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  const clickShuffleItems = () => {
    matrix = getMatrix(shuffleArray(matrix.flat()));
    setPositionItems(matrix);
    addWonClass();
  };

  /** Change position by click */
  const clickTargetItems = ({ target }) => {
    const btnNode = target.closest('.app__puzzle--btn');
    if (!btnNode) return;

    const btnNumber = Number(btnNode.dataset.matrixId);

    const btnCoords = findCoordinatesByNumber(btnNumber, matrix);
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);

    getСoordinatesNumber(btnCoords, blankCoords);
  };

  /** Change position by arrows */
  const isValidArrow = (btnCoords, blankCoords) => {
    if (
      btnCoords.y >= matrix.length || btnCoords.y < 0 || 
      btnCoords.x >= matrix.length || btnCoords.x < 0
    ) { 
      return; 
    }

    swapItems(btnCoords, blankCoords, matrix);
    setPositionItems(matrix);
  };

  const shuffleItemsArrow = (direction, btnCoords, blankCoords) => {
    switch(direction) {
      case 'up':
        btnCoords.y += 1;
        break;
      case 'down':
        btnCoords.y -= 1;
        break;
      case 'left':
        btnCoords.x += 1;
        break;
      case 'right':
        btnCoords.x -= 1;
        break;
    }

    isValidArrow(btnCoords, blankCoords);
  };

  const clickArrows = event => {
    if (!event.key.includes('Arrow')) return;
    const blankCoords = findCoordinatesByNumber(blankNumber, matrix);
    const btnCoords = { x: blankCoords.x, y: blankCoords.y };
    const direction = event.key.split('Arrow')[1].toLowerCase();

    shuffleItemsArrow(direction, btnCoords, blankCoords);
  };

  /** Events */
  $appNode.addEventListener('click', clickTargetItems);
  $appShuffle.addEventListener('click', clickShuffleItems);
  document.body.addEventListener('keydown', clickArrows);

  /** Start */
  const init = () => {
    checkCountItems();
    hideItemsLast();
    const matrixId = checkDatasetItems();
    matrix = getMatrix(matrixId);
    setPositionItems(matrix);
    addWonClass();
  };

  init();
};

appPuzzle();

