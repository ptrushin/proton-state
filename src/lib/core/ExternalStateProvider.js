export default class ExternalStateProvider {
    constructor(props) {
        this.props = props;
        this.protonStateApi = null;
        this.filterDefs = props.externalFilterDefs;
        this.filterValues = {}
    }
    getFilterDefs = () => {
        return this.filterDefs.map(filterDef => {
            return {
                provider: this,
                ...filterDef
            }
        });
    }
    checkChanged = (props) => {
        let isUpdated = false;
        for (let filterDef of this.filterDefs) {
            let currentValue = this.filterValues[filterDef.name];
            let newValue = (filterDef.stateHolder || this.props.rootComponent).state[filterDef.name];
            console.log('chechChanges', this.filterValues, filterDef, currentValue, newValue)
            if (currentValue !== newValue) {
                this.filterValues[filterDef.name] = newValue;
                isUpdated = true;
            }
        }

        console.log('chechChanges', isUpdated, this.filterValues)
        if (isUpdated) this.protonStateApi.changeState({
            stateProvider: this,
            filters: this.filterValues
        });
    }
    getState = () => {
        return {
            filters: this.filterValues
        };
    }
    changeState = (props) => {
        console.log('changeState', props)
        let { filters } = props;
        let providerFilters = {};
        for (let name in filters) {
            let value = filters[name];
            let filterDef = this.filterDefs.filter(f => f.name === name)[0];
            console.log('changeState', name, value, filterDef)
            if (!filterDef) continue;
            providerFilters[name] = value;
        }
        console.log(providerFilters)
        //this.props.rootComponent.setState(providerFilters)
        this.props.rootComponent.setState({unitPriceGt20: true})
    }
    serialize = (props) => {
        let { filterDef, value } = props;
        return filterDef.serialize
            ? filterDef.serialize(props)
            : !value
                ? undefined
                : JSON.stringify(value);
    }
    deserialize = (props) => {
        let { filterDef, value } = props;
        return filterDef.deserialize
            ? filterDef.deserialize(props)
            : JSON.parse(value);
    }
}