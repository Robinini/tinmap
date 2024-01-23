/**
 * @module ol-tinmap/tinmap
 */


import Delaunator from 'delaunator';
import BaseObject from 'ol/Object';
import {TinShift, sliceIntoChunks} from 'tinshift'

import {Space} from './spaces/space';


// ToDo: Future: Origin fallback to SendMessage on child window. 
// ToDO: Future: Orientation and Scale vectors along triangle edges to allow user to create eg: a 15 min. walk ellipse.
// ToDo: Future: Examples including https://commons.wikimedia.org/wiki/Category:Satellite_pictures_of_the_Alps#/media/File:Alpine_arc_(49262991813).jpg


/**
 * @classdesc
 * Tinmap mapping object. Will attempt to create mapping 'pairs' between any number of Spaces which should share some vertex (ids).
 * Space will be used as a source if it has a pointer.
 * Space will be used as a target if it has a marker.
 * Space will be paired to itself if it has a pointer and a marker and the option 'mark_self' is true.
 *
 * @api
 */
class Tinmap extends BaseObject {
/**
   * @param {Options} [options] Tinmap options.
   */

  constructor(options) {

    super();
    options = options ? options : {};

    this.pairs_ = [];

    this.spaces_ = options.spaces !== undefined ? options.spaces : [];

    for (const space in this.spaces_){
      this.add_space(this.spaces_[space]);
    }
  }
  add_space(space){
    // Add to this.spaces_
    if(!this.spaces_.includes(space)) this.spaces_.push(space);

    // Loop through possible pair combinations and add if missing
    for (const source_space in this.spaces_) {
      for (const target_space in this.spaces_) {
        if (!this.pair_exists_(this.spaces_[source_space], this.spaces_[target_space]) 
            && (this.spaces_[source_space] !== this.spaces_[target_space] || this.spaces_[source_space].mark_self)
            && this.spaces_[source_space].pointer && this.spaces_[target_space].marker){
          console.debug('Adding new pair');
          this.pairs_.push(new TinmapPair({source:this.spaces_[source_space], target: this.spaces_[target_space]}));
        }
      }
    }
  }
  remove_space(space){
    // Remove from spaces_
    const index = this.spaces_.indexOf(space);
    if (index > -1) { // only splice array when item is found
      console.log('Removing space');
      this.spaces_.splice(index, 1);
      // Remove relevant pairs
      for (const i of this.pair_indices_(space).reverse()) {
        this.pairs_[i].deconstruct();
        this.pairs_.splice(i, 1);
      }
    }
  }
  pair_indices_(space){
    const indices = [];
    for (const i in this.pairs_){
      if (this.pairs_[i].source === space || this.pairs_[i].target === space) indices.push(i);;
    }
    console.log('Found ' + indices.length + ' pairs (to remove)');
    return indices;  // in ascending order
  }
  /**
   * 
   * @param {Space} source - 
   * @param {Space} target 
   * @returns 
   */
  pair_exists_(source, target){
    for (const pair in this.pairs_) {
      if (this.pairs_[pair].source === source && this.pairs_[pair].target === target) {
        console.debug('Pair found in pairs, no need to add');
        return true;
      }
    }
    console.debug('Pair not found in pairs');
    return false;
  }
}


class TinmapPair extends BaseObject{

  /**
   * @param {Options} [options] MapPair options.
   */

  constructor(options) {

    super();
    options = options ? options : {};
    
    this.source =
      options.source !== undefined ? options.source : new Space();
  
    this.target =
      options.target !== undefined ? options.target : new Space();   

    this.events_ = [];
    this.add_event(this.source, "change", this.create_transformer.bind(this));    
    this.add_event(this.source.pointer, "change", this.move_marker.bind(this));
    this.add_event(this.target, "change", this.create_transformer.bind(this));

    this.transformer = null;
    this.create_transformer();
  }

  add_event(target, event, handler){
    this.events_.push([target, event, handler]);
    target.on(event, handler);
  }

  deconstruct(){
    // Hide marker
    this.target.marker.move(null);

    // Remove all registered events
    for (const i in this.events_){
      const target = this.events_[i][0];
      const event = this.events_[i][1];
      const handler = this.events_[i][2];
      target.un(event, handler);
    }
  }

  create_transformer(){
    console.debug('Creating transformer');

    const sourcecoord_dict = this.source.get_vertices();
    const target_coord_dict = this.target.get_vertices();

    // Prepare delauney triangle data
    const ids_array = [];
    const coords_array = [];
    let target_vertices;
    const vertices = [];  // suitable for tingrid
    for (const [id, sourcecoords] of Object.entries(sourcecoord_dict)) {
      if (id in target_coord_dict){  // Reduce to ids common in both source and target
        // Delauney input
        coords_array.push(sourcecoords);
        // Tingrid
        target_vertices = target_coord_dict[id];
        vertices.push([sourcecoords[0], sourcecoords[1], target_vertices[0], target_vertices[1]]);
      }
    }
    // Create delauney trianngles
    const delaunay = Delaunator.from(coords_array);

    const tinshift_config = { name: "tinshift", 
                            input_crs: null, // ToDo: Future?
                            fallback_strategy: this.source.fallback_strategy,
                            transformed_components: [ "horizontal" ],
                            vertices_columns: [ "source_x", "source_y", "target_x", "target_y" ],
                            triangles_columns: [ "idx_vertex1", "idx_vertex2", "idx_vertex3" ],
                            vertices: vertices,
                            triangles: sliceIntoChunks(delaunay.triangles)} ;  
    this.transformer = new TinShift(tinshift_config);

    this.changed();
  }
  move_marker(){

    if(!this.target.marker) return;

    const source_coords = this.source.pointer.coordinate;    
    let target_coords = null;

    if (source_coords === null) {
      console.log('Source (' + this.source.name + ') coordinate is null');
    }
    else if (this.source.pointer && this.source.pointer.limit_bounds && !this.source.pointer.in_bounds(source_coords, this.source.container)) {
      console.log('Source (' + this.source.name + ') out of bounds');
    } else {
      // Calculate target coordinates from current coordinates NB: If the source spave = target space, target_coords = source_coords
      target_coords = this.source === this.target ? source_coords: this.transformer.forward(source_coords);
    }

    if (target_coords === null) {
      console.log('Target (' + this.target.name + ') coordinate is null');
    }
    else if (this.target.marker && this.target.marker.limit_bounds && !this.target.marker.in_bounds(target_coords, this.target.container)){
      console.log('Source (' + this.source.name + ') out of bounds');
      target_coords = null;  // Hide marker
    }
    // Move and show marker
    console.debug('Moving marker coords to ' + target_coords);
    this.target.marker.move(target_coords);
    this.changed();
  }
}



export {Tinmap, TinmapPair};