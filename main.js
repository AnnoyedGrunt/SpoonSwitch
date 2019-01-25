import Measure from "./measure.js"

var measurementRegex = /(\d.+)(?:((?:cup)|(?:ounce)|(?:teaspoon|tsp)|(?:tablespoon|tbsp|tablespoonful)|(?:inch)|(?:pound))(?:s|es)?)/gi
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
            var convertedValue = (new Measure(parsedValue)).from(sourceUnit).to(targetUnit).convert().value
            return formatValue(convertedValue)
        }
        
        function processUnit(unit) {
            return addHighlight(`${unit}`)
        }
        
        function convertUnit(unit) {
            var unitData = Measure.getUnit(unit)
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
            var formattedValue = (value == Math.round(value))? value : value.toFixed(Converter.precision)
            formattedValue = addHighlight(formattedValue)
            return formattedValue
        }
        
        function addHighlight(string) {
            return `<span class='highlight'>${string}</span>`
        }
        
        return recipeString.replace(measurementRegex, processMeasurement)
    }
}


const conversionTable = {
    volume: "milliliter",
    length: "centimeter",
    weight: "gram"
}

Converter.conversionTable = conversionTable
Converter.precision = 2

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
    for (let line of lines) {
        let element = document.createElement("LI")
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