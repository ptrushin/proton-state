export default class ExternalStateProvider {
    constructor(props) {
        this.props = props;
        this.protonStateApi = null;
        this.externalFilterValues = {}
    }
    getFilterDefs = () => {
        return this.props.externalFilters.map(f => {
            return {
                provider: this,
                name: f.name
            }
        });
    }
    checkChanged = (props) => {
        let isUpdated = false;
        for (let externalFilter of this.props.externalFilters) {
            let currentValue = this.externalFilterValues[externalFilter.name];
            let newValue = (externalFilter.stateHolder || this.props.rootComponent).state[externalFilter.name];
            if (currentValue !== newValue) {
                this.externalFilterValues[externalFilter.name] = newValue;
                isUpdated = true;
            }
        }

        if (isUpdated) this.protonStateApi.changeState({
            stateProvider: this,
            filters: this.externalFilterValues
        });
    }
    getState = () => {
        return {
            filters: this.externalFilterValues
        };
    }
    changeState = (props) => {
        let { filters } = props;
        let providerFilters = {};
        for (let name in filters) {
            let value = filters[name];
            let filterDef = this.props.externalFilters.filter(f => f.name === name)[0];
            if (!filterDef) continue;
            providerFilters[name] = value;
        }
        this.props.rootComponent.setState(providerFilters)
    }
    serialize = (value) => {
        return !value
            ? null
            : JSON.stringify(value);
    }
    deserialize = (value) => {
        return JSON.parse(value);
    }
}