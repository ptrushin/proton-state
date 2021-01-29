import { defaultFilterTypes } from './Filters/defaultFilterTypes'

export default class AntTagFilterPanelStateProvider {
    constructor(props) {
        this.props = props;
        const { api } = props;
        this.protonStateApi = null;
        this.api = api;
        let currentOnChange = this.api.onChangeEvent;
        this.api.onChangeEvent = (props) => {
            this.onFilterChanged(props);
            if (currentOnChange) currentOnChange(props);
        }
    }
    getFilterDefs = () => {
        return this.api.props.filterDefs.map(filterDef => {
            return {
                provider: this,
                ...filterDef,
                ...(this.props.filterDefs || {})[filterDef.name]
            }
        });
    }
    onFilterChanged = (props) => {
        let {filters} = props;
        this.protonStateApi.changeState({
            stateProvider: this,
            filters: filters
        });
    }
    getState = () => {
        return {
            filters: this.api.state.filterValues
        };
    }
    changeState = (props) => {
        let { filters } = props;
        let providerFilters = {};
        for (let name in filters) {
            let value = filters[name];
            let filterDef = this.api.getFullFilterDefByName(name);
            if (!filterDef) continue;
            providerFilters[name] = value;
        }
        this.api.setFilters({filters: providerFilters})
    }
    serialize = (props) => {
        let {value, filterDef} = props;
        const serializeFunc = filterDef.type ? (defaultFilterTypes[filterDef.type] || {}).serialize : null;
        return !value
            ? null
            : serializeFunc ? serializeFunc({filterDef, value}) : JSON.stringify(value);
    }
    deserialize = (props) => {
        let {value, filterDef} = props;
        const deserializeFunc = filterDef.type ? (defaultFilterTypes[filterDef.type] || {}).deserialize : null;
        console.log('---', value, defaultFilterTypes[filterDef.type], deserializeFunc)
        return deserializeFunc
            ? deserializeFunc({filterDef, value}) 
            : JSON.parse(value);
    }
}