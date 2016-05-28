import debounce from 'lodash.debounce';
import forEach from 'lodash.foreach';
import hoistStatics from 'hoist-non-react-statics';
import isEqual from 'lodash.isequal';
import Q from 'q';
import React, {Component, PropTypes} from 'react';
import {mergeFragments, buildQueryAndVariables} from 'relax-fragments';

import queryAction from '../actions/query';

export default function rootDataConnect (config) {
  return function wrapWithDataConnect (WrappedComponent) {
    class RootConnectData extends Component {
      static contextTypes = {
        store: PropTypes.any.isRequired
      };

      static childContextTypes = {
        fetchData: PropTypes.func.isRequired
      };

      constructor (props, context) {
        super(props, context);
        this.bundle = {};
        this.childFetchDataBind = ::this.childFetchData;
        this.fetchDebounce = debounce(::this.fetchData, 10);
        this.scopeID = 0;
      }

      getChildContext () {
        return {
          fetchData: this.childFetchDataBind
        };
      }

      componentDidMount () {
        this.mounted = true;
        if (this.bundle && this.bundle.fragments) {
          this.fetchData();
        }
      }

      childFetchData ({fragments, variables, ID, mutations, loadMore = false}) {
        // Check for same query with different variables
        const scopes = {};
        const resultFragments = Object.assign({}, fragments || {});
        const resultVariables = Object.assign({}, variables || {});

        if (this.bundle.fragments) {
          forEach(fragments, (fragment, queryName) => {
            if (this.bundle.fragments[queryName]) {
              // Same query name detected, will have to check if variables are the same
              const sameVariables = isEqual(
                variables && variables[queryName],
                this.bundle.variables && this.bundle.variables[queryName]
              );

              if (!sameVariables) {
                // Will have to scope it
                const scope = `relate_${this.scopeID++}`;
                const newQueryName = `${scope}: ${queryName}`;
                resultFragments[newQueryName] = Object.assign({}, fragments[queryName]);
                scopes[scope] = queryName;
                delete resultFragments[queryName];

                if (resultVariables[queryName]) {
                  resultVariables[newQueryName] = Object.assign({}, variables[queryName]);
                  delete resultVariables[queryName];
                }
              }
            }
          });
        }

        this.bundle = {
          fragments: mergeFragments(this.bundle.fragments || {}, resultFragments),
          variables: Object.assign(this.bundle.variables || {}, resultVariables),
          connectors: Object.assign(this.bundle.connectors || {}, {
            [ID]: {fragments, mutations, scopes, loadMore}
          })
        };

        if (this.mounted) {
          this.fetchDebounce();
        }
        this.deferred = this.deferred || Q.defer();

        return this.deferred.promise;
      }

      fetchData () {
        const {dispatch} = this.context.store;
        const fragments = this.bundle.fragments;
        const variables = this.bundle.variables;
        const connectors = this.bundle.connectors;
        this.bundle = {};

        dispatch(
          queryAction(
            buildQueryAndVariables(fragments, variables),
            fragments,
            connectors,
            config
          )
        ).fin(() => {
          this.deferred.resolve();
          this.deferred = null;
        });
      }

      render () {
        return <WrappedComponent {...this.props} />;
      }
    }

    return hoistStatics(RootConnectData, WrappedComponent);
  };
}
