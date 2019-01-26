import Measure from "./measure.js"

var measurementRegex = /(\d.+)(?:((?:cup)|(?:ounce)|(?:teaspoon|tsp)|(?:tablespoon|tbsp|tablespoonful)|(?:inch)|(?:pound|lb))(?:s|es)?)/gi
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
        function processMeasurement(match, values, unit, offset, string) {
            var sourceUnitName = unit.toLowerCase()
            var targetUnitName = convertUnit(sourceUnitName)
            var targetUnit = null
            var isPlural = false
            
            var convertedValues = values.replace(valueRegex, function(match, left, operator, right) {
                var value = new Measure(parseValue(match, left, operator, right))
                var convertedValue = value.from(sourceUnitName).to(targetUnitName).convert().value
                
                console.log(convertedValue)
                if (convertedValue >= 1000) {
                    if (value.unit.name = "gram") {convertedValue = value.to("kilogram").convert().value}
                    else if (value.unit = "milliliter") {convertedValue = value.to("liter").convert().value}
                }
                
                isPlural = isPlural || (convertedValue != 1)
                targetUnit = value.unit
                return formatValue(convertedValue)
            })
            
            var convertedUnitName = formatUnit(isPlural? targetUnit.plural : targetUnit.name)
            return `${convertedValues}${convertedUnitName}`
        }
        
        function formatUnit(unit) {
            return addHighlight(`${unit}`)
        }
        
        function convertUnit(unit) {
            var unitData = Measure.getUnit(unit)
            return Converter.conversionTable[unitData.type]
        }
        
        function formatValue(value) {
            var formattedValue = (value == Math.round(value))? value : value.toFixed(Converter.precision)
            formattedValue = addHighlight(formattedValue)
            return formattedValue
        }
        
        function addHighlight(string) {
            return `<span class='highlight'>${string}</span>`
        }
        
        function parseValue(whole, left, operator, right) {
            const isFraction = (operator != null)
            return isFraction ? (Number(left) / Number(right)) : Number(whole)
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