import React from 'react';
import compose from 'recompose/compose';
import defaultProps from 'recompose/defaultProps';
import withState from 'recompose/withState';
import withAttachedProps from 'recompose/withAttachedProps';
import mapPropsOnChange from 'recompose/mapPropsOnChange';
import GoogleMapReact from 'google-map-react';
import ClusterMarker from './markers/ClusterMarker';
import supercluster from 'points-cluster';
import { susolvkaCoords, markersData } from './data/fakeData';

export const gMap = ({
  style, hoverDistance, options,
  mapProps: { center, zoom },
  hoveredMarkerId,
  onChange, onChildMouseEnter, onChildMouseLeave,
  clusters,
}) => (
  <GoogleMapReact
    style={style}
    options={options}
    hoverDistance={hoverDistance}
    center={center}
    zoom={zoom}
    onChange={onChange}
    onChildMouseEnter={onChildMouseEnter}
    onChildMouseLeave={onChildMouseLeave}
  >
    {
      clusters
        .map(({ wx, wy, numPoints, points }) => ({
          lat: wy,
          lng: wx,
          text: numPoints,
          id: `${numPoints}_${points[0].id}`,
        }))
        .map(({ ...markerProps, id }) => (
          <ClusterMarker
            key={id}
            hovered={id === hoveredMarkerId}
            {...markerProps}
          />
        ))
    }
  </GoogleMapReact>
);

export const gMapHOC = compose(
  defaultProps({
    clusterRadius: 50,
    hoverDistance: 30,
    options: {
      minZoom: 6,
      maxZoom: 15,
    },
    style: {
      position: 'relative',
      margin: 0,
      padding: 0,
      flex: 1,
    },
  }),
  // withState so you could change markers if you want
  withState(
    'markers',
    'setMarkers',
    markersData
  ),
  withState(
    'hoveredMarkerId',
    'setHoveredMarkerId',
    -1
  ),
  withState(
    'mapProps',
    'setMapProps',
    {
      center: susolvkaCoords,
      zoom: 10,
    }
  ),
  // describe events
  withAttachedProps(
    (getProps) => ({
      onChange({ center, zoom, bounds }) {
        const { setMapProps } = getProps();
        setMapProps({ center, zoom, bounds });
      },

      onChildMouseEnter(hoverKey, { id }) {
        const { setHoveredMarkerId } = getProps();
        setHoveredMarkerId(id);
      },

      onChildMouseLeave(/* hoverKey, childProps */) {
        const { setHoveredMarkerId } = getProps();
        setHoveredMarkerId(-1);
      },
    })
  ),
  // precalculate clusters if markers data has changed
  mapPropsOnChange(
    ['markers'],
    ({ ...props, markers = [], clusterRadius, options: { minZoom, maxZoom } }) => ({
      ...props,
      getCluster: supercluster(
        markers,
        {
          minZoom, // min zoom to generate clusters on
          maxZoom, // max zoom level to cluster the points on
          radius: clusterRadius, // cluster radius in pixels
        }
      ),
    })
  ),
  // get clusters specific for current bounds and zoom
  mapPropsOnChange(
    ['mapProps', 'getCluster'],
    ({ ...props, mapProps, getCluster }) => ({
      ...props,
      clusters: mapProps.bounds
        ? getCluster(mapProps)
        : [],
    })
  )
);

export default gMapHOC(gMap);
