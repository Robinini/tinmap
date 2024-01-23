/**
 * @module ol-tinmap/pointer
 */

import BaseObject from 'ol/Object';
import { Map } from 'ol';

import {Messenger, set_messenger } from './messenger';Map



// Pointer coordinate source
// ToDo: Map != Source coordinate system remember. May need to transform Map > Source Coordsys

class Pointer extends BaseObject {
    constructor(options){
      super();
      options = options ? options : {};

      this.messengers_ = set_messenger(options.messengers);

      this.limit_bounds =
        typeof(options.limit_bounds) === 'boolean'? options.limit_bounds : true;

      this.coordinate = null;
    }
    update_coords(coordinate){
        console.debug('New pointer coordinate:' + coordinate);
        this.coordinate = coordinate;
        this.changed();
        this.broadcast(this.coordinate);
        
    }
    in_bounds(coordinate, container){
      return true;
    }
    broadcast(message){
      for (const key in this.messengers_){  // Broadcast coordinate using messengers
        this.messengers_[key].send(message);
      }
    }
  }


class DomPointer extends Pointer {
  constructor(options){
      super(options);
      options = options ? options : {};

      // Obtain html element for user to point. Allow actual HTML object orstring ID to search
      // If nothing provided - use whole document
      if(options.element instanceof Element) {
        this.element = options.element;
      }
      else if (typeof options.element == 'string' && document.getElementById(options.element)) {
        this.element = document.getElementById(options.element);
      }
      else this.element = document.documentElement;
      
      // Add update coords event. If leaving map - set coords to null
      const bf = this.update_coords.bind(this);

      // set up and DOM moseovermove event and mouseout
      // (offset_X, offset_y relate to actual elemet coordinate system)
      this.element.onmousemove = (evt) => {bf([evt.clientX, evt.clientY])};
      if(this.limit_bounds){
        console.log(this.element);
        this.element.onmouseout = (evt)=>{bf(null)};
      }
  }
}

class MapPointer extends Pointer {
    constructor(options){
        super(options);
        options = options ? options : {};

        this.map =
          options.map instanceof Map ? options.map : new Map();

        // Add update coords event. If leaving map - set coords to null
        const bf = this.update_coords.bind(this);
        this.map.on(['pointermove', 'click'], function (evt) {bf(evt.coordinate)});
        if(this.limit_bounds){
          this.map.getViewport().addEventListener('mouseout', (evt)=>{bf(null)});
        }
    }
}

class GeolocationPointer extends Pointer {  // ToDo - use ol geolocation triggers
  constructor(options){
      super(options);
      options = options ? options : {};
  }
}

class BroadcasMessengePointer extends Pointer { // ToDo - use BroadcasMessenger triggers
  constructor(options){
    super(options);
    options = options ? options : {};

    // Connection to a broadcast channel
    this.bc = new BroadcastChannel(options.channel_name !== undefined ? options.channel_name : 'tinmap');

    // Add update coords event. If leving map - set coords to null
    const bf = this.update_coords.bind(this);
    this.bc.onmessage = (event) => {
      console.debug('New BroadcastMessage: ' + event + ' Data:' + event.data);
      bf(event.data);
    };
  }
}

class MqttMessengePointer extends Pointer { // ToDo - use MqttMessenger triggers
  constructor(options){
    super(options);
    options = options ? options : {};
  }
}


export {Pointer, DomPointer, MapPointer, GeolocationPointer, BroadcasMessengePointer, MqttMessengePointer};