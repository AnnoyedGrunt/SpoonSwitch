var measurementRegex = /(\d.+)(?:((?:cup)|(?:ounce)|(?:teaspoon|tsp)|(?:tablespoon|tblsp)|(?:inch)|(?:pound))(?:s|es)?)/gi
/*
The above expression matches a measurement, defined as: a number + (other stuff)? + a unit of measurement
It has two capture groups: the measurement and the unit (it ignores plurals)
*/ 
var valueRegex = /(?:(\d+)(?:\s*(?:(?:\.)|(\/))\s*(\d+))?)/gi
/*
The above expression matches all numbers within a string, with three capture groups:
1) The digits to the left of the period or slash
2) The slash, if it is present (otherwise undefined)
3) The digits to the right of the period or slash
*/

var replacementString = `<span style="background-color: #FFFF00">$&</span>`

class Converter {
    constructor(addHighlight = true) {
        this.addHighlight = addHighlight
    }
    
    convertRecipe(recipeString) {
        var sourceUnit = ""
        var targetUnit = ""
        
        function processMeasurement(match, values, unit, offset, string) {
            sourceUnit = unit.toLowerCase()
            targetUnit = convertUnit(sourceUnit)
            var processedValues = values.replace(valueRegex, processValue)
            return `${processedValues}${processUnit(targetUnit)}`
        }
        
        function processValue(match, left, operator, right, offset, string) {
            var parsedValue = parseValue(match, left, operator, right)
            var convertedValue = convertValue(parsedValue, sourceUnit, targetUnit)
            return formatValue(convertedValue)
        }
        
        function processUnit(unit) {
            return addHighlight(`${unit}`)
        }
        
        function convertUnit(unit) {
            var unitData = Converter.unitsTable[unit]
            return Converter.conversionTable[unitData.type]
        }
        
        function parseValue(match, left, operator, right) {
            const isFraction = (operator != null)
            return isFraction ? (Number(left) / Number(right)) : Number(match)
        }
        
        function convertValue(amount, fromUnit, toUnit) {
            var fromUnitData = Converter.unitsTable[fromUnit]
            var toUnitData = Converter.unitsTable[toUnit]
            var convertedValue = (amount * fromUnitData.measure) / toUnitData.measure
            return convertedValue
        }
        
        function formatValue(value) {
            var formattedValue = value.toFixed(targetUnit.precision)
            formattedValue = addHighlight(formattedValue)
            return formattedValue
        }
        
        function addHighlight(string) {
            return `<span class='highlight'>${string}</span>`
        }
        
        return recipeString.replace(measurementRegex, processMeasurement)
    }
}

const unitsTable = {
    cup: {type: "volume", measure: 0.236, plural: "s", precision: 1},
    teaspoon: {type: "volume", measure: 0.005, plural: "s", precision: 1},
    tablespoon: {type: "volume", measure: 0.015, plural: "s", precision: 1},
    milliliter: {type: "volume", measure: 0.001, plural: "s", precision: 0},
    inch: {type: "length", measure: 0.254, plural: "es", precision: 2},
    centimeter: {type: "length", measure: 0.01, plural: "s", precision: 1},
    ounce: {type: "weight", measure: 0.028, plural: "s", precision: 2},
    pound: {type: "weight", measure: 0.453, plural: "s", precision: 2},
    gram: {type: "weight", measure: 0.001, plural: "s", precision: 0},
    liter: {type: "volume", measure: 1, plural: "s", precision: 2}
}
unitsTable.tsp = unitsTable.teaspoon
unitsTable.tblsp = unitsTable.tablespoon
unitsTable.ml = unitsTable.milliliter
unitsTable.lb = unitsTable.pound
unitsTable.oz = unitsTable.ounce
unitsTable.g = unitsTable.gram
unitsTable.cm = unitsTable.centimeter

const conversionTable = {
    volume: "milliliter",
    length: "centimeter",
    weight: "gram"
}

Converter.unitsTable = unitsTable
Converter.conversionTable = conversionTable

//---------------

function getInputText() {
    var inputField = document.querySelector("#inputArea")
    return inputField.value;
}

function setOutputText(output) {
    var outputField = document.querySelector("#resultList")
    while (outputField.firstChild) {
        outputField.removeChild(outputField.firstChild)
    }
    var lines = output.split("\n")
    for (var line of lines) {
        element = document.createElement("LI")
        element.innerHTML = line
        outputField.appendChild(element)
    }
}

function getOutputText() {
    var outputField = document.querySelector("#resultList")
    var output = ""
    for (var li of outputField.element) {
        output += li.value + "\n"
    }
    
}

function showPopup(show) {
    var popup = document.querySelector("#resultPopup")
    show ? popup.classList.add('showResult') : popup.classList.remove('showResult');
}

function convertButtonPressed(e) {
    var converter = new Converter("","",true)
    var inputText = getInputText()
    var outputText = converter.convertRecipe(inputText)
    setOutputText(outputText)
    showPopup(true)
}

function closeButtonPressed(e) {
    showPopup(false)
}

function copyButtonPressed(e) {
    var range = document.createRange();
    var list = document.querySelector("#resultList")
    var selection = window.getSelection()
    range.selectNodeContents(list)
    selection.removeAllRanges()
    selection.addRange(range)
    document.execCommand('copy')
    selection.removeAllRanges()
}

document.querySelector("#convertButton").addEventListener("click", convertButtonPressed)
document.querySelector("#resultCloseButton").addEventListener("click", closeButtonPressed)
document.querySelector("#resultCopyButton").addEventListener("click", copyButtonPressed)