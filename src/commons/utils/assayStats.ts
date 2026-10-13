const toRanks = (values: number[]): number[] => {
  const order = values.map((value, index) => ({ value, index }));
  order.sort((a, b) => a.value - b.value);
  const ranks = new Array<number>(values.length);
  let start = 0;
  while (start < order.length) {
    let end = start;
    while (
      end + 1 < order.length &&
      order[end + 1].value === order[start].value
    )
      end++;
    for (let k = start; k <= end; k++)
      ranks[order[k].index] = (start + end) / 2 + 1;
    start = end + 1;
  }
  return ranks;
};

const pearson = (x: number[], y: number[]): number => {
  const meanX = x.reduce((a, b) => a + b, 0) / x.length;
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  let top = 0;
  let sumX = 0;
  let sumY = 0;
  x.forEach((value, i) => {
    top += (value - meanX) * (y[i] - meanY);
    sumX += (value - meanX) ** 2;
    sumY += (y[i] - meanY) ** 2;
  });
  return sumX && sumY ? top / Math.sqrt(sumX * sumY) : NaN;
};

export const spearman = (x: number[], y: number[]): number =>
  pearson(toRanks(x), toRanks(y));

export const rmse = (x: number[], y: number[]): number =>
  Math.sqrt(
    x.reduce((sum, value, i) => sum + (value - y[i]) ** 2, 0) / x.length,
  );
