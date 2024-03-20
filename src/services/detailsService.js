import Axios from "axios";
import settings from "../settings";
import {isPordalProperty} from "../helpers/propertyFrom";

export default class DetailsService {
  getCalendarDetails(propertyId, from, to) {
    return new Promise((resolve, reject) => {
      return this.getCalendar(propertyId, from, to)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getListingDetails(propertyId, from, to, minOccupancy, promoCode) {
    return new Promise((resolve, reject) => {
      return this.getListing(propertyId, from, to, minOccupancy, promoCode)
        .then((response) => {
          resolve(response.data.results[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
    
  getReservationQuote(propertyId, from, to, minOccupancy, promoCode) {
    return new Promise((resolve, reject) => {
      return this.getReservationQuoteRequest(
        propertyId,
        from,
        to,
        minOccupancy,
        promoCode
      )
        .then((response) => {
          resolve(isPordalProperty(propertyId)? response.data.reservation : response.data.money);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getPromoCode(reservation, lang) {
    return new Promise((resolve, reject) => {
      return this.postPromoCode(this.mapToFormData(reservation, lang))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  setReservation(reservation, lang) {
    return new Promise((resolve, reject) => {
      return this.postReservation(this.mapToFormData(reservation, lang))
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getCalendar(propertyId, from, to) {
    const fields =
      "reservation reservation.checkInDateLocalized reservation.checkOutDateLocalized";
    return Axios.get(
      `${settings.guestyApiUrl}/listings/${propertyId}/calendar`,
      {
        params: {
          from: from,
          to: to,
          fields,
        },
      }
    );
  }

  mapToFormData(reservation, lang) {
    const formData = new FormData();

    Object.keys(reservation).forEach((key) => {
      if (typeof reservation[key] !== "object") {
        formData.append(key, reservation[key]);
      }
    });

    formData.append("guest.firstName", reservation.guest.firstName);
    formData.append("guest.lastName", reservation.guest.lastName);
    formData.append("guest.email", reservation.guest.email);
    formData.append("guest.phone", reservation.guest.phone);
    formData.append("lang", lang === "en" ? 1 : 2);

    return formData;
  }

  getListing(propertyId, from, to, minOccupancy, promoCode) {
    const fields =
      "_id terms taxes accommodates calendarRules title beds bedrooms bathrooms propertyType address.full address.city address.country address.state address.street address.lng address.lat publicDescription picture.regular picture.large defaultCheckInTime defaultCheckOutTime prices amenities pictures markups isListed";
    const available = {
      checkIn: from,
      checkOut: to,
      minOccupancy: minOccupancy,
    };
    return Axios.get(`${settings.guestyApiUrl}/listings`, {
      params: {
        fields,
        ...(from && to && minOccupancy > 0 ? { available } : {}),
        filters: JSON.stringify([
          { field: "_id", operator: "$eq", value: propertyId },
        ]),
        promoCode,
      },
    });
  }

  getReservationQuoteRequest(propertyId, from, to, minOccupancy, promoCode) {
    const available = {
      checkIn: from,
      checkOut: to,
      guestsCount: minOccupancy,
    };
    return Axios.get(`${settings.guestyApiUrl}/reservations/quote`, {
      params: {
        listingId: propertyId,
        ...available,
        promoCode,
        channelId: "manual",
      },
    });
  }


  postReservation(reservation) {
    return Axios.post(
      `${settings.frankPorterApiUrl}/admin/payment/reservation/create`,
      reservation,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  }

  postPromoCode(reservation) {
    return Axios.post(
      `${settings.frankPorterApiUrl}/admin/payment/reservation/checkcode`,
      reservation,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
  }

  getErrors(listing, translate) {
    if (!listing.reservation) {
      return [translate("book:DEFAULT")];
    }
    if (!listing.reservation.errors) {
      return [];
    }
    return listing.reservation.errors.map((error) => {
      return translate(`book:${error}`);
    });
  }
}

export const detailsService = new DetailsService();
