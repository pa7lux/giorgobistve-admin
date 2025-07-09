"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/indent-string";
exports.ids = ["vendor-chunks/indent-string"];
exports.modules = {

/***/ "(rsc)/./node_modules/indent-string/index.js":
/*!*********************************************!*\
  !*** ./node_modules/indent-string/index.js ***!
  \*********************************************/
/***/ ((module) => {

eval("\nmodule.exports = (string, count = 1, options)=>{\n    options = {\n        indent: \" \",\n        includeEmptyLines: false,\n        ...options\n    };\n    if (typeof string !== \"string\") {\n        throw new TypeError(`Expected \\`input\\` to be a \\`string\\`, got \\`${typeof string}\\``);\n    }\n    if (typeof count !== \"number\") {\n        throw new TypeError(`Expected \\`count\\` to be a \\`number\\`, got \\`${typeof count}\\``);\n    }\n    if (typeof options.indent !== \"string\") {\n        throw new TypeError(`Expected \\`options.indent\\` to be a \\`string\\`, got \\`${typeof options.indent}\\``);\n    }\n    if (count === 0) {\n        return string;\n    }\n    const regex = options.includeEmptyLines ? /^/gm : /^(?!\\s*$)/gm;\n    return string.replace(regex, options.indent.repeat(count));\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvaW5kZW50LXN0cmluZy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUVBQSxPQUFPQyxPQUFPLEdBQUcsQ0FBQ0MsUUFBUUMsUUFBUSxDQUFDLEVBQUVDO0lBQ3BDQSxVQUFVO1FBQ1RDLFFBQVE7UUFDUkMsbUJBQW1CO1FBQ25CLEdBQUdGLE9BQU87SUFDWDtJQUVBLElBQUksT0FBT0YsV0FBVyxVQUFVO1FBQy9CLE1BQU0sSUFBSUssVUFDVCxDQUFDLDZDQUE2QyxFQUFFLE9BQU9MLE9BQU8sRUFBRSxDQUFDO0lBRW5FO0lBRUEsSUFBSSxPQUFPQyxVQUFVLFVBQVU7UUFDOUIsTUFBTSxJQUFJSSxVQUNULENBQUMsNkNBQTZDLEVBQUUsT0FBT0osTUFBTSxFQUFFLENBQUM7SUFFbEU7SUFFQSxJQUFJLE9BQU9DLFFBQVFDLE1BQU0sS0FBSyxVQUFVO1FBQ3ZDLE1BQU0sSUFBSUUsVUFDVCxDQUFDLHNEQUFzRCxFQUFFLE9BQU9ILFFBQVFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7SUFFcEY7SUFFQSxJQUFJRixVQUFVLEdBQUc7UUFDaEIsT0FBT0Q7SUFDUjtJQUVBLE1BQU1NLFFBQVFKLFFBQVFFLGlCQUFpQixHQUFHLFFBQVE7SUFFbEQsT0FBT0osT0FBT08sT0FBTyxDQUFDRCxPQUFPSixRQUFRQyxNQUFNLENBQUNLLE1BQU0sQ0FBQ1A7QUFDcEQiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9naW9yZ29iaXN0dmUtYWRtaW4vLi9ub2RlX21vZHVsZXMvaW5kZW50LXN0cmluZy9pbmRleC5qcz80YzRmIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSAoc3RyaW5nLCBjb3VudCA9IDEsIG9wdGlvbnMpID0+IHtcblx0b3B0aW9ucyA9IHtcblx0XHRpbmRlbnQ6ICcgJyxcblx0XHRpbmNsdWRlRW1wdHlMaW5lczogZmFsc2UsXG5cdFx0Li4ub3B0aW9uc1xuXHR9O1xuXG5cdGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRgRXhwZWN0ZWQgXFxgaW5wdXRcXGAgdG8gYmUgYSBcXGBzdHJpbmdcXGAsIGdvdCBcXGAke3R5cGVvZiBzdHJpbmd9XFxgYFxuXHRcdCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGNvdW50ICE9PSAnbnVtYmVyJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoXG5cdFx0XHRgRXhwZWN0ZWQgXFxgY291bnRcXGAgdG8gYmUgYSBcXGBudW1iZXJcXGAsIGdvdCBcXGAke3R5cGVvZiBjb3VudH1cXGBgXG5cdFx0KTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygb3B0aW9ucy5pbmRlbnQgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcblx0XHRcdGBFeHBlY3RlZCBcXGBvcHRpb25zLmluZGVudFxcYCB0byBiZSBhIFxcYHN0cmluZ1xcYCwgZ290IFxcYCR7dHlwZW9mIG9wdGlvbnMuaW5kZW50fVxcYGBcblx0XHQpO1xuXHR9XG5cblx0aWYgKGNvdW50ID09PSAwKSB7XG5cdFx0cmV0dXJuIHN0cmluZztcblx0fVxuXG5cdGNvbnN0IHJlZ2V4ID0gb3B0aW9ucy5pbmNsdWRlRW1wdHlMaW5lcyA/IC9eL2dtIDogL14oPyFcXHMqJCkvZ207XG5cblx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlZ2V4LCBvcHRpb25zLmluZGVudC5yZXBlYXQoY291bnQpKTtcbn07XG4iXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInN0cmluZyIsImNvdW50Iiwib3B0aW9ucyIsImluZGVudCIsImluY2x1ZGVFbXB0eUxpbmVzIiwiVHlwZUVycm9yIiwicmVnZXgiLCJyZXBsYWNlIiwicmVwZWF0Il0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/indent-string/index.js\n");

/***/ })

};
;