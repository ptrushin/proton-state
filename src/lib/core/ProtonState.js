import BrowserUrlStoreProvider from '../storeproviders/BrowserUrlStoreProvider';
import LocalStorageStoreProvider from '../storeproviders/LocalStorageStoreProvider';
import ReactRouterStoreProvider from '../storeproviders/ReactRouterStoreProvider';
import ExternalStateProvider from './ExternalStateProvider';
const merge = require('deepmerge')

export default class ProtonState {
    constructor(props) {
        this.props = props;

        this.storeProviders = [];
        this.storeProviders.push(new LocalStorageStoreProvider({storageKey: this.getLocalStorageKey()}));
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

    getLocalStorageKey = () => '_protonstate';

    changeState = (props) => {
        let {stateProvider} = props;
        const state = merge.all(this.stateProviders.map(sp => sp.getState() || {}));
        const filters = state.filters;
        const sort = state.sort;
        console.log(state);
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

    updateInternal = (props) => {
        let {initStateProvider} = props || {};

        for (let sp of this.storeProviders) {
            console.log('updateInternal', sp.load({ filterDefs: this.filterDefs, sortParName: this.getSortParName() }))
        }

        const overwriteMerge = (destinationArray, sourceArray, options) => Array.from(new Set([...destinationArray, ...sourceArray]));
        let state = merge.all(
            this.storeProviders.map(storeProvider => storeProvider.load({ filterDefs: this.filterDefs, sortParName: this.getSortParName() }) || {}),
            { arrayMerge: overwriteMerge }
        );
        let filters = state.filters;
        let sort = state.sort;
        console.log('sort', sort)
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
}