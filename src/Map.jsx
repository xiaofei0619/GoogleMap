import React from 'react';
import { Alert } from 'rsuite';
import {
  Button, Form, Col, Row,
} from 'react-bootstrap';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import mapStyles from './mapStyles.js';
import './map.css';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
import "@reach/combobox/styles.css";

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
  const onSetSelected = React.useCallback(() => {
    setSelected(1);
  }, []);

  const [travelMode, setTravelMode] = React.useState("DRIVING");
  const onSetTravelMode = React.useCallback((event) => {
    const { target } = event;
    const { value } = target;
    setTravelMode(value);
  }, []);

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({lat, lng}) => {
    setStartMarker({ lat, lng });
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
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
      <Search panTo={panTo} />
      <Locate panTo={panTo} />
      <div className="mode">
      <Form>
        <Form.Group as={Row} style={{ marginTop: '5px' }}>
          <Col md={6} style={{ paddingRight: '0' }}>
            <Form.Control
              as="select"
              size="md"
              id="travelMode"
              name="travelMode"
              onChange={onSetTravelMode}
            >
              <option value="">Travel Mode</option>
              <option value="DRIVING">DRIVING</option>
              <option value="BICYCLING">BICYCLING</option>
              <option value="TRANSIT">TRANSIT</option>
              <option value="WALKING">WALKING</option>
            </Form.Control>
          </Col>
          <Col md={3} style={{ paddingLeft: '0' }}>
            <Button
              type="submit"
              size="md"
              variant="dark"
              disabled={startMarker.lat === null}
              // onClick={onSubmitOrder}
            >
              GO!
            </Button>
          </Col>
        </Form.Group>
      </Form>
      </div>
      <div className="map">
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
            onClick={onSetSelected}
          />
          {selected ? (
            <InfoWindow
              position={{ lat: 47.650906, lng: -122.349274 }}
              onCloseClick={() => {
                setSelected(null);
              }}
            >
              <div>
                <h5>Awesome Dimsum</h5>
                <p>1210 Clear Water Bay Road</p>
                <p>Seattle, WA 98199, US</p>
              </div>
            </InfoWindow>
          ) : null}

          {startMarker.lat ? (
            <Marker
              position={{ lat: startMarker.lat, lng: startMarker.lng }}
            />
          ) : null}
        </GoogleMap>
      </div>
    </div>
  );
}

function Locate({ panTo }) {
  const getLocation = () => {
    if (!navigator.geolocation) {
      Alert.error('Geolocation is not supported by your browser!', 5000);
    } else {
      Alert.success('Locating...', 4000);
      navigator.geolocation.getCurrentPosition((position) => {
        Alert.success('Success!', 6000);
        panTo({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (err) => {
        Alert.error('Unable to retrieve your location!', 6000);
        console.log(err);
      }
      );
    }
  };
  return (
    <button
      className="locate"
      onClick={getLocation}
    >
      <img src="compass.svg" alt="Locate User Position"/>
    </button>
  );
}

function Search({ panTo }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      country: 'us',
    },
  });

  const handleSelect = async (address) => {
    setValue("", false);
    clearSuggestions();
    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0])
      panTo({ lat, lng });
    } catch (err) {
      console.log("Error: ", err);
    }
  }

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          disabled={!ready}
          placeholder='Enter Your Address...'
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id} value={description} />
              ))
            }
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}