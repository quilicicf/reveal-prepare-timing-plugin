export default (slide) => {
  const titles = Array.from(slide.childNodes || [])
    .filter(node => /^H[1-6]$/.test(node.tagName))
    .map(node => node.innerText.replace(/\s+/g, ''));
  return titles[ 0 ];
};
