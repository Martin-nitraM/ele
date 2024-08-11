class OperatorManager {
    constructor() {
        this.operators = new Map();
    }
    add(operator, priority, operatorFunction) {
        this.operators.set(operator, {priority, operatorFunction});
        return this;
    }
    has(operator) {
        return this.operators.has(operator);
    }
    getPriority(operator) {
        return this.operators.get(operator).priority;
    }
    getValue(operator, left, right) {
        return this.operators.get(operator).operatorFunction(left, right);
    }
}

class ExpressionNode {
    #value;
    #actualValue;
    substituteValues;
    constructor(value, operatorManager) {
        this.#actualValue = null;
        this.#value = value;
        this.operatorManager = operatorManager;
        this.left = null;
        this.right = null;
    }
    get stringValue() {
        return this.#value;
    }
    get priority() {
        if (this.isOperator) {
            return this.operatorManager.getPriority(this.#value);
        } return Infinity;
    }
    get value() {
        if (this.#actualValue != null) return this.#actualValue;
        if (this.isOperator) {
            this.#actualValue = this.operatorManager.getValue(this.#value, this.left.value, this.right.value);
        }
        else if (this.substituteValues && this.substituteValues.has(this.#value)) this.#actualValue = this.substituteValues.get(this.#value);
        else this.#actualValue = parseFloat(this.#value);
        return this.#actualValue;
    }
    get isOperator() {
        return this.operatorManager.has(this.#value)
    }
    get isLeaf() {
        return !this.isOperator;
    }
    get variables() {
        let set = new Set();
        this.#getVariables(set);
        return set;
    }
    set value(value) {
        this.#value = value;
    }
    get children() {
        let acc = [];
        this.#getChildren(acc);
        return acc;
    }
    #getChildren(acc) {
        if (this.isOperator) {
            this.left.#getChildren(acc);
            this.right.#getChildren(acc);
        } else {
            acc.push(this);
        }
    }
    #getVariables(set) {
        if (this.isOperator) {
            this.left.#getVariables(set);
            this.right.#getVariables(set);
        } else if (isNaN(this.#value)){
            set.add(this.#value);
        }
    }
    substitute(values) {
        if (this.isOperator) {
            this.left.substitute(values);
            this.right.substitute(values);
        } else this.substituteValues = values;
    }
    toString() {
        let string = '';
        let o = this.isOperator;
        if (o)
            if (this.left.priority < this.priority) {
                string += `(${this.left.toString()})`;
            } else {
                string += this.left.toString();
            }
        string += this.#value;
        if (o)
            if (this.right.priority < this.priority) {
                string += `(${this.right.toString()})`;
            } else {
                string += this.right.toString();
            }
        return string;
    }
}

class ExpressionTree {
    constructor(expression, operatorManager) {
        this.expression = expression.replaceAll(' ', '');
        this.operatorManager = operatorManager;
    }
    getTree() {
        let nodeValue = '';
        let node = null;
        let nodes = [];
        for (let i = 0; i < this.expression.length; i++) {
            let currentCharacter = this.expression[i];
            if (this.operatorManager.has(currentCharacter)) {
                if (nodeValue != '') node = new ExpressionNode(nodeValue, this.operatorManager);
                if (node) nodes.push(node);
                else {
                    nodeValue += currentCharacter;
                    continue;
                }
                nodes.push(new ExpressionNode(currentCharacter, this.operatorManager));
                nodeValue = '';
                node = null;
            } else if (currentCharacter === '(') {
                let bracketsCount = 1;
                let j = i + 1;
                while(bracketsCount > 0) {
                    i++;
                    if (this.expression[i] === ')') bracketsCount--;
                    else if (this.expression[i] === '(') bracketsCount++;
                }
                node = new ExpressionTree(this.expression.substring(j, i), this.operatorManager).getTree();
            } else nodeValue += currentCharacter;
        }
        if (nodeValue != '') node = new ExpressionNode(nodeValue, this.operatorManager);
        if (node) nodes.push(node);
        while(nodes.length > 1) this.mergeNodes(nodes);
        return nodes[0];
    }
    mergeNodes(nodes) {
        if (nodes.length < 3) return;
        let maxPriorityIndex = -1;
        for (let i = 1; i < nodes.length; i+=2) {//first operator node is always the second node in the array nodes and aperator is every second node, which mean that if two leaf nodes are merged in operator and removed from array nodes, the merged operator node will by its position in array became leaf node (is surounded by another operator nodes)
            if (maxPriorityIndex === -1 || nodes[maxPriorityIndex].priority < nodes[i].priority) {
                maxPriorityIndex = i;
            }
        }
        let node = nodes[maxPriorityIndex];
        node.left = nodes[maxPriorityIndex - 1];
        nodes.splice(maxPriorityIndex - 1, 1);
        node.right = nodes[maxPriorityIndex];
        nodes.splice(maxPriorityIndex, 1);
    }
}