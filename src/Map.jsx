import React from 'react';
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