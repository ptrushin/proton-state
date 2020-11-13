export default class ODataDataSource {
    getUniqueItems = (items, keyName) => {
        let resultItems = [];
        let keys = [];
        for (let i of items) {
            let key = i[keyName];
            if (!keys.includes(key)) {
                keys.push(key);
                resultItems.push(i);
            }
        }
        return resultItems;
    }

    getUniqueItemsWrapped = (json, keyName) => {
        const items = this.getUniqueItems(json.value, keyName);

        return {
            '@odata.count': items.length,
            value: items
        }
    }

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
        const { value, callback, filter, dataSource, option, onlyUnique, separators } = props;
        const entityName = dataSource.entityName;
        const searchFields = dataSource.searchFields
            ? dataSource.searchFields
            : option.label
                ? [option.label]
                : null;
        if (!searchFields) return;
        const count = option.count || 20 * (onlyUnique ? 10 : 1);

        let valueArr = [value.toLowerCase()];
        if (separators) {
            for (let separator of separators) {
                valueArr = valueArr.map(v => v.split(separator)).flat();
            }
        }
        let filters = [searchFields.map(k => valueArr.map(v => `contains(tolower(${k}),'${v.trim().replaceAll('\'','\'\'')}')`)).flat().join(' or ')]
        if (filter) filters.push(filter)

        let expand = dataSource.expand ? `&$expand=${dataSource.expand.join(',')}` : '';
        let orderby = dataSource.orderby ? `&$orderby=${dataSource.orderby.join(',')}` : '';

        fetch(`${dataSource.root}/${entityName}?$filter=${filters.join(' and ')}${expand}${orderby}&$top=${count}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(onlyUnique ? this.getUniqueItemsWrapped(data, option.key) : data))
                }
            })
    }

    getAll = (props) => {
        const { callback, filter, dataSource, option, onlyUnique } = props;
        const entityName = dataSource.entityName;
        const count = option.count || 0;

        let filters = []
        if (filter) filters.push(filter)

        let expand = dataSource.expand ? `&$expand=${dataSource.expand.join(',')}` : '';
        let orderby = dataSource.orderby ? `&$orderby=${dataSource.orderby.join(',')}` : '';

        fetch(`${dataSource.root}/${entityName}?${filters.length > 0 ? `$filter=${filters.join(' and ')}` : ''}${count > 0 ? `&$top=${count}` : ''}${expand}${orderby}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(onlyUnique ? this.getUniqueItemsWrapped(data, option.key) : data))
                }
            })
    }

    quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;

    searchByKeys = (props) => {
        const { value, callback, dataSource, option, keyType, onlyUnique } = props;
        const entityName = dataSource.entityName;
        const keyName = option.key;
        const valueArr = Array.isArray(value) ? value : [value];

        let expand = dataSource.expand ? `&$expand=${dataSource.expand.join(',')}` : '';
        let orderby = dataSource.orderby ? `&$orderby=${dataSource.orderby.join(',')}` : '';
        
        fetch(`${dataSource.root}/${entityName}?$filter=${valueArr.map(k => `${keyName} eq ${this.quoted(k, keyType)}`).join(' or ')}${expand}${orderby}`)
            .then(response => {
                if (!response.ok) {
                    callback({
                        '@odata.count': 0,
                        value: []
                    });
                } else {
                    response.json().then(data => callback(onlyUnique ? this.getUniqueItemsWrapped(data, keyName) : data))
                }
            })
    }
}

export let oDataDataSource = new ODataDataSource();