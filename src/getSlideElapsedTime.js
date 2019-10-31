import constants from './constants';

export default (slide) => {
  const elapsedTimeAsString = slide.getAttribute(constants.ATTRIBUTE_ELAPSED_TIME) || '0';
  return parseInt(elapsedTimeAsString, 0);
};
