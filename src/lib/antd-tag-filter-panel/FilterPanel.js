import React, { PureComponent } from "react";
import { Menu, Button, Space, Tag, Dropdown, Popover } from 'antd';
import SingleFilterPanel from './SingleFilterPanel'
import ODataDataSource from "../datasources/ODataDataSource";
import { localeText } from './locale/en';
import { defaultFilterTypes } from './Filters/defaultFilterTypes'
const merge = require('deepmerge')

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
            filterValueProps: []
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
        return merge.all([
            defaultFilterTypes[filterDef.type] || {},
            (this.props.filterTypes && this.props.filterTypes[filterDef.type]) || {},
            filterDef || {},
            {dataSource: this.getDataSource(filterDef) || {}}
        ]);
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

    getDataSource = (filterDef) => {
        if (!filterDef || !filterDef.dataSource || !this.props.dataSources) return undefined;
        let dataSource = filterDef.dataSource.name
            ? this.props.dataSources[filterDef.dataSource.name]
            : this.props.dataSources[Object.keys(this.props.dataSources)[0]];

        return merge.all([
            defaultFilterTypes[filterDef.type] ? defaultFilterTypes[filterDef.type].dataSources[dataSource.type] || {} : {},
            (this.props.filterTypes && this.props.filterTypes[filterDef.type]) ? this.props.filterTypes[filterDef.type].dataSources[dataSource.type] || {} : {},
            filterDef.dataSource,
            dataSource,
            this.dataSourceTypes[dataSource.type]
        ])
    }

    renderFilters = () => {
        if (!this.state.filterValues) return null;
        return Object.keys(this.state.filterValues).map((name) => {
            let value = this.state.filterValues[name];
            let valueProps = this.state.filterValueProps[name];
            let filterDef = this.getFullFilterDefByName(name);
            if (!filterDef || !this.state.filterValues[name]) return null;
            let templateFunc = filterDef.template;
            let template = templateFunc({ filterDef, value, valueProps: valueProps, localeText: this.localeText });
            return <Popover key={name} trigger="click" overlayStyle={{ width: '298px' }} title={filterDef.title} placement="bottomLeft" content={<SingleFilterPanel {...filterDef} value={value} valueProps={valueProps} api={this} filters={this.state.filterValues} dataSource={this.getDataSource(filterDef)} localeText={this.localeText} onOk={this.singleFilterPanelOnOk} onCancel={this.singleFilterPanelOnCancel} />}>
                <Tag key={name} closable onClose={() => this.updateFilter({ filterDef: filterDef, value: null })}>
                    {template}
                </Tag>
            </Popover>
        })
    }

    renderFilterList = () => {
        return this.props.filterDefs.map((filterDef) => {
            return <Menu.Item key={filterDef.name} onClick={() => this.renderSingleFilterPanel({ filterDef: this.getFullFilterDefByDef(filterDef) })}>
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
        this.setState({ filterAddPanelVisible: false });
        this.updateFilter(props);
    }

    updateFilter = (props) => {
        let { filterDef, value, valueProps } = props;
        this.setState({
            filterValues: { ...this.state.filterValues, [filterDef.name]: value },
            filterValueProps: { ...this.state.filterValueProps, [filterDef.name]: valueProps },
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
    }

    initSingleFilterValueProps = (props) => {
        let { filterDef, valueProps } = props;
        let name = filterDef.name;
        this.setState({ filterValueProps: { ...this.state.filterValueProps, [name]: valueProps } })
    }

    initFilterValueProps = (props) => {
        let { filters } = props;
        let filterDefs = this.getFullFilterDefs();
        for (let filterDef of filterDefs) {
            let name = filterDef.name;
            let value = filters[name];
            if (value === undefined || value === null || !filterDef.dataSource.init) {
                this.initSingleFilterValueProps({ filterDef: filterDef, valueProps: undefined })
            } else {
                filterDef.dataSource.init({
                    filterDef: filterDef,
                    value: value,
                    callback: (valueProps) => this.initSingleFilterValueProps({ filterDef: filterDef, valueProps: valueProps })
                })
            }
        }
    }

    setFilters = (props) => {
        let { filters } = props;
        this.initFilterValueProps({ filters });
        this.setState({ filterValues: filters })
    }

    render() {
        return <Space size="small">
            {this.renderFilters()}
            <Dropdown placement="bottomRight" overlay={
                <Menu>
                    {this.renderFilterList()}
                </Menu>
            }>
                <Popover overlayStyle={{ width: '398px' }} title={this.state.filterAddPanelTitle} placement="bottomLeft" content={<SingleFilterPanel {...this.state.addedFilterDef} api={this} filters={this.state.filterValues} dataSource={this.getDataSource(this.state.addedFilterDef)} localeText={this.localeText} onOk={this.singleFilterPanelOnOk} onCancel={this.singleFilterPanelOnCancel} visible={this.state.filterAddPanelVisible} />} visible={this.state.filterAddPanelVisible}>
                    <Button type="link">{this.localeText.AddFilterButton}</Button>
                </Popover>
            </Dropdown>
        </Space>;
    }
}