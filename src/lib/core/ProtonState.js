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

    getSortParName = () => 'sort';

    changeState = (props) => {
        let {stateProvider} = props;
        let filters = {}
        let sort = {}
        for (let stateProvider of this.stateProviders) {
            let state = stateProvider.getState();
            filters = {...filters, ...state.filters}
            sort = {...sort, ...state.sort}
        }
        if (this.props.onChange) this.props.onChange({
            stateProvider: stateProvider,
            filters: filters,
            sort: sort
        });
        this.storeProvider.save({ filters: filters, filterDefs: this.filterDefs, sort: sort, sortParName: this.getSortParName() })
    }

    updateState = (props) => {
        console.log('changeState0')
        let {initStateProvider} = props || {};
        if (this.props.externalFilterDefs && !this.externalStateProvider) {
            this.externalStateProvider = new ExternalStateProvider(this.props);
            this.addStateProvider(this.externalStateProvider)
        }
        console.log('changeState1')
        if (this.externalStateProvider) {
            console.log('changeState2')
            if (this.externalStateProvider.checkChanged()) return;
        }
        console.log('changeState3')
        let {filters, sort, isUpdated} = this.storeProvider.load({ filterDefs: this.filterDefs, sortParName: this.getSortParName() });
        console.log('changeState4', initStateProvider, filters, sort, isUpdated)
        if (!initStateProvider && !isUpdated) return;
        console.log('changeState5', isUpdated)
        for (let stateProvider of this.stateProviders) {
            if (initStateProvider && initStateProvider !== stateProvider) continue;
            stateProvider.changeState({filters: filters, sort: sort, stateProvider: initStateProvider})
        }
        if (!initStateProvider && isUpdated && this.props.onChange) this.props.onChange({
            filters: filters,
            sort: sort
        });
        
    }
}