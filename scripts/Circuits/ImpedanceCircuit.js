class ImpedanceCircuit extends Circuit{
    /**
     * Creates a impedance circuit representation based on circuit expression
     * @param {string} circuitExpression
     */
    constructor(circuitExpression) {
        super(
            circuitExpression,
            new OperatorManager().add('_', 1, (a, b) => a.add(b)). add('|', 2, (a, b) => a.multiply(b).divide(a.add(b))),
            CircuitPopupWindow.showImpedance,
            ImpedanceCircuit.#drawElement,
            ImpedanceCircuit.#stepMessage,
            ImpedanceCircuit.#serialStepEquation,
            ImpedanceCircuit.#parallelStepEquation
        );
        this.elementPefix = 'Z';
    }
    /**
     * Draws element
     * @param {string} name
     * @param {any} position
     * @param {CanvasRenderingContext2D} context
     */
    static #drawElement(name, position, context) {     
        if (name.includes('L')) {
            context.drawImage(Circuit.inductorImage, position.x, position.y);
        } else if (name.includes('C')) {
            context.drawImage(Circuit.capacitorImage, position.x, position.y);
        } else {
            context.drawImage(Circuit.impedanceImage, position.x, position.y);
        }
    }
    /**
     * Returns message describing calculation step
     * @param {string} type
     * @param {string} mergedElements
     * @param {string} finalElement 
     * @returns {string}
     */
    static #stepMessage(type, mergedElements, finalElement) {
        return `Výpočet ${type} spojení impedamcí ${mergedElements} do impedance ${finalElement}`;
    }
    /**
     * Returns a text equation showing the calculation process of combining impedances in series into a single impedance
     * @param {ExpressionNode[]} children
     * @param {ExpressionNode} node
     * @returns {string}
     */
    static #serialStepEquation(children, node) {
        let equationSymbol = Circuit.reduceNodes(children, node => node.stringValue);
        let equationValue = MathJaxHelperFunctions.replaceExponents(
            Circuit.reduceNodes(children, node => MathJaxHelperFunctions.roundedString(node.value))
        );
        let value = MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(node.value));
        return (
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${equationSymbol}`) + 
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${equationValue}`) + 
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${value}`)
        );
    }
    /**
     * Returns a text equation showing the calculation process of combining impedances in parallel into a single impedance
     * @param {ExpressionNode[]} children
     * @param {ExpressionNode} node
     * @returns {string}
     */
    static #parallelStepEquation(children, node) {
        let equationSymbol = Circuit.reduceNodes(children, node => MathJaxHelperFunctions.getFrac('1', node.stringValue));
        let equationValue = MathJaxHelperFunctions.replaceExponents(
            Circuit.reduceNodes(children, node => MathJaxHelperFunctions.getFrac('1', MathJaxHelperFunctions.roundedString(node.value)))
        );
        let inverseValue = MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(node.value.inverse()));
        let value = MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(node.value));
        return (
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${MathJaxHelperFunctions.getFrac('1', equationSymbol)}`) +
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${MathJaxHelperFunctions.getFrac('1', equationValue)}`) + 
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${MathJaxHelperFunctions.getFrac('1', inverseValue)}`) +
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${value}`)
        );
    }
    /**
     * Calculates voltage from current and impedance of node, parent node is used to determine if image and calculation step should be generated
     * @param {ComplexNumber} current 
     * @param {ExpressionNode} node 
     * @param {ExpressionNode} parent 
     */
    calculateSerial(current, node, parent) {
        this.calculate(current, current.multiply(node.value), node, parent);
    }
    /**
     * Calculates current from voltage and impedance of node, parent node is used to determine if image and calculation step should be generated
     * @param {ComplexNumber} voltage 
     * @param {ExpressionNode} node 
     * @param {ExpressionNode} parent 
     */
    calculateParallel(voltage, node, parent) {
        this.calculate(voltage.divide(node.value), voltage, node, parent)
    }
    /**
     * Calculates circuit values from voltage
     * @param {ComplexNumber} voltage 
     */
    calculateFromVoltage(voltage) {
        this.calculateParallel(voltage, this.expressionTree, null);
    }
    /**
     * Calculates circuit values from current
     * @param {ComplexNumber} current 
     */
    calculateFromCurrent(current) {
        this.calculateSerial(current, this.expressionTree, null);
    }
    /**
     * Recursive function for calculating and storing circuit values
     * @param {ComplexNumber} serialQuantity
     * @param {ComplexNumber} parallelQuantity
     * @param {ExpressionNode} node
     * @param {ExpressionNode} parentNode 
     */
    calculate(serialQuantity, parallelQuantity, node, parentNode) {
        super.calculate(serialQuantity, parallelQuantity, node, parentNode);
        let power = serialQuantity.conjugate().multiply(parallelQuantity).divide(new ComplexNumber(2, 0));   
        this.values.set(node, {impedance: node.value, current: serialQuantity, voltage: parallelQuantity, power: power, name: node.stringValue});
    }
    /**
     * Returns a div containing results
     * @returns {HTMLDivElement}
     */
    get finalResults() {
        let div  = document.createElement("div");
        div.className = 'final_results';
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `<span style="text-decoration: overline;">${this.expressionTree.stringValue}</span>`,
                    this.expressionTree.stringValue,
                    `φ<sub>${this.expressionTree.stringValue}</sub>`
                ],
                [
                    'Ω',
                    'Ω',
                    'rad'
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.expressionTree.value),
                    MathJaxHelperFunctions.roundedString(this.expressionTree.value.magnitude),
                    MathJaxHelperFunctions.roundedString(this.expressionTree.value.phase)
                ],
                "Výsledná impedance"
            )
        );
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `<span style="text-decoration: overline;">U</span>`,
                    `U<sub>ef</sub>`,
                    `φ<sub>U</sub>`
                ],
                [
                    'V',
                    'V',
                    'rad'
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).voltage),
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).voltage.magnitude / Math.SQRT2),
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).voltage.phase)
                ],
                "Výsledné napětí"
            )
        );
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `<span style="text-decoration: overline;">I</span>`,
                    `I<sub>ef</sub>`,
                    `φ<sub>I</sub>`
                ],
                [
                    'A',
                    'A',
                    'rad'
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).current),
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).current.magnitude / Math.SQRT2),
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).current.phase)
                ],
                "Výsledný proud"
            )
        );
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `S`,
                    `P`,
                    `Q`
                ],
                [
                    'VA',
                    'W',
                    'VAr'
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).power.magnitude),
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).power.real),
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).power.imaginary)
                ],
                "Výsledný výkon"
            )
        );
        return div;
    }
}