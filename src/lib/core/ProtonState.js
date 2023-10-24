import BrowserUrlStoreProvider from '../storeproviders/BrowserUrlStoreProvider';
import LocalStorageStoreProvider from '../storeproviders/LocalStorageStoreProvider';
import ReactRouterStoreProvider from '../storeproviders/ReactRouterStoreProvider';
import ExternalStateProvider from './ExternalStateProvider';
const merge = require('deepmerge')

export default class ProtonState {
    constructor(props) {
        this.props = props;

        this.storeProviders = [];
        this.localStorageStoreProvider = new LocalStorageStoreProvider({storageKey: this.getLocalStorageKey()});
        this.storeProviders.push(this.localStorageStoreProvider);
        this.storeProviders.push(props.history ? new ReactRouterStoreProvider(props) : new BrowserUrlStoreProvider(props));

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
        this.updateInternal({initStateProvider: stateProvider});
    }

    getSortParName = () => 'sort';

    getLocalStorageKey = () => `_ps_${window.location.pathname}`;

    changeState = (props) => {
        let {stateProvider} = props;
        const state = merge.all(this.stateProviders.map(sp => sp.getState() || {}));
        const filters = state.filters;
        const sort = state.sort;
        if (this.props.onChange) this.props.onChange({
            stateProvider: stateProvider,
            filters: filters,
            sort: sort
        });
        for (const storeProvider of this.storeProviders) {
            storeProvider.save({ state: state, filters: filters, filterDefs: this.filterDefs, sort: sort, sortParName: this.getSortParName() })
        }
    }

    updateState = (props) => {
        // add externalStateProvider and exit if not exists
        if (this.props.externalFilterDefs && !this.externalStateProvider) {
            this.externalStateProvider = new ExternalStateProvider(this.props);
            this.addStateProvider(this.externalStateProvider)
        } 
        else {
            this.updateInternal(props);
        }
    }

    mergeState = (states) => {
        var state = {};
        for (let s of states) {
            state = {...state, ...s};
        }
        return state;
    }

    updateInternal = (props) => {
        let {initStateProvider} = props || {};

        let state = this.mergeState(
            this.storeProviders.map(storeProvider => storeProvider.load({ filterDefs: this.filterDefs, sortParName: this.getSortParName() }) || {})
        );
        let filters = state.filters;
        let sort = state.sort;
        let isUpdatedFromStore = state.isUpdated;

        // check externalStateProvider changes
        if (!isUpdatedFromStore && this.externalStateProvider) {
            if (this.externalStateProvider.checkChanged()) return;
        }
        if (!initStateProvider && !isUpdatedFromStore) return;
        for (let stateProvider of this.stateProviders) {
            if (initStateProvider && initStateProvider !== stateProvider) continue;
            stateProvider.changeState({filters: filters, sort: sort, stateProvider: initStateProvider, state: state})
        }
        if (!initStateProvider && isUpdatedFromStore && this.props.onChange) this.props.onChange({
            filters: filters,
            sort: sort
        });
    }

    clear = (storeProvider) => {
        if (storeProvider === 'LocalStorage') {
            this.localStorageStoreProvider.clear();
        } else {
            for (const storeProvider of this.storeProviders) {
                storeProvider.save({ state: {}, filters: {}, filterDefs: this.filterDefs, sort: [], sortParName: this.getSortParName() })
            }
        }
    }

    copyToClipboard = () => {
        this.localStorageStoreProvider.copyToClipboard();
    }

    setFromString = (str) => {
        this.localStorageStoreProvider.setFromString(str);
    }
}