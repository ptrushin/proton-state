import React, { PureComponent } from "react";
import { Menu, Button, Space, Tag, Dropdown, Popover } from 'antd';
import SingleFilterPanel from './SingleFilterPanel'
import ODataDataSource from "../datasources/ODataDataSource";
import { localeText } from './locale/en';
import { defaultFilterTypes } from './Filters/defaultFilterTypes'
const queryString = require('query-string');
const merge = require('deepmerge')

//const { Header, Content, Sider } = Layout;

export default class FilterPanel extends PureComponent {
    constructor(props) {
        super(props);
        this.dataSourceTypes = {
            odata: {
                instance: new ODataDataSource()
            }
        }
        this.state = {
            addedFilterDef: null,
            filterValues: [],
            filterEntities: []
        }
        this.localeText = props.localeText || localeText;

        this.onChangeEvent = this.props.onChange;
    }

    componentDidMount() {
        if (this.props.onReady) this.props.onReady({ api: this });
    }

    componentDidUpdate() {
    }

    getFilterDef = (name) => {
        return this.props.filterDefs.filter(fd => fd.name === name)[0];
    }

    getFullFilterDefByDef = (filterDef) => {
        if (!filterDef) return undefined;
        console.log('getFullFilterDefByDef', defaultFilterTypes[filterDef.type], this.props.filterTypes[filterDef.type], filterDef);
        return merge.all([defaultFilterTypes[filterDef.type] || {}, this.props.filterTypes[filterDef.type] || {}, filterDef || {}]);
    }

    getFullFilterDefByName = (name) => {
        return this.getFullFilterDefByDef(this.getFilterDef(name));
    }

    getFullFilterDefs = () => {
        return this.props.filterDefs.map(filterDef => this.getFullFilterDefByDef(filterDef));
    }

    getFilters = () => {
        return this.state.filterValues;
    }

    /*updateFilterValuesByLocationSearch = () => {
        let {history, defaultFilterDefs, dataSource, onChange, urlPrefix} = this.props;
        let quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;
        if (this.locationSearch !== history.location.search) {
            this.locationSearch = history.location.search;
            let pars = queryString.parse(this.locationSearch);
            let filterValues = {};
            for (let nameWithPrefix in pars) {
                let name = urlPrefix ? nameWithPrefix.replace(urlPrefix, '') : nameWithPrefix;
                let value = pars[nameWithPrefix];
                let filterDef = this.getFilterDef(name)
                if (!filterDef) continue;
                filterValues[name] = defaultFilterDefs[filterDef.type].deserialize({ filterDef, value: value });
                if (filterDef.type === 'select') {
                    const entityName = filterDef.odata.entity.name;
                    get({
                        url: `${dataSource.path}/${entityName}?$filter=${filterValues[name].map(v => `${filterDef.odata.entity.key} eq ${quoted(v, filterDef.odata.keyType)}`).join(' or ')
                            }`,
                        callback: (json) => { this.setState({ filterEntities: { ...this.state.filterEntities, [name]: json.value } }) }
                    })
                }
            }
            this.setState({ filterValues: filterValues }, () => { if (onChange) onChange({ api: this }) })
        }
    }*/

    getODataFilters = () => {
        return null;
        if (!this.state.filterValues) return null;
        let filter = [];
        for (let name in this.state.filterValues) {
            let value = this.state.filterValues[name];
            let filterDef = this.getFilterDef(name);
            if (!filterDef) continue;
            let odata = this.props.defaultFilterDefs[filterDef.type].odata;
            filter.push(odata.filter({ filterDef, value }));
        }
        return filter;
    }

    getDataSource = (filterDef) => {
        console.log('getDataSource', filterDef, this.props.dataSources)
        if (!filterDef || !filterDef.dataSource || !this.props.dataSources) return undefined;
        let dataSource = filterDef.dataSource.name
            ? this.props.dataSources[filterDef.dataSource.name]
            : this.props.dataSources[Object.keys(this.props.dataSources)[0]];
        return {
            ...filterDef.dataSource,
            ...dataSource,
            ...this.dataSourceTypes[dataSource.type]
        }
    }

