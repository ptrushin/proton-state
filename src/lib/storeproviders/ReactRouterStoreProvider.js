const queryString = require('query-string');

export default class ReactRouterStoreProvider {
    constructor(props) {
        this.props = props;
        this.locationSearch = null;
    }

    save = (props) => {
        const { filters, filterDefs } = props;
        const { history } = this.props;
        let pars = queryString.parse(history.location.search);
        for (let filterDef of filterDefs) {
            let stateName = filterDef.stateName || filterDef.name;
            let name = filterDef.name;
            let value = filters[name];
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                delete pars[stateName];
            } else {
                pars[stateName] = filterDef.provider ? filterDef.provider.serialize(value) : JSON.stringify(value);
            }
        }
        let locationSearch = "?" + queryString.stringify(pars);
        if (history.location.search != locationSearch)
        {
            this.locationSearch = locationSearch;
            history.push(`${history.location.pathname}${locationSearch}`);
        }
    }

    load = (props) => {
        
        const { filterDefs } = props;
        const { history } = this.props;
        let isUpdated = this.locationSearch !== history.location.search;
        this.locationSearch = history.location.search;
        let pars = queryString.parse(history.location.search);
        let filters = {};
        for (let filterDef of filterDefs) {
            let stateName = filterDef.stateName || filterDef.name;
            let name = filterDef.name;
            let value = pars[stateName];
            if (value !== null && value !== undefined) {
                filters[name] = filterDef.provider ? filterDef.provider.deserialize(value) : JSON.parse(value);
            }
        }
        return {filters, isUpdated}
    }
}