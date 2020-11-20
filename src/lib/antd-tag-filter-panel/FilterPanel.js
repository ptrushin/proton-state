import React, { PureComponent } from "react";
import { Menu, Button, Space, Tag, Dropdown, Popover } from 'antd';
import SingleFilterPanel from './SingleFilterPanel'
import { oDataDataSource } from "../datasources/ODataDataSource";
import { localeText } from './locale/en';
import { defaultFilterTypes } from './Filters/defaultFilterTypes'
const merge = require('deepmerge')

export default class FilterPanel extends PureComponent {
    constructor(props) {
        super(props);

        this.dataSourceTypes = {
            odata: {
                instance: oDataDataSource
            }
        }
        this.state = {
            newFilterDef: null,
            filterValues: [],
            filterValueProps: [],
            filterPanelVisibleKey: undefined
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
        let dataSource = {};
        if (filterDef.dataSource && this.props.dataSources) {
            dataSource = filterDef.dataSource.name
                ? this.props.dataSources[filterDef.dataSource.name]
                : this.props.dataSources[Object.keys(this.props.dataSources)[0]];

            dataSource = merge.all([
                defaultFilterTypes[filterDef.type] ? defaultFilterTypes[filterDef.type].dataSources[dataSource.type] || {} : {},
                (this.props.filterTypes && this.props.filterTypes[filterDef.type]) ? this.props.filterTypes[filterDef.type].dataSources[dataSource.type] || {} : {},
                this.dataSourceTypes[dataSource.type],
                dataSource
            ])
        }
        return merge.all([
            defaultFilterTypes[filterDef.type] || {},
            (this.props.filterTypes && this.props.filterTypes[filterDef.type]) || {},
            {dataSource: dataSource},
            filterDef || {}
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

    getSingleFilterPanel = ({filterDef, isNew}) => {
        if (!filterDef) return null;
        let name = filterDef.name;
        //let key = `${filterDef.name}${isNew ? '_new' : ''}`;
        let key = isNew ? '_new' : filterDef.name;
        let value = this.state.filterValues[name];
        let valueProps = this.state.filterValueProps[name];
        return <SingleFilterPanel {...filterDef} 
            api={this} 
            filters={this.state.filterValues} 
            value={value}
            valueProps={valueProps}
            localeText={this.localeText} 
            onOk={this.singleFilterPanelOnOk} 
            onCancel={this.singleFilterPanelOnCancel} 
            visible={this.state.filterPanelVisibleKey === key}
            key={key} />
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
            return <Popover trigger="click" 
                onVisibleChange={() => this.setState({filterPanelVisibleKey: this.state.filterPanelVisibleKey === name ? undefined : name})} 
                visible={this.state.filterPanelVisibleKey === name} key={name} 
                overlayStyle={{ width: '298px' }} 
                title={filterDef.title} 
                placement="bottomLeft" 
                content={this.getSingleFilterPanel({filterDef})}>
                <Tag key={name} closable onClose={() => this.updateFilter({ filterDef: filterDef, value: null })} onClick={() => this.setState({currentFilterPanel: name})}>
                    {template}
                </Tag>
            </Popover>
        })
    }

    renderFilterList = () => {
        return this.props.filterDefs.map((filterDef) => {
            return <Menu.Item key={filterDef.name} onClick={() => 
                this.setState({ filterPanelVisibleKey: "_new", newFilterDef: this.getFullFilterDefByDef(filterDef) })
                }>
                {filterDef.title}
            </Menu.Item>
        })
    }

    singleFilterPanelOnCancel = () => {
        this.setState({ filterPanelVisibleKey: undefined })
    }

    singleFilterPanelOnOk = (props) => {
        this.setState({ filterPanelVisibleKey: undefined });
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
                <Popover 
                    overlayStyle={{ width: '398px' }} 
                    title={this.state.newFilterDef ? this.state.newFilterDef.title : undefined} 
                    placement="bottomLeft" 
                    content={this.getSingleFilterPanel({filterDef: this.state.newFilterDef, isNew: true})} 
                    visible={this.state.filterPanelVisibleKey === "_new"}
                    >
                    <Button type="link">{this.localeText.AddFilterButton}</Button>
                </Popover>
            </Dropdown>
        </Space>;
    }
}