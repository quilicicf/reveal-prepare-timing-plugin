import saveAs from 'file-saver';

const { Reveal } = window;

const ATTRIBUTE_ELAPSED_TIME = 'data-elapsed-time';

const MODAL_ID = 'reveal-timing-plugin-modal';
const MODAL_CONTENT_ID = 'reveal-timing-plugin-modal-content';
const MODAL_CLOSE_BUTTON_ID = 'reveal-timing-plugin-modal-close-button';
const MODAL_CTA_ID = 'reveal-timing-plugin-modal-cta';
const MODAL_DOWNLOAD_BUTTON_ID = 'reveal-timing-plugin-download-button';
const REPORT_ID = 'reveal-timing-plugin-report';
const RECORDING_ITEM_ID = 'reveal-timing-plugin-record-indicator';

let lastSwitchDate = null;
let isRecording = false;

Reveal.registerPlugin('timer', { init });

function addTimeToNode (slide, timeToAdd) {
  const elapsedTime = getSlideElapsedTime(slide);
  const newTime = elapsedTime + timeToAdd;
  slide.setAttribute(ATTRIBUTE_ELAPSED_TIME, `${newTime}`);
}

function computeTimeToAdd (oldDate, newDate) {
  const timeDifference = newDate.getTime() - oldDate.getTime();
  return Math.round(timeDifference / 1000);
}

function getSlideTitle (slide) {
  const titles = Array.from(slide.childNodes || [])
    .filter(node => /^H[1-6]$/.test(node.tagName))
    .map(node => node.innerText);
  return titles[ 0 ];
}

function getSlideElapsedTime (slide) {
  const elapsedTimeAsString = slide.getAttribute(ATTRIBUTE_ELAPSED_TIME) || '0';
  return parseInt(elapsedTimeAsString, 0);
}

function startRecording () {
  isRecording = true;
  displayRecordingItem();
  lastSwitchDate = new Date();
  Reveal.getSlides().forEach(function (slide) {
    slide.setAttribute(ATTRIBUTE_ELAPSED_TIME, '0');
  });
}

function processSlide (slide) {
  const oldDate = lastSwitchDate;
  lastSwitchDate = new Date();
  const timeToAdd = computeTimeToAdd(oldDate, lastSwitchDate);
  addTimeToNode(slide, timeToAdd);
}

function stopRecording () {
  const currentSlide = Reveal.getCurrentSlide();
  processSlide(currentSlide);

  isRecording = false;
  hideRecordingItem();

  openModal();
}

function toggleRecording () {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
}

function displayRecordingItem () {
  const recordingItem = document.getElementById(RECORDING_ITEM_ID);
  recordingItem.style.display = 'inline-block';
}

function hideRecordingItem () {
  const recordingItem = document.getElementById(RECORDING_ITEM_ID);
  recordingItem.style.display = 'none';
}

function querySelectorAsArray (selector, parentNode = document) {
  return Array.from(parentNode.querySelectorAll(selector));
}

function openModal () {
  const modal = document.getElementById(MODAL_ID);
  modal.style.display = 'grid';

  const modalContent = document.getElementById(MODAL_CONTENT_ID);

  const createSingleSlideElement = function (horizontalIndex, verticalIndex, title, timing) {
    const bulletSuffix = verticalIndex !== null ? `.${verticalIndex}` : '';
    const bullet = `${horizontalIndex}${bulletSuffix}`;
    return `<li>${bullet} ${title} (${timing}s)</li>`;
  };

  const report = {};
  const allSlides = [];
  const allTimings = [];
  querySelectorAsArray('.slides > section')
    .forEach(function (slide, horizontalIndex) {
      const childrenSlides = querySelectorAsArray('section', slide);
      if (childrenSlides.length === 0) {
        const title = getSlideTitle(slide);
        const timing = getSlideElapsedTime(slide);
        allTimings.push(timing);
        const slideReport = {
          title,
          timing,
          selector: `.slides > section:nth-of-type(${horizontalIndex})`,
          horizontalIndex,
          verticalIndex: null,
          html: createSingleSlideElement(horizontalIndex, null, title, timing),
        };
        report[ horizontalIndex ] = slideReport;
        allSlides.push(slideReport);
      } else {
        const firstElement = childrenSlides[ 0 ];
        const title = getSlideTitle(firstElement);
        const timing = getSlideElapsedTime(firstElement);
        allTimings.push(timing);
        const sectionReport = {
          title,
          timing,
          selector: `.slides > section:nth-of-type(${horizontalIndex}) > section:nth-of-type(0)`,
          horizontalIndex,
          verticalIndex: 0,
          html: createSingleSlideElement(horizontalIndex, 0, title, timing),
          children: childrenSlides.splice(1)
            .map(function (childSlide, screwedVerticalIndex) {
              const verticalIndex = screwedVerticalIndex + 1; // Spliced, duh (see above)
              const childTitle = getSlideTitle(childSlide);
              const childTiming = getSlideElapsedTime(childSlide);
              allTimings.push(childTiming);
              return {
                title: childTitle,
                timing: childTiming,
                selector: `.slides > section:nth-of-type(${horizontalIndex}) > section:nth-of-type(${verticalIndex})`,
                horizontalIndex,
                verticalIndex,
                html: createSingleSlideElement(horizontalIndex, verticalIndex, childTitle, childTiming),
              };
            }),
        };
        report[ horizontalIndex ] = sectionReport;
        allSlides.push(sectionReport);
      }
    });

  const fullTiming = allTimings.reduce(function (seed, timing) {
    return seed + timing;
  }, 0);

  modalContent.innerHTML = allSlides.reduce(
    function (seed, slideData) {
      if (slideData.children) {
        return `${seed}
        ${slideData.html}
        <ol style="list-style-type: none">
          ${slideData.children.reduce(function (childSeed, childSlideData) {
          return `${childSeed}${childSlideData.html}`;
        }, '')
        }
        </ol>`;
      } else {
        return `${seed}
        ${slideData.html}
      `;
      }
    }, `
    <div>Full presentation time: ${fullTiming}s</div>
    <div id="${REPORT_ID}" style="display:none">${JSON.stringify(report, null, 2)}</div>
    <ol style="list-style-type: none">`
  ) + '</ol>';
}

