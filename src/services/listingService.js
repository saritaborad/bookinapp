import toMomentObject from "react-dates/lib/utils/toMomentObject";

/**
 * @description Based on focused input shows different blocked dates:
 *      for check-in input - enable dates that has a check-out on a given day
 *      for check-out input - enable dates that has a check-in on a given day
 *                          - if previous day is available
 * @param {String} focusedInput 'startDate'/'endDate' based on DatePicker selected input
 * @param {Array<Object>} days - all fetched days from db.calendars
 * @returns {Array} - filtered blocked days
 */
export const getBlockedDays = days => days.map(daysToBlock);

/**
 * @description Creates filter which:
 *  - returns days that are not available
 *  - returns days that are not the last days of manual blocks
 * @param {Array<Object>} days - all fetched days from db.calendars
 * @returns {function({Object} day, {number} index)}
 */
export const daysToBlock = (day, index, days) => {
  const isCheckOut = dayIsCheckOut(day, days, index);
  // returns day object for blocked day (day with reservation obj) or false othervise
  // dayIsCheckOut(day, days, index)) - day doesn't have reservation but is checkout
  return (
    !!(isNotAvailable(day) || isCheckOut) && {
      ...day,
      ...(isCheckIn(day) ? { isCheckIn: true } : {}),
      ...(isCheckOut ? { isCheckOut: true } : {})
    }
  );
};

/**
 * @param {Object} day - record in db.calendars
 * @returns {boolean}
 */
export const isNotAvailable = day => day.status !== "available";

/**
 * @param {Object} day - record in db.calendars
 * @param {Array<Object>} days - all fetched days from db.calendars
 * @param {number} index - JS filter's iteration number
 * @returns {*}
 */
export const dayIsCheckOut = (day, days, index) =>
  !!days[index - 1] &&
  !!days[index - 1].reservation &&
  toMomentObject(day.date).isSame(
    toMomentObject(new Date(days[index - 1].reservation.checkOutDateLocalized)),
    "day"
  );

/**
 * Checks if day is check-in
 * @param {Object} day - record in db.calendars
 * @returns {boolean}
 */
export const isCheckIn = day =>
  !!day.reservation &&
  toMomentObject(day.date).isSame(
    toMomentObject(new Date(day.reservation.checkInDateLocalized)),
    "day"
  );

/**
 * Checks if listing is accesible via direct link eg: /listings/:id
 * @param {Array<String>} excludedListings - field in website record from db.websites
 * @param {Array<String>} includedListings - field in website record from db.websites
 * @param {Object} listing - field in listings record from db.listings
 * @returns {boolean}
 */
export const isListingAccessible = ({
  excludedListings = [],
  includedListings = [],
  listing: { _id: listingId, isListed }
}) =>
  isListed &&
  ((!excludedListings.length && !includedListings.length) ||
    (!excludedListings.includes(listingId) &&
      (!includedListings.length || includedListings.includes(listingId))));

export function getCalculatedTaxes(listingDetails, reservation, discount) {
  const { taxes, accountTaxes } = listingDetails;

  const {
    guestsCount: guests,
    currency,
    nightsCount
  } = listingDetails.reservation;

  return getTaxForProperty({
    currency,
    basePrice: getBasePriceForTax(listingDetails),
    taxes: accountTaxes || taxes,
    guests,
    nights: nightsCount,
    discount
  });
}

function getBasePriceForTax(listingDetails) {
  const {
    fareAccommodation,
    cleaningFee,
    nightsCount,
    basePrice
  } = listingDetails.reservation;

  return fareAccommodation
    ? (fareAccommodation + cleaningFee) / nightsCount
    : basePrice;
}

export function getTaxForProperty({
  basePrice = 1,
  taxes = [],
  guests = 1,
  nights = 1,
  discount = 0
}) {
  const tax = taxes.reduce((sum, tax) => {
    const multiplier = quantifier => {
      switch (quantifier) {
        case "PER_GUEST":
          return guests;
        case "PER_NIGHT":
          return tax.units === "FIXED" ? nights : 1;
        case "PER_GUEST_PER_NIGHT":
          return nights * guests;
        case "PER_STAY":
          return 1;
        default:
          return 1;
      }
    };

    const price = basePrice * nights + discount;

    if (tax.units === "FIXED") {
      return (sum += tax.amount * multiplier(tax.quantifier));
    }
    if (tax.units === "PERCENTAGE") {
      let taxInPercantages = tax.amount / 100;
      let taxesWithMuptiplier = multiplier(tax.quantifier) * taxInPercantages;

      return (sum += taxesWithMuptiplier * price);
    }
    return 0;
  }, 0);
  return Math.ceil(tax * 100) / 100;
}


