export default (node, style) => {
  Object.keys(style)
    .forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      node.style[ key ] = style[ key ];
    });
};
