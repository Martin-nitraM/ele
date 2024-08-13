//((C1_L1)|(R1_C2))|((R2)|(L2)_(R3)|(C3)) - test circuit
let circuit;
let elementInputValues = [];

const pageContent = document.getElementById("page_content");
const inputs = document.getElementById("inputs");
const elementInputs = document.getElementById("element_inputs");
const voltageCurrentSelect = document.getElementById("voltage_current_select");
const voltageCurrentInput = document.getElementById("voltage_current_input");
const calculationSteps = document.getElementById("calculation_steps");
const equationInput = document.getElementById('circuit_equation');
const mainImageContainer = document.getElementById('main_image');

function setEquation() {
    let equation = equationInput.innerText;
    if (validate(equation)) {
        circuit = new ResistorCircuit(equation);
        let variables = circuit.variables;
        createElementInputs(variables);
    } else {
        alert("Neplatný zápis obvodu.")
    }
}

function createRandom() {
    equationInput.innerText = Circuit.randomEquation(['R']);
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
    mainImageContainer.innerHTML = '';
    mainImageContainer.appendChild(circuit.mainImage);
    elementInputValues = [];
    for (const elementName of elementNames) {
        elementInputs.appendChild(createElementInput(elementName));
    }
    inputs.style.display = 'flex';
}

function createElementInput(elementName) {
    return createDiv(elementName, 'Ω');
}

function calculate() {
    for(let elementValue of elementInputValues) {
        circuit.substitute(elementValue.name, getResistance(elementValue.value));
    }
    if (isCurrentSelected()) {
        circuit.calculateFromCurrent(getVoltageCurrentValue());
    } else {
        circuit.calculateFromVoltage(getVoltageCurrentValue());
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

function isCurrentSelected() {
    return voltageCurrentSelect.value === 'I';
}

function getVoltageCurrentValue() {
    return parseFloat(voltageCurrentInput.value);
}

function getResistance(value) {
    return parseFloat(value);
}