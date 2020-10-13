const queryString = require('query-string');

export default class ReactRouterStoreProvider {
    constructor(props) {
        this.props = props;
        this.locationSearch = null;
    }

    save = (props) => {
        const { filters, filterDefs, sort, sortParName } = props;
        const { history } = this.props;
        let pars = queryString.parse(history.location.search);
        for (let filterDef of filterDefs) {
            let stateName = filterDef.stateName || filterDef.name;
            let name = filterDef.name;
            let value = filters[name];
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                delete pars[stateName];
            } else {
                pars[stateName] = filterDef.provider ? filterDef.provider.serialize({filterDef, value}) : JSON.stringify(value);
            }
        }
        let sortArray = [];
        console.log(sort)
        if (sort) {
            for (let si in sort) {
                let s = sort[si];
                sortArray.push(`${s.colId} ${s.sort}`)
            }
        }
        if (sortArray.length > 0) pars[sortParName] = sortArray.join(",");
        let locationSearch = "?" + queryString.stringify(pars);
        if (history.location.search !== locationSearch)
        {
            this.locationSearch = locationSearch;
            history.push(`${history.location.pathname}${locationSearch}`);
        }
    }

    load = (props) => {
        
        const { filterDefs, sortParName } = props;
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
                filters[name] = filterDef.provider ? filterDef.provider.deserialize({filterDef, value}) : JSON.parse(value);
            }
        }
        let sort = [];
        if (pars[sortParName])
        {
            let sortArray = pars[sortParName].split(",")
            for (let i in sortArray) {
                let parts = sortArray[i].split(' ');
                sort[i] = {
                    colId: parts[0],
                    sort: parts[1]
                }
            }
        }
        return {filters, sort, isUpdated}
    }
}