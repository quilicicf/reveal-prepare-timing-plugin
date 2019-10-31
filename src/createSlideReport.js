import getSlideTitle from './getSlideTitle';
import getSlideElapsedTime from './getSlideElapsedTime';
import querySelectorAsArray from './querySelectorAsArray';
import createSingleSlideHtmlReport from './createSingleSlideHtmlReport';

export default (slide, horizontalIndex) => {
  const childrenSlides = querySelectorAsArray('section', slide);
  if (childrenSlides.length === 0) {
    const title = getSlideTitle(slide);
    const timing = getSlideElapsedTime(slide);
    return {
      title,
      timing,
      selector: `.slides > section:nth-of-type(${horizontalIndex})`,
      horizontalIndex,
      verticalIndex: null,
      html: createSingleSlideHtmlReport(horizontalIndex, null, title, timing),
    };
  }

  const firstElement = childrenSlides[ 0 ];
  const title = getSlideTitle(firstElement);
  const timing = getSlideElapsedTime(firstElement);
  return {
    title,
    timing,
    selector: `.slides > section:nth-of-type(${horizontalIndex}) > section:nth-of-type(0)`,
    horizontalIndex,
    verticalIndex: 0,
    html: createSingleSlideHtmlReport(horizontalIndex, 0, title, timing),
    children: childrenSlides.splice(1)
      .map((childSlide, screwedVerticalIndex) => {
        const verticalIndex = screwedVerticalIndex + 1; // Spliced, duh (see above)
        const childTitle = getSlideTitle(childSlide);
        const childTiming = getSlideElapsedTime(childSlide);
        return {
          title: childTitle,
          timing: childTiming,
          selector: `.slides > section:nth-of-type(${horizontalIndex}) > section:nth-of-type(${verticalIndex})`,
          horizontalIndex,
          verticalIndex,
          html: createSingleSlideHtmlReport(horizontalIndex, verticalIndex, childTitle, childTiming),
        };
      }),
  };
};
