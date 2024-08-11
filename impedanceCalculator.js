//((C1_L1)|(R1_C2))|((R2)|(L2)_(R3)|(C3)) - test circuit
let circuit;
let elementInputValues = [];

const pageContent = document.getElementById("page_content");
const inputs = document.getElementById("inputs");
const elementInputs = document.getElementById("element_inputs");
const voltageCurrentSelect = document.getElementById("voltage_current_select");
const voltageCurrentInput = document.getElementById("voltage_current_input");
const frequencyInput = document.getElementById("frequency_input");
const calculationSteps = document.getElementById("calculation_steps");

function setEquation(equation) {
    if (validate(equation)) {
        circuit = new ImpedanceCircuit(equation);
        let variables = circuit.variables;
        createElementInputs(variables);
    } else {
        alert("Neplatný zápis obvodu.")
    }
}

function validate(text) {
    text = text.replaceAll(" ", "");
    if (text === "") return false;
    let res = text.match(/(?!((\()|(\))|(\|)|(\_)|([A-Z])|([a-z])|([0-9])))./);
    if (res != null) return false;
    res = text.match(/((\(\))|(\_\))|(\|\))|(\_\_)|(\|\|)|(\_\|)|(\|\_)|(\_$)|(\|$))/);
    if (res != null) return false;
    let c = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] == "(") c++;
        if (text[i] == ")") {
            c--;
            if (c < 0) return false;
        }
    }
    if (c != 0) return false;
    return true;
}

function createElementInputs(elementNames) {
    calculationSteps.innerHTML = '';
    elementInputs.innerHTML = '';
    elementInputValues = [];
    for (const elementName of elementNames) {
        elementInputs.appendChild(createElementInput(elementName));
    }
    inputs.style.display = 'flex';
}

function createElementInput(elementName) {
    switch(elementName[0].toLowerCase()) {
        case 'c': {
            return createDiv(elementName, 'μF');
        }
        case 'l': {
            return createDiv(elementName, 'mH');
        }
        default: {
            return createDiv(elementName, 'Ω');
        }
    }
}

function createDiv(name, units) {
    let div = document.createElement('div');
    let span = document.createElement('span');
    span.innerHTML = `${name}[${units}]`;
    let input = document.createElement('input');
    input.type = 'number';
    input.value = '1';
    input.min = '0.001';
    input.name = name;
    elementInputValues.push(input);
    div.appendChild(span);
    div.appendChild(input);
    return div;
}

function calculate() {
    let frequency = getFrequency();
    for(let elementValue of elementInputValues) {
        circuit.substitute(elementValue.name, getImpedance(elementValue.name, elementValue.value, frequency));
    }
    if (isCurrentSelected()) {
        circuit.calculateFromCurrent(new ComplexNumber(getVoltageCurrentValue(), 0));
    } else {
        circuit.calculateFromVoltage(new ComplexNumber(getVoltageCurrentValue(), 0));
    }
    calculationSteps.innerHTML = '';
    calculationSteps.appendChild(circuit.mainImage);

    for (const step of circuit.steps) {
        calculationSteps.appendChild(step.div);
        calculationSteps.appendChild(step.image);
    }

    calculationSteps.appendChild(circuit.finalResults);

    MathJax.typeset();
}

function getFrequency() {
    return parseFloat(frequencyInput.value);
}

function isCurrentSelected() {
    return voltageCurrentSelect.value === 'I';
}

function getVoltageCurrentValue() {
    return parseFloat(voltageCurrentInput.value);
}

function getImpedance(elementName, value, frequency) {
    value = parseFloat(value);
    switch(elementName[0].toLowerCase()) {
        case 'c': {
            return new ComplexNumber(0, -1000000 / (frequency * 2 * Math.PI * value));
        }
        case 'l': {
            return new ComplexNumber(0, frequency * 2 * Math.PI * value / 1000);
        }
        default: {
            return new ComplexNumber(value, 0);
        }
    }
}