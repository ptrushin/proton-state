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
        if (this.props.onChange) this.props.onChange({
            filterChange: true,
            filters: filters
        });
        this.storeProvider.save({ filters: filters, filterDefs: this.filterDefs })
    }

    updateStateFromUrl = (always) => {
        let {filters, isUpdated} = this.storeProvider.load({ filterDefs: this.filterDefs });
        if (!always && !isUpdated) return;
        for (let stateProvider of this.stateProviders) {
            stateProvider.changeState({filters: filters})
        }
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
}