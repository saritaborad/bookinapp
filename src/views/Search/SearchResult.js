import _ from "lodash";
import React, { Component } from "react";
import { withTranslation } from "react-i18next";
import Pagination from "./Pagination";
import PropertyItem from "./PropertyItem";
import "./Search.scss";
import SearchMap from "./SearchMap";
import settings from "../../settings";
import { checkForArabic } from "../../helpers/arabicLangValidator";

class SearchResult extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDropdown: false,
      hoveredProperty: null,
      visiblePropertiesIds: [],
    };

    this.propertiesVisibleDebounce = _.debounce((markers) => {
      this.setState({ visiblePropertiesIds: markers.map((x) => x.id) });
    }, 100);
  }

  dropdownToggle() {
    this.setState({
      showDropdown: !this.state.showDropdown,
    });
  }

  onDropdownClick(sort) {
    this.props.onDropdownClick(sort);
    this.setState({
      showDropdown: false,
    });
  }

  hideSelector() {
    this.setState({
      showDropdown: false,
    });
  }

  searchByName() {
    this.props.searchByNameToggle();
  }

  propertyHover(property) {
    this.setState({ hoveredProperty: property ? property : null });
  }

  onPageChange(page) {
    this.props.onChangePage(page);
  }

  // visibleMarkersChanged = (markers) => {
  //   this.propertiesVisibleDebounce(markers);
  // };

  render() {
    return (
      <div className={`search-result-container ${checkForArabic("arabic-search-result-container")}`}>
        <div className="properties-list-col">
          {this.props.downloadingItems ? (
            <div className="loader" />
          ) : (
            <div>
              <div className="results-header">
                <div className="properties-sorting">
                  <div className="dropdown-container">
                    <input
                      type="text"
                      onClick={this.dropdownToggle.bind(this)}
                      value={this.props.t(
                        this.props.state.sortMethod?.translationKey
                      )}
                      readOnly
                      placeholder={this.props.t("sortBy")}
                      className="dropdown-input"
                    />
                    <div
                      onClick={this.dropdownToggle.bind(this)}
                      className={
                        "dropdown-triangle" +
                        (this.state.showDropdown ? " rotate" : "")
                      }
                    ></div>
                    {this.state.showDropdown ? (
                      <div
                        className="overlay"
                        onClick={this.hideSelector.bind(this)}
                      ></div>
                    ) : null}
                    <ul
                      className={
                        "dropdown" + (this.state.showDropdown ? " show" : "")
                      }
                    >
                      {settings.sortMethods.map((sort) => (
                        <li
                          onClick={this.onDropdownClick.bind(this, sort)}
                          key={sort.key}
                        >
                          {this.props.t(sort.translationKey)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className={`properties-list ${checkForArabic("arabic-properties-list")}`}>
                {this.props.properties.map((property) => (
                  <PropertyItem
                    key={property._id}
                    property={property}
                    onPropertyHover={this.propertyHover.bind(this)}
                    {...this.props}
                  />
                ))}

                <div className="total-properties">
                  {this.props.t(
                    this.props.totalProperties === 1
                      ? "propertyFound"
                      : "propertiesFound",
                    {
                      quantity: this.props.totalProperties,
                    }
                  )}
                </div>
                <Pagination
                  key={this.props.totalProperties}
                  onPageChange={this.onPageChange.bind(this)}
                  itemsCount={this.props.totalProperties}
                  selectedPage={this.props.selectedPage}
                  getListingParams={this.props.getListingParams}
                />
              </div>
            </div>
          )}
        </div>
        <div className="search-map-col">
          {this.props.downloadingMapItems ? (
            <div className="loader" />
          ) : (
            <SearchMap
              history={this.props.history}
              properties={this.props.properties}
              mapProperties={this.props.mapProperties}
              hoveredProperty={this.state.hoveredProperty}
              getListingParams={this.props.getListingParams}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withTranslation("search")(SearchResult);
