/**
 * @module tinmap/spaces/space
 */

import BaseObject from 'ol/Object';

import {Marker} from '../marker';
import {GeolocationPointer} from '../pointer';


// Data source for coordinate transform
class Space extends BaseObject{
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

      this.marker = new Marker({target: options.marker});  // ToDO - allow string/DOM Element or actual Marker object 

      this.limit_bounds = 
          options.limit_bounds !== undefined ? options.limit_bounds : true;
  
    }
    get_coords(){
      return {};
    }
  
  }

  export {Space};