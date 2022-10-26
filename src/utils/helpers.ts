import ethers from 'ethers';

export const bigNumberify = (n: number | string) => ethers.BigNumber.from(n);
export const expandDecimals = (n: number, decimals: number) => bigNumberify(n).mul(bigNumberify(10).pow(decimals));

export const calcMedian = (a: ethers.BigNumber[]): ethers.BigNumber=> {
  if (a.length === 0) {
    return ethers.BigNumber.from(0);
  }

  const sortedArray = a.sort((a, b) => {
    const diff = a.sub(b);
    if (diff.gt(0)) {
      return -1
    } else if (diff.lt(0)) {
      return 1;
    } else {
      return 0
    }
  });
  const half = Math.floor(a.length / 2);
  
  if (a.length % 2)
    return sortedArray[half];
  return (sortedArray[half - 1].add(sortedArray[half])).div(2);
}
