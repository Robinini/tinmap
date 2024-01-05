/**
 * @module tinmap/source
 */

import BaseObject from 'ol/Object';

import{GeolocationPointer} from './pointer';



//////////////////////////////////////////////////////////
// Source (Input) objects
// Vector source, Broadcast, Variable, Geolocation


// ToDo: Force load of data without map. https://stackoverflow.com/questions/70892489/how-to-force-openlayers-to-load-source


// Data source for coordinate transform
class Source extends BaseObject{
  /**
   * Abstract Input object
   */
  constructor(options) {
    super();
    options = options ? options : {};
    
    this.fallback_strategy = // null, "nearest_side" or "nearest_centroid"
      options.fallback_strategy !== undefined ? options.fallback_strategy : 'nearest_side';

    this.pointer =
      options.pointer !== undefined ? options.pointer : new GeolocationPointer();

  }
  get_coords(){
    return {};
  }

}

class VectorTinmapSource extends Source {
  /**
   * Open layers Vector Layer input object
   */
  constructor(options) {
    super(options);
    options = options ? options : {};

    this.source =
      options.source !== undefined ? options.source : null;

    this.id_att =
      options.id_att !== undefined ? options.id_att : null;

    // Set up change event on source, triggered by vector layer change
    this.source.on('change', this.changed.bind(this));
  }

  get_coords(){
    let coords = {};
    const att = this.id_att;
    this.source.forEachFeature(function (feature) {
      // ToDo: Connvert to map lat lon or whatever the map is using?
      coords[feature.get(att)] = feature.getGeometry().getCoordinates();
    });
    console.debug(Object.keys(coords).length + ' schema points found in Open layers Vector Layer input object');
    return coords;
  }

}


export {Source, VectorTinmapSource};