import actionTypes from '../actions/types';
import Store from '../store';

const store = new Store();

// Default state
// state will be composed of connectors data, e.g.
// {
//   connector_1: {
//     pages: [{...}, {...}]
//   },
//   connector_2: {
//     page: {...}
//   }
// }
const defaultState = {
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  },
  body: {},
  endpoint: '/graphql'
};

export function relateReducer (state = defaultState, action = {}) {
  if ((action.type === actionTypes.query || action.type === actionTypes.mutation) &&
      action.data &&
      action.fragments) {
    const isMutation = action.type === actionTypes.mutation;
    const isRemoveMutation = isMutation && action.mutationType === 'REMOVE';

    const changes = store.processIncoming({
      data: action.data,
      fragments: action.fragments,
      connectors: action.connectors,
      mutates: action.mutates,
      isMutation,
      isRemoveMutation
    });

    return Object.assign({}, state, changes);
  }

  if (action.type === actionTypes.removeConnector) {
    const newState = Object.assign({}, state);
    delete newState[action.id];
    store.deleteConnector(action.id);
    // TODO Delete no longer needed data from state? or maintain for future cache?
    return newState;
  }

  if (action.type === actionTypes.setHeader) {
    return Object.assign({}, state, {
      headers: Object.assign({}, state.headers, {
        [action.key]: action.value
      })
    });
  }

  if (action.type === actionTypes.removeHeader) {
    const headers = Object.assign({}, state.headers);
    delete headers[action.key];
    return Object.assign({}, state, {
      headers
    });
  }

  if (action.type === actionTypes.setEndpoint) {
    return Object.assign({}, state, {
      endpoint: action.endpoint
    });
  }

  if (action.type === actionTypes.setBody) {
    return Object.assign({}, state, {
      body: Object.assign({}, state.body, {
        [action.key]: action.value
      })
    });
  }

  if (action.type === actionTypes.removeBody) {
    const body = Object.assign({}, state.body);
    delete body[action.key];
    return Object.assign({}, state, {
      body
    });
  }

  return state;
}

export function relateReducerInit (settings) {
  Object.assign(defaultState, settings);
  return relateReducer;
}
