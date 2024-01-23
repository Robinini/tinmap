/**
 * @module ol-tinmap/spaces/dom
 */

import {Space} from './space';
import {Marker, DomMarker} from '../marker';
import {Pointer, DomPointer} from '../pointer';


class DomSpace extends Space{
    /**
   * HTML DOM space
   */
    constructor(options) {
      super(options);
      options = options ? options : {};

      this.name = 'DomSpace';  // To help with debugging

      // Use provided pointer or if not false, create pointer using the space containing element.
      if(options.pointer instanceof Pointer) this.pointer = options.pointer;
      else if(options.pointer !== false) this.pointer = new DomPointer({element: this.container}); 

      // Use provided marker or if not false create marker, passing marker option which can be a html element or id (string)
      if(options.marker instanceof Marker) this.marker = options.marker;
      else if(options.marker !== false) this.marker = new DomMarker({target: options.marker});

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