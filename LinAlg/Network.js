function Network(layers, stepSize = 0.001, empty = false) {
    let invLog = (n) => {
        return -Math.log(1 / n - 1);
    }

    let logistic = (m) => {
        return m.applyFunc((n) => {
            return 1 / (1 + Math.exp(-n));
        })
    }

    this.neurons = [];
    this.weights = [];
    this.biases = [];

    this.weightNum = 0;
    this.biasNum = 0;

    this.inputNum = layers[0];
    this.outputNum = layers[layers.length - 1];

    this.inputData = undefined;
    this.expectedOutputs = undefined;

    this.stepSize = stepSize;

    this.maxCost = (layers[layers.length - 1]) ** .5;

    for (let i of Range2(1, layers.length)) {
        this.biasNum += layers[i];
    }

    for (let i of Range(layers.length - 1)) {
        this.weightNum += layers[i] * layers[i + 1];
        this.neurons.push(new Matrix(layers[i], 1));

        let weight;
        let bias;
        if (empty) {
            weight = new Matrix(layers[i + 1], layers[i]);
            bias = new Matrix(layers[i + 1], 1);
        } else {
            let standardDist = () => {
                let sum = 0;
                for (let n = 0; n < 12; n++) {
                    sum += Math.random();
                }
                return (sum - 6) / (layers[i] ** .5);
            }
            weight = new Matrix(layers[i + 1], layers[i], standardDist);
            bias = new Matrix(layers[i + 1], 1, standardDist);
        }
        this.weights.push(weight);
        this.biases.push(bias);
    }

    this.neurons.push(new Matrix(layers[layers.length - 1], 1));

    this.__proto__.setTrainingData = function (td, eo) {
        this.inputData = td;
        this.expectedOutputs = eo;
    }

    this.__proto__.setInputs = function (inputs) {
        this.neurons[0] = new Matrix(inputs);
    }

    this.__proto__.getOutputs = function () {
        let ret = [];
        for (let i of Range(this.outputNum)) {
            ret.push(this.neurons[this.neurons.length - 1][i][0])
        }
        return ret;
    }

    this.__proto__.process = function () {
        for (let i of Range(this.neurons.length - 1)) {
            this.neurons[i + 1] = logistic(this.weights[i].mul(this.neurons[i]).add(this.biases[i]));
        }
    }

    this.__proto__.getAvCost = function () {
        let sum = 0;
        for (let i of Range(this.expectedOutputs.length)) {
            sum += this.error(this.inputData[i], this.expectedOutputs[i]).normF();
        }
        return sum / this.expectedOutputs.length;
    }

    this.__proto__.train = function (printProgress = false) {
        let weightSlopes = [];
        let biasSlopes = [];
        let neuronSlopes = [];

        for (let i of Range(this.neurons.length)) {
            neuronSlopes.push(new Matrix(this.neurons[i].rows, 1));
        }

        let costs = [];
        let diffs = [];
        let frozenNeurons = [];

        for (let i of Range(this.expectedOutputs.length)) {
            let error = this.error(this.inputData[i], this.expectedOutputs[i])
            diffs.push(error);
            costs.push(error.normF());

            frozenNeurons.push([]);
            for (let j of Range(this.neurons.length)) {
                frozenNeurons[i].push(new Matrix(this.neurons[j]));
            }
        }

        for (let i of Range(this.weights.length)) {
            let currentWeights = this.weights[i];
            weightSlopes.push(new Matrix(currentWeights.rows, currentWeights.cols));

            for (let r of Range(currentWeights.rows)) {
                for (let c of Range(currentWeights.cols)) {
                    let sum = 0;
                    for (let j of Range(this.expectedOutputs.length)) {
                        let cst = costs[j];
                        let diff = diffs[j];

                        neuronSlopes[i + 1] = new Matrix(frozenNeurons[j][i + 1].rows, 1);
                        neuronSlopes[i + 1][r][0] = frozenNeurons[j][i][c][0] * frozenNeurons[j][i + 1][r][0] * (1 - frozenNeurons[j][i + 1][r][0]);

                        for (let k of Range2(i + 1, this.weights.length)) {
                            neuronSlopes[k + 1] = frozenNeurons[j][k + 1].applyFunc((n) => {
                                return n * (1 - n);
                            }).elementMul(this.weights[k].mul(neuronSlopes[k]));
                        }

                        let outputErrors = diff.transpose();
                        let slope = outputErrors.mul(neuronSlopes[neuronSlopes.length - 1])[0][0] / cst;
                        sum += slope;
                    }
                    weightSlopes[i][r][c] = sum / this.expectedOutputs.length;
                }
            }
        }

        for (let i of Range(this.biases.length)) {
            let currentBiases = this.biases[i];
            biasSlopes.push(new Matrix(currentBiases.rows, 1));

            for (let r of Range(currentBiases.rows)) {
                let sum = 0;
                for (let j of Range(this.expectedOutputs.length)) {
                    let cst = costs[j];
                    let diff = diffs[j];

                    neuronSlopes[i + 1] = new Matrix(frozenNeurons[j][i + 1].rows, 1);
                    neuronSlopes[i + 1][r][0] = frozenNeurons[j][i + 1][r][0] * (1 - frozenNeurons[j][i + 1][r][0]);

                    for (let k of Range2(i + 1, this.biases.length)) {
                        neuronSlopes[k + 1] = (frozenNeurons[j][k + 1].applyFunc((n) => {
                            return n * (1 - n);
                        })).elementMul(this.weights[k].mul(neuronSlopes[k]));
                    }

                    let outputErrors = diff.transpose();
                    let slope = outputErrors.mul(neuronSlopes[neuronSlopes.length - 1])[0][0] / cst;
                    sum += slope;
                }
                biasSlopes[i][r][0] = sum / this.expectedOutputs.length;
            }
        }

        for (let i of Range(this.weights.length)) {
            let newWeights = this.weights[i].sub(weightSlopes[i].mul(this.stepSize));
            this.weights[i] = newWeights;
        }

        for (let i of Range(this.biases.length)) {
            let newBiases = this.biases[i].sub(biasSlopes[i].mul(this.stepSize));
            this.biases[i] = newBiases;
        }
    }

    this.__proto__.error = function (inp, out) {
        this.setInputs(inp);
        this.process();
        let expected = new Matrix(out);
        let output = this.neurons[this.neurons.length - 1];

        return output.sub(expected);
    }
}