import forEach from 'lodash.foreach';
import invariant from 'invariant';
import merge from 'lodash.merge';

import iterateField from '../helpers/iterate-field';
import Link from './link';

// The store is responsible for holding and managing data
export default class DB {
  constructor () {
    // Local database
    // composed of data nodes, e.g.
    // {
    //   56d0583eb0dc646f07b05cf2: {...},
    //   568fc7d152e76bc604a74520: {...}
    // }
    this.db = {};
  }

  mergeChanges (changes) {
    merge(this.db, changes);
  }

  removeNode (id) {
    this.db[id] && delete this.db[id];
  }

  performUserMutate ({nodeId, type, field}, nodes) {
    invariant(nodeId, 'Relate: mutate does not have a nodeId defined');
    invariant(type, 'Relate: mutate does not have a type defined');
    invariant(field, 'Relate: mutate does not have a field defined');
    let result = [];
    const nodeToMutate = this.db[nodeId];
    if (nodeToMutate) {
      iterateField(field, nodeToMutate, (dataField, parent, lastField) => {
        if (dataField.constructor === Link) {
          // add nodes to data field
          const nodeToMutateNodes = dataField.get();
          const nodesArr = nodes.constructor === Array ? nodes : [nodes];
          parent[lastField] = new Link([...nodeToMutateNodes, ...nodesArr]);
          result = [nodeId];
        }
      });
    }
    return result;
  }

  getData (data) {
    const isList = data && data.constructor === Array;
    const isId = data && typeof data !== 'object' && this.db[data];
    const isObject = data && typeof data === 'object';
    const isLink = data && data.constructor === Link;
    let result;

    if (isLink) {
      const linkData = data.get();
      if (linkData && linkData.constructor === Array) {
        result = [];
        forEach(linkData, (piece) => {
          result.push(this.getData(piece));
        });
      } else {
        result = this.getData(linkData);
      }
    } else if (isList) {
      result = [];
      forEach(data, (piece) => {
        result.push(this.getData(piece));
      });
    } else if (isId) {
      result = {};
      const nodeData = this.db[data];
      forEach(nodeData, (piece, pieceName) => {
        if (typeof piece === 'object') {
          result[pieceName] = this.getData(piece);
        } else {
          result[pieceName] = piece;
        }
      });
    } else if (isObject) {
      result = {};
      forEach(data, (piece, pieceName) => {
        result[pieceName] = this.getData(piece);
      });
    } else {
      result = data;
    }

    return result;
  }
}
