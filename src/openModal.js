import constants from './constants';
import createSlideReport from './createSlideReport';
import querySelectorAsArray from './querySelectorAsArray';
import createSlideHtmlReport from './createSlideHtmlReport';

export default () => {
  const modal = document.getElementById(constants.MODAL_ID);
  modal.style.display = 'grid';

  const modalContent = document.getElementById(constants.MODAL_CONTENT_ID);

  const fullReport = {};
  const allTimings = [];
  querySelectorAsArray('.slides > section')
    .map((slide, horizontalIndex) => createSlideReport(slide, horizontalIndex))
    .forEach((slideReport) => {
      fullReport[ slideReport.horizontalIndex ] = slideReport;
      allTimings.push(slideReport.timing);
      if (slideReport.children) {
        slideReport.children.forEach(({ timing }) => allTimings.push(timing));
      }
    });

  const fullTiming = allTimings.reduce((seed, timing) => seed + timing, 0);

  const slidesHtmlReport = Object.values(fullReport)
    .reduce((seed, slideReport) => `${seed}\n${createSlideHtmlReport(slideReport)}`, '');

  modalContent.innerHTML = `
    <div>Full presentation time: ${fullTiming}s</div>
    <code id="${constants.REPORT_ID}" style="display:none">${JSON.stringify(fullReport, null, 2)}</code>
    <ol style="list-style-type: none">${slidesHtmlReport}</ol>`;
};
