/** @type {import('stylelint').Config} */
export default {
  extends: [
    "stylelint-config-standard",
    "stylelint-config-html/astro",
    // "stylelint-config-clean-order",
  ],
  rules: {
    "import-notation": null,
    "no-empty-source": null,
    "comment-empty-line-before": null,
    "shorthand-property-no-redundant-values": [true, { severity: "warning" }],
  },
};
