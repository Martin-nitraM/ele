class Circuit {
    static #endOfLine = 10;
    static #imageSize = {w: 100, h: 100, copy() {return {w: this.w, h: this.h}}};
    static capacitorImage = this.#createCapacitorImage(this.#imageSize.w, this.#imageSize.h);
    static inductorImage = this.#createInductorImage(this.#imageSize.w, this.#imageSize.h);
    static impedanceImage = this.#createImpedanceImage(this.#imageSize.w, this.#imageSize.h);
    /**
     * Returns random circuit equation
     * @param {string[]} prefixes 
     * @returns 
     */
    static randomEquation(prefixes) {
        let indexes = new Array(prefixes.length).fill(1);

        function randomEquation(depth) {
            if (depth == 0) {
                let index = Math.floor(Math.random() * prefixes.length);
                return prefixes[index] + indexes[index]++;
            }
            let left = randomEquation(depth-1);
            let right = randomEquation(depth-1);
            if (Math.random() < 0.5) {
                if (Math.random() < 0.5 && depth > 1) return "(" + left + ")|(" + right + ")";
                return left + "|" + right;
            }
            return left + "_" + right;
        }
        return randomEquation(3);
    }
    /**
     * Reduce expression nodes by a function extracting a value from each node into string
     * @param {ExpressionNode[]} nodes
     * @param {Function} valueFunction
     */
    static reduceNodes(nodes, valueFunction, delimiter = ' + ') {
        return nodes.reduce(
           (acc, cur, i) => {
               if (i < 1) return valueFunction(cur); 
               return `${acc}${delimiter}${valueFunction(cur)}`
           },''
        );
    }
    /**
     * Creates image of capacitor
     * @param {Number} width
     * @param {Number} height 
     */
    static #createCapacitorImage(width, height) {
        let d1 = width / 17;
        let d2 = height / 3;
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d");
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(width / 2 - d1, height / 2);
        context.stroke();
        context.beginPath();
        context.moveTo(width / 2 - d1, d2);
        context.lineTo(width / 2 - d1, height - d2);
        context.stroke();
        context.beginPath();
        context.moveTo(width, height / 2);
        context.lineTo(width / 2 + d1, height / 2);
        context.stroke();
        context.beginPath();
        context.moveTo(width / 2 + d1, d2);
        context.lineTo(width / 2 + d1, height - d2);
        context.stroke();
        return canvas;
    }
    /**
     * Creates image of inductor
     * @param {Number} width
     * @param {Number} height 
     */
    static #createInductorImage(width, height) {
        let d = width / 5;
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d");
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(0, height / 2);
        context.lineTo(d, height / 2);
        context.stroke();
        context.beginPath();
        context.arc(d * 1.5, height / 2 + 1, d / 2, 0, Math.PI, true);
        context.stroke();
        context.beginPath();
        context.arc(d * 2.5, height / 2 + 1, d / 2, 0, Math.PI, true);
        context.stroke();
        context.beginPath();
        context.arc(d * 3.5, height / 2 + 1, d / 2, 0, Math.PI, true);
        context.stroke();
        context.beginPath();
        context.moveTo(d * 4, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();
        return canvas;
    }
    /**
     * Creates image of impedance
     * @param {Number} width
     * @param {Number} height 
     */
    static #createImpedanceImage(width, height) {
        let d = width / 5;
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d");
        context.lineWidth = 2;
        context.moveTo(0, height / 2);
        context.lineTo(d, height / 2);
        context.moveTo(d * 4, height / 2);
        context.lineTo(width, height / 2);
        context.stroke();
        context.strokeRect(d, (height - d) / 2, d * 3, d);
        return canvas;
    }
    /**
     * Creates div for displaying results
     * @param {string[]} names
     * @param {string[]} units
     * @param {string[]} values
     * @param {string} heading
     */
    static getResultDiv(names, units, values, heading) {
        let div  = document.createElement("div");
        let h = document.createElement("h3");
        h.innerHTML = heading;
        div.appendChild(h);

        for (let i = 0; i < names.length; i++) {
            let span = document.createElement('span');
            span.innerHTML = `${names[i]}[${units[i]}] = ${values[i]}`;
            div.appendChild(span);
        }

        return div;
    }

    #elementIndex = 1;
    #substituteValues = new Map();
    #displayElementValues;
    #drawElement;
    #stepMessage;
    #serialStepEquation;
    #parallelStepEquation;
    /**
     * Creates circuit representation
     * @param {string} circuitExpression
     * @param {OperatorManager} operatorManager
     * @param {(values, position) => void} displayElementValues
     * @param {(name: string, position, context: CanvasRenderingContext2D) => void} drawElement
     * @param {(type:string, mergedElements:string, finalElement:string)} stepMessage
     * @param {(children:ExpressionNode[], node:ExpressionNode)} serialStepEquation
     * @param {(children:ExpressionNode[], node:ExpressionNode)} parallelStepEquation  
     */
    constructor(circuitExpression, operatorManager, displayElementValues, drawElement, stepMessage, serialStepEquation, parallelStepEquation) {
        this.#displayElementValues = displayElementValues;
        this.#drawElement = drawElement;
        this.#stepMessage = stepMessage;
        this.#serialStepEquation = serialStepEquation;
        this.#parallelStepEquation = parallelStepEquation;
        this.expressionTree = new ExpressionTree(circuitExpression, operatorManager).getTree();
        this.expressionTree.substitute(this.#substituteValues);
        this.elementNames = this.expressionTree.variables;
        this.values = new Map();
        this.mainImage = this.#image;
        this.steps = [];  
    }
    //public getters
    /**
     * returns size of the circuit image
     */
    get size(){
        let size = this.#size(this.expressionTree);
        size.w += Circuit.#endOfLine * 2;
        return size;
    }
    /**
     * returns array of all variables in the circuit equation
     */
    get variables() {
        return new Array(...this.expressionTree.variables);
    }
    //private getters
    /**
     * Returns unique name which will be used for merged element
     */
    get #elementName() {
        let name = this.elementPefix + this.#elementIndex++;
        while(this.elementNames.has(name)) {
            name = this.elementPefix + this.#elementIndex++;
        }
        this.elementNames.add(name);
        return name;
    } 
    /**
     * Returns image of current circuit
     */
    get #image() {
        let canvas = document.createElement('canvas');
        canvas.addEventListener('mouseleave', () => {CircuitPopupWindow.hide();});
        let context = canvas.getContext('2d');
        let size = this.size;
        canvas.width = size.w + 5;
        canvas.height = size.h + 5;
        context.lineWidth = 2;
        context.textAlign = 'center';
        context.textBaseline = 'top';
        context.font = '20px Arial'
        context.translate(2.5, 0);
        this.#draw(this.expressionTree, {x: Circuit.#endOfLine, y: 0}, context);
        this.#drawCircle(Circuit.#endOfLine / 2, size.h / 2, Circuit.#endOfLine / 2, context);
        this.#drawCircle(size.w - Circuit.#endOfLine / 2, size.h / 2, Circuit.#endOfLine / 2, context);  
        return canvas;
    }
    /**
     * Substitutes a variable in the circuit equation for a complex number
     * @param {string} name
     * @param {ComplexNumber | number} value
     */
    substitute(name, value) {
        this.#substituteValues.set(name, value);
        return this;
    }
     /**
     * Recursive function that calculates values ​​in a circuit
     * @param {ComplexNumber | number} serialQuantity
     * @param {ComplexNumber | number} parallelQuantity
     * @param {ExpressionNode} node 
     * @param {ExpressionNode} parentNode 
     */
    calculate(serialQuantity, parallelQuantity, node, parentNode) {
        if (node.isOperator) {
            let priority = node.priority;
            if (priority === 1) {
                this.calculateSerial(serialQuantity, node.left, node);//method implemented in child class
                this.calculateSerial(serialQuantity, node.right, node);
            } else {
                this.calculateParallel(parallelQuantity, node.left, node);//method implemented in child class
                this.calculateParallel(parallelQuantity, node.right, node);
            }
            if (!this.#mergeable(parentNode)) {
                let children = node.children;
                node.value = this.#elementName;     
                this.steps.push(
                    {
                        image: this.#image,
                        div: this.#getStepDiv(priority, children, node)
                    }
                );
            }
        }
    }
    //private methods
    /**
     * Returns if given node can be merged at once or not
     * @param {ExpressionNode} node 
     */
    #mergeable(node) {
        if (node === null) return false;
        if (node.isLeaf) return true;
        if (node.priority === 1) {
            return node.left.priority != 2 && node.right.priority != 2 && this.#mergeable(node.left) && this.#mergeable(node.right);
        } else {
            return node.left.priority != 1 && node.right.priority != 1 && this.#mergeable(node.left) && this.#mergeable(node.right);
        }
    }
    /**
     * Returns size of node in canvas without connection lines
     * @param {ExpressionNode} node 
     */
    #size(node) {
        if (node.isLeaf) return Circuit.#imageSize.copy();
        let leftSize = this.#size(node.left);
        let rightSize = this.#size(node.right);
        if (node.priority === 1) return {w: leftSize.w + rightSize.w, h: Math.max(leftSize.h, rightSize.h)};
        return {w: Math.max(leftSize.w, rightSize.w) + Circuit.#endOfLine * 2, h: leftSize.h + rightSize.h};
    }
    /**
     * Creates and returns a div to display the calculation process
     * @param {Number} priority 
     * @param {ExpressionNode[]} children 
     * @param {ExpressionNode} node 
     */
    #getStepDiv(priority, children, node) {
        let div = document.createElement('div');
        if (priority === 1) {
            div.innerHTML = this.#getSerialStep(children, node);
        } else {
            div.innerHTML = this.#getParallelStep(children, node);
        } 
        return div;
    }
    /**
     * Returns a message decribing current calculation step
     * @param {ExpressionNode[]} children 
     * @param {ExpressionNode} node
     * @param {string} type
     */
    #getStepMessage(children, node, type) {
        return this.#stepMessage(type, Circuit.reduceNodes(children, (node) => node.stringValue, ', '), node.stringValue);
    }
    /**
     * Returns a message decribing serial calculation step
     * @param {ExpressionNode[]} children 
     * @param {ExpressionNode} node
     */
    #getSerialStep(children, node) {
        return this.#getStepMessage(children, node, "sériového") + this.#serialStepEquation(children, node);
    }
    /**
     * Returns a message decribing parallel calculation step
     * @param {ExpressionNode[]} children 
     * @param {ExpressionNode} node
     */
    #getParallelStep(children, node) {
        return this.#getStepMessage(children, node, "paralelního") + this.#parallelStepEquation(children, node);
    }
    /**
     * Draws line into the canvas from [sx; sy] to [ex, ey]  
     * @param {number} sx 
     * @param {number} sy
     * @param {number} ex
     * @param {number} ey
     * @param {CanvasRenderingContext2D} context 
     */
    #drawLine(sx, sy, ex, ey, context) {
        context.beginPath();
        context.moveTo(sx, sy);
        context.lineTo(ex, ey);
        context.stroke();
    }
    /**
     * Draws circle into the canvas with center in [x; y], radius r  
     * @param {number} x 
     * @param {number} y
     * @param {CanvasRenderingContext2D} context
     * @param {string} fillColor 
     */
    #drawCircle(x, y, r, context, fillColor) {
        context.beginPath();
        context.arc(x, y, r, 0, Math.PI * 2);
        context.stroke();
        if (fillColor) {
            context.fillStyle = fillColor;
            context.fill();
        }
    }
    /**
     * Recursively draws the circuit based on a representation in expression tree 
     * @param {ExpressionNode} node
     * @param {CanvasRenderingContext2D} context
     */
    #draw(node, position, context) {
        if (node.isLeaf) {
            let value = node.toString().toUpperCase();
            this.#drawElement(value, position, context);
            context.fillText(value, position.x + Circuit.#imageSize.w / 2, position.y + 1);
            context.canvas.addEventListener('mousemove', (event) => {
                let rect = event.target.getBoundingClientRect();
                let x = (event.clientX - rect.left) * (event.target.width / rect.width);
                let y = (event.clientY - rect.top) * (event.target.height / rect.height);
                if (x > position.x && x < position.x + Circuit.#imageSize.w && y > position.y && y < position.y + Circuit.#imageSize.h) {
                    let values = this.values.get(node);
                    if (!values) return;
                    //y = position.y * rect.height / event.target.height + rect.top;
                    this.#displayElementValues(values, {x: rect.x, y: rect.y + window.scrollY});
                }
            });
        } else {
            let leftSize = this.#size(node.left);
            let rightSize = this.#size(node.right);
            if (node.priority === 1) {
                let maxHeight = Math.max(leftSize.h, rightSize.h);
                var leftPosition = {
                    x: position.x,
                    y: position.y + (maxHeight - leftSize.h) / 2
                };
                var rightPosition = {
                    x: position.x + leftSize.w,
                    y: position.y + (maxHeight - rightSize.h) / 2
                }     
            } else {
                let maxWidth = Math.max(leftSize.w, rightSize.w);
                var leftPosition = {
                    x: position.x + Circuit.#endOfLine + (maxWidth - leftSize.w) / 2,
                    y: position.y
                };
                var rightPosition = {
                    x: position.x + Circuit.#endOfLine + (maxWidth - rightSize.w) / 2,
                    y: position.y + leftSize.h
                }
                if (leftSize.w < maxWidth) {
                    let x = leftPosition.x;
                    let width = (maxWidth - leftSize.w) / 2;
                    let y = leftPosition.y + leftSize.h / 2;
                    this.#drawLine(x, y, x - width, y, context);
                    x += leftSize.w;
                    this.#drawLine(x, y, x + width, y, context);
                }
                if (rightSize.w < maxWidth) {
                    let x = rightPosition.x;
                    let width = (maxWidth - rightSize.w) / 2;
                    let y = rightPosition.y + rightSize.h / 2;
                    this.#drawLine(x, y, x - width, y, context);
                    x += rightSize.w;
                    this.#drawLine(x, y, x + width, y, context);
                }
                let x = position.x + Circuit.#endOfLine;
                let y = position.y + leftSize.h / 2;
                let height = (leftSize.h + rightSize.h) / 2;
                this.#drawLine(x, y, x, y + height, context);
                this.#drawLine(x + maxWidth, y, x + maxWidth, y + height, context);
                this.#drawLine(position.x, position.y + height, x, position.y + height, context);
                this.#drawLine(x + maxWidth, position.y + height, x + maxWidth + Circuit.#endOfLine, position.y + height, context);
                this.#drawCircle(x, position.y + height, Circuit.#endOfLine / 4, context, 'black');
                this.#drawCircle(x + maxWidth, position.y + height, Circuit.#endOfLine / 4, context, 'black');
            }
            this.#draw(node.left, leftPosition, context);
            this.#draw(node.right, rightPosition, context);
        }
    }
}