export default (horizontalIndex, verticalIndex, title, timing) => {
  const bulletSuffix = verticalIndex !== null ? `.${verticalIndex}` : '';
  const bullet = `${horizontalIndex}${bulletSuffix}`;
  return `<li>${bullet} ${title} (${timing}s)</li>`;
};
