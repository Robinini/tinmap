/**
 * @module ol-tinmap/spaces/dom
 */

import {Space} from './space';
import {Marker, DomMarker} from '../marker';
import {Pointer, DomPointer} from '../pointer';


/*
ToDo: Future - allow non-embedded HTML <object> continaing SVGs to be provide. 
To actually update_vertices, Would need to test if <object>, then access the contained SVG sing getSVGDocument()

*/

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
      else if(options.pointer !== false) this.pointer = new DomPointer({container: this.container}); 

      // Use provided marker or if not false create marker, passing marker option which can be a html element or id (string)
      if(options.marker instanceof Marker) this.marker = options.marker;
      else if(options.marker !== false) this.marker = new DomMarker({container: this.container, target: options.marker});

      // Initiate vertex info
      this.update_vertices();

      // Set up change event on source, triggered by vector layer change
      window.addEventListener('resize', this.update_vertices.bind(this));  // window.onresize
    }
    
    update_vertices(){ 
      let coords = {}; 

      const container_rect = this.container.getBoundingClientRect();
      const elements = this.container.querySelectorAll('[id]');

      elements.forEach((e) => {coords[e.id] = this.get_element_coords(e, container_rect.left, container_rect.top);});
      console.debug(Object.keys(coords).length + ' schema points found in '  + this.name);

      this.vertices = coords;
      this.changed();
    }
  
    get_element_coords(element, base_offset_x=0, base_offset_y=0){
      const rect = element.getBoundingClientRect();
      let el_coords = [rect['x'] + rect['width']/2 - base_offset_x, 
                       rect['y'] + rect['height']/2 - base_offset_y];
      return el_coords;
    }

  }

export {DomSpace};