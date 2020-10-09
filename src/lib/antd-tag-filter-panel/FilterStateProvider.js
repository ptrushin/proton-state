export default class FilterStateProvider {
    constructor(props) {
        this.props = props;
        const { filterPanel, prefix } = props;
        this.protonStateApi = null;
        this.filterPanel = filterPanel;
        let currentFilterPanleOnChange = this.filterPanel.OnChange;
        this.filterPanel.OnChange = (props) => {
            if (currentFilterPanleOnChange) currentFilterPanleOnChange(props);
            this.onFilterChanged(props)
        }
    }
    getFilterDefs = () => {
        return this.filterPanel.getFilterDefs.map(filterDef => {
            return {
                provider: this,
                ...filterDef
            }
        });
    }
    onFilterChanged = (props) => {
        /*const filterModel = event.api.getFilterModel();
        this.protonStateApi.changeState({
            filters: filterModel
        });*/
    }
    onCellClicked = (event) => {
        if (!event.event.altKey) return;
        let value = event.value;
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