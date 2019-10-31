import constants from './constants';
import getSlideElapsedTime from './getSlideElapsedTime';

export default (slide, timeToAdd) => {
  const elapsedTime = getSlideElapsedTime(slide);
  const newTime = elapsedTime + timeToAdd;
  slide.setAttribute(constants.ATTRIBUTE_ELAPSED_TIME, `${newTime}`);
};
