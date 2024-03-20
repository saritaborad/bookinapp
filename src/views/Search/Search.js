import moment from "moment";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import { searchService } from "../../services/searchService";
import settings from "../../settings";
import "./Search.scss";
import SearchBar from "./SearchBar";
import SearchResult from "./SearchResult";
import flatMap from "lodash/flatMap";
import sortBy from "lodash/sortBy";
import random from "lodash/random";
import { generateSearchLink, getTagsIndex } from "../../helpers/urls";
import swal from "sweetalert";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class Search extends Component {
  constructor(props) {
    super(props);

    const params = new URLSearchParams(this.props.location.search);
    const page = params.get("page");
    const from = params.get("from");
    const to = params.get("to");
    const guests = params.get("guests");
    const bedrooms = params.get("bedrooms");
    const searchText = params.get("searchText");
    const sort = params.get("sort");

    const parsedBedrooms = bedrooms?.length > 0 ? bedrooms.split(",") : [];

    this.state = {
      searchByNameVisible: false,
      city: {},
      guests: guests ? parseInt(guests) : 1,
      startDate: from ? moment(from) : null,
      endDate: to ? moment(to) : null,
      cities: settings.citiesTags
        .filter(({ visible }) => visible)
        .map((city) => city),
      tags: this.getUrlTags(),
      properties: [],
      mapProperties: [],
      bedrooms: settings.bedrooms.filter((bedroom) =>
        parsedBedrooms.includes(bedroom.name)
      ),
      totalProperties: 0,
      sortMethod:
        settings.sortMethods.find((method) => sort === method.translationKey) ||
        settings.sortMethods[0],
      page: page ? page : 1,
      searchText: searchText ? searchText : "",
      downloadingItems: true,
      downloadingMapItems: true,
      getListingParams: {},
    };
  }

  componentDidMount() {
    const params = new URLSearchParams(this.props.location.search);
    const city = params.get("city");
    this.selectCityFromParam(city);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.t !== prevProps.t || this.state.city !== prevState.city) {
      this.setState({
        tags: this.getUrlTags(),
      });
    }
  }

  getUrlTags() {
    const params = new URLSearchParams(this.props.location.search);
    const tags = params.get("tags");
    const parsedTags = tags?.length > 0 ? tags.split(",") : [];

    let tagsToMap = [
      ...settings.tagsDubai,
      ...settings.tagsAbuDhabi,
      ...settings.tagsStpetersburg,
    ];
    if (this.state?.city?.urlName) {
      tagsToMap = settings[getTagsIndex(this.state.city.urlName)];
    }

    return tagsToMap
      .filter((tag) => parsedTags.includes(tag.tag))
      .map((tag) => ({
        tag: tag.tag,
        displayName: this.props.t(tag.translationKey),
      }));
  }

  selectCityFromParam(selectedCity) {
    const foundCity = settings.citiesTags
      .filter(({ visible }) => visible)
      .find((c) => c.urlName === selectedCity?.toLowerCase());
    const city = foundCity
      ? foundCity
      : settings.citiesTags.filter(({ visible }) => visible)[0];
    this.setState({ city }, () => {
      this.onSearchClick();
      this.props.onCityUpdate(city);
    });
  }

  onGuestChange(guests) {
    this.setState({
      guests: guests > 0 ? guests : 1,
    });
  }

    onBedroomsChange(bedrooms) {
    this.setState({
      bedrooms: bedrooms,
    });
  }

  onCityClick(city) {
    this.setState({
      city: city,
      tags: [],
    });
  }

  onChangeHandler(event) {
    this.setState({
      [event.target.name]: event.target.value,
    });
  }

  onDatesChange({ startDate, endDate }) {
    this.setState({ startDate, endDate },  () => {
        this.onSearchClick();
    });
  }

  onSortSelect(method) {
    this.setState({ sortMethod: method }, () => {
      this.onSearchClick(false);
    });
  }

  onTagsChange(tags) {
    this.setState({ tags });
  }

  onChangePage(page) {
    this.setState({ page: page }, () => {
      this.onSearchClick(false);
    });
  }

  onSearchClickEvent(event) {
    if (event) {
      event.preventDefault();
    }

    this.setState({ page: 1 }, () => {
      this.onSearchClick();
    });
  }

  handleShuffleIfNeeded(list, isDefault) {
    if (isDefault) {
      return sortBy(list, (item) =>
        item.tags.includes("TOP_STAR") ? 0 : random(1, 100)
      );
    }
    return list;
  }

  onSearchClick(getMapProperties = true) {
    this.setState({
      downloadingItems: true,
    });

    this.props.onCityUpdate(this.state.city);

    const {
      city,
      startDate,
      endDate,
      guests,
      sortMethod,
      page,
      tags,
      searchText,
      bedrooms,
    } = this.state;

    this.props.history.push(this.prepareUrlForHistory());
    const getListingParams = {
      cityTag: city.tag,
      checkIn: startDate ? startDate.format("YYYY-MM-DD") : null,
      checkOut: endDate ? endDate.format("YYYY-MM-DD") : null,
      guests,
      sort: sortMethod ? sortMethod : null,
      page: parseInt(page),
      tags: tags.map((tag) => tag.tag),
      bedrooms: flatMap(bedrooms, (bedroom) => bedroom.values),
      searchText,
    };

    const isDefaultSearch = searchService.isDefaultSearch({
      ...getListingParams,
      sortKey: getListingParams.sort.key,
    });

  searchService
  .getAvailableListings(getListingParams)
  .then((searchResult) => {
    if(isDefaultSearch && getListingParams.page === 1) {
      localStorage.setItem("defaultStarProperties", searchResult.count);
    }
    const firstPagePropertiesCount = isDefaultSearch ? localStorage.getItem("defaultStarProperties") : settings.actualItemsPerPage;
    this.setState(
      {
        properties: this.handleShuffleIfNeeded(searchResult.results, isDefaultSearch),
        ...((!isDefaultSearch || (isDefaultSearch && getListingParams.page > 1)) && {
          totalProperties: isDefaultSearch
            ? Number(searchResult.count) + Number(firstPagePropertiesCount)
            : searchResult.count,
          downloadingItems: false,
        }),
        getListingParams: getListingParams,
      },
      () => {
        if (isDefaultSearch && getListingParams.page === 1) {
          searchService
            .getAvailableListingsCount(getListingParams)
            .then((searchResult) => {
              this.setState({
                totalProperties: Number(searchResult.count) + Number(localStorage.getItem("defaultStarProperties")),
                downloadingItems: false,
              });
            })
            .catch(() => {
              swal({
                text:this.props.t("common:errorPropertiesData"),
                className: checkForArabic("arabic-modal"),
              });
            });
        }
      }
    );
  })
  .catch(() => {
    this.setState({ downloadingItems: false });
  });

    if (getMapProperties) {
      this.getAvailableListingsForMap({
        guests,
        bedrooms,
        city,
        tags,
        startDate,
        endDate,
      });
    }
  }

  getAvailableListingsForMap({
    guests,
    bedrooms,
    city,
    tags,
    startDate,
    endDate,
  }) {
    this.setState({
      downloadingMapItems: true,
    });
    searchService
      .getAvailableListingsForMap(
        guests,
        flatMap(bedrooms, (bedroom) => bedroom.values),
        city.tag,
        tags.map((tag) => tag.tag),
        startDate ? startDate.format("YYYY-MM-DD") : null,
        endDate ? endDate.format("YYYY-MM-DD") : null
      )
      .then((result) => {
        this.setState({
          mapProperties: result.results,
          downloadingMapItems: false,
        });
      })
      .catch(() => {
        this.setState({ downloadingItems: false, downloadingMapItems: false });
      });
  }

  prepareUrlForHistory() {
    return generateSearchLink(
      this.state.city.urlName,
      this.state.startDate,
      this.state.endDate,
      this.state.guests,
      this.state.sortMethod?.translationKey,
      this.state.page,
      this.state.tags,
      this.state.bedrooms,
      this.state.searchText
    );
  }

  searchByNameToggle() {
    this.setState({ searchByNameVisible: !this.state.searchByNameVisible });
  }

  submitSearchText(event) {
    this.searchByNameToggle();
    this.onSearchClick();
    event.preventDefault();
  }

  resetFreeText() {
    this.setState({ searchText: "" }, () => {
      this.searchByNameToggle();
      this.onSearchClick();
    });
  }

  render() {
    return (
      <div>
        <SearchBar
          state={this.state}
          cities={this.state.cities.filter(({ visible }) => visible)}
          tags={this.state.tags}
          bedrooms={this.state.bedrooms}
          onChangeHandler={this.onChangeHandler.bind(this)}
          onCityClick={this.onCityClick.bind(this)}
          onTagsChange={this.onTagsChange.bind(this)}
          onBedroomsChange={this.onBedroomsChange.bind(this)}
          onGuestChange={this.onGuestChange.bind(this)}
          onDatesChange={this.onDatesChange.bind(this)}
          onSearchClick={this.onSearchClickEvent.bind(this)}
        />
        <SearchResult
          {...this.props}
          searchByNameToggle={this.searchByNameToggle.bind(this)}
          downloadingItems={this.state.downloadingItems}
          downloadingMapItems={this.state.downloadingMapItems}
          onDropdownClick={this.onSortSelect.bind(this)}
          onChangePage={this.onChangePage.bind(this)}
          onChangeHandler={this.onChangeHandler.bind(this)}
          state={this.state}
          properties={this.state.properties}
          mapProperties={this.state.mapProperties}
          totalProperties={this.state.totalProperties}
          selectedPage={this.state.page}
          getListingParams={this.state.getListingParams}
          checkIn={this.state.startDate}
          checkOut={this.state.endDate}
          guests={this.state.guests}
        />
      </div>
    );
  }
}

export default withTranslation("search")(Search);
