/* eslint-disable no-param-reassign */
module.exports = report => Object.keys(report)
  .reduce(
    (seed, key) => {
      const node = report[ key ];
      seed[ `${node.horizontalIndex}/0` ] = node;

      if (node.children) {
        node.children.forEach((child) => {
          seed[ `${child.horizontalIndex}/${child.verticalIndex}` ] = child;
        });
      }

      return seed;
    },
    {},
  );
