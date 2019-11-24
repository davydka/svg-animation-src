const range = require('lodash/range')
const { vec2 } = require('gl-matrix')

const SVG = require('../../utils/SVG')

const createPoints = () => {
  const SIZE = 200;
  const OFFSET = -(SIZE / 2);
  const CELLS = 10;
  const STEP = SIZE / (CELLS + 1);

  return range(1, CELLS + 1).reduce((rows, rowIndex) => {
    const row = range(1, CELLS + 1).reduce((cells, colIndex) => {
      return [
        ...cells,
        vec2.fromValues(rowIndex * STEP + OFFSET, colIndex * STEP + OFFSET),
      ];
    }, []);

    return [...rows, row];
  }, []);

  return points;
};

module.exports = id => {
  const DURATION = 1;

  const svg = SVG.svg({
    id,
    dataAnimationDuration: `${DURATION}s`,
    viewBox: '-100 -100 200 200',
  });

  const OFFSET = 200 / 11 / 8;

  svg.style(`
    circle:nth-child(1) {
      fill: none;
      stroke: black;
      stroke-width: 0.5;
      transform-origin: 0 0;
    }

    circle:nth-child(2) {
      fill: black;
      stroke: none;
    }

    circle:nth-child(1) {
      animation: first-circle ${DURATION}s infinite ease-out alternate;
    }

    @keyframes first-circle {
      from {
        transform: scale(1);
      }

      to {
        transform: scale(1.05);
      }
    }
  `);

  createPoints().forEach((row, rowindex) => {
    row.forEach(([cx, cy], colIndex) => {
      const g = svg.g();
      g.circle({
        cx,
        cy,
        r: 2,
      });

      g.circle({
        cx,
        cy,
        r: 2,
      });
    });
  });

  return svg;
};
