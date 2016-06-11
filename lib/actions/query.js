import q from 'q';

import actionTypes from './types';
import request from '../helpers/request';

export default function graphql ({query, variables}, fragments, connectors, config, relateSSR = false) {
  return (dispatch, getState) => {
    let result;

    if (relateSSR) {
      result = q()
        .then(() => relateSSR({
          query,
          variables
        }))
        .then(({data, errors}) => {
          dispatch({
            type: actionTypes.query,
            data,
            errors,
            variables,
            connectors,
            fragments,
            isIntrospection: true
          });
        })
        .catch(() => {
          console.log('error');
        });
    } else {
      const {headers, endpoint, body} = getState().relateReducer;
      result = request({
        dispatch,
        type: actionTypes.query,
        query,
        variables,
        connectors,
        fragments,
        headers: config && config.headers || headers,
        body: config && config.body || body,
        endpoint: config && config.endpoint || endpoint
      });
    }

    return result;
  };
}