    renderFilters = () => {
        if (!this.state.filterValues) return null;
        return Object.keys(this.state.filterValues).map((name) => {
            let value = this.state.filterValues[name];
            let filterDef = this.getFullFilterDefByName(name);
            console.log('renderFilters', filterDef);
            if (!filterDef || !this.state.filterValues[name]) return null;
            let templateFunc = filterDef.template;
            let template = templateFunc({ filterDef, value, entity: this.state.filterEntities[name], localeText: this.localeText });
            return <Popover key={name} trigger="click" overlayStyle={{ width: '298px' }} title={filterDef.title} placement="bottomLeft" content={<SingleFilterPanel {...filterDef} value={value} dataSource={this.getDataSource(filterDef)} localeText={this.localeText} onOk={this.singleFilterPanelOnOk} onCancel={this.singleFilterPanelOnCancel} />}>
                <Tag key={name} closable onClose={() => this.updateFilter({ filterDef: filterDef, value: null })}>
                    {template}
                </Tag>
            </Popover>
        })
    }

    renderFilterList = () => {
        return Object.keys(this.props.filterDefs).map((name) => {
            const filterDef = this.props.filterDefs[name];
            return <Menu.Item key={name} onClick={() => this.renderSingleFilterPanel({ filterDef: filterDef })}>
                {filterDef.title}
            </Menu.Item>
        })
    }

    renderSingleFilterPanel = (props) => {
        let { filterDef } = props;
        if (!filterDef) return null;
        this.setState({ filterAddPanelVisible: true, addedFilterDef: filterDef, filterAddPanelTitle: filterDef.title });
    }

    singleFilterPanelOnCancel = () => {
        this.setState({ filterAddPanelVisible: false })
    }

    singleFilterPanelOnOk = (props) => {
        let { filterDef, value } = props;
        this.setState({ filterAddPanelVisible: false });
        this.updateFilter({ filterDef: filterDef, value: value });
    }

    updateFilter = (props) => {
        let { filterDef, value } = props;
        this.setState({
            filterValues: { ...this.state.filterValues, [filterDef.name]: value },
            filterEntities: { ...this.state.filterEntities, [filterDef.name]: filterDef.type === 'select' && value ? value.map(v => {return {ProductName: v}}) : undefined },
        }, () => {
            if (this.onChangeEvent) {
                this.onChangeEvent({
                    api: this,
                    filterDef: filterDef,
                    value: value,
                    filters: this.state.filterValues
                });
            }
        })

        /*let { urlPrefix, defaultFilterDefs, history } = this.props;
        let filters = { ...this.state.filterValues, [filterDef.name]: value };
        let pars = queryString.parse(this.locationSearch);

        for (let name in filters) {
            let nameWithPrefix = urlPrefix ? `${urlPrefix}${name}` : name;
            let value = filters[name];
            let filterDef = this.getFilterDef(name);
            if (!filterDef) continue;
            if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                delete pars[nameWithPrefix];
            } else {
                pars[nameWithPrefix] = defaultFilterDefs[filterDef.type].serialize({ filterDef, value: value });
            }
        }

        let locationSearch = queryString.stringify(pars);
        locationSearch = locationSearch ? '?' + locationSearch : locationSearch;
        history.push(history.location.pathname + locationSearch);
        */
    }

    render() {
        return <Space size="small">
            {this.renderFilters()}
            <Dropdown placement="bottomRight" overlay={
                <Menu>
                    {this.renderFilterList()}
                </Menu>
            }>
                <Popover overlayStyle={{ width: '398px' }} title={this.state.filterAddPanelTitle} placement="bottomLeft" content={<SingleFilterPanel {...this.state.addedFilterDef} dataSource={this.getDataSource(this.state.addedFilterDef)} localeText={this.localeText} onOk={this.singleFilterPanelOnOk} onCancel={this.singleFilterPanelOnCancel} visible={this.state.filterAddPanelVisible} />} visible={this.state.filterAddPanelVisible}>
                    <Button type="link">{this.localeText.AddFilterButton}</Button>
                </Popover>
            </Dropdown>
        </Space>;
    }
}