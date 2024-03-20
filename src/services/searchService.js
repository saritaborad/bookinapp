import Axios from "axios";
import settings from "../settings";

export default class SearchService {
  getTagByDisplayName(displayName) {
    return settings.citiesTags.find((city) => city.displayName === displayName);
  }

  isDefaultSearch({
    cityTag,
    checkIn,
    checkOut,
    sortKey,
    guests,
    bedrooms,
    searchText,
    tags,
  }) {
    return (
      cityTag === "DXB" &&
      !checkIn &&
      !checkOut &&
      sortKey === "default" &&
      parseInt(guests) === 1 &&
      !bedrooms.length &&
      !searchText &&
      !tags.length
    );
  }

  prepareListingParameters(params) {
    let {
      cityTag,
      checkIn,
      checkOut,
      guests,
      sort,
      page,
      tags,
      bedrooms,
      searchText,
      listingIds,
      clearQuery,
    } = params;

    const filters = [{ field: "type", operator: "$ne", value: "MTL" }];

    let cityTags = [cityTag];
    let sorting = sort.key;
    let available = {};

    if (!searchText || searchText.length === 0) {
      if (!checkIn || !checkOut) {
        filters.push({
          field: "accommodates",
          operator: "$gt",
          value: guests - 1,
        });
      }

      if (tags?.length) {
        filters.push({
          value: tags,
          operator: "$in",
          field: "tags",
        });
      }

      if (bedrooms?.length) {
        filters.push({
          value: bedrooms,
          operator: "$in",
          field: "bedrooms",
        });
      }

      available = {
        checkIn: checkIn,
        checkOut: checkOut,
        minOccupancy: parseInt(guests),
      };

      if (checkIn && checkOut && sort.reservationKey) {
        sorting = sort.reservationKey;
      }
    }

    return {
      filters,
      available,
      sorting,
      page,
      cityTags,
      listingIds,
      clearQuery,
    };
  }

  getAvailableListingsCount(params) {
    let { page, searchText, listingIds, clearQuery } = params;

    const { filters, available, sorting, cityTags } =
      this.prepareListingParameters(params);

    filters.push({
      value: ["STAR"],
      operator: "$nin",
      field: "tags",
    });

    return new Promise((resolve, reject) => {
      return this.getListingsCount(
        filters,
        available,
        sorting,
        page,
        searchText,
        cityTags,
        listingIds,
        clearQuery
      )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getAvailableListings(params) {
    let { page, searchText, listingIds, clearQuery, omitPagination } = params;

    const { filters, available, sorting, cityTags } =
      this.prepareListingParameters(params);

    const defaultFilters = this.isDefaultSearch({
      ...params,
      sortKey: sorting,
    });

    if (defaultFilters && !listingIds?.length) {
      filters.push({
        value: ["STAR"],
        operator: parseInt(page) === 1 ? "$in" : "$nin",
        field: "tags",
      });
      if (parseInt(page) === 1) {
        cityTags.splice(0, 1);
      } else {
        page--;
      }
    }

    return new Promise((resolve, reject) => {
      return this.getListings(
        filters,
        available,
        sorting,
        page,
        searchText,
        cityTags,
        listingIds,
        clearQuery,
        omitPagination
      )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getAvailableListingsForMap(
    accommodates,
    bedrooms,
    tags,
    area,
    checkIn,
    checkOut
  ) {
    return new Promise((resolve, reject) => {
      return this.getMapListings(
        accommodates,
        bedrooms,
        tags,
        area,
        checkIn,
        checkOut
      )
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getCertainListings(listingsIds) {
    return new Promise((resolve, reject) => {
      return this.getListingsById(listingsIds)
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  getAvailableCities() {
    return new Promise((resolve, reject) => {
      return this.getCities()
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }


  getCities() {
    return Axios.get(`${settings.guestyApiUrl}/listings/cities`);
  }

  getListingsCount(filters, available, sort, page, searchText, tags) {
    const params = new URLSearchParams({
      active: true,
      listed: true,
      fields: "_id",
      limit: 1,
      skip: 0,
      filters: JSON.stringify(filters),
      tags,
    });

    if (available.checkIn && available.checkOut) {
      params.append("available", JSON.stringify(available));
    }
    if (sort) {
      params.append("sort", sort);
    }
    if (searchText) {
      params.append("q", searchText);
    }

    return Axios.get(`${settings.guestyApiUrl}/listings`, {
      params,
    });
  }

  getListings(
    filters,
    available,
    sort,
    page,
    searchText,
    tags,
    listingsIds,
    clearQuery = false,
    omitPagination = false
  ) {
    const params = new URLSearchParams({
      active: true,
      listed: true,
      fields:
        "_id terms taxes accommodates calendarRules title beds bedrooms bathrooms propertyType address.full address.city address.country address.state address.street address.lng address.lat publicDescription picture.regular picture.large defaultCheckInTime defaultCheckOutTime prices amenities pictures markups isListed",
      ...(!clearQuery &&
        !omitPagination && {
          limit: settings.itemsPerPage(),
        }),
      ...(!clearQuery &&
        !omitPagination && {
          skip: settings.itemsPerPage() * (page - 1),
        }),
      ...(!clearQuery && { filters: JSON.stringify(filters) }),
      ...(!clearQuery && { tags }),
    });

    if (!clearQuery) {
      if (available.checkIn && available.checkOut) {
        params.append("available", JSON.stringify(available));
      }
      if (sort) {
        params.append("sort", sort);
      }
      if (searchText) {
        params.append("q", searchText);
      }
    }
    if (listingsIds) {
      params.append("ids", listingsIds.join(","));
    }

    return Axios.get(`${settings.guestyApiUrl}/listings`, {
      params,
    });
  }

  getMapListings(accommodates, bedrooms, tags, area, checkIn, checkOut) {
    const params = new URLSearchParams({
      accommodates,
      tags,
    });

    if (checkIn && checkOut) {
      params.append("check_in", checkIn);
      params.append("check_out", checkOut);
    }

    if (bedrooms?.length) {
      params.append("bedrooms", bedrooms);
    }

    if (area?.length) {
      params.append("area", area);
    }

    return Axios.get(`${settings.guestyApiUrl}/map/`, {params});
  }

  getListingsById(listingsIds) {
    return Axios.get(`${settings.guestyApiUrl}/listings`, {
      params: {
        active: true,
        listed: true,
        ids: listingsIds.join(","),
        fields:
          "_id terms taxes accommodates calendarRules title beds bedrooms bathrooms propertyType address.full address.city address.country address.state address.street address.lng address.lat publicDescription picture.regular picture.large defaultCheckInTime defaultCheckOutTime prices amenities pictures markups isListed",
      },
    });
  }
}

export const searchService = new SearchService();

