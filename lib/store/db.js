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

  getData (data, fragment) {
    const result = {};

    forEach(fragment, (frag, propertyName) => {
      const dataValue = data[propertyName] || null;

      if (typeof frag === 'object' && dataValue) {
        const isLink = dataValue.constructor === Link;

        const dataParsed = isLink ? dataValue.get() : dataValue;
        const isList = dataParsed && dataParsed.constructor === Array;
        const isId = typeof dataParsed !== 'object' && this.db[dataParsed];

        if (isList) {
          const list = [];
          forEach(dataParsed, (piece) => {
            const isPieceId = isLink || typeof piece !== 'object' && this.db[piece];
            list.push(this.getData(isPieceId ? this.db[piece] : piece, frag));
          });
          result[propertyName] = list;
        } else if (isId) {
          result[propertyName] = this.getData(this.db[dataParsed], frag);
        } else {
          result[propertyName] = this.getData(dataParsed, frag);
        }
      } else {
        result[propertyName] = dataValue;
      }
    });

    return result;
  }
}