function closeModal () {
  const modal = document.getElementById(MODAL_ID);
  modal.style.display = 'none';
}

function applyStyle (node, style) {
  Object.keys(style).forEach(key => node.style[ key ] = style[ key ]);
}

function createModal () {
  const modal = document.createElement('div');
  modal.id = MODAL_ID;

  modal.innerHTML = `
    <span id="${MODAL_CLOSE_BUTTON_ID}">✕</span>
    <h1 style="display: flex; justify-content: center;">Captured timings</h1>
    <p id="${MODAL_CONTENT_ID}"></p>
    <div id="${MODAL_CTA_ID}">
      <button id="${MODAL_DOWNLOAD_BUTTON_ID}" type="button">Download report</button>
    </div>
  `;

  applyStyle(modal, {
    display: 'none',
    'grid-template': `
      "header" 8vh
      "content" 1fr
      "cta" 8vh`,
    position: 'absolute',
    top: '10vh',
    bottom: '10vh',
    left: '40vh',
    right: '40vh',
    'border-radius': '1rem',
    border: '.50vh solid ',
    color: '#FFFFFF',
    'background-color': '#000000',
    'z-index': 2,
  });

  const body = document.querySelector('body');
  body.appendChild(modal);

  const modalContent = document.getElementById(MODAL_CONTENT_ID);
  applyStyle(modalContent, {
    margin: '0 0 0 1vw',
    overflow: 'auto',
    'line-height': '1.1',
  });

  const cta = document.getElementById(MODAL_CTA_ID);
  applyStyle(cta, {
    display: 'flex',
    'justify-content': 'flex-end',
  });

  const downloadButton = document.getElementById(MODAL_DOWNLOAD_BUTTON_ID);
  applyStyle(downloadButton, {
    'background-color': '#006B9A',
    color: '#FFFFFF',
    'border-radius': '1em',
    margin: '1em',
    outline: 'none',
    border: 'none',
    cursor: 'pointer',
  });
  downloadButton.onclick = () => {
    const reportAsJson = document.getElementById(REPORT_ID).innerText;
    const blob = new Blob([ reportAsJson ], { type: "application/json;charset=utf-8" });
    saveAs(blob, 'reveal-timing-plugin-report.json');
  };

  const closeButton = document.getElementById(MODAL_CLOSE_BUTTON_ID);
  applyStyle(closeButton, {
    position: 'absolute',
    top: '0',
    right: '0',
    'font-size': '2rem',
    padding: '.5rem',
    cursor: 'pointer',
  });
  closeButton.onclick = () => closeModal();
}

function createRecordingItem () {
  const recordingItem = document.createElement('span');
  recordingItem.id = RECORDING_ITEM_ID;
  recordingItem.innerText = '•';
  recordingItem.title = 'Click to stop recording';
  recordingItem.onclick = stopRecording;

  applyStyle(recordingItem, {
    cursor: 'pointer',
    display: 'none',
    position: 'absolute',
    color: 'red',
    right: '0',
    top: '0',
    'font-size': '6vh',
    'font-family': 'courier',
  });

  const body = document.querySelector('body');
  body.appendChild(recordingItem);
}

function init () {
  createModal();
  createRecordingItem();

  Reveal.addEventListener('slidechanged', function (event) {
    if (isRecording && event.previousSlide) {
      processSlide(event.previousSlide);
    }
  });

  Reveal.addKeyBinding({ keyCode: 84, key: 'T', description: 'Toggle timing plugin' }, toggleRecording);
  Reveal.addKeyBinding({ keyCode: 89, key: 'Y', description: 'Open timing plugin modal' }, openModal);
}
