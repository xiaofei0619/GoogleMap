import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import {
  GoogleMap,
  withScriptjs,
  withGoogleMap,
  Marker,
  InfoWindow,
} from 'react-google-maps/lib';
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from 'react-places-autocomplete';

// Routing Example with react-google-maps
// https://github.com/tomchentw/react-google-maps/blob/master/src/components/DirectionsRenderer.md
function Map() {
  const [selected, setSelected] = useState(null);

  return (
    <div>
      <GoogleMap
        defaultZoom={14}
        defaultCenter={{ lat: 47.650506, lng: -122.349274 }}
        // options={{ disableDefaultUI: true, zoomControl: true, }}
      >
        <Marker
          position={{ lat: 47.650506, lng: -122.349274 }}
          onClick={() => {
            setSelected(1);
          }}
          icon={{
            url: '/Logo2.png',
            scaledSize: new window.google.maps.Size(80, 80),
          }}
        />
        {/* <Marker
          position={{ lat: 47.630506, lng: -122.349274 }}
        /> */}
        {selected && (
          <InfoWindow
            position={{ lat: 47.652506, lng: -122.349274 }}
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
        )}
      </GoogleMap>
    </div> 
  );
}

const WrappedMap = withScriptjs(withGoogleMap(Map));

export default function MyMap() {
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [address, setAddress] = useState("");
  const [searchCoordinates, setSearchCoordinates] = React.useState({
    lat: null,
    lng: null,
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setUserStatus('Geolocation is not supported by your browser');
    } else {
      setUserStatus('Locating...');
      navigator.geolocation.getCurrentPosition((position) => {
        setUserStatus('Success');
        setUserLat(position.coords.latitude);
        setUserLng(position.coords.longitude);
      }, (err) => {
        setUserStatus('Unable to retrieve your location');
        console.log(err);
      });
    }
  };

  const handleSelect = async value => {
    const results = await geocodeByAddress(value);
    const latlng = await getLatLng(results[0]);
    setSearchCoordinates(latlng);
    setAddress(value);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Button
        variant="dark"
        onClick={getLocation}
      >
        Get My Current Location
      </Button>
      <p>{userStatus}</p>
      {userLat && <p>Latitude: {userLat}</p>}
      {userLng && <p>Longitude: {userLng}</p>}

      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <p>Search Location Latitude: {searchCoordinates.lat}</p>
            <p>Search Location Longitude: {searchCoordinates.lng}</p>

            <input {...getInputProps({
              placeholder: 'Search for address...'
            })}/>
            <div>
              {loading && <div>Loading...</div>}

              {suggestions.map((suggestion, index) => {
                const style = {
                  backgroundColor: suggestion.active ? "#9dd3a8" : "#ceefe4"
                };
                return (
                  <div key={index} {...getSuggestionItemProps(suggestion, { style })}>
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          </div>
        )} 
      </PlacesAutocomplete>

      <WrappedMap
        googleMapURL={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAP_KEY}&v=3.exp&libraries=geometry,drawing,places`}
        loadingElement={<div style={{ height: '100%' }} />}
        containerElement={<div style={{ height: '550px', width: '100%' }} />}
        mapElement={<div style={{ height: '100%' }} />}
      />
    </div>
  );
}
