/**
 * @module ol-tinmap/spaces/space
 */

import BaseObject from 'ol/Object';

import {Marker, DomMarker} from '../marker';
import {Pointer, GeolocationPointer} from '../pointer';



// Data source for coordinate transform
class Space extends BaseObject{
    /**
     * Abstract Input object
     */
    constructor(options) {
      super();
      options = options ? options : {};

      this.vertices = {};

      // Obtain starting container to look within. Allow actual HTML object orstring ID to search
      // If nothing provided - use whole document
      if(options.container instanceof Element) {
        this.container = options.container;
      }
      else if (typeof options.container == 'string' && document.getElementById(options.container)) {
        this.container = document.getElementById(options.container);
      }
      else this.container = document.documentElement;
      
      this.fallback_strategy = // null, "nearest_side" or "nearest_centroid"
        options.fallback_strategy !== undefined ? options.fallback_strategy : 'nearest_side';
  
      this.pointer = null;

      this.marker =null;

      this.mark_self = 
        options.mark_self !== undefined ? options.mark_self : true;

      this.limit_bounds = 
        options.limit_bounds !== undefined ? options.limit_bounds : true;
  
    }
    update_vertices(){

    }
    get_vertices(){
      return this.vertices;
    }
    in_bounds(coordinate){
      return true;
    }
  }

  export {Space};