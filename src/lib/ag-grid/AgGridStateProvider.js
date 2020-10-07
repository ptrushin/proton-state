export default class AgGridStateProvider {
    constructor(props) {
        this.props = props;
        const { agGridApi, prefix } = props;
        this.protonStateApi = null;
        this.agGridApi = agGridApi;
        this.agGridApi.addEventListener('filterChanged', this.onFilterChanged);
        this.agGridApi.addEventListener('cellClicked', this.onCellClicked)
    }
    getFilterDefs = () => {
        return this.agGridApi.columnController.gridColumns.map(column => {
            return {
                provider: this,
                name: column.colId,
                ...this.props.columnDefs[column.colId]
            }
        });
    }
    onFilterChanged = (event) => {
        const filterModel = event.api.getFilterModel();
        this.protonStateApi.changeState({
            filters: filterModel
        });
    }
    onCellClicked = (event) => {
        console.log('onCellClicked', event);
        if (!event.event.altKey) return;
        let value = event.value;
        console.log('onCellClicked2', event);
        let colId = event.column.colId;
        let filterInstance = this.agGridApi.getFilterInstance(colId);
        filterInstance.setModel({
            filterType: 'text',
            type: 'equals',
            filter: value
        });
        filterInstance.onFilterChanged();
    }
    changeState = (props) => {
        let { filters } = props;
        for (let name in filters) {
            let value = filters[name];
            let filterInstance = this.agGridApi.getFilterInstance(name);
            if (!filterInstance) continue;
            filterInstance.setModel(value);
            filterInstance.onFilterChanged();
        }
    }
    serialize = (value) => {
        return !value
            ? null
            : value.type === 'contains' || value.type === 'equals'
                ? value.filter
                : JSON.stringify(value);
    }
    deserialize = (value) => {
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