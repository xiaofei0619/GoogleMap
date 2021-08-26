import React from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import mapStyles from './mapStyles.js';
import './map.css';

export default function Map() {
  const libraries = ['places'];
  const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
  };
  const center = {
    lat: 47.650506,
    lng: -122.349274,
  };
  const options = {
    styles: mapStyles,
    disableDefaultUI: true,
    zoomControl: true,
  };

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAP_KEY,
    libraries, // Use variables to prevent redenering in React
  });

  const [startMarker, setStartMarker] = React.useState({
    lat: null,
    lng: null,
  });
  const [selected, setSelected] = React.useState(null);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  if (loadError) {
    return 'Error Loading Maps!';
  }
  if (!isLoaded) {
    return 'Loading Maps...';
  }

  return (
    <div>
      <h2>
        AwesomeDimsum <span role="img" aria-label="tent">🥢</span>
      </h2>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={center}
        options={options}
        onLoad={onMapLoad}
      >
        <Marker
          position={{ lat: 47.650506, lng: -122.349274 }}
          icon={{
            url: '/Logo2.png',
            scaledSize: new window.google.maps.Size(60, 60),
          }}
          onClick={() => {
            setSelected(1);
          }}
        />
        {selected ? (
          <InfoWindow
            position={{ lat: 47.650906, lng: -122.349274 }}
            onCloseClick={() => {
              setSelected(null);
            }}
          >
            <div>
              <h3>Awesome Dimsum</h3>
              <p>1210 Clear Water Bay Road</p>
              <p>Seattle, WA 98199, US</p>
            </div>
          </InfoWindow>
        ) : null}
      </GoogleMap>
    </div>
  );
}