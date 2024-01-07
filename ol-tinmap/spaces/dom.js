/**
 * @module tinmap/spaces/dom
 */

import {Space} from './space';


class DomSpace extends Space{
    /**
   * HTML DOM space
   */
    constructor(options) {
        super(options);
        options = options ? options : {};

        // Obtain starting container to look within. If nothing provided - use whole document
        this.container = 
          options.container !== undefined ? document.getElementById(options.container) : document;

        // Initiate vertex info
        this.update_vertices();

        // Set up change event on source, triggered by vector layer change
        window.addEventListener('resize', this.update_vertices.bind(this));  // window.onresize
    }
    
    update_vertices(){ 
      let coords = {}; 

      const elements = this.container.querySelectorAll('[id]');

      elements.forEach((e) => {coords[e.id] = this.get_element_coords(e);});
      console.debug(Object.keys(coords).length + ' schema points found in HTML DOM Element');

      this.vertices = coords;
      this.changed();
    }
  
    get_element_coords(element){
      const rect = element.getBoundingClientRect();
      return [rect['x'] + rect['width']/2, rect['y'] + rect['height']/2];
    }

  }

export {DomSpace};