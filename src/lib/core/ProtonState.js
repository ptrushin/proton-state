import BrowserUrlStoreProvider from '../storeproviders/BrowserUrlStoreProvider';
import ReactRouterStoreProvider from '../storeproviders/ReactRouterStoreProvider';

export default class ProtonState {
    constructor(props) {
        this.props = props;
        this.storeProvider = props.history ? new ReactRouterStoreProvider(props) : new BrowserUrlStoreProvider(props);
        this.stateProviders = [];
        this.filterDefs = props.filterDefs || [];
    }

    state = {
        filters: []
    }

    addStateProvider = (stateProvider) => {
        this.stateProviders.push(stateProvider);
        stateProvider.protonStateApi = this;
        this.filterDefs = [...this.filterDefs, ...stateProvider.getFilterDefs()]
        this.updateStateFromUrl(true);
    }

    changeState = (state) => {
        let filters = {}
        for (let stateProvider of this.stateProviders) {
            let state = stateProvider.getState();
            filters = {...filters, ...state.filters}
        }
        console.log('changeState', state);
        this.storeProvider.save({ filters: filters, filterDefs: this.filterDefs })
    }

    updateStateFromUrl = (always) => {
        let {filters, isUpdated} = this.storeProvider.load({ filterDefs: this.filterDefs });
        if (!always && !isUpdated) return;
        for (let stateProvider of this.stateProviders) {
            stateProvider.changeState({filters: filters})
        }
        console.log('updateStateFromUrl', filters);
    }

    componentDidMount() {
        if (this.props.onReady) this.props.onReady({ api: this });
        //this.updateFilterValuesByLocationSearch();
    }

    componentDidUpdate() {
        this.updateFilterValuesByLocationSearch();
    }

    getFilterDef = (name) => {
        return this.props.filterDefs.filter(fd => fd.name === name)[0];
    }

    updateFilterValuesByLocationSearch = () => {
        let { history, defaultFilterDefs, dataSource, onChange, urlPrefix } = this.props;
        let quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;
        /*if (this.locationSearch !== history.location.search) {
            this.locationSearch = history.location.search;
            let pars = queryString.parse(this.locationSearch);
            let filterValues = {};
            for (let nameWithPrefix in pars) {
                let name = urlPrefix ? nameWithPrefix.replace(urlPrefix, '') : nameWithPrefix;
                let value = pars[nameWithPrefix];
                let filterDef = this.getFilterDef(name)
                if (!filterDef) continue;
                filterValues[name] = defaultFilterDefs[filterDef.type].deserialize({ filterDef, value: value });
                if (filterDef.type === 'select') {
                    const entityName = filterDef.odata.entity.name;
                    get({
                        url: `${dataSource.path}/${entityName}?$filter=${filterValues[name].map(v => `${filterDef.odata.entity.key} eq ${quoted(v, filterDef.odata.keyType)}`).join(' or ')
                            }`,
                        callback: (json) => { this.setState({ filterEntities: { ...this.state.filterEntities, [name]: json.value } }) }
                    })
                }
            }
            this.setState({ filterValues: filterValues }, () => { if (onChange) onChange({ api: this }) })
        }*/
    }

    /*getODataFilters = () => {
        if (!this.state.filterValues) return null;
        let filter = [];
        for (let name in this.state.filterValues) {
            let value = this.state.filterValues[name];
            let filterDef = this.getFilterDef(name);
            if (!filterDef) continue;
            let odata = this.props.defaultFilterDefs[filterDef.type].odata;
            filter.push(odata.filter({ filterDef, value }));
        }
        return filter;
    }*/

    /*renderFilters = () => {
        if (!this.state.filterValues) return null;
        return Object.keys(this.state.filterValues).map((name) => {
            let value = this.state.filterValues[name];
            let filterDef = this.getFilterDef(name);
            if (!filterDef || !this.state.filterValues[name]) return null;
            let templateFunc = filterDef.template || this.props.defaultFilterDefs[filterDef.type].template;
            let template = templateFunc({ filterDef, value, entity: this.state.filterEntities[name] });
            return <Popover key={name} trigger="click" overlayStyle={{ width: '298px' }} title={filterDef.title} placement="bottomLeft" content={<SingleFilterPanel {...filterDef} value={value} dataSource={this.props.dataSource} onOk={this.singleFilterPanelOnOk} onCancel={this.singleFilterPanelOnCancel} />}>
                <Tag key={name} closable onClose={() => this.updateFilter({ filterDef: filterDef, value: null })}>
                    {template}
                </Tag>
            </Popover>
        })
    }

    renderFilterList = () => {
        return Object.keys(this.props.filterDefs).map((name) => {
            const filterDef = this.props.filterDefs[name];
            return <Menu.Item key={name} onClick={() => this.renderSingleFilterPanel({ filterDef: filterDef })}>
                {filterDef.title}
            </Menu.Item>
        })
    }

    renderSingleFilterPanel = (props) => {
        let { filterDef } = props;
        if (!filterDef) return null;
        this.setState({ filterAddPanelVisible: true, addedFilterDef: filterDef, filterAddPanelTitle: filterDef.title });
    }

    singleFilterPanelOnCancel = () => {
        this.setState({ filterAddPanelVisible: false })
    }

    singleFilterPanelOnOk = (props) => {
        let { filterDef, value } = props;
        this.setState({ filterAddPanelVisible: false });
        this.updateFilter({ filterDef: filterDef, value: value });
    }

    updateFilter = (props) => {
        let { filterDef, value } = props;
        let { urlPrefix, defaultFilterDefs, history } = this.props;
        let filters = { ...this.state.filterValues, [filterDef.name]: value };
        let pars = queryString.parse(this.locationSearch);

        for (let name in filters) {
            let nameWithPrefix = urlPrefix ? `${urlPrefix}${name}` : name;
            let value = filters[name];
            let filterDef = this.getFilterDef(name);
            if (!filterDef) continue;
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                delete pars[nameWithPrefix];
            } else {
                pars[nameWithPrefix] = defaultFilterDefs[filterDef.type].serialize({ filterDef, value: value });
            }
        }

        let locationSearch = queryString.stringify(pars);
        locationSearch = locationSearch ? '?' + locationSearch : locationSearch;
        history.push(history.location.pathname + locationSearch);
    }*/

    render() {
        return null;
    }
}