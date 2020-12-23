export default class AgGridStateProvider {
    constructor(props) {
        this.props = props;
        const { api } = props;
        this.protonStateApi = null;
        this.api = api;
        this.columnApi = api.columnController.columnApi;
        this.api.addEventListener('cellClicked', this.onCellClicked);
        this.api.addEventListener('sortChanged', this.onStateChanged);
        this.api.addEventListener('columnVisible', this.onStateChanged);
        this.api.addEventListener('columnPinned', this.onStateChanged);
        this.api.addEventListener('columnResized', this.onStateChanged);
        this.api.addEventListener('columnMoved', this.onStateChanged);
        this.api.addEventListener('columnRowGroupChanged', this.onStateChanged);
        this.api.addEventListener('columnValueChanged', this.onStateChanged);
        this.api.addEventListener('columnGroupOpened', this.onStateChanged);
        this.api.addEventListener('filterChanged', this.onStateChanged);
        this.api.addEventListener('toolPanelVisibleChanged', this.onStateChanged);
    }
    getFilterDefs = () => {
        return this.api.columnController.gridColumns
            .filter(column => column.colDef.filter)
            .map(column => {
                return {
                    provider: this,
                    name: column.colId,
                    ...(this.props.columnDefs || {})[column.colId]
                }
            });
    }
    getState = () => {
        return {
            filters: this.api.getFilterModel(),
            sort: this.api.getSortModel(),
            columnState: this.columnApi.getColumnState(),
            columnGroupState: this.columnApi.getColumnGroupState(),
            openedToolPanel: this.api.getOpenedToolPanel()
        };
    }
    onStateChanged = (event) => {
        const state = this.getState();
        this.protonStateApi.changeState({
            stateProvider: this,
            ...state
        });
    }
    onCellClicked = (event) => {
        if (!event.event.altKey) return;
        let value = event.value;
        let colId = event.column.colId;
        let filterInstance = this.getFilterInstance(colId);
        if (!filterInstance) return;
        filterInstance.setModel({
            filterType: 'text',
            type: 'equals',
            filter: value
        });
        filterInstance.onFilterChanged();
    }
    getFilterInstance = (colId) => {
        const column = this.api.columnController.gridColumns.filter(c => c.colId === colId)[0];
        if (!column || !column.colDef || !column.colDef.filter) return null;
        let filterInstance = this.api.getFilterInstance(colId);
        if (!filterInstance || !filterInstance.providedFilterParams.colDef.filter) return null;
        return filterInstance;
    }
    changeState = (props) => {
        let { filters, sort, state } = props;
        //if (filters) this.api.setFilterModel(filters);
        for (let name in filters) {
            
            let value = filters[name];
            let filterInstance = this.getFilterInstance(name);
            // eslint-disable-next-line
            if (!filterInstance || filterInstance.filter == value) continue;
            filterInstance.setModel(value);
            filterInstance.onFilterChanged();
        }
        if (sort) {
            this.api.setSortModel(
                sort.map((s, i) => {
                    return {
                        colId: s.colId,
                        sort: s.sort,
                        sortIndex: i
                    }
                })
            )
        };
        if (state) {
            this.setState({state: state});
        }
    }

    serialize = (props) => {
        let { value } = props;
        return !value
            ? null
            : value.type === 'contains' || value.type === 'equals'
                ? value.filter
                : JSON.stringify(value);
    }
    deserialize = (props) => {
        let { value } = props;
        if (value.startsWith('{')) {
            return JSON.parse(value);
        } else {
            return {
                filterType: 'text',
                type: 'contains',
                filter: value
            }
        }
    }

    setState = (props) => {
        const { state } = props;
        if (state.columnState) {
            this.columnApi.setColumnState(state.columnState);
        }
        if (state.columnGroupState) {
            this.columnApi.setColumnGroupState(state.columnGroupState);
        }
        if (state.filterModel) {
            this.api.setFilterModel(state.filterModel);
        }
        if (state.openedToolPanel) {
            this.api.openToolPanel(state.openedToolPanel);
        } else {
            this.api.closeToolPanel();
        }

        //var filtersToolPanel = this.api.getToolPanelInstance('filters');
        //filtersToolPanel.expandFilters();
    }
}