const init = () => {
  const slidesContainerNode = document.querySelector('.slides');
  const observer = new MutationObserver((mutations, observer) => {
    console.log(mutations);
  });

  observer.observe(slidesContainerNode, { attributes: true });
  console.log('Timer initialized!')
};


Reveal.registerPlugin('timer', { init });
