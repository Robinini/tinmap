/**
 * @module tinmap/spaces/space
 */

import BaseObject from 'ol/Object';

import {Marker} from '../marker';
import {Pointer, GeolocationPointer} from '../pointer';


// ToDo: default this.pointer, this.marker for each subclass type Vector, OlMap, DOM. Geolocation only as LAST RESORT


// Data source for coordinate transform
class Space extends BaseObject{
    /**
     * Abstract Input object
     */
    constructor(options) {
      super();
      options = options ? options : {};

      this.vertices = {};

      // Obtain starting container to look within. If nothing provided - use whole document
      this.container = 
        options.container !== undefined ? document.getElementById(options.container) : document.documentElement;
      
      this.fallback_strategy = // null, "nearest_side" or "nearest_centroid"
        options.fallback_strategy !== undefined ? options.fallback_strategy : 'nearest_side';
  
      this.pointer =
        options.pointer instanceof Pointer ? options.pointer : new GeolocationPointer();

      this.marker = new Marker({target: options.marker});
        options.marker instanceof Marker ? options.marker : new Marker({target: options.marker});;

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
  }

  export {Space};