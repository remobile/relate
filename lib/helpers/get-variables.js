import forEach from 'lodash.foreach';
import invariant from 'invariant';

export default ({variables, fragments, variablesTypes, displayName}) => {
  const resultVariables = {};
  if (variables) {
    forEach(variables, (vars, queryName) => {
      if (fragments[queryName]) { // if not in fragments, ignore
        resultVariables[queryName] = {};
        const queryVariablesTypes = variablesTypes[queryName];

        // No variables types defined for this query
        invariant(
          queryVariablesTypes,
          'Relate: Query to %s doesn\'t have variables types defined in %s!',
          queryName,
          displayName || 'a component'
        );

        // Check if every variable has a type
        forEach(vars, (value, variable) => {
          invariant(
            queryVariablesTypes[variable],
            'Relate: Query to %s does not have variable "%s" type defined in %s!',
            queryName,
            variable,
            displayName || 'a component'
          );

          // add variable prepared for query e.g. {type: 'String', value: 'something'}
          resultVariables[queryName][variable] = {
            type: queryVariablesTypes[variable],
            value
          };
        });

        // Check if every required variable type is met
        forEach(queryVariablesTypes, (type, variable) => {
          invariant(
            type.slice(-1) !== '!' || vars[variable],
            'Relate: Query to %s requires the variable "%s" in %s!',
            queryName,
            variable,
            displayName || 'a component'
          );
        });
      }
    });
  }
  return resultVariables;
};
