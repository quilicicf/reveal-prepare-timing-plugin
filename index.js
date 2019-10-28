const ATTRIBUTE_ELAPSED_TIME = 'data-elapsed-time';

const MODAL_ID = 'reveal-timing-plugin-modal';
const MODAL_CONTENT_ID = 'reveal-timing-plugin-modal_content';
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
  modal.style.display = 'block';

  const modalContent = document.getElementById(MODAL_CONTENT_ID);

  const createSingleSlideElement = function (horizontalIndex, verticalIndex, title, timing) {
    const bulletSuffix = verticalIndex !== null ? `.${verticalIndex}` : '';
    const bullet = `${horizontalIndex}${bulletSuffix}`;
    return `<li>${bullet} ${title} (${timing}s)</li>`;
  };

  const allSlides = [];
  const allTimings = [];
  querySelectorAsArray('.slides > section')
    .forEach(function (slide, horizontalIndex) {
      const childrenSlides = querySelectorAsArray('section', slide);
      if (childrenSlides.length === 0) {
        const title = getSlideTitle(slide);
        const timing = getSlideElapsedTime(slide);
        allTimings.push(timing);
        allSlides.push({
          title,
          timing,
          selector: `.slides > section:nth-of-type(${horizontalIndex})`,
          horizontalIndex,
          verticalIndex: null,
          html: createSingleSlideElement(horizontalIndex, null, title, timing),
        });
      } else {
        const firstElement = childrenSlides[ 0 ];
        const title = getSlideTitle(firstElement);
        const timing = getSlideElapsedTime(firstElement);
        allTimings.push(timing);
        allSlides.push({
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
        });
      }
    });

  const fullTiming = allTimings.reduce(function (seed, timing) {
    return seed + timing;
  }, 0);
  modalContent.innerHTML = allSlides.reduce(function (seed, slideData) {
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
  }, `<div>Full presentation time: ${fullTiming}s</div><ol style="list-style-type: none">`) + '</ol>';
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
    <h1 style="display: flex; justify-content: center;">Captured timings</h1>
    <div id="${MODAL_CONTENT_ID}"></div>
  `;
  applyStyle(modal, {
    display: 'none',
    position: 'absolute',
    top: '10vh',
    bottom: '10vh',
    left: '30vh',
    right: '30vh',
    'border-radius': '1rem',
    border: '.50vh solid ',
    color: '#FFFFFF',
    'background-color': '#000000',
    'z-index': 2,
  });

  const body = document.querySelector('body');
  body.appendChild(modal);
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
