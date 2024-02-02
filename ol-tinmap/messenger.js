/**
 * @module ol-tinmap/messenger
 */

import BaseObject from 'ol/Object';


// ToDo: Messenger classes can be attached to the Pointer or Marker which will simultaneously publish the pointer coordinate

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

      // ("broker.hivemq.com", 1883, 60) - WARN USER IF GOES TO DEFAULT
    }
    send(message){
      // publish('ol-tinmap/space.name/', json.dumps([1, 2, 3, i]).encode('utf-8'), 0)
    }
  }


/**
 * Creates an Array from possible user options
 * @param {*} option Option provided by user
 */
function set_messenger(option){
    if (option === undefined) return [];
    if (Array.isArray(option)) return option;
    if (option instanceof Messenger) return [option];
  }


export {Messenger, BroadcastMessenger, MqttMessenger, set_messenger};