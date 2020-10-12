import BrowserUrlStoreProvider from '../storeproviders/BrowserUrlStoreProvider';
import ReactRouterStoreProvider from '../storeproviders/ReactRouterStoreProvider';
import ExternalStateProvider from './ExternalStateProvider';

export default class ProtonState {
    constructor(props) {
        this.props = props;
        this.storeProvider = props.history ? new ReactRouterStoreProvider(props) : new BrowserUrlStoreProvider(props);
        this.stateProviders = [];
        this.filterDefs = [];
    }

    state = {
        filters: []
    }

    addStateProvider = (stateProvider) => {
        this.stateProviders.push(stateProvider);
        stateProvider.protonStateApi = this;
        this.filterDefs = [...this.filterDefs, ...stateProvider.getFilterDefs()]
        this.updateState({initStateProvider: stateProvider});
    }

    changeState = (props) => {
        let {stateProvider} = props;
        let filters = {}
        for (let stateProvider of this.stateProviders) {
            let state = stateProvider.getState();
            filters = {...filters, ...state.filters}
        }
        if (this.props.onChange) this.props.onChange({
            stateProvider: stateProvider,
            filterChange: true,
            filters: filters
        });
        this.storeProvider.save({ filters: filters, filterDefs: this.filterDefs })
    }

    updateState = (props) => {
        let {initStateProvider} = props || {};
        if (this.props.externalFilterDefs && !this.externalStateProvider) {
            this.externalStateProvider = new ExternalStateProvider(this.props);
            this.addStateProvider(this.externalStateProvider)
        }
        if (this.externalStateProvider) {
            if (this.externalStateProvider.checkChanged()) return;
        }
        let {filters, isUpdated} = this.storeProvider.load({ filterDefs: this.filterDefs });
        if (!initStateProvider && !isUpdated) return;
        for (let stateProvider of this.stateProviders) {
            if (initStateProvider && initStateProvider !== stateProvider) continue;
            stateProvider.changeState({filters: filters, stateProvider: initStateProvider})
        }
        
    }
}