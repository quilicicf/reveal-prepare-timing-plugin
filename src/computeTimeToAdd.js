export default (oldDate, newDate) => {
  const timeDifference = newDate.getTime() - oldDate.getTime();
  return Math.round(timeDifference / 1000);
};
