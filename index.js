"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
exports.line = void 0;
exports.ansiEscapes = void 0;
exports.stringf = void 0;
exports.printf = void 0;

const util = require('util');
const { default: cursor } = require('./ansi-escapes');
// const getCursorPosition = require('get-cursor-position');

function stringf() {
    let args = Array.from(arguments)
        .map(arg => {
            if (typeof arg == 'string')
                return arg;
            return util.inspect(arg, { showHidden: false, depth: null, colors: true, }); // compact: true, breakLength: Infinity 
        });
    return util.format.apply(this, args);
}

function printf() {
    console._stdout.write(stringf.apply(this, arguments));
};

class Line {
    static count = 0;
    static line() {
        return new Line(arguments);
    }

    index = Line.count;
    args = [];

    constructor(args, opts) {
        this.index = opts?.index ?? Line.count;
        this.args = Array.from(args);
        this.content = stringf(...args);

        if (opts?.noSend)
            return;

        const lineCount = stringf(...args).split('\n').length;
        Line.count += lineCount;

        printf(...args, '\n');
    }

    edit(...args) {
        printf(cursor.cursorSavePosition);
        // let oldRow = getCursorPosition.sync().row;
        // let oldRow = (await getCursorPos()).row;
        printf(cursor.cursorUp(Line.count - this.index));
        // let row = getCursorPosition.sync().row;
        // let row = (await getCursorPos()).row;

        // if (oldRow - row == line - this.index) {
        printf(cursor.eraseLine);

        // _line = line;
        // line = this.index;
        this.args = args;
        printf(...args, '\n');
        // line = _line;
        // }

        printf(cursor.cursorRestorePosition);
        return this;
    }

    append(...args) {
        return this.edit(...this.args, ...args);
    }

    erase() {
        return this.edit();
    }

    resend() {
        this.index = Line.count;

        const lineCount = stringf(...this.args).split('\n').length;
        Line.count += lineCount;

        printf(...this.args, '\n');
        return this;
    }

    copy() {
        return new Line(this.args, { index: this.index, noSend: true });
    }
};

module.exports.default = Line.line;
module.exports.line = Line.line;
module.exports.ansiEscapes = cursor;
module.exports.stringf = stringf;
module.exports.printf = printf;