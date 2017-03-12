import functionNameHelper from 'babel-helper-function-name'
import template from 'babel-template'
import * as t from 'babel-types'

/*
 stack format:
 ${error.name}: ${error.message}
 at ${functionName} (${fileNameOrUrl}:line:column)
 at ${functionName} (${fileNameOrUrl}:line:column)
 .
 .
 .
 */

const wrapFunctionRethrow = template(`{
  try {
    BODY
  } catch(ERROR_VARIABLE_NAME) {
    REPORT_ERROR(ERROR_VARIABLE_NAME, FILENAME, FUNCTION_NAME, LINE, COLUMN)
    throw ERROR_VARIABLE_NAME
  }
}`)

const wrapFunctionNothrow = template(`{
  try {
    BODY
  } catch(ERROR_VARIABLE_NAME) {
    REPORT_ERROR(ERROR_VARIABLE_NAME, FILENAME, FUNCTION_NAME, LINE, COLUMN)
  }
}`)


const markErrorResolved = template(`
  ERROR._r = true
`)

const markErrorUnresolved = template(`
  delete ERROR._r
`)

const shouldSkip = (() => {
    const records = new Map

    return (path, state) => {
        if (state.end) {
            return true
        }

        // ignore generated code
        if (!path.node.loc) {
            return true
        }

        // ignore processed nodes
        const nodeType = path.node.type
        if (!records.has(nodeType)) {
            records.set(nodeType, new Set)
        }
        const recordsOfThisType = records.get(nodeType)
        const sourceLocation = `${filename}:${path.node.start}-${path.node.end}`
        const hasRecord = recordsOfThisType.has(sourceLocation)
        recordsOfThisType.add(sourceLocation)
        return hasRecord
    }
})()

// filename of which is being processed
let filename

// function name reporting error, default: 'reportError'
let reportError

let wrapFunction

export default {
    pre(file) {
        ({reportError = 'reportError'}= this.opts)

        filename = this.opts.filename || file.opts.filenameRelative

        if (!filename || filename.toLowerCase() === 'unknown') {
            throw new Error('babel-plugin-try-catch-wrapper: If babel cannot grab filename, you must pass it in')
        }
        wrapFunction = this.opts.rethrow ? wrapFunctionRethrow : wrapFunctionNothrow;
    },
    visitor: {
        "Function|ClassMethod": {
            exit(path, state) {
                if (shouldSkip(path, state)) {
                    return
                }

                // ignore empty function body
                const body = path.node.body.body
                if (body.length === 0) {
                    return
                }

                let functionName = 'anonymous function';
                functionNameHelper(path);
                if (path.node.id) {
                    functionName = path.node.id.name || 'anonymous function';
                }
                if (path.node.key) {
                    functionName = path.node.key.name || 'anonymous function';
                }
                const loc = path.node.loc
                const errorVariableName = path.scope.generateUidIdentifier('e')

                path.get('body').replaceWith(wrapFunction({
                    BODY: body,
                    FILENAME: t.StringLiteral(filename),
                    FUNCTION_NAME: t.StringLiteral(functionName),
                    LINE: t.NumericLiteral(loc.start.line),
                    COLUMN: t.NumericLiteral(loc.start.column),
                    REPORT_ERROR: t.identifier(reportError),
                    ERROR_VARIABLE_NAME: errorVariableName,
                }))
            }
        },
        "CatchClause": {
            enter(path, state) {
                if (shouldSkip(path, state)) {
                    return
                }

                // variable name of error caught
                const errorVariableName = path.node.param.name

                path.node.body.body.unshift(
                    markErrorResolved({
                        ERROR: t.Identifier(errorVariableName)
                    })
                )
            }
        },
        "ThrowStatement": {
            enter(path, state) {
                if (shouldSkip(path, state)) {
                    return
                }

                const error = path.node.argument
                if (error.type === 'Identifier') {
                    path.insertBefore(
                        markErrorUnresolved({
                            ERROR: t.Identifier(error.name)
                        })
                    )
                }
            }
        },
    }
}

