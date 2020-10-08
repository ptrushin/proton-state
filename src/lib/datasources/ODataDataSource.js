export default class ODataDataSource {
    getFilters = (props) => {
        let {filterDefs, filters} = props;
        let oDataFilters = [];
        for (let filterDef of filterDefs) {
            let value = filters[filterDef.name];
            let oDataFilterFunc = filterDef.dataSources.odata.filter;
            if (!oDataFilterFunc) continue;
            let oDataFilter = oDataFilterFunc({filterDef, value});
            if (oDataFilter === undefined) continue;
            oDataFilters.push(oDataFilter);
        }
        return oDataFilters;
    }

    searchByText = (props) => {
        const { value, callback, props: extProps } = props;
        let dataSource = extProps.dataSource;
        console.log('searchByText', props);
        const entityName = dataSource.entity.name;
        const searchFields = dataSource.entity.searchFields
            ? dataSource.entity.searchFields
            : extProps.option.label
                ? [extProps.option.label]
                : null;
        if (!searchFields) return;
        const count = dataSource.entity.count || 20;

        fetch(`${dataSource.root}/${entityName}?$filter=${searchFields.map(k => `contains(tolower(${k}),'${value.toLowerCase()}')`).join(' or ')}&$top=${count}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(data))
                }
            })
    }
}