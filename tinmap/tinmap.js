/**
 * @module tinmap/tinmap
 */


import BaseObject from 'ol/Object';

import {TinShift, sliceIntoChunks} from '../../tinshift/tinshift'  // ToDO - proper package link please
import {Source} from './source';
import {Target} from './target';
import Delaunator from 'delaunator';

// ToDo: Future: Origin fallback to SendMessage on child window. 
// ToDO: Future: Orientation and Scale vectors along triangle edges to allow user to create eg: a 15 min. walk ellipse.
// ToDo: Future: Examples including https://commons.wikimedia.org/wiki/Category:Satellite_pictures_of_the_Alps#/media/File:Alpine_arc_(49262991813).jpg


class Tinmap extends BaseObject{

  /**
   * @param {Options} [options] Tinmap options.
   */

  constructor(options) {

    super();

    this.transformer = null;

    options = options ? options : {};

    this.source = // ToDo: Implement. What if undefined? First layer look for id?
      options.source !== undefined ? options.source : new Source();
  
    
    this.target = // ToDo: Implement. What if undefined? Any HTML thing with same id?
      options.target !== undefined ? options.target : new Target();   

    this.source.on("change", this.create_transformer.bind(this));
    this.source.pointer.on("change", this.move_marker.bind(this));
    this.target.on("change", this.create_transformer.bind(this));

    this.create_transformer();
  }

  create_transformer(){
    console.debug('Creating transformer');

    const sourcecoord_dict = this.source.get_coords();
    const target_coord_dict = this.target.get_coords();

    // Prepare delauney triangle data
    const ids_array = [];
    const coords_array = [];
    let target_coords;
    const vertices = [];  // suitable for tingrid
    for (const [id, sourcecoords] of Object.entries(sourcecoord_dict)) {
      if (id in target_coord_dict){  // Reduce to ids common in both source and target
        // Delauney input
        coords_array.push(sourcecoords);
        // Tingrid
        target_coords = target_coord_dict[id];
        vertices.push([sourcecoords[0], sourcecoords[1], target_coords[0], target_coords[1]]);
      }
    }
    // Create delauney trianngles
    const delaunay = Delaunator.from(coords_array);

    const tinshift_config = { name: "tinshift", 
                            input_crs: null, // ToDo
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
    if (this.source.pointer.coordinate === null){
      // Hide Pointer
      console.debug('Pointer out of frame');
      this.target.marker.move(this.source.pointer.coordinate);
    } else {
      // Move and show pointer
      console.debug('Moving coords');
      this.target.marker.move(this.transformer.forward(this.source.pointer.coordinate));
    }
    this.changed();
  }
  
}
  

export {Tinmap};