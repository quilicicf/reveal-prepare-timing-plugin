import constants from './constants';

export default () => {
  const recordingItem = document.getElementById(constants.RECORDING_ITEM_ID);
  recordingItem.style.display = 'none';
};
