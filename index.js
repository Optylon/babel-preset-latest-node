/* eslint-disable strict, global-require */

'use strict';

const validTargetOption = ['6', '6.5', '7', '7.6', '8', 'current'];

module.exports = function(context, opts) {
  // `|| {}` to support node 4
  opts = opts || {};
  const targetOption = String(opts.target);
  // use indexOf to support node 4
  if (targetOption && validTargetOption.indexOf(targetOption) === -1) {
    throw new Error(
      `Preset latest-node 'target' option must one of ${validTargetOption.join(', ')}.`
    );
  }

  const target = targetOption !== 'current' ? targetOption : process.versions.node;
  const splittedTarget = target.split('.');

  const major = Number(splittedTarget[0]);
  const minor = Number(splittedTarget[1]) || 0;

  const loose = opts.loose !== undefined ? opts.loose : false;
  const modules = opts.modules !== undefined ? opts.modules : 'commonjs';
  const es2016 = opts.es2016 !== undefined ? opts.es2016 : true;
  const es2017 = opts.es2017 !== undefined ? opts.es2017 : true;

  if (modules !== false && modules !== 'commonjs') {
    throw new Error(
      "Preset latest-node 'modules' option must be 'false' to indicate no modules\n" +
        "or 'commonjs' (default)"
    );
  }
  if (typeof loose !== 'boolean') {
    throw new Error("Preset latest-node 'loose' option must be a boolean.");
  }

  const optsLoose = { loose };

  const infNode6dot5 = major < 6 || (major === 6 && minor < 5);
  const infNode7 = major < 7;
  const infNode7dot6 = major < 7 || (major === 7 && minor < 6);

  return {
    plugins: [
      /* es2015 */
      require('babel-plugin-check-es2015-constants'),

      modules === 'commonjs' && [
        require('babel-plugin-transform-es2015-modules-commonjs'),
        optsLoose,
      ],

      infNode6dot5 && require('babel-plugin-transform-es2015-arrow-functions'), // needed for function-name
      infNode6dot5 && require('babel-plugin-transform-es2015-function-name'),

      /* es2016 */
      es2016 && infNode7 && require('babel-plugin-transform-exponentiation-operator'),

      /* es2017 */
      es2017 && require('babel-plugin-syntax-trailing-function-commas'),
      es2017 && infNode7dot6 && require('babel-plugin-transform-async-to-generator'),
    ].filter(Boolean),
  };
};
