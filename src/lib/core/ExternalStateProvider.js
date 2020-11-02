export default class ExternalStateProvider {
    constructor(props) {
        this.props = props;
        this.protonStateApi = null;
        this.filterValues = {}
        this.filterDefs = props.externalFilterDefs;
        for (let filterDef of this.filterDefs) {
            this.filterValues[filterDef.name] = (filterDef.stateHolder || this.props.rootComponent).state[filterDef.name];
        }
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
            if (currentValue !== newValue) {
                this.filterValues[filterDef.name] = newValue;
                isUpdated = true;
            }
        }

        if (isUpdated) this.protonStateApi.changeState({
            stateProvider: this,
            filters: this.filterValues
        });

        return isUpdated;
    }
    getState = () => {
        return {
            filters: this.filterValues
        };
    }
    changeState = (props) => {
        let { filters } = props;
        let providerFilters = {};
        let isUpdated = false;
        for (let name in filters) {
            let value = filters[name];
            let filterDef = this.filterDefs.filter(f => f.name === name)[0];
            if (!filterDef || this.filterValues[name] === value) continue;
            isUpdated = true;
            providerFilters[name] = value;
            this.filterValues[name] = value;
        }
        if (isUpdated) this.props.rootComponent.setState(providerFilters)
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