const Diff = require('diff');

/**
 * Computes line-by-line and inline diffs between original and customized resume
 * @param {string} originalText 
 * @param {string} customizedText 
 * @returns {object}
 */
function computeDiff(originalText, customizedText) {
  if (!originalText || !customizedText) {
    return { changes: [], stats: { added: 0, removed: 0, unchanged: 0 } };
  }

  // Word-level diff
  const wordDiff = Diff.diffWordsWithSpace(originalText, customizedText);

  // Line-level diff for structured view
  const lineDiff = Diff.diffLines(originalText, customizedText, { ignoreWhitespace: false });

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  const changes = lineDiff.map((part) => {
    if (part.added) addedCount += (part.value.match(/\n/g) || []).length || 1;
    else if (part.removed) removedCount += (part.value.match(/\n/g) || []).length || 1;
    else unchangedCount += (part.value.match(/\n/g) || []).length || 1;

    return {
      value: part.value,
      added: !!part.added,
      removed: !!part.removed
    };
  });

  const wordChanges = wordDiff.map((part) => ({
    value: part.value,
    added: !!part.added,
    removed: !!part.removed
  }));

  return {
    changes,
    wordChanges,
    stats: {
      addedLines: addedCount,
      removedLines: removedCount,
      unchangedLines: unchangedCount,
      totalChanges: addedCount + removedCount
    }
  };
}

module.exports = {
  computeDiff
};
