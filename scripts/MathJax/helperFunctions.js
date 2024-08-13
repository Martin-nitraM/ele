class MathJaxHelperFunctions{
    /**
     * Creates new line with MathJax equation
     * @param {string} content 
     * @returns {string}
     */
    static newLine(content) {
        return `<br> $$${content}$$`;
    }
    /**
     * Replaces javascript exponential notation with LaTex
     * @param {string} equation 
     * @returns {string}
     */
    static replaceExponents(equation) {
        let match = equation.match(/e-\d+/);
        if(match) {
            let number = match[0].match(/\d+/);
            return MathJaxHelperFunctions.replaceExponents(equation.replace(match[0],"\\cdot 10^{-"+ number +"}"))
        } else return equation;
    }
    /**
     * Creates LaTex fraction
     * @param {string} numerator 
     * @param {string} denominator 
     * @returns {string}
     */
    static getFrac(numerator, denominator) {
        return "\\frac{" + numerator + "}{" + denominator + "}";
    }
    /**
     * Reduce all numbers in string to given decimal places
     * @param {number} value 
     * @param {number} places 
     * @returns {string}
     */
    static roundedString(value, places = 7) {
        let string = typeof value === 'string' ? value : value.toString();
        let indexes = MathJaxHelperFunctions.#indexesOfDot(string);
        for (let i = 0; i < indexes.length; i++) {
            let digits = MathJaxHelperFunctions.#digitsAfter(string, indexes[i]);
            if (digits > places) {
                let tmp = string;
                string = string.substring(0, indexes[i] + places + 1) + tmp.substring(indexes[i] + digits + 1);
                for (let j = i + 1; j < indexes.length; j++) {
                    indexes[j] -= digits - places;            
                }
            }
        }
        return string;
    }
    /**
     * Returns array with all indexes of dots in input string
     * @param {string} string
     * @returns {number[]}
     */
    static #indexesOfDot(string) {
        let indexes = [];
        for (let i = 0; i < string.length; i++) {
            if (string[i] === '.') indexes.push(i);
        }
        return indexes;
    }
    /**
     * Returns the number of digits after the specified place in string
     * @param {string} string 
     * @param {number} place 
     * @returns {number}
     */
    static #digitsAfter(string, place) {
        for (let i = place + 1; i < string.length; i++) {
            if (isNaN(string[i]) || string[i] === ' ') {
                return i - 1 - place;
            }
        }
        return string.length - 1 - place;
    }
}