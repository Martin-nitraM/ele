let helps = document.getElementsByClassName('help');
let unClicked = false;
let lastClickedHelp;
document.addEventListener('mousedown', () => {
    if (!unClicked) unClick(lastClickedHelp);
    unClicked = false;
});
for (const help of helps) {
    help.addEventListener('mousedown', () => {
        unClick(lastClickedHelp);
        lastClickedHelp = help;
        help.setAttribute('clicked', 'true');
        unClicked = true;
    });
}
/**
 * @param {HTMLElement} help
 */
function unClick(help) {
    if (help) help.setAttribute('clicked', 'false');
}
/**
 * Checks if value of input is not lower than its minimum
 * @param {HTMLInputElement} input
 */
function checkValue(input) {
    if (parseFloat(input.value) < parseFloat(input.min)) {
        input.value = input.min;
    }
}
/**
 * Creates div containing element input and name
 * @param {string} name 
 * @param {string} units 
 * @returns {HTMLDivElement}
 */
function createDiv(name, units) {
    let div = document.createElement('div');
    let span = document.createElement('span');
    span.innerHTML = `${name}[${units}]`;
    let input = document.createElement('input');
    input.onchange = () => checkValue(input);
    input.type = 'number';
    input.value = '1';
    input.min = '0.001';
    input.name = name;
    elementInputValues.push(input);
    div.appendChild(span);
    div.appendChild(input);
    return div;
}