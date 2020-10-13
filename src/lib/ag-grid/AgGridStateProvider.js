export default class AgGridStateProvider {
    constructor(props) {
        this.props = props;
        const { api } = props;
        this.protonStateApi = null;
        this.api = api;
        this.api.addEventListener('filterChanged', this.onFilterChanged);
        this.api.addEventListener('cellClicked', this.onCellClicked);
        this.api.addEventListener('sortChanged', this.onSortChanged);
    }
    getFilterDefs = () => {
        return this.api.columnController.gridColumns.map(column => {
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
            sort: this.api.getSortModel()
        };
    }
    onFilterChanged = (event) => {
        this.protonStateApi.changeState({
            stateProvider: this,
            filters: event.api.getFilterModel(),
            sort: this.api.getSortModel()
        });
    }
    onSortChanged = (event) => {
        this.protonStateApi.changeState({
            stateProvider: this,
            filters: event.api.getFilterModel(),
            sort: this.api.getSortModel()
        });
    }
    onCellClicked = (event) => {
        if (!event.event.altKey) return;
        let value = event.value;
        let colId = event.column.colId;
        let filterInstance = this.api.getFilterInstance(colId);
        filterInstance.setModel({
            filterType: 'text',
            type: 'equals',
            filter: value
        });
        filterInstance.onFilterChanged();
    }
    changeState = (props) => {
        let { filters, sort } = props;
        for (let name in filters) {
            let value = filters[name];
            let filterInstance = this.api.getFilterInstance(name);
            if (!filterInstance) continue;
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
}