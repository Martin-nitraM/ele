class ResistorCircuit extends Circuit{
    /**
     * Creates a resistor circuit representation based on circuit expression
     * @param {string} circuitExpression
     */
    constructor(circuitExpression) {
        super(
            circuitExpression,
            new OperatorManager().add('_', 1,(a, b) => a + b). add('|', 2, (a, b) => a * b / (a + b)),
            CircuitPopupWindow.showResistance,
            ResistorCircuit.#drawElement,
            ResistorCircuit.#stepMessage,
            ResistorCircuit.#serialStepEquation,
            ResistorCircuit.#parallelStepEquation
        );
        this.elementPefix = 'R';
    }
    /**
     * Draws element
     * @param {string} name
     * @param {any} position
     * @param {CanvasRenderingContext2D} context
     */
    static #drawElement(name, position, context) {     
        context.drawImage(Circuit.impedanceImage, position.x, position.y);
    }
    /**
     * Returns message describing calculation step
     * @param {string} type
     * @param {string} mergedElements
     * @param {string} finalElement
     * @returns {string}
     */
    static #stepMessage(type, mergedElements, finalElement) {
        return `Výpočet ${type} spojení rezistorů ${mergedElements} do rezistoru ${finalElement}`;
    }
    /**
     * Returns a text equation showing the calculation process of combining resistors in parallel into a single resistor
     * @param {ExpressionNode[]} children
     * @param {ExpressionNode} node
     * @returns {string}
     */
    static #parallelStepEquation(children, node) {
        let equationSymbol = Circuit.reduceNodes(children, node => MathJaxHelperFunctions.getFrac('1', node.stringValue));
        let equationValue = MathJaxHelperFunctions.replaceExponents(
            Circuit.reduceNodes(children, node => MathJaxHelperFunctions.getFrac('1', MathJaxHelperFunctions.roundedString(node.value)))
        );
        let inverseValue = MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(1 / node.value));
        let value = MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(node.value));
        return (
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${MathJaxHelperFunctions.getFrac('1', equationSymbol)}`) +
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${MathJaxHelperFunctions.getFrac('1', equationValue)}`) + 
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${MathJaxHelperFunctions.getFrac('1',  inverseValue)}`) +
            MathJaxHelperFunctions.newLine(`${node.stringValue} = ${value}`)
        );      
    }
    /**
     * Returns a text equation showing the calculation process of combining resistors in series into a single resistor
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
     * Calculates voltage from current and resistance of node, parent node is used to determine if image and calculation step should be generated
     * @param {number} current 
     * @param {ExpressionNode} node 
     * @param {ExpressionNode} parent 
     */
    calculateSerial(current, node, parent) {
        this.calculate(current, current * node.value, node, parent);
    }
    /**
     * Calculates current from voltage and capacity of node, parent node is used to determine if image and calculation step should be generated
     * @param {number} voltage 
     * @param {ExpressionNode} node 
     * @param {ExpressionNode} parent 
     */
    calculateParallel(voltage, node, parent) {
        this.calculate(voltage / node.value, voltage, node, parent);
    }
    /**
     * Calculates circuit values from voltage
     * @param {number} voltage 
     */
    calculateFromVoltage(voltage) {
        this.calculateParallel(voltage, this.expressionTree, null);
    }
    /**
     * Calculates circuit values from charge
     * @param {number} current 
     */
    calculateFromCurrent(current) {
        this.calculateSerial(current, this.expressionTree, null);
    }
    /**
     * Recursive function for calculating and storing circuit values
     * @param {number} serialQuantity
     * @param {number} parallelQuantity
     * @param {ExpressionNode} node
     * @param {ExpressionNode} parentNode 
     */
    calculate(serialQuantity, parallelQuantity, node, parentNode) {
        super.calculate(serialQuantity, parallelQuantity, node, parentNode);
        let power = serialQuantity * parallelQuantity;
        this.values.set(node, {resistance: node.value, current: serialQuantity, voltage: parallelQuantity, power: power, name: node.stringValue});
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
                    this.expressionTree.stringValue,
                ],
                [
                    'Ω',
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).resistance),
                ],
                "Výsledný odpor"
            )
        );
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `U`,
                ],
                [
                    'V',
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).voltage),
                ],
                "Výsledné napětí"
            )
        );
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `I`
                ],
                [
                    'A',
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).current)
                ],
                "Výsledný proud"
            )
        );
        div.appendChild(
            Circuit.getResultDiv(
                [
                    `P`
                ],
                [
                    'W',
                ],
                [
                    MathJaxHelperFunctions.roundedString(this.values.get(this.expressionTree).power)
                ],
                "Výsledný výkon"
            )
        );
        return div;
    }
}