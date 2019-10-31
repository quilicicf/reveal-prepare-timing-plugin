import saveAs from 'file-saver';

import constants from './src/constants';
import openModal from './src/openModal';
import closeModal from './src/closeModal';
import applyStyle from './src/applyStyle';
import addTimeToNode from './src/addTimeToNode';
import computeTimeToAdd from './src/computeTimeToAdd';
import hideRecordingItem from './src/hideRecordingItem';
import displayRecordingItem from './src/displayRecordingItem';

const { Reveal } = window;

/**
 * Plugin state start
 */
let lastSwitchDate = null;
let isRecording = false;

/**
 * Plugin state end
 */

function processSlide (slide) {
  const oldDate = lastSwitchDate;
  lastSwitchDate = new Date();
  const timeToAdd = computeTimeToAdd(oldDate, lastSwitchDate);
  addTimeToNode(slide, timeToAdd);
}

function createModal () {
  const modal = document.createElement('div');
  modal.id = constants.MODAL_ID;

  modal.innerHTML = `
    <span id="${constants.MODAL_CLOSE_BUTTON_ID}">✕</span>
    <h1 style="display: flex; justify-content: center;">Captured timings</h1>
    <p id="${constants.MODAL_CONTENT_ID}"></p>
    <div id="${constants.MODAL_CTA_ID}">
      <button id="${constants.MODAL_DOWNLOAD_BUTTON_ID}" type="button">Download report</button>
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

  const modalContent = document.getElementById(constants.MODAL_CONTENT_ID);
  applyStyle(modalContent, {
    margin: '0 0 0 1vw',
    overflow: 'auto',
    'line-height': '1.1',
  });

  const cta = document.getElementById(constants.MODAL_CTA_ID);
  applyStyle(cta, {
    display: 'flex',
    'justify-content': 'flex-end',
  });

  const downloadButton = document.getElementById(constants.MODAL_DOWNLOAD_BUTTON_ID);
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
    const reportAsJson = document.getElementById(constants.REPORT_ID).innerText;
    const blob = new Blob([ reportAsJson ], { type: 'application/json;charset=utf-8' });
    saveAs(blob, 'reveal-timing-plugin-report.json');
  };

  const closeButton = document.getElementById(constants.MODAL_CLOSE_BUTTON_ID);
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
  recordingItem.id = constants.RECORDING_ITEM_ID;
  recordingItem.innerText = '•';
  recordingItem.title = 'Click to stop recording';

  // eslint-disable-next-line no-use-before-define
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

function startRecording () {
  isRecording = true;
  displayRecordingItem();
  lastSwitchDate = new Date();
  Reveal.getSlides().forEach((slide) => {
    slide.setAttribute(constants.ATTRIBUTE_ELAPSED_TIME, '0');
  });
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

Reveal.registerPlugin('timer', {
  init () {
    createModal();
    createRecordingItem();

    Reveal.addEventListener('slidechanged', (event) => {
      if (isRecording && event.previousSlide) {
        processSlide(event.previousSlide);
      }
    });

    Reveal.addKeyBinding({ keyCode: 84, key: 'T', description: 'Toggle timing plugin' }, toggleRecording);
    Reveal.addKeyBinding({ keyCode: 89, key: 'Y', description: 'Open timing plugin modal' }, openModal);
  },
});
