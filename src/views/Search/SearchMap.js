import { GoogleApiWrapper, InfoWindow, Map, Marker } from "google-maps-react";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { withTranslation } from "react-i18next";
import PropertyItem from "./PropertyItem";
import "./Search.scss";
import MarkerCluster from "./MarkerCluster";
import { searchService } from "../../services/searchService";

class SearchMap extends Component {
  constructor(props) {
    super(props);
    this.markerPath =
      "M-0.0006900000000005235,-27 C-5.523121,-27 -10,-22.5240517 -10,-17.000689700000002 C-10,-9.727448299999999 -0.5634999999999994,0 0.2879310000000004,0 C1.1351720000000007,0 10.000017,-10.5844655 10.000017,-17.000689700000002 C9.999552000000001,-22.5240517 5.522672,-27 -0.0006900000000005235,-27 L-0.0006900000000005235,-27 Z M-0.048171999999999215,-13.6582759 C-2.2156209999999996,-13.6582759 -3.971552,-15.3671897 -3.971552,-17.4769138 C-3.971552,-19.5852414 -2.216086,-21.2960172 -0.048171999999999215,-21.2960172 C2.1197409999999994,-21.2960172 3.876137999999999,-19.5852414 3.876137999999999,-17.4769138 C3.876137999999999,-15.3671897 2.1197409999999994,-13.6582759 -0.048171999999999215,-13.6582759 L-0.048171999999999215,-13.6582759 Z";
    this.style = [
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [
          {
            color: "#e9e9e9",
          },
          {
            lightness: 17,
          },
        ],
      },
      {
        featureType: "landscape",
        elementType: "geometry",
        stylers: [
          {
            color: "#f5f5f5",
          },
          {
            lightness: 20,
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.fill",
        stylers: [
          {
            color: "#ffffff",
          },
          {
            lightness: 17,
          },
        ],
      },
      {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [
          {
            color: "#ffffff",
          },
          {
            lightness: 29,
          },
          {
            weight: 0.2,
          },
        ],
      },
      {
        featureType: "road.arterial",
        elementType: "geometry",
        stylers: [
          {
            color: "#ffffff",
          },
          {
            lightness: 18,
          },
        ],
      },
      {
        featureType: "road.local",
        elementType: "geometry",
        stylers: [
          {
            color: "#ffffff",
          },
          {
            lightness: 16,
          },
        ],
      },
      {
        featureType: "poi",
        elementType: "geometry",
        stylers: [
          {
            color: "#f5f5f5",
          },
          {
            lightness: 21,
          },
        ],
      },
      {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [
          {
            color: "#dedede",
          },
          {
            lightness: 21,
          },
        ],
      },
      {
        elementType: "labels.text.stroke",
        stylers: [
          {
            visibility: "on",
          },
          {
            color: "#ffffff",
          },
          {
            lightness: 16,
          },
        ],
      },
      {
        elementType: "labels.text.fill",
        stylers: [
          {
            saturation: 36,
          },
          {
            color: "#333333",
          },
          {
            lightness: 40,
          },
        ],
      },
      {
        elementType: "labels.icon",
        stylers: [
          {
            visibility: "off",
          },
        ],
      },
      {
        featureType: "transit",
        elementType: "geometry",
        stylers: [
          {
            color: "#f2f2f2",
          },
          {
            lightness: 19,
          },
        ],
      },
      {
        featureType: "administrative",
        elementType: "geometry.fill",
        stylers: [
          {
            color: "#fefefe",
          },
          {
            lightness: 20,
          },
        ],
      },
      {
        featureType: "administrative",
        elementType: "geometry.stroke",
        stylers: [
          {
            color: "#fefefe",
          },
          {
            lightness: 17,
          },
          {
            weight: 1.2,
          },
        ],
      },
    ];

    this.state = {
      showingInfoWindow: false,
      activeMarker: null,
      activeProperty: null,
      gettingProperty: false,
      markerError: null,
    };
    this.mapRef = null;
    this.renderedMarkers = this.renderMarkerList();

    this.setMapRef = (element) => {
      this.mapRef = element;
    };
  }

  reloadMap = () => {
    if (!this.bounds) {
      this.bounds = new this.props.google.maps.LatLngBounds();
    }
    this.props.mapProperties.map((property) => {
      this.bounds.extend({
        lat: parseFloat(
          property.address?.lat ? property.address.lat : property.lat
        ),
        lng: parseFloat(
          property.address?.lng ? property.address.lng : property.lng
        ),
      });
      return true;
    });

    if (this.mapRef) {
      this.mapRef.map.fitBounds(this.bounds);
    }
  };

  handleNotFound = (props) => {
    searchService
      .getAvailableListings({
        ...this.props.getListingParams,
        listingIds: [props.marker.id],
        clearQuery: true,
      })
      .then((searchResult) => {
        const found = searchResult.results.find(
          (x) => x._id === props.marker.id
        );
        this.setState({
          activeProperty: found,
          gettingProperty: false,
          markerError: this.props.t("propertyNotFound"),
          foundClear: true,
        });
      })
      .catch(() => {
        this.setState({
          gettingProperty: false,
        });
      });
  };

  onMarkerClick = (props) => {
    this.setState({
      activeMarker: props.entry,
      showingInfoWindow: true,
      gettingProperty: true,
      activeProperty: null,
      markerError: null,
    });
    searchService
      .getAvailableListings({
        ...this.props.getListingParams,
        listingIds: [props.marker.id],
        omitPagination: true,
      })
      .then((searchResult) => {
        const found = searchResult.results.find(
          (x) => x._id === props.marker.id
        );
        if (!found) {
          this.handleNotFound(props);
        } else {
          this.setState({
            activeProperty: found,
            gettingProperty: false,
            markerError: null,
            foundClear: false,
          });
        }
      })
      .catch(() => {
        this.setState({
          gettingProperty: false,
        });
      });
  };

  renderMarkerList = () => {
    return this.props.mapProperties?.map((property) => (
      <Marker
        key={property.property_id}
        id={property.property_id}
        title={property.title}
        icon={{
          path: this.markerPath,
          fillColor: "black",
          fillOpacity: 1,
          strokeColor: "white",
        }}
        name={property.nickname}
        position={{
          lat: parseFloat(property.lat),
          lng: parseFloat(property.lng),
        }}
      />
    ));
  };

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
        activeProperty: null,
      });
    }
  };

  onPropertyClick = () => {
    if (this.state.foundClear) {
      return;
    }
    let url = "";
    if (
      this.props.getListingParams.checkIn &&
      this.props.getListingParams.checkOut
    ) {
      url = `?from=${this.props.getListingParams.checkIn}&to=${this.props.getListingParams.checkOut}&guests=${this.props.getListingParams.guestsCount}`;
    }
    this.props.history.push("/details/" + this.state.activeProperty._id + url);
  };

  onInfoWindowOpen = (props, e) => {
    const markerTooltip = (
      <div
        className={
          "marker-tooltip" + (this.state.foundClear ? " found-clear" : "")
        }
        onClick={this.onPropertyClick.bind(this)}
      >
        {this.state.activeProperty && (
          <PropertyItem
            showArrows={false}
            showDots={false}
            property={this.state.activeProperty}
            simpleView
            onPropertyHover={() => {}}
          />
        )}
        {this.state.gettingProperty && <div className="loader" />}
        {this.state.markerError && (
          <p
            className={
              "marker-error" + (this.state.foundClear ? " found-clear" : "")
            }
          >
            {this.state.markerError}
          </p>
        )}
      </div>
    );
    ReactDOM.render(
      React.Children.only(markerTooltip),
      document.getElementById("iwc")
    );
  };

  render() {
    return (
      <div className="search-map">
        <Map
          google={this.props.google}
          ref={this.setMapRef}
          maxZoom={18}
          onReady={this.reloadMap}
          zoom={14}
          onClick={this.onMapClicked}
          gestureHandling="greedy"
          styles={this.style}
          disableDefaultUI
          zoomControl
          bounds={this.bounds}
        >
          <MarkerCluster
            markers={this.renderedMarkers}
            click={this.onMarkerClick}
          />
          {this.props.hoveredProperty?._id && (
            <Marker
              key={this.props.hoveredProperty._id}
              id={this.props.hoveredProperty._id}
              title={this.props.hoveredProperty.title}
              icon={{
                path: this.markerPath,
                fillColor: "#AD8C63",
                fillOpacity: 1,
                strokeColor: "white",
                scale: 1.5,
              }}
              name={this.props.hoveredProperty.nickname}
              zIndex={99}
              position={{
                lat: parseFloat(this.props.hoveredProperty.address.lat),
                lng: parseFloat(this.props.hoveredProperty.address.lng),
              }}
            />
          )}
          <InfoWindow
            visible={this.state.showingInfoWindow}
            marker={this.state.activeMarker}
            onOpen={(e) => {
              this.onInfoWindowOpen(this.props, e);
            }}
          >
            <div id="iwc" />
          </InfoWindow>
        </Map>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_MAP_API_KEY,
})(withTranslation("search")(SearchMap));
