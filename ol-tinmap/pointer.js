/**
 * @module tinmap/pointer
 */

import BaseObject from 'ol/Object';

import {Map as olMap} from 'ol';



// Pointer coordinate source
// ToDo: Map != Source coordinate system remember. May need to transform Map > Source Coordsys


// ToDo: Messenger clases can be attached to the Pointer which will simultaneously publish the pointer coordinate
class Messenger extends BaseObject { // ToDo 
  constructor(options){
    super();
    options = options ? options : {};
  }
  send(message){
    console.debug('Sending Message (Messenger Base Class - simulated): ' + message);
  }
}

class BroadcastMessenger extends Messenger { // ToDo 
  constructor(options){
    super(options);
    options = options ? options : {};

    // Connection to a broadcast channel
    this.bc = new BroadcastChannel(options.channel_name !== undefined ? options.channel_name : 'tinmap');

  }
  send(message){
    console.debug('Sending BroadcastChanel "' + this.bc.name + '" message: ' + message);
    this.bc.postMessage(message);
  }
}

class MqttMessenger extends Messenger { // ToDo 
  constructor(options){
    super(options);
    options = options ? options : {};
  }
}



class Pointer extends BaseObject {
    constructor(options){
      super();
      options = options ? options : {};

      if (options.messengers === undefined) this.messengers_ = [];
      else if (Array.isArray(options.messengers)) this.messengers_ = options.messengers;
      else if (options.messengers instanceof Messenger) this.messengers_ = [options.messengers];

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


class MapPointer extends Pointer {
    constructor(options){
        super(options);
        options = options ? options : {};

        this.map =
         options.map !== undefined ? options.map : new olMap();

        this.clear_marker_outside =
         options.clear_marker_outside !== undefined ? options.clear_marker_outside : true;

        // Add update coords event. If leving map - set coords to null
        const bf = this.update_coords.bind(this);
        this.map.on(['pointermove', 'click'], function (evt) {bf(evt.coordinate)});
        if(this.clear_marker_outside){
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


export {Messenger, BroadcastMessenger, MqttMessenger, Pointer, MapPointer, GeolocationPointer, BroadcasMessengePointer, MqttMessengePointer};