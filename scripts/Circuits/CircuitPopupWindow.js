class CircuitPopupWindow {

    static #window;
    static #nameLabel;
    static #powerLabel;
    static #valueLabel;
    static #parallelLabel;
    static #serialLabel;

    static {
        this.#window = document.createElement('div');
        this.#window.className = 'circuit_popup';
        this.#window.style = 'position: absolute; display: none; ';
        this.#nameLabel = document.createElement('div');
        this.#powerLabel = document.createElement('div');
        this.#valueLabel = document.createElement('div');
        this.#parallelLabel = document.createElement('div');
        this.#serialLabel = document.createElement('div');
        this.#window.appendChild(this.#nameLabel);
        this.#window.appendChild(this.#valueLabel);
        this.#window.appendChild(this.#serialLabel);
        this.#window.appendChild(this.#parallelLabel);
        this.#window.appendChild(this.#powerLabel);
        this.#nameLabel.style.fontWeight = 'bold';
        document.getElementById("page_content").appendChild(this.#window);
    }

    static showImpedance(values, position) {
        CircuitPopupWindow.hide();
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#nameLabel, values.name);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#valueLabel, `${CircuitPopupWindow.#getOverlineSpan('Z')}[Ω] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.impedance))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#parallelLabel, `${CircuitPopupWindow.#getOverlineSpan('U')}[V] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.voltage))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#serialLabel, `${CircuitPopupWindow.#getOverlineSpan('I')}[A] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.current))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#powerLabel, `${CircuitPopupWindow.#getOverlineSpan('S')}[VA] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.power))}`);
        CircuitPopupWindow.#show(position);        
    }

    static showResistance(values, position) {
        CircuitPopupWindow.hide();
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#nameLabel, values.name);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#valueLabel, `R[Ω] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.resistance))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#parallelLabel, `U[V] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.voltage))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#serialLabel, `I[A] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.current))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#powerLabel, `P[W] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.power))}`);
        CircuitPopupWindow.#show(position);        
    }

    static showCapacity(values, position) {
        CircuitPopupWindow.hide();
        CircuitPopupWindow.#powerLabel.style.display = 'none';
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#nameLabel, values.name);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#valueLabel, `C[μF] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.capacity))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#parallelLabel, `U[V] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.voltage))}`);
        CircuitPopupWindow.#setContent(CircuitPopupWindow.#serialLabel, `Q[μC] = ${MathJaxHelperFunctions.replaceExponents(MathJaxHelperFunctions.roundedString(values.charge))}`);
        CircuitPopupWindow.#show(position);
    }

    static #show(position) {
        MathJax.typeset([CircuitPopupWindow.#window]);
        CircuitPopupWindow.#window.style.display = 'block';
        CircuitPopupWindow.#window.style.top = `${position.y}px`; 
    }

    static hide() {
        CircuitPopupWindow.#window.style.display = 'none';
    }

    static #setContent(label, content) {
        label.innerHTML = `$$${content}$$`;
    }

    static #getOverlineSpan(content) {
        return `\\overline{${content}}`;
    }
}