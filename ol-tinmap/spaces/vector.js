/**
 * @module ol-tinmap/spaces/vector
 */

import { Space } from './space';
import { Marker, MapMarker } from '../marker';
import { Pointer, MapPointer } from '../pointer';


class VectorSpace extends Space {
    /**
     * Open layers Vector Layer space
     */
    constructor(options) {
      super(options);
      options = options ? options : {};


      // Use provided pointer or if not false, , passing map option which may be an ol Map instance (or undefined)
      if(options.pointer instanceof Pointer) this.pointer = options.pointer;
      else if(options.pointer !== false) this.pointer = new MapPointer({map: options.map});

      // Use provided marker or if not false create marker, passing map option which may be an ol Map instance (or undefined)
      if(options.marker instanceof Marker) this.marker = options.marker;
      else if(options.marker !== false) this.marker = new MapMarker({target: options.map});
  
      this.source =
        options.source !== undefined ? options.source : null;
  
      this.id_att =
        options.id_att !== undefined ? options.id_att : null;

      // Initiate vertex info
      this.update_vertices();
  
      // Set up change event on source, triggered by vector layer change
      this.source.on('change', this.update_vertices.bind(this));
    }

    update_vertices(){
      let coords = {};
      const att = this.id_att;
      this.source.forEachFeature(function (feature) {
        // ToDo: Connvert to map lat lon or whatever the map is using?
        coords[feature.get(att)] = feature.getGeometry().getCoordinates();
      });
      console.debug(Object.keys(coords).length + ' schema points found in Open layers Vector Layer');

      this.vertices = coords;
      this.changed();
    }
  
  }
  
  
  export {VectorSpace};