export default slideReport => (
  slideReport.children
    ? `${slideReport.html}
        <ol style="list-style-type: none">
          ${slideReport.children.reduce((childSeed, childSlideData) => `${childSeed}${childSlideData.html}`, '')}
        </ol>
    `
    : slideReport.html
);
