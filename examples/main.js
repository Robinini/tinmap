
import './style.css';

import { Map, View } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import VectorSource from 'ol/source/Vector';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';


import { MapPointer } from 'ol-tinmap';

import { BroadcastMessenger, BroadcasMessengePointer } from 'ol-tinmap';
import { VectorSpace, DomSpace } from 'ol-tinmap';
import { Tinmap } from 'ol-tinmap';



const stationsSource = new VectorSource({
  url: './data/stations.geojson',
  format: new GeoJSON(),
});

const stationsLayer = new VectorLayer({
  source: stationsSource,
  style: {'circle-radius': 3,
      'circle-fill-color': 'magenta',
      'circle-stroke-color': 'gray',
      'circle-stroke-width': 0.5}
});

const osm_background = new TileLayer({
    source: new OSM(),
  });

const map = new Map({
  layers: [osm_background, stationsLayer], 
  target: 'map',
  view: new View({
    center: [-0.150, 51.520],
    projection: 'EPSG:4326',
    zoom: 11,
  }),
});



//////////////////////////////////////////////////////////////
// Tinmap use

// Create vector space using the ol source, and make the containg map a pointer element, broadcasting the coordinates also. 

const source = new VectorSpace({
  source: stationsSource, 
  id_att: "ogc_fid",
  mark_self: true,
  map: map
});

// Create a vector space using HTML DOM eelements from within the SVG - which has an id of 'schema'
const target = new DomSpace({container: "schema", mark_self: true});

// Map these two spaces
const tm = new Tinmap({spaces: [source, target]});  //, 




