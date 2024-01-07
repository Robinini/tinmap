/**
 * @module tinmap/tinmap
 */


import Delaunator from 'delaunator';
import BaseObject from 'ol/Object';
import {TinShift, sliceIntoChunks} from '../../../tinshift/tinshift'  // ToDO - proper package link please

import {Space} from './space';


// ToDo: Future: Origin fallback to SendMessage on child window. 
// ToDO: Future: Orientation and Scale vectors along triangle edges to allow user to create eg: a 15 min. walk ellipse.
// ToDo: Future: Examples including https://commons.wikimedia.org/wiki/Category:Satellite_pictures_of_the_Alps#/media/File:Alpine_arc_(49262991813).jpg

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
        if (!this.pair_exists(this.spaces_[source_space], this.spaces_[target_space]) 
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
    const index = this.spaces_.indexOf(5);
    if (index > -1) { // only splice array when item is found
      console.log('Removing space');
      this.spaces_.splice(index, 1);
      // Remove relevant pairs
      for (const i of this.pair_indices(space).reverse()) {
        this.pairs_.splice(i, 1);
      }
    }
  }
  pair_indices(space){
    const indices = [];
    for (i in this.pairs_){
      if (this.pairs_[i].source === space || this.pairs_[i].target === space) indices.push(i);;
    }
    return this.pair_indices;  // in ascending order
  }
  
  pair_exists(source, target){
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
    
    this.source = // ToDo: Implement. What if undefined? First layer look for id?
      options.source !== undefined ? options.source : new Space();
  
    
    this.target = // ToDo: Implement. What if undefined? Any HTML thing with same id?
      options.target !== undefined ? options.target : new Space();   

    this.source.on("change", this.create_transformer.bind(this));
    this.source.pointer.on("change", this.move_marker.bind(this));
    this.target.on("change", this.create_transformer.bind(this));

    this.transformer = null;
    this.create_transformer();
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
                            input_crs: null, // ToDo?
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

    const target_vertices = this.transformer.forward(this.source.pointer.coordinate);

    if (this.target_vertices === null || (this.target.limit_bounds && !in_bounds(target_vertices, this.target.container))){
      // Hide Pointer
      console.debug('Pointer out of frame');
      this.target.marker.move(null);
    } else {
      // Move and show pointer
      console.debug('Moving marker coords');
      this.target.marker.move(target_vertices);
    }
    this.changed();
  }
  
}
  
function in_bounds(coordinate, container){

  if (coordinate === null || coordinate === undefined) return false;

  if (!container instanceof HTMLElement && !container instanceof Element) return true;

  const boundingClientRect = container.getBoundingClientRect();

  if (coordinate[0] < boundingClientRect['left'] || coordinate[0] > boundingClientRect['right'] 
      || coordinate[1] < boundingClientRect['top'] || coordinate[1] > boundingClientRect['bottom']) {
    console.debug('Coordinates out of bounds of HTML Element');
        return false;
  }

  return true;
  

}
export {Tinmap, TinmapPair};