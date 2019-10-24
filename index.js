const ATTRIBUTE_ELAPSED_TIME = 'data-elapsed-time';
const ATTRIBUTE_DATA_TIMING = 'data-timing';

const MODAL_ID = 'reveal-timing-plugin-modal';
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

function stopRecording () {
  isRecording = false;
  hideRecordingItem();
  Reveal.getSlides().forEach(function (slide) {
    const elapsedTime = getSlideElapsedTime(slide);
    slide.setAttribute(ATTRIBUTE_DATA_TIMING, `${elapsedTime}`);
  });
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

function openModal () {
  const modal = document.getElementById(MODAL_ID);
  modal.style.display = 'block';
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

  modal.innerHTML = `<h1>Captured timings</h1>`;
  applyStyle(modal, {
    position: 'absolute',
    top: '10vh',
    bottom: '10vh',
    left: '30vh',
    right: '30vh',
    border: '.50vh solid '
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
      const oldDate = lastSwitchDate;
      lastSwitchDate = new Date();
      const timeToAdd = computeTimeToAdd(oldDate, lastSwitchDate);
      addTimeToNode(event.previousSlide, timeToAdd);
    }
  });

  Reveal.addKeyBinding({ keyCode: 84, key: 'T', description: 'Toggle timing plugin' }, toggleRecording);
  Reveal.addKeyBinding({ keyCode: 89, key: 'Y', description: 'Open timing plugin modal' }, openModal);
}
