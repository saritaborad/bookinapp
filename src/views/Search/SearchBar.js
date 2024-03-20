import React, { Component } from "react";
import { DateRangePicker } from "react-dates";
import { withTranslation } from "react-i18next";
import "./Search.scss";
import { Multiselect } from "multiselect-react-dropdown";
import settings from "../../settings";
import { authService } from "../../services/authService";
import { getTagsIndex } from "../../helpers/urls";
import {getQueryParameters} from "../../helpers/settingsHelper";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class SearchBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      focusedInput: null,
      showCitiesDropdown: false,
      isAdmin: false,
      selectAreaTags: this.getSelectAreaTags(),
      bedroomOptions: this.getSelectedBedroomType()
    };
    this.bedroomMultiselectRef = React.createRef();
    this.tagMultiselectRef = React.createRef();
  }

  componentDidMount() {
    if (authService.isAdmin()) {
      this.setState({ isAdmin: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.t !== prevProps.t ||
      this.props.state.city !== prevProps.state.city
    ) {
      const bedroomOptions = this.getSelectedBedroomType();
      this.setState({
        selectAreaTags: this.getSelectAreaTags(),
        bedroomOptions,
      });
      this.selectOptionFromURL(bedroomOptions);
    }
  }

  selectOptionFromURL(bedroomOptions){
    let selectedBed = getQueryParameters()?.bedrooms?.split(',');
    if(Array.isArray(selectedBed) && selectedBed?.length > 0){
      selectedBed = bedroomOptions?.filter((brOption) => selectedBed.includes(brOption.name));
      this.onSelectBedroom(selectedBed);
    }
  }

  getSelectAreaTags() {
    return settings[getTagsIndex(this.props.state.city.urlName)].map((tag) => ({
      tag: tag.tag,
      displayName: this.props.t(tag.translationKey),
    }));
  }

  getSelectedBedroomType() {
    return settings.bedrooms.map((br) => ({
      name: br.name,
      value: br.values,
      displayName: this.props.t(br.translationKey),
    }));
  }

  onMinusClick() {
    const guests = parseInt(this.props.state.guests);
    this.props.onGuestChange(
      guests > 1 && !isNaN(guests) ? guests - 1 : !isNaN(guests) ? guests : 1
    );
  }

  onPlusClick() {
    const guests = parseInt(this.props.state.guests);
    this.props.onGuestChange(!isNaN(guests) ? guests + 1 : 1);
  }

  dropdownToggle() {
    this.setState({
      showCitiesDropdown: !this.state.showCitiesDropdown,
    });
  }

  hideSelector() {
    this.setState({
      showCitiesDropdown: false,
    });
  }

  onCityClick(city) {
    this.props.onCityClick(city);
    this.setState({
      showCitiesDropdown: false,
    });
  }

  onSelectTag(selectedList, selectedItem) {
    this.props.onTagsChange(selectedList);
  }

  onSelectBedroom(selectedList) {
    this.props.onBedroomsChange(selectedList);
  }

  render() {
    return (
      <form onSubmit={this.props.onSearchClick.bind(this)}>
        <div className={`search-box ${checkForArabic("arabic-search-box")}`}>
          <div className="dropdown-container" onClick={this.dropdownToggle.bind(this)}>
            <input
              type="text"
              value={this.props.t("common:" + this.props.state.city.urlName)}
              name="city"
              readOnly
              onChange={this.props.onChangeHandler}
              className="dropdown-input"
            />
            <div
              className={
                "dropdown-triangle" +
                (this.state.showCitiesDropdown ? " rotate" : "")
              }
            ></div>
            {this.state.showCitiesDropdown ? (
              <div
                className="overlay"
                onClick={this.hideSelector.bind(this)}
              ></div>
            ) : null}
            <ul
              className={
                "dropdown" + (this.state.showCitiesDropdown ? " show" : "")
              }
            >
              {this.props.cities.map((city) => (
                <li
                  onClick={this.onCityClick.bind(this, city)}
                  key={city.urlName}
                >
                  {this.props.t("common:" + city.urlName)}
                </li>
              ))}
            </ul>
          </div>
          <div className="plus-minus-container">
            <div className="plus-minus-label">
              {this.props.t("common:guests")}:
            </div>
            <div className="plus-minus-value" >
              <div className="minus" onClick={this.onMinusClick.bind(this)}>
                -
              </div>
              <input
                type="text"
                className="plus-minus-input"
                onChange={(event) => {
                  this.props.onGuestChange(event.target.value);
                }}
                value={this.props.state.guests}
                name="guests"
              />
              <div className="plus" onClick={this.onPlusClick.bind(this)}>
                +
              </div>
            </div>
          </div>
          <div className="multi-select bedroom-selector">
            <Multiselect
              ref={this.bedroomMultiselectRef}
              options={this.state.bedroomOptions}
              showCheckbox={true}
              selectedValues={this.props.bedrooms}
              focusOnClick={window.innerWidth >= 992}
              onSelect={this.onSelectBedroom.bind(this)}
              onRemove={this.onSelectBedroom.bind(this)}
              showCloseButton={window.innerWidth < 992}
              avoidHighlightFirstOption
              closeOnSelect={false}
              displayValue="displayName"
              placeholder={
                this.props.bedrooms.length > 0
                  ? `${this.props.bedrooms.length} ${this.props.t("selected")}`
                  : this.props.t("selectBedroom")
              }
            />
          </div>
          <DateRangePicker
            startDate={this.props.state.startDate}
            startDateId="startDate"
            readOnly={window.innerWidth < 992}
            endDate={this.props.state.endDate}
            keepOpenOnDateSelect={window.innerWidth < 992}
            endDateId="endDate"
            onDatesChange={this.props.onDatesChange}
            focusedInput={this.state.focusedInput}
            showCloseButton={true}
            showBottomButton={true}
            showConfirmButton={window.innerWidth < 992}
            confirmButtonText={this.props.t("confirm")}
            bottomButtonText={this.props.t("clear")}
            onFocusChange={(focusedInput) => this.setState({ focusedInput })}
            startDatePlaceholderText={this.props.t("checkIn")}
            endDatePlaceholderText={this.props.t("checkOut")}
            numberOfMonths={window.innerWidth < 992 ? 1 : 2}
          />
          <div
            className="multi-select area-selector"
            style={{
              fontSize: `${
                this.props.state.city.urlName === "stpetersburg" &&
                this.props.i18n.language === "ru"
                  ? 1.7
                  : 1.5
              }rem`,
            }}
          >
            <div className="multiselect-and-triangle-wrapper">
              <Multiselect
                ref={this.tagMultiselectRef}
                options={this.state.selectAreaTags}
                showCheckbox={true}
                selectedValues={this.props.tags}
                focusOnClick={window.innerWidth >= 992}
                onSelect={this.onSelectTag.bind(this)}
                onRemove={this.onSelectTag.bind(this)}
                showCloseButton={window.innerWidth < 992}
                closeOnSelect={false}
                avoidHighlightFirstOption
                displayValue="displayName"
                placeholder={
                  this.props.tags.length > 0
                    ? `${this.props.tags.length} ${this.props.t("selected")}`
                    : this.props.t("selectTags")
                }
           />
            </div>
          </div>
          {this.state.isAdmin && (
            <div className="free-text-container">
              <input
                type="text"
                className="free-text-input"
                onChange={this.props.onChangeHandler}
                value={this.props.state.searchText}
                name="searchText"
                placeholder={this.props.t("name")}
              />
            </div>
          )}

          <button className="search-button" type="submit">
            {this.props.t("search")}
          </button>
        </div>
      </form>
    );
  }
}

export default withTranslation("search")(SearchBar);
