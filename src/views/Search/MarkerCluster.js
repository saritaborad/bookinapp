import { useEffect } from "react";
import PropTypes from "prop-types";

import { MarkerClusterer } from "./MarkerClusterer.js";

const evtNames = [
  "click",
  "dblclick",
  "dragend",
  "mousedown",
  "mouseout",
  "mouseover",
  "mouseup",
  "recenter",
];

const markerCluster = (props) => {
  const { map, google, markers } = props;

  const handleEvent = ({ event, marker, entry }) => {
    if (props[event]) {
      props[event]({
        props: props,
        marker: marker,
        event: event,
        entry: entry,
      });
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (map && markers) {
      const mapMarkers = markers.map((marker) => {
        const entry = new google.maps.Marker({
          ...marker.props,
          position: {
            lat: marker.props.position.lat,
            lng: marker.props.position.lng,
          },
          map: map,
          name: marker.props.name,
        });

        evtNames.forEach((e) => {
          entry.addListener(e, () =>
            handleEvent({
              event: e,
              marker: marker.props,
              entry: entry,
            })
          );
        });

        return entry;
      });

      const clusterer = new MarkerClusterer(map, mapMarkers, {
        imagePath: '/images/m',
        minimumClusterSize: 5,
        maxZoom: 17,
        zoomOnClick: true
      });

      return () => {
        clusterer.clearMarkers();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, google, markers]);

  return null;
};

markerCluster.propTypes = {
  map: PropTypes.object,
  google: PropTypes.object,
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      props: PropTypes.shape({
        position: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
        }).isRequired,
        name: PropTypes.string.isRequired,
      }),
    })
  ),
};

export default markerCluster;
