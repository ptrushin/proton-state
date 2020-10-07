const queryString = require('query-string');

export default class BrowserUrlStoreProvider {
    constructor(props) {
        this.props = props;
        this.locationSearch = null;
    }

    save = (props) => {
        const { filters, filterDefs } = props;
        let pars = queryString.parse(window.location.search);
        for (let filterDef of filterDefs) {
            let name = filterDef.name;
            let value = filters[name];
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                delete pars[name];
            } else {
                pars[name] = filterDef.provider ? filterDef.provider.serialize(value) : JSON.stringify(value);
            }
        }
        let locationSearch = "?" + queryString.stringify(pars);
        console.log('BrowserUrlStoreProvider.save', filters, filterDefs, pars, locationSearch);
        if (window.location.search != locationSearch)
        {
            this.locationSearch = locationSearch;
            window.location = `${window.location.pathname}${locationSearch}`;
        }
    }

    load = (props) => {
        const { filterDefs } = props;
        let isUpdated = this.locationSearch !== window.location.search;
        this.locationSearch = window.location.search;
        let pars = queryString.parse(window.location.search);
        console.log('load', filterDefs, pars)
        let filters = {};
        for (let filterDef of filterDefs) {
            let name = filterDef.name;
            let value = pars[name];
            if (value !== null && value !== undefined) {
                filters[name] = filterDef.provider ? filterDef.provider.deserialize(value) : JSON.parse(value);
            }
        }
        return {filters, isUpdated}
    }
}