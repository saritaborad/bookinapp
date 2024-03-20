export function toSpaceSeparated(number, round) {
  number = parseFloat(number);
  const options = {};
  if (round) {
    number = Math.round(number);
  } else {
    options.minimumFractionDigits = 2;
    options.maxiFractionDigits = 2;
  }
  return number.toLocaleString("en-US", options).replace(",", " ");
}

export function toNumberWithCorrectForm(quantity, singular, plural) {
  return quantity + " " + (quantity > 1 ? plural : singular);
}
