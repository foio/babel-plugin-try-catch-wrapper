/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _babelCore = __webpack_require__(2);
	
	var babel = _interopRequireWildcard(_babelCore);
	
	var _index = __webpack_require__(3);
	
	var _index2 = _interopRequireDefault(_index);
	
	var _fs = __webpack_require__(7);
	
	var fs = _interopRequireWildcard(_fs);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	//const fileName = process.argv[2];
	const fileName = './testInput.js';
	
	// read the code from this file
	fs.readFile(fileName, (err, data) => {
	    if (err) throw err;
	
	    // convert from a buffer to a string
	    const src = data.toString();
	    console.log(src);
	    // use our plugin to transform the source
	    const out = babel.transform(src, {
	        plugins: [[_index2.default, {
	            filename: fileName,
	            reportError: 'reportError',
	            rethrow: false
	        }]]
	    });
	
	    // print the generated code to screen
	    console.log(out.code);
	});

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = require("babel-core");

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _babelHelperFunctionName = __webpack_require__(4);
	
	var _babelHelperFunctionName2 = _interopRequireDefault(_babelHelperFunctionName);
	
	var _babelTemplate = __webpack_require__(5);
	
	var _babelTemplate2 = _interopRequireDefault(_babelTemplate);
	
	var _babelTypes = __webpack_require__(6);
	
	var t = _interopRequireWildcard(_babelTypes);
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	/*
	 stack format:
	 ${error.name}: ${error.message}
	 at ${functionName} (${fileNameOrUrl}:line:column)
	 at ${functionName} (${fileNameOrUrl}:line:column)
	 .
	 .
	 .
	 */
	
	const wrapFunctionRethrow = (0, _babelTemplate2.default)(`{
	  try {
	    BODY
	  } catch(ERROR_VARIABLE_NAME) {
	    REPORT_ERROR(ERROR_VARIABLE_NAME, FILENAME, FUNCTION_NAME, LINE, COLUMN)
	    throw ERROR_VARIABLE_NAME
	  }
	}`);
	
	const wrapFunctionNothrow = (0, _babelTemplate2.default)(`{
	  try {
	    BODY
	  } catch(ERROR_VARIABLE_NAME) {
	    REPORT_ERROR(ERROR_VARIABLE_NAME, FILENAME, FUNCTION_NAME, LINE, COLUMN)
	  }
	}`);
	
	const markErrorResolved = (0, _babelTemplate2.default)(`
	  ERROR._r = true
	`);
	
	const markErrorUnresolved = (0, _babelTemplate2.default)(`
	  delete ERROR._r
	`);
	
	const shouldSkip = (() => {
	    const records = new Map();
	
	    return (path, state) => {
	        if (state.end) {
	            return true;
	        }
	
	        // ignore generated code
	        if (!path.node.loc) {
	            return true;
	        }
	
	        // ignore processed nodes
	        const nodeType = path.node.type;
	        if (!records.has(nodeType)) {
	            records.set(nodeType, new Set());
	        }
	        const recordsOfThisType = records.get(nodeType);
	        const sourceLocation = `${filename}:${path.node.start}-${path.node.end}`;
	        const hasRecord = recordsOfThisType.has(sourceLocation);
	        recordsOfThisType.add(sourceLocation);
	        return hasRecord;
	    };
	})();
	
	// filename of which is being processed
	let filename;
	
	// function name reporting error, default: 'reportError'
	let reportError;
	
	let wrapFunction;
	
	exports.default = {
	    pre(file) {
	        ({ reportError = 'reportError' } = this.opts);
	
	        filename = this.opts.filename || file.opts.filenameRelative;
	
	        if (!filename || filename.toLowerCase() === 'unknown') {
	            throw new Error('babel-plugin-try-catch-wrapper: If babel cannot grab filename, you must pass it in');
	        }
	        wrapFunction = this.opts.rethrow ? wrapFunctionRethrow : wrapFunctionNothrow;
	    },
	    visitor: {
	        "Function|ClassMethod": {
	            exit(path, state) {
	                if (shouldSkip(path, state)) {
	                    return;
	                }
	
	                // ignore empty function body
	                const body = path.node.body.body;
	                if (body.length === 0) {
	                    return;
	                }
	
	                let functionName = 'anonymous function';
	                (0, _babelHelperFunctionName2.default)(path);
	                if (path.node.id) {
	                    functionName = path.node.id.name || 'anonymous function';
	                }
	                if (path.node.key) {
	                    functionName = path.node.key.name || 'anonymous function';
	                }
	                const loc = path.node.loc;
	                const errorVariableName = path.scope.generateUidIdentifier('e');
	
	                path.get('body').replaceWith(wrapFunction({
	                    BODY: body,
	                    FILENAME: t.StringLiteral(filename),
	                    FUNCTION_NAME: t.StringLiteral(functionName),
	                    LINE: t.NumericLiteral(loc.start.line),
	                    COLUMN: t.NumericLiteral(loc.start.column),
	                    REPORT_ERROR: t.identifier(reportError),
	                    ERROR_VARIABLE_NAME: errorVariableName
	                }));
	            }
	        },
	        "CatchClause": {
	            enter(path, state) {
	                if (shouldSkip(path, state)) {
	                    return;
	                }
	
	                // variable name of error caught
	                const errorVariableName = path.node.param.name;
	
	                path.node.body.body.unshift(markErrorResolved({
	                    ERROR: t.Identifier(errorVariableName)
	                }));
	            }
	        },
	        "ThrowStatement": {
	            enter(path, state) {
	                if (shouldSkip(path, state)) {
	                    return;
	                }
	
	                const error = path.node.argument;
	                if (error.type === 'Identifier') {
	                    path.insertBefore(markErrorUnresolved({
	                        ERROR: t.Identifier(error.name)
	                    }));
	                }
	            }
	        }
	    }
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = require("babel-helper-function-name");

/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("babel-template");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("babel-types");

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNmEyMWJhMDIyZjc1N2I2ZTEyZDciLCJ3ZWJwYWNrOi8vLy4vdGVzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJiYWJlbC1jb3JlXCIiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIiwid2VicGFjazovLy9leHRlcm5hbCBcImJhYmVsLWhlbHBlci1mdW5jdGlvbi1uYW1lXCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmFiZWwtdGVtcGxhdGVcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJiYWJlbC10eXBlc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImZzXCIiXSwibmFtZXMiOlsiYmFiZWwiLCJmcyIsImZpbGVOYW1lIiwicmVhZEZpbGUiLCJlcnIiLCJkYXRhIiwic3JjIiwidG9TdHJpbmciLCJjb25zb2xlIiwibG9nIiwib3V0IiwidHJhbnNmb3JtIiwicGx1Z2lucyIsImZpbGVuYW1lIiwicmVwb3J0RXJyb3IiLCJyZXRocm93IiwiY29kZSIsInQiLCJ3cmFwRnVuY3Rpb25SZXRocm93Iiwid3JhcEZ1bmN0aW9uTm90aHJvdyIsIm1hcmtFcnJvclJlc29sdmVkIiwibWFya0Vycm9yVW5yZXNvbHZlZCIsInNob3VsZFNraXAiLCJyZWNvcmRzIiwiTWFwIiwicGF0aCIsInN0YXRlIiwiZW5kIiwibm9kZSIsImxvYyIsIm5vZGVUeXBlIiwidHlwZSIsImhhcyIsInNldCIsIlNldCIsInJlY29yZHNPZlRoaXNUeXBlIiwiZ2V0Iiwic291cmNlTG9jYXRpb24iLCJzdGFydCIsImhhc1JlY29yZCIsImFkZCIsIndyYXBGdW5jdGlvbiIsInByZSIsImZpbGUiLCJvcHRzIiwiZmlsZW5hbWVSZWxhdGl2ZSIsInRvTG93ZXJDYXNlIiwiRXJyb3IiLCJ2aXNpdG9yIiwiZXhpdCIsImJvZHkiLCJsZW5ndGgiLCJmdW5jdGlvbk5hbWUiLCJpZCIsIm5hbWUiLCJrZXkiLCJlcnJvclZhcmlhYmxlTmFtZSIsInNjb3BlIiwiZ2VuZXJhdGVVaWRJZGVudGlmaWVyIiwicmVwbGFjZVdpdGgiLCJCT0RZIiwiRklMRU5BTUUiLCJTdHJpbmdMaXRlcmFsIiwiRlVOQ1RJT05fTkFNRSIsIkxJTkUiLCJOdW1lcmljTGl0ZXJhbCIsImxpbmUiLCJDT0xVTU4iLCJjb2x1bW4iLCJSRVBPUlRfRVJST1IiLCJpZGVudGlmaWVyIiwiRVJST1JfVkFSSUFCTEVfTkFNRSIsImVudGVyIiwicGFyYW0iLCJ1bnNoaWZ0IiwiRVJST1IiLCJJZGVudGlmaWVyIiwiZXJyb3IiLCJhcmd1bWVudCIsImluc2VydEJlZm9yZSJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHVCQUFlO0FBQ2Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0Q0E7O0tBQVlBLEs7O0FBQ1o7Ozs7QUFDQTs7S0FBWUMsRTs7Ozs7O0FBRVo7QUFDQSxPQUFNQyxXQUFXLGdCQUFqQjs7QUFFQTtBQUNBRCxJQUFHRSxRQUFILENBQVlELFFBQVosRUFBc0IsQ0FBQ0UsR0FBRCxFQUFNQyxJQUFOLEtBQWU7QUFDakMsU0FBSUQsR0FBSixFQUFTLE1BQU1BLEdBQU47O0FBRWI7QUFDSSxXQUFNRSxNQUFNRCxLQUFLRSxRQUFMLEVBQVo7QUFDQUMsYUFBUUMsR0FBUixDQUFZSCxHQUFaO0FBQ0o7QUFDSSxXQUFNSSxNQUFNVixNQUFNVyxTQUFOLENBQWdCTCxHQUFoQixFQUFxQjtBQUM3Qk0sa0JBQVMsQ0FDTCxrQkFBa0I7QUFDZEMsdUJBQVVYLFFBREk7QUFFZFksMEJBQWEsYUFGQztBQUdkQyxzQkFBUztBQUhLLFVBQWxCLENBREs7QUFEb0IsTUFBckIsQ0FBWjs7QUFVSjtBQUNJUCxhQUFRQyxHQUFSLENBQVlDLElB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OztBQUVELHVCQUFNbUQsUUFBUXBELEtBQUtHLElBQUwsQ0FBVWtELFFBQXhCO0FBQ0EscUJBQUlELE1BQU05QyxJQUFOLEtBQWUsWUFBbkIsRUFBaUM7QUFDN0JOLDBCQUFLc0QsWUFBTCxDQUNJMUQsb0JBQW9CO0FBQ2hCc0QsZ0NBQU8xRCxFQUFFMkQsVUFBRixDQUFhQyxNQUFNdkIsSUFBbkI7QUFEUyxzQkFBcEIsQ0FESjtBQUtIO0FBQ0o7QUFkYTtBQW5EYjtBQVhFLEU7Ozs7OztBQzFFZix3RDs7Ozs7O0FDQUEsNEM7Ozs7OztBQ0FBLHlDOzs7Ozs7QUNBQSxnQyIsImZpbGUiOiJyZWxlYXNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgNmEyMWJhMDIyZjc1N2I2ZTEyZDciLCJpbXBvcnQgKiBhcyBiYWJlbCAgZnJvbSBcImJhYmVsLWNvcmVcIjtcclxuaW1wb3J0ICB0cnlDYXRjaFdyYXBwZXIgZnJvbSAnLi4vc3JjL2luZGV4LmpzJ1xyXG5pbXBvcnQgKiBhcyBmcyBmcm9tICdmcydcclxuXHJcbi8vY29uc3QgZmlsZU5hbWUgPSBwcm9jZXNzLmFyZ3ZbMl07XHJcbmNvbnN0IGZpbGVOYW1lID0gJy4vdGVzdElucHV0LmpzJ1xyXG5cclxuLy8gcmVhZCB0aGUgY29kZSBmcm9tIHRoaXMgZmlsZVxyXG5mcy5yZWFkRmlsZShmaWxlTmFtZSwgKGVyciwgZGF0YSkgPT4ge1xyXG4gICAgaWYgKGVycikgdGhyb3cgZXJyO1xyXG5cclxuLy8gY29udmVydCBmcm9tIGEgYnVmZmVyIHRvIGEgc3RyaW5nXHJcbiAgICBjb25zdCBzcmMgPSBkYXRhLnRvU3RyaW5nKCk7XHJcbiAgICBjb25zb2xlLmxvZyhzcmMpO1xyXG4vLyB1c2Ugb3VyIHBsdWdpbiB0byB0cmFuc2Zvcm0gdGhlIHNvdXJjZVxyXG4gICAgY29uc3Qgb3V0ID0gYmFiZWwudHJhbnNmb3JtKHNyYywge1xyXG4gICAgICAgIHBsdWdpbnM6IFtcclxuICAgICAgICAgICAgW3RyeUNhdGNoV3JhcHBlciwge1xyXG4gICAgICAgICAgICAgICAgZmlsZW5hbWU6IGZpbGVOYW1lLFxyXG4gICAgICAgICAgICAgICAgcmVwb3J0RXJyb3I6ICdyZXBvcnRFcnJvcicsXHJcbiAgICAgICAgICAgICAgICByZXRocm93OiBmYWxzZVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgIF0sXHJcbiAgICB9KTtcclxuXHJcbi8vIHByaW50IHRoZSBnZW5lcmF0ZWQgY29kZSB0byBzY3JlZW5cclxuICAgIGNvbnNvbGUubG9nKG91dC5jb2RlKTtcclxufSlcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi90ZXN0L2luZGV4LmpzIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtY29yZVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImJhYmVsLWNvcmVcIlxuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJpbXBvcnQgZnVuY3Rpb25OYW1lSGVscGVyIGZyb20gJ2JhYmVsLWhlbHBlci1mdW5jdGlvbi1uYW1lJ1xuaW1wb3J0IHRlbXBsYXRlIGZyb20gJ2JhYmVsLXRlbXBsYXRlJ1xuaW1wb3J0ICogYXMgdCBmcm9tICdiYWJlbC10eXBlcydcblxuLypcbiBzdGFjayBmb3JtYXQ6XG4gJHtlcnJvci5uYW1lfTogJHtlcnJvci5tZXNzYWdlfVxuIGF0ICR7ZnVuY3Rpb25OYW1lfSAoJHtmaWxlTmFtZU9yVXJsfTpsaW5lOmNvbHVtbilcbiBhdCAke2Z1bmN0aW9uTmFtZX0gKCR7ZmlsZU5hbWVPclVybH06bGluZTpjb2x1bW4pXG4gLlxuIC5cbiAuXG4gKi9cblxuY29uc3Qgd3JhcEZ1bmN0aW9uUmV0aHJvdyA9IHRlbXBsYXRlKGB7XG4gIHRyeSB7XG4gICAgQk9EWVxuICB9IGNhdGNoKEVSUk9SX1ZBUklBQkxFX05BTUUpIHtcbiAgICBSRVBPUlRfRVJST1IoRVJST1JfVkFSSUFCTEVfTkFNRSwgRklMRU5BTUUsIEZVTkNUSU9OX05BTUUsIExJTkUsIENPTFVNTilcbiAgICB0aHJvdyBFUlJPUl9WQVJJQUJMRV9OQU1FXG4gIH1cbn1gKVxuXG5jb25zdCB3cmFwRnVuY3Rpb25Ob3Rocm93ID0gdGVtcGxhdGUoYHtcbiAgdHJ5IHtcbiAgICBCT0RZXG4gIH0gY2F0Y2goRVJST1JfVkFSSUFCTEVfTkFNRSkge1xuICAgIFJFUE9SVF9FUlJPUihFUlJPUl9WQVJJQUJMRV9OQU1FLCBGSUxFTkFNRSwgRlVOQ1RJT05fTkFNRSwgTElORSwgQ09MVU1OKVxuICB9XG59YClcblxuXG5jb25zdCBtYXJrRXJyb3JSZXNvbHZlZCA9IHRlbXBsYXRlKGBcbiAgRVJST1IuX3IgPSB0cnVlXG5gKVxuXG5jb25zdCBtYXJrRXJyb3JVbnJlc29sdmVkID0gdGVtcGxhdGUoYFxuICBkZWxldGUgRVJST1IuX3JcbmApXG5cbmNvbnN0IHNob3VsZFNraXAgPSAoKCkgPT4ge1xuICAgIGNvbnN0IHJlY29yZHMgPSBuZXcgTWFwXG5cbiAgICByZXR1cm4gKHBhdGgsIHN0YXRlKSA9PiB7XG4gICAgICAgIGlmIChzdGF0ZS5lbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZ25vcmUgZ2VuZXJhdGVkIGNvZGVcbiAgICAgICAgaWYgKCFwYXRoLm5vZGUubG9jKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWdub3JlIHByb2Nlc3NlZCBub2Rlc1xuICAgICAgICBjb25zdCBub2RlVHlwZSA9IHBhdGgubm9kZS50eXBlXG4gICAgICAgIGlmICghcmVjb3Jkcy5oYXMobm9kZVR5cGUpKSB7XG4gICAgICAgICAgICByZWNvcmRzLnNldChub2RlVHlwZSwgbmV3IFNldClcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByZWNvcmRzT2ZUaGlzVHlwZSA9IHJlY29yZHMuZ2V0KG5vZGVUeXBlKVxuICAgICAgICBjb25zdCBzb3VyY2VMb2NhdGlvbiA9IGAke2ZpbGVuYW1lfToke3BhdGgubm9kZS5zdGFydH0tJHtwYXRoLm5vZGUuZW5kfWBcbiAgICAgICAgY29uc3QgaGFzUmVjb3JkID0gcmVjb3Jkc09mVGhpc1R5cGUuaGFzKHNvdXJjZUxvY2F0aW9uKVxuICAgICAgICByZWNvcmRzT2ZUaGlzVHlwZS5hZGQoc291cmNlTG9jYXRpb24pXG4gICAgICAgIHJldHVybiBoYXNSZWNvcmRcbiAgICB9XG59KSgpXG5cbi8vIGZpbGVuYW1lIG9mIHdoaWNoIGlzIGJlaW5nIHByb2Nlc3NlZFxubGV0IGZpbGVuYW1lXG5cbi8vIGZ1bmN0aW9uIG5hbWUgcmVwb3J0aW5nIGVycm9yLCBkZWZhdWx0OiAncmVwb3J0RXJyb3InXG5sZXQgcmVwb3J0RXJyb3JcblxubGV0IHdyYXBGdW5jdGlvblxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICAgcHJlKGZpbGUpIHtcbiAgICAgICAgKHtyZXBvcnRFcnJvciA9ICdyZXBvcnRFcnJvcid9PSB0aGlzLm9wdHMpXG5cbiAgICAgICAgZmlsZW5hbWUgPSB0aGlzLm9wdHMuZmlsZW5hbWUgfHwgZmlsZS5vcHRzLmZpbGVuYW1lUmVsYXRpdmVcblxuICAgICAgICBpZiAoIWZpbGVuYW1lIHx8IGZpbGVuYW1lLnRvTG93ZXJDYXNlKCkgPT09ICd1bmtub3duJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdiYWJlbC1wbHVnaW4tdHJ5LWNhdGNoLXdyYXBwZXI6IElmIGJhYmVsIGNhbm5vdCBncmFiIGZpbGVuYW1lLCB5b3UgbXVzdCBwYXNzIGl0IGluJylcbiAgICAgICAgfVxuICAgICAgICB3cmFwRnVuY3Rpb24gPSB0aGlzLm9wdHMucmV0aHJvdyA/IHdyYXBGdW5jdGlvblJldGhyb3cgOiB3cmFwRnVuY3Rpb25Ob3Rocm93O1xuICAgIH0sXG4gICAgdmlzaXRvcjoge1xuICAgICAgICBcIkZ1bmN0aW9ufENsYXNzTWV0aG9kXCI6IHtcbiAgICAgICAgICAgIGV4aXQocGF0aCwgc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU2tpcChwYXRoLCBzdGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gaWdub3JlIGVtcHR5IGZ1bmN0aW9uIGJvZHlcbiAgICAgICAgICAgICAgICBjb25zdCBib2R5ID0gcGF0aC5ub2RlLmJvZHkuYm9keVxuICAgICAgICAgICAgICAgIGlmIChib2R5Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBsZXQgZnVuY3Rpb25OYW1lID0gJ2Fub255bW91cyBmdW5jdGlvbic7XG4gICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lSGVscGVyKHBhdGgpO1xuICAgICAgICAgICAgICAgIGlmIChwYXRoLm5vZGUuaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb25OYW1lID0gcGF0aC5ub2RlLmlkLm5hbWUgfHwgJ2Fub255bW91cyBmdW5jdGlvbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChwYXRoLm5vZGUua2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uTmFtZSA9IHBhdGgubm9kZS5rZXkubmFtZSB8fCAnYW5vbnltb3VzIGZ1bmN0aW9uJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgbG9jID0gcGF0aC5ub2RlLmxvY1xuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yVmFyaWFibGVOYW1lID0gcGF0aC5zY29wZS5nZW5lcmF0ZVVpZElkZW50aWZpZXIoJ2UnKVxuXG4gICAgICAgICAgICAgICAgcGF0aC5nZXQoJ2JvZHknKS5yZXBsYWNlV2l0aCh3cmFwRnVuY3Rpb24oe1xuICAgICAgICAgICAgICAgICAgICBCT0RZOiBib2R5LFxuICAgICAgICAgICAgICAgICAgICBGSUxFTkFNRTogdC5TdHJpbmdMaXRlcmFsKGZpbGVuYW1lKSxcbiAgICAgICAgICAgICAgICAgICAgRlVOQ1RJT05fTkFNRTogdC5TdHJpbmdMaXRlcmFsKGZ1bmN0aW9uTmFtZSksXG4gICAgICAgICAgICAgICAgICAgIExJTkU6IHQuTnVtZXJpY0xpdGVyYWwobG9jLnN0YXJ0LmxpbmUpLFxuICAgICAgICAgICAgICAgICAgICBDT0xVTU46IHQuTnVtZXJpY0xpdGVyYWwobG9jLnN0YXJ0LmNvbHVtbiksXG4gICAgICAgICAgICAgICAgICAgIFJFUE9SVF9FUlJPUjogdC5pZGVudGlmaWVyKHJlcG9ydEVycm9yKSxcbiAgICAgICAgICAgICAgICAgICAgRVJST1JfVkFSSUFCTEVfTkFNRTogZXJyb3JWYXJpYWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgfSkpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIFwiQ2F0Y2hDbGF1c2VcIjoge1xuICAgICAgICAgICAgZW50ZXIocGF0aCwgc3RhdGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2hvdWxkU2tpcChwYXRoLCBzdGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gdmFyaWFibGUgbmFtZSBvZiBlcnJvciBjYXVnaHRcbiAgICAgICAgICAgICAgICBjb25zdCBlcnJvclZhcmlhYmxlTmFtZSA9IHBhdGgubm9kZS5wYXJhbS5uYW1lXG5cbiAgICAgICAgICAgICAgICBwYXRoLm5vZGUuYm9keS5ib2R5LnVuc2hpZnQoXG4gICAgICAgICAgICAgICAgICAgIG1hcmtFcnJvclJlc29sdmVkKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEVSUk9SOiB0LklkZW50aWZpZXIoZXJyb3JWYXJpYWJsZU5hbWUpXG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBcIlRocm93U3RhdGVtZW50XCI6IHtcbiAgICAgICAgICAgIGVudGVyKHBhdGgsIHN0YXRlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNob3VsZFNraXAocGF0aCwgc3RhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IGVycm9yID0gcGF0aC5ub2RlLmFyZ3VtZW50XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yLnR5cGUgPT09ICdJZGVudGlmaWVyJykge1xuICAgICAgICAgICAgICAgICAgICBwYXRoLmluc2VydEJlZm9yZShcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcmtFcnJvclVucmVzb2x2ZWQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVSUk9SOiB0LklkZW50aWZpZXIoZXJyb3IubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgfVxufVxuXG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvaW5kZXguanMiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJiYWJlbC1oZWxwZXItZnVuY3Rpb24tbmFtZVwiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImJhYmVsLWhlbHBlci1mdW5jdGlvbi1uYW1lXCJcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmFiZWwtdGVtcGxhdGVcIik7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gZXh0ZXJuYWwgXCJiYWJlbC10ZW1wbGF0ZVwiXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImJhYmVsLXR5cGVzXCIpO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIGV4dGVybmFsIFwiYmFiZWwtdHlwZXNcIlxuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJmc1wiKTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyBleHRlcm5hbCBcImZzXCJcbi8vIG1vZHVsZSBpZCA9IDdcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==