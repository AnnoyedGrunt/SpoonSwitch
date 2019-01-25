export default class Measure {
    constructor(value) {
        this.unit = null
        this.value = value
        this._targetUnit = null
    }
    
    from(unitName) {
        var unit = Measure.allUnits[unitName]
        if (!unit) {throw `Source unit of name '${unitName} does not exist'`}
        this.unit = unit
        return this
    }
    
    to(unitName) {
        var unit = Measure.allUnits[unitName]
        if (!unit) {throw `Target unit of name '${unitName} does not exist`}
        this._targetUnit = unit
        return this
    }
    
    convert() {
        if (!this.unit) {throw `Missing a source unit, use from(unitName) to set one.`}
        if (!this._targetUnit) {throw `Missing a target unit, use to(unitName) to set one`}
        if (!this.value) {throw `Missing a value to convert, use value(value) to set one`}
        if (this.unit.type != this._targetUnit.type) {throw `Mismatching types: source unit '${this.unit.name}' is of type ${this.unit.type}, while target unit ${this._targetUnit.name}' is of type ${this._targetUnit.type}`}
        
        var convertedValue = (this.value * this.unit.value) / this._targetUnit.value
        this.value = convertedValue
        this.sourceUnit = this._targetUnit
        this._targetUnit = null
        return this
    }
}

Measure.createUnit = function(name, plural, type, value, aliases) {
    var unit = {}
    unit.name = name
    unit.plural = plural
    unit.type = type
    unit.value = value
    Measure.allUnits[name] = unit
    
    if (alias) {
        for (var alias of aliases) {
            Measure.allUnits[alias] = unit
        }
    }
    
    return unit
}

Measure.getUnit = function(name) {
    var unit = Measure.allUnits[name]
    if (unit) {
        return unit
    } else {
        throw `There exists no unit of name ${name}`
    }
}

Measure.allUnits = {}

Measure.createUnit("cup", "cups", "volume", 0.236)
Measure.createUnit("teaspoon", "teaspoons", "volume", 0.005, ["tsp"])
Measure.createUnit("tablespoon", "tablespoons", "volume", 0.025, ["tbsp", "tablespoonful"])
Measure.createUnit("inch", "inches", "length", 0.254)
Measure.createUnit("ounce", "ounces", "weight", 0.028)
Measure.createUnit("pound", "pounds", "weight", 0.453, ["lbs"])
Measure.createUnit("milliliter", "milliliters", "volume", 0.001, ["ml"])
Measure.createUnit("liter", "liters", "volume", 1, ["l"])
Measure.createUnit("centimeter", "centimeters", "length", 0.01, ["cm"])
Measure.createUnit("gram", "grams", "weight", 0.001, ["g"])