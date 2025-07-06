"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/remark-breaks";
exports.ids = ["vendor-chunks/remark-breaks"];
exports.modules = {

/***/ "(ssr)/./node_modules/remark-breaks/lib/index.js":
/*!*************************************************!*\
  !*** ./node_modules/remark-breaks/lib/index.js ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ remarkBreaks)\n/* harmony export */ });\n/* harmony import */ var mdast_util_newline_to_break__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mdast-util-newline-to-break */ \"(ssr)/./node_modules/mdast-util-newline-to-break/lib/index.js\");\n/**\n * @typedef {import('mdast').Root} Root\n */ \n/**\n * Support hard breaks without needing spaces or escapes (turns enters into\n * `<br>`s).\n *\n * @returns\n *   Transform.\n */ function remarkBreaks() {\n    /**\n   * Transform.\n   *\n   * @param {Root} tree\n   *   Tree.\n   * @returns {undefined}\n   *   Nothing.\n   */ return function(tree) {\n        (0,mdast_util_newline_to_break__WEBPACK_IMPORTED_MODULE_0__.newlineToBreak)(tree);\n    };\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvcmVtYXJrLWJyZWFrcy9saWIvaW5kZXguanMiLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTs7Q0FFQyxHQUV5RDtBQUUxRDs7Ozs7O0NBTUMsR0FDYyxTQUFTQztJQUN0Qjs7Ozs7OztHQU9DLEdBQ0QsT0FBTyxTQUFVQyxJQUFJO1FBQ25CRiwyRUFBY0EsQ0FBQ0U7SUFDakI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2dpb3Jnb2Jpc3R2ZS1hZG1pbi8uL25vZGVfbW9kdWxlcy9yZW1hcmstYnJlYWtzL2xpYi9pbmRleC5qcz9hNzhlIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQHR5cGVkZWYge2ltcG9ydCgnbWRhc3QnKS5Sb290fSBSb290XG4gKi9cblxuaW1wb3J0IHtuZXdsaW5lVG9CcmVha30gZnJvbSAnbWRhc3QtdXRpbC1uZXdsaW5lLXRvLWJyZWFrJ1xuXG4vKipcbiAqIFN1cHBvcnQgaGFyZCBicmVha3Mgd2l0aG91dCBuZWVkaW5nIHNwYWNlcyBvciBlc2NhcGVzICh0dXJucyBlbnRlcnMgaW50b1xuICogYDxicj5gcykuXG4gKlxuICogQHJldHVybnNcbiAqICAgVHJhbnNmb3JtLlxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiByZW1hcmtCcmVha3MoKSB7XG4gIC8qKlxuICAgKiBUcmFuc2Zvcm0uXG4gICAqXG4gICAqIEBwYXJhbSB7Um9vdH0gdHJlZVxuICAgKiAgIFRyZWUuXG4gICAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gICAqICAgTm90aGluZy5cbiAgICovXG4gIHJldHVybiBmdW5jdGlvbiAodHJlZSkge1xuICAgIG5ld2xpbmVUb0JyZWFrKHRyZWUpXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJuZXdsaW5lVG9CcmVhayIsInJlbWFya0JyZWFrcyIsInRyZWUiXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/remark-breaks/lib/index.js\n");

/***/ })

};
;