const ONE_THOUSAND = 1000;
const ONE_MILLION = 1000000;

function formatAmericanNumber(value: number) {
  return Math.floor(value).toLocaleString("en-US");
}

function trimCompactDecimal(value: number) {
  return value.toFixed(1).replace(/\.0$/, "").replace(".", ",");
}

function formatCompactValue(value: number, maxLength: number) {
  if (value >= ONE_MILLION) {
    const decimalValue = `${trimCompactDecimal(value / ONE_MILLION)}m`;
    const integerValue = `${Math.floor(value / ONE_MILLION)}m`;

    return decimalValue.length <= maxLength ? decimalValue : integerValue;
  }

  if (value >= ONE_THOUSAND) {
    const decimalValue = `${trimCompactDecimal(value / ONE_THOUSAND)}k`;
    const integerValue = `${Math.floor(value / ONE_THOUSAND)}k`;

    return decimalValue.length <= maxLength ? decimalValue : integerValue;
  }

  return formatAmericanNumber(value);
}

export function formatGridBoardValue(value: number, maxLength: number) {
  const americanValue = formatAmericanNumber(value);

  if (americanValue.length <= maxLength) {
    return americanValue;
  }

  return formatCompactValue(value, maxLength);
}

export function getNextBetValue(currentBet: number, betValues: readonly number[]) {
  const currentIndex = betValues.indexOf(currentBet);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % betValues.length : 0;

  return betValues[nextIndex] ?? currentBet;
}
