/**
 * @module ol-tinmap/marker
 */

import BaseObject from 'ol/Object';
import { Map } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point.js';
import { Fill, Stroke, Style, Circle } from 'ol/style';


import { set_messenger } from './messenger';



class Marker extends BaseObject{
  /**
   * Abstract Base Marker object (shows position of a given coordinate)
   */
  constructor(options) {
    super();
    options = options ? options : {};

    this.name = 'Marker';  // To help with debugging

    this.limit_bounds =
      typeof(options.limit_bounds) === 'boolean'? options.limit_bounds : true;
    
    this.messengers_ = set_messenger(options.messengers);

    this.coordinate = null;

    this.matrix = undefined;  // future - matrix used to convert pointer to marker coordinates including scale, rotate etc

  }
  move(coordinate){
    this.coordinate = coordinate;
    if (this.coordinate === null){
      console.debug('Hiding marker');
    } else {
      console.debug('Moving marker to ' + this.coordinate[0] + ' ' + this.coordinate[1]);
    }
    
    this.changed();
    this.broadcast(this.coordinate);

  }
  in_bounds(coordinate, container){
    return true;
  }
  broadcast(message){
    // Broadcast coordinate using messengers
    for (const key in this.messengers_){  // Broadcast coordinate using messengers
      this.messengers_[key].send(message);
    }
  }
}


class MapMarker extends Marker {
  constructor(options){
      super(options);
      options = options ? options : {};

      this.name = 'MapMarker';  // To help with debugging

      this.map =
        options.map instanceof Map ? options.map : new Map();

      // center view on coords
      this.center = 
        typeof options.center === 'boolean' ? options.center : false
      // Zoom to fixed value
      this.zoom = 
        options.zoom !== undefined ? options.zoom : null

      
      // Create new point layer on top of all others.
      // User defined or default (red) point style.
      
      const marker_style = new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({color: 'red'}),
          stroke: false
        })
      });

      // To: Do - make same coord sys as VectorSpace
      this.marker_feature = new Feature();
      this.marker_feature.setStyle(marker_style);
      this.marker_source = new VectorSource({
        features: [this.marker_feature]
      });
      const marker_layer = new VectorLayer({
          source: this.marker_source
        });
      this.map.addLayer(marker_layer);
      /*
      
      */
  }
  move(coordinate){
    this.coordinate = coordinate;
    if (this.coordinate === null){
      this.marker_feature.setGeometry();
      console.debug('Hiding marker (provided coordinate is null)');
    } else {
      this.marker_feature.setGeometry(new Point(coordinate));
      console.debug('Moving Map marker to ' + coordinate);

      // Center and zoom view
      // Future: Find out why ths causes crash - likely triggers pointer>marker>pointer.. event infinite cycle?
      //if (this.center) this.map.getView().setCenter(coordinate);
      //if (this.zoom) this.map.getView().setZoom(this.zoom);

    }
    this.changed();
    this.broadcast(this.coordinate);

  }
}


class DomMarker extends Marker{
  /**
   * Schema Marker object (shows position of marker)
   */
  constructor(options) {
    super(options);
    options = options ? options : {};

    this.name = 'DomMarker';  // To help with debugging

    // Conntainer is the eleent within which the target can move around within and the coordinates refer to
    if(options.container instanceof Element) {
      this.container = options.container;
    }
    else if (typeof options.container == 'string' && document.getElementById(options.container)) {
      this.container = document.getElementById(options.container);
    }
    else this.container = document.documentElement;
    
    this.target = create_target(options.target);
    this.target.style.pointerEvents = "none";  // This prevents the mouseout event being triggered on an underlying pointer element when the pointer is above the marker eg: when self_mark is true. This is undesirable (results in flickering)
    this.target.display = 'block';  // In case user element has display:none. When none, element size can not be calculated
    this.target.style.visibility = 'hidden';
    
    this.x_offset = // offset to use when positioning the marker target element. Will be subtracted from target coords. If not provided, calculated from width/2
      options.x_offset !== undefined ? options.x_offset : this.target.getBoundingClientRect()['width']/2;
        
    this.y_offset = // offset to use when positioning the marker target element. Will be subtracted from target coords. If not provided, calculated from height/2
      options.y_offset !== undefined ? options.y_offset : this.target.getBoundingClientRect()['height']/2;

    this.coordinate = null;

    this.matrix = undefined;  // Future - matrix used to convert pointer to marker coordinates including scale, rotate etc

  }
  move(coordinate){
    this.coordinate = coordinate;
    if (this.coordinate === null){
      this.target.style.visibility = 'hidden';
      console.debug('Hiding ' + this.name + ' marker (provided coordinate is null)');
    } else {
      // (offset_X, offset_y relate to actual elemet coordinate system)
      const container_rect = this.container.getBoundingClientRect();
      this.target.style.left = String(this.coordinate[0] + container_rect.left - this.x_offset) + 'px';
      this.target.style.top = String(this.coordinate[1] + container_rect.top - this.y_offset) + 'px';
      console.debug('Moving ' + this.name + ' marker to ' + this.target.style.left + ' ' + this.target.style.top);
      this.target.style.visibility = 'visible';
    }
    
    this.changed();
    this.broadcast(this.coordinate);
  }
  in_bounds(coordinate, container){

    if (coordinate === null || coordinate === undefined) return false;

    if (container === null || 
        container === undefined || 
        (!container instanceof HTMLElement 
          && !container instanceof Element)) return true;

    const boundingClientRect = container.getBoundingClientRect();

    const container_width = boundingClientRect['right'] - boundingClientRect['left'];
    const container_height = boundingClientRect['bottom'] - boundingClientRect['top'];

    if (coordinate[0] < 0 || coordinate[0] > container_width 
      || coordinate[1] < 0 || coordinate[1] > container_height) {
      console.debug('Coordinates out of bounds of ' + this.name + ' HTML Element');
      return false;
    }

    return true;
  }

}


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

  /*  // Sidn't seem to work creating elements from scatch
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

export {Marker, DomMarker, MapMarker};