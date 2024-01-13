/**
 * @module ol-tinmap/spaces/dom
 */

import {Space} from './space';


class DomSpace extends Space{
    /**
   * HTML DOM space
   */
    constructor(options) {
        super(options);
        options = options ? options : {};

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

    in_bounds(coordinate, container){

      if (coordinate === null || coordinate === undefined) return false;

      if (this.container === null || this.container === undefined || (!this.container instanceof HTMLElement && !this.container instanceof Element)) return true;

      const boundingClientRect = this.container.getBoundingClientRect();

      if (coordinate[0] < boundingClientRect['left'] || coordinate[0] > boundingClientRect['right'] 
        || coordinate[1] < boundingClientRect['top'] || coordinate[1] > boundingClientRect['bottom']) {
      console.debug('Coordinates out of bounds of HTML Element');
          return false;
      }

      return true;
    }


  }

export {DomSpace};