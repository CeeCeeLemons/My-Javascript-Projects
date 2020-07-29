const Range = (length) => {
    return Array.from({ length }, (_, i) => i);
}

const Range2 = (start, end) => {
    const length = end - start;
    return Array.from({ length }, (_, i) => i + start);
}

function Matrix(...args) {
    this.rows = 1;
    this.cols = 1;
    this[0] = [0];

    if (args.length === 2 && typeof args[0] === 'number' && typeof args[1] === 'number') {
        this.rows = args[0];
        this.cols = args[1];
        for (let r of Range(this.rows)) {
            let temp = []
            for (let c of Range(this.cols)) {
                temp.push(0);
            }
            this[r] = temp;
        }
    } else if (args.length === 1) {
        if (typeof args[0] === 'number') {
            this.rows = args[0];
            this.cols = args[0];
            for (let r of Range(this.rows)) {
                let temp = []
                for (let c of Range(this.cols)) {
                    temp.push(0);
                }
                this[r] = temp;
            }
        } else if (typeof args[0] === 'object') {
            if (args[0].constructor.name === 'Array') {
                if (args[0][0] !== undefined) {
                    this.rows = args[0].length;
                    if (args[0][0].constructor.name === 'Array') {
                        for (let r of Range(this.rows)) {
                            let row = args[0][r]
                            this.cols = Math.max(this.cols, row.length);
                            let temp = [];
                            for (let d of row) {
                                temp.push(d);
                            }
                            this[r] = temp;
                        }
                        for (let r of Range(this.rows)) {
                            let row = this[r];
                            while (row.length < this.cols) {
                                row.push(0);
                            }
                        }
                    } else {
                        for (let r of Range(args[0].length)) {
                            this[r] = [args[0][r]];
                        }
                    }
                }
            } else if (args[0].constructor.name === 'Matrix') {
                this.rows = args[0].rows;
                this.cols = args[0].cols;
                for (let r of Range(this.rows)) {
                    let temp = [];
                    for (let c of Range(this.cols)) {
                        temp.push(args[0][r][c]);
                    }
                    this[r] = temp;
                }
            }
        }
    } else if (args.length === 3) {
        if (typeof args[0] === 'number' && typeof args[1] === 'number' && typeof args[2] === 'function') {
            this.rows = args[0];
            this.cols = args[1];
            for (let r of Range(this.rows)) {
                let temp = []
                for (let c of Range(this.cols)) {
                    temp.push(args[2]());
                }
                this[r] = temp;
            }
        }
    }

    this.__proto__.add = function (m) {
        if (typeof m === 'number') {
            let ret = new Matrix(this.rows, this.cols);
            for (let r of Range(this.rows)) {
                for (let c of Range(this.cols)) {
                    ret[r][c] = this[r][c] + m;
                }
            }
            return ret;
        } else if (m.constructor.name === 'Matrix') {
            if (this.rows !== m.rows || this.cols !== m.cols) {
                throw "Invalid dimensions when adding two matrices";
                return undefined;
            } else {
                let ret = new Matrix(this.rows, this.cols);
                for (let r of Range(this.rows)) {
                    for (let c of Range(this.cols)) {
                        ret[r][c] = this[r][c] + m[r][c];
                    }
                }
                return ret;
            }
        }
    }

    this.__proto__.sub = function (m) {
        if (this.rows !== m.rows || this.cols !== m.cols) {
            throw "Invalid dimensions when subtracting two matrices";
            return undefined;
        } else {
            let ret = new Matrix(this.rows, this.cols);
            for (let r of Range(this.rows)) {
                for (let c of Range(this.cols)) {
                    ret[r][c] = this[r][c] - m[r][c];
                }
            }
            return ret;
        }
    }

    this.__proto__.mul = function (arg) {
        if (typeof (arg) === 'number') {
            let ret = new Matrix(this.rows, this.cols);
            for (let r of Range(this.rows)) {
                for (let c of Range(this.cols)) {
                    ret[r][c] = this[r][c] * arg;
                }
            }
            return ret;
        } else if (arg.constructor.name === 'Matrix') {
            if (this.cols !== arg.rows) {
                throw "Invalid dimensions when multiplying two matrices";
                return undefined;
            } else {
                let ret = new Matrix(this.rows, arg.cols);
                for (let r of Range(this.rows)) {
                    for (let c of Range(arg.cols)) {
                        let sum = 0;
                        for (let i of Range(this.cols)) {
                            sum += (this[r][i] * arg[i][c]);
                        }
                        ret[r][c] = sum;
                    }
                }
                return ret;
            }
        }
    }

    this.__proto__.elementMul = function (m) {
        if (this.rows !== m.rows || this.cols !== m.cols) {
            throw "Invalid dimensions when multiplying two matrices by element";
            return undefined;
        } else {
            let ret = new Matrix(this.rows, this.cols);
            for (let r of Range(this.rows)) {
                for (let c of Range(this.cols)) {
                    ret[r][c] = this[r][c] * m[r][c];
                }
            }
            return ret;
        }
    }

    this.__proto__.transpose = function () {
        let ret = new Matrix(this.cols, this.rows);
        for (let c of Range(this.cols)) {
            for (let r of Range(this.rows)) {
                ret[c][r] = this[r][c];
            }
        }
        return ret;
    }

    this.__proto__.elementExp = function () {
        let ret = new Matrix(this.rows, this.cols);
        for (let r of Range(this.rows)) {
            for (let c of Range(this.cols)) {
                ret[r][c] = Math.exp(this[r][c]);
            }
        }
        return ret;
    }

    this.__proto__.elementPower = function (n) {
        let ret = new Matrix(this.rows, this.cols);
        for (let r of Range(this.rows)) {
            for (let c of Range(this.cols)) {
                ret[r][c] = Math.pow(this[r][c], n);
            }
        }
        return ret;
    }

    this.__proto__.normF = function () {
        let sum = 0;
        for (let r of Range(this.rows)) {
            for (let c of Range(this.cols)) {
                sum += this[r][c] * this[r][c];
            }
        }
        return sum ** .5;
    }

    this.__proto__.applyFunc = function (func) {
        let ret = new Matrix(this.rows, this.cols);
        for (let r of Range(this.rows)) {
            for (let c of Range(this.cols)) {
                ret[r][c] = func(this[r][c]);
            }
        }
        return ret;
    }
}

Matrix.ones = function (...args) {
    let m = new Matrix(...args);
    for (let r of Range(m.rows)) {
        for (let c of Range(m.cols)) {
            m[r][c] = 1;
        }
    }
    return m;
}

Matrix.eye = function (n) {
    let m = new Matrix(n);
    for (let r of Range(n)) {
        m[r][r] = 1;
    }
    return m;

}