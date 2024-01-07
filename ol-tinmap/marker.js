/**
 * @module tinmap/marker
 */

import BaseObject from 'ol/Object';


function create_target(target){  // {HTMLElement|string} [target] The Element or id of the Element
    
    if (typeof target === 'string' || target instanceof String) target = document.getElementById(target);
    if (target instanceof HTMLElement) return target;

    // Undefined or not found - create new, default version
    target = document.createElement('div');
    target.className = 'marker';
    target.style.zIndex = '10';
    target.style.color='blue';
    target.style.width = '12';
    target.style.height = '12';
    target.style.position = 'absolute';
    target.style.display = 'inline-block';

    document.body.appendChild(target); 

    /*
    const svg = document.createElement('svg');
    svg.setAttribute('width', '12');
    svg.setAttribute('height', '12');
    target.appendChild(svg);

    const circle = document.createElement('circle');
    circle.setAttribute('r', '6');
    circle.setAttribute('cy', '6');
    circle.setAttribute('cx', '6');
    circle.setAttribute('style', 'stroke:none; stroke-width:0px; fill:red')
    svg.appendChild(circle);   
    */

    target.innerHTML = '<svg width="12" height="12"><circle cx="6" cy="6" r="6" style="stroke:none; stroke-width:0px; fill:red"/></svg>';
    return target;
}


class Marker extends BaseObject{
  /**
   * Schema Marker object (shows position of marker)
   */
  constructor(options) {
    super();
    options = options ? options : {};
    
    this.target = create_target(options.target);
    this.target.display = 'block';  // In case user element has display:none. When none, element size can not be calculated
    this.target.style.visibility = 'hidden';
    
    this.x_offset = // offset to use when positioning the marker element. Will be subtracted from target coords. If not provided, calculated from width/2
      options.x_offset !== undefined ? options.x_offset : this.target.getBoundingClientRect()['width']/2;
        
    this.y_offset = // offset to use when positioning the marker element. Will be subtracted from target coords. If not provided, calculated from height/2
      options.y_offset !== undefined ? options.y_offset : this.target.getBoundingClientRect()['height']/2;

    this.coordinate = null;

    this.matrix = undefined;  // ToDO future - matrix used to convert pointer to marker coordinates including scale, rotate etc

  }
  move(coordinate){
    this.coordinate = coordinate;
    if (this.coordinate === null){
      this.target.style.visibility = 'hidden';
      console.debug('Hiding marker (pointer out of range)');
    } else {
      this.target.style.visibility = 'visible';
      this.target.style.left = String(this.coordinate[0] - this.x_offset) + 'px';
      this.target.style.top = String(this.coordinate[1] - this.y_offset) + 'px';
      console.debug('Moving marker to ' + this.target.style.left + ' ' + this.target.style.top);
    }
    
    this.changed();
  }

}

export {Marker};