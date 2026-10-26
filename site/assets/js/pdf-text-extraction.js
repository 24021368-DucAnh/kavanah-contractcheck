(function (root) {
  "use strict";

  function finite(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function geometry(item) {
    const transform = item && item.transform;
    if (!Array.isArray(transform) || transform.length < 6 || !finite(transform[4]) || !finite(transform[5])) return null;
    const height = Math.abs(finite(item.height) && item.height > 0 ? item.height : transform[3]);
    if (!finite(height) || height === 0 || !finite(item.width)) return null;
    return { x: transform[4], y: transform[5], width: item.width, height };
  }

  function joinPdfTextItems(items) {
    if (!Array.isArray(items)) return "";
    let output = "";
    let previousItem = null;
    let previousGeometry = null;

    for (const item of items) {
      const str = item && typeof item.str === "string" ? item.str : "";
      if (!str) continue;
      const currentGeometry = geometry(item);

      if (output && previousItem) {
        const explicitBreak = previousItem.hasEOL === true;
        const baselineDiff = previousGeometry && currentGeometry
          ? Math.abs(previousGeometry.y - currentGeometry.y)
          : 0;
        const lineBreak = explicitBreak || (previousGeometry && currentGeometry && baselineDiff > Math.max(previousGeometry.height, currentGeometry.height) * 0.55);
        if (lineBreak) {
          output = output.replace(/[ \t]+$/u, "") + "\n";
        } else if (!/\s$/u.test(output) && !/^\s/u.test(str)) {
          if (previousGeometry && currentGeometry) {
            const prevRight = previousGeometry.x + previousGeometry.width;
            const gap = currentGeometry.x - prevRight;
            const threshold = Math.max(Math.min(previousGeometry.height, currentGeometry.height) * 0.16, 1.25);
            if (gap > threshold) output += " ";
          } else {
            // Without layout metrics, PDF.js may have split either glyphs or words.
            // A space is safer than silently joining separate words.
            output += " ";
          }
        }
      }

      output += str;
      previousItem = item;
      previousGeometry = currentGeometry;
    }

    return output.replace(/[\t\f\v]+/gu, " ").replace(/ *\n */gu, "\n").trim();
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { joinPdfTextItems };
  if (root) root.KavanahPdfText = { joinPdfTextItems };
})(typeof globalThis !== "undefined" ? globalThis : this);

