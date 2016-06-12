import React from 'react';

import {resetConnectorsIds} from '../helpers/connectors-ids';

function processElement ({element, context, rootDataConnectors, dataConnectors}) {
  try {
    if (element !== null) {
      const {props, type} = element;

      if (typeof type === 'function') {
        const ElementClass = element.type;
        const Element = new ElementClass(
          Object.assign({}, ElementClass.defaultProps, element.props),
          context
        );

        if (type.relateIdentifier === 'ROOT_DATA_CONNECT') {
          rootDataConnectors.push(Element);
        } else if (type.relateIdentifier === 'DATA_CONNECT') {
          dataConnectors.push(Element);
        }

        // Generate context for children
        let newContext = context;
        if (Element.getChildContext) {
          newContext = Object.assign({}, context, Element.getChildContext());
        }

        // go through children
        const renderResult = Element.render();
        processElement({
          element: renderResult,
          context: newContext,
          rootDataConnectors,
          dataConnectors
        });
      } else if (props && props.children) {
        React.Children.forEach(props.children, (childElement) => {
          processElement({
            element: childElement,
            context,
            rootDataConnectors,
            dataConnectors
          });
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
}

export default async function getAllDataDependencies (rootElement, getData) {
  const rootDataConnectors = [];
  const dataConnectors = [];

  // Ensure connectors ids are reset
  resetConnectorsIds('server_');

  // traverse tree
  processElement({
    element: rootElement,
    context: {
      relate_ssr: getData
    },
    rootDataConnectors,
    dataConnectors
  });

  // fetch data for each root data connector
  console.log('rootDataConnectors');
  console.log(rootDataConnectors);
  for (const rootDataConnector of rootDataConnectors) {
    console.log('Con:', rootDataConnector);
    await rootDataConnector.fetchData();
  }

  // Ensure connectors ids are reset
  // next render will map to the same ids
  resetConnectorsIds();
}
