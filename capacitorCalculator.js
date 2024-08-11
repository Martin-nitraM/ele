//((C1_L1)|(R1_C2))|((R2)|(L2)_(R3)|(C3)) - test circuit
let circuit;
let elementInputValues = [];

const pageContent = document.getElementById("page_content");
const inputs = document.getElementById("inputs");
const elementInputs = document.getElementById("element_inputs");
const voltageChargeSelect = document.getElementById("voltage_charge_select");
const voltageChargeInput = document.getElementById("voltage_charge_input");
const calculationSteps = document.getElementById("calculation_steps");

function setEquation(equation) {
    if (validate(equation)) {
        circuit = new CapacitorCircuit(equation);
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
    return createDiv(elementName, 'μF');
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
    for(let elementValue of elementInputValues) {
        circuit.substitute(elementValue.name, getCapacity(elementValue.value));
    }
    if (isChargeSelected()) {
        circuit.calculateFromCharge(getVoltageChargeValue());
    } else {
        circuit.calculateFromVoltage(getVoltageChargeValue());
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

function isChargeSelected() {
    return voltageChargeSelect.value === 'Q';
}

function getVoltageChargeValue() {
    return parseFloat(voltageChargeInput.value);
}

function getCapacity(value) {
    return parseFloat(value);
}