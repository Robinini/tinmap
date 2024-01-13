/**
 * @module ol-tinmap/pointer
 */

import BaseObject from 'ol/Object';
import {Map as olMap} from 'ol';

import {Messenger, set_messenger } from './messenger';


// Pointer coordinate source
// ToDo: Map != Source coordinate system remember. May need to transform Map > Source Coordsys

class Pointer extends BaseObject {
    constructor(options){
      super();
      options = options ? options : {};

      this.messengers_ = set_messenger(options.messengers);

      this.limit_bounds = false;

      this.coordinate = null;
    }
    update_coords(coordinate){
        console.debug('New pointer coordinate:' + coordinate);
        this.coordinate = coordinate;
        this.changed();
        for (const key in this.messengers_){  // Broadcast coordinate using messengers
          this.messengers_[key].send(this.coordinate);
        }
    }
  }


class DomPointer extends Pointer {
  constructor(options){
      super(options);
      options = options ? options : {};

      // ToDO - element or use text to find element byID
      this.element = options.element !== undefined ? this.element : document.documentElement;

      this.limit_bounds =
        options.limit_bounds !== undefined ? options.limit_bounds : true;

      // Add update coords event. If leaving map - set coords to null
      const bf = this.update_coords.bind(this);

      // set up and DOM moseovermove event and mouseout
      this.element.onmousemove = (evt) => {bf(evt.coordinate)};
      if(this.limit_bounds){
        this.element.onmouseout = (evt)=>{bf(null)};
      }
  }
}

class MapPointer extends Pointer {
    constructor(options){
        super(options);
        options = options ? options : {};

        this.map =
        options.map !== undefined ? options.map : new olMap();

        this.limit_bounds =
          options.limit_bounds !== undefined ? options.limit_bounds : true;

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