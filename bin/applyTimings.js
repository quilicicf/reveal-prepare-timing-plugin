const { tmpdir } = require('os');
const { resolve: resolvePath } = require('path');
const reIndexReport = require('./reIndexReport');
const RewritingStream = require('parse5-html-rewriting-stream');
const {
  readFileSync,
  writeFileSync,
  unlinkSync,
  renameSync,
  createWriteStream,
  createReadStream,
} = require('fs');

const DATA_TIMING_ATTRIBUTE = 'data-timing';

const createRewriter = (reIndexedReport) => {
  const rewriter = new RewritingStream();

  const state = {
    depth: 0,
    horizontalIndex: -1,
    verticalIndex: -1,
  };

  rewriter.on('startTag', (tag) => {
    if (tag.tagName === 'section') {
      if (state.depth > 0) {
        state.verticalIndex++;
      } else {
        state.horizontalIndex++;
        state.verticalIndex = 0;
      }

      const slideId = `${state.horizontalIndex}/${state.verticalIndex}`;
      const slideReport = reIndexedReport[ slideId ];

      state.depth++;

      if (slideReport.children) { // Contains children, the section that receives the timing is current's child
        state.verticalIndex--;
        return rewriter.emitStartTag(tag);
      }

      const timingFromReport = slideReport.timing;

      if (!slideReport.timing) {
        return rewriter.emitStartTag(tag);
      }

      const timingAttribute = { name: DATA_TIMING_ATTRIBUTE, value: `${timingFromReport}` };
      let timingAttributeAdded = false;
      // eslint-disable-next-line no-param-reassign
      tag.attrs = Object.keys(tag.attrs || {})
        .reduce(
          (seed, index) => {
            if (tag.attrs[ index ].name === DATA_TIMING_ATTRIBUTE) {
              timingAttributeAdded = true;
              seed.push(timingAttribute);
            } else {
              seed.push(tag.attrs[ index ]);
            }

            return seed;
          },
          [],
        );
      if (!timingAttributeAdded) {
        tag.attrs.push(timingAttribute);
      }
    }

    return rewriter.emitStartTag(tag);
  });

  rewriter.on('endTag', (tag) => {
    if (tag.tagName === 'section') {
      state.depth--;
    }

    return rewriter.emitEndTag(tag);
  });

  return rewriter;
};

module.exports = ({ s: sourcePath, r: reportPath }) => {
  const reportString = readFileSync(reportPath, 'utf8');
  const report = JSON.parse(reportString);
  const reIndexedReport = reIndexReport(report);

  const tempFile = resolvePath(tmpdir(), 'reveal-timing-plugin-apply-result.html');
  const writeStream = createWriteStream(tempFile);

  createReadStream(sourcePath, { encoding: 'utf8' })
    .pipe(createRewriter(reIndexedReport))
    .pipe(writeStream);

  renameSync(tempFile, sourcePath);
};
