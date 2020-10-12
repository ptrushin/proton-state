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
        for (let name in filters) {
            let value = filters[name];
            let filterDef = this.filterDefs.filter(f => f.name === name)[0];
            if (!filterDef) continue;
            providerFilters[name] = value;
        }
        this.props.rootComponent.setState(providerFilters)
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