/**
 * @module tinmap/target
 */


import BaseObject from 'ol/Object';

import {Marker} from './marker';




//////////////////////////////////////////////////////////
// Output objects
// Vector source, Map, SVG/HTML DOM Element, Broadcast, Local-Object

class Target extends BaseObject{
  /**
   * Abstract Target (Output) object
   */
    constructor(options) {
      super();
      options = options ? options : {};

      this.marker = new Marker({target: options.marker});

      this.limit_target_bounds =  // ToDo: Implement
        options.limit_target_bounds !== undefined ? options.limit_target_bounds : true;

    }
    
    get_coords(){
      return {};
    }  
  }
  
class DomTinmapTarget extends Target{
    /**
   * Output object
   */
    constructor(options) {
        super(options);
        options = options ? options : {};

        // Obtain starting container to look within. If nothing provided - use whole document
        this.container = 
            options.container !== undefined ? document.getElementById(options.container) : document;

        // Set up change event on source, triggered by vector layer change
        onresize = this.changed.bind(this);  // window.onresize
    }
    
    get_coords(){ 
      let coords = {}; 

      const elements = this.container.querySelectorAll('[id]');

      elements.forEach((e) => {coords[e.id] = this.get_element_coords(e);});
      console.debug(Object.keys(coords).length + ' schema points found in html');
  
      return coords;
    }
  
    get_element_coords(element){
      const rect = element.getBoundingClientRect();
      return [rect['x'] + rect['width']/2, rect['y'] + rect['height']/2];
    }

  }

export {Target, DomTinmapTarget};