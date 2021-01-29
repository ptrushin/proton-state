import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import OdataProvider from "ag-grid-odata";
import { AllModules } from "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import { Switch } from 'antd'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import moment from "moment";
import ProtonState from '../lib/core/ProtonState';
import AgGridStateProvider from "../lib/ag-grid/AgGridStateProvider";
import FilterPanel from '../lib/antd-tag-filter-panel/FilterPanel'
import AntTagFilterPanelStateProvider from '../lib/antd-tag-filter-panel/AntTagFilterPanelStateProvider'
import { date2Def } from "./FilterDate2";
import { oDataDataSource } from '../lib/datasources/ODataDataSource'
import WrappedList from "../lib/components/WrappedList";
//import {localeText} from '../lib/antd-tag-filter-panel/locale/ru'

console.log(window.location.pathname)

export class AgGridExample extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: "OrderId", field: "Order.OrderID", filter: 'agNumberColumnFilter' },
                { headerName: "OrderDate", field: "Order.OrderDate", type: 'dateColumn' },
                { headerName: "Product", field: "Product.ProductName", filter: 'agTextColumnFilter' },
                { headerName: "CustomerID", field: "Order.CustomerID", filter: 'agTextColumnFilter' },
                { headerName: "Quantity", field: "Quantity", filter: 'agNumberColumnFilter' },
                { headerName: "Price & Dicount", children: [
                    { headerName: "UnitPrice", field: "UnitPrice", filter: 'agNumberColumnFilter' },
                    { headerName: "Discount", field: "Discount", filter: 'agNumberColumnFilter', columnGroupShow: 'open' }
                ]}                    
            ],
            defaultColDef: {
                sortable: true
            },
            columnTypes: {
                'dateColumn': {
                    filter: 'agDateColumnFilter',
                    valueFormatter: (params) => params.value == null ? null : moment(params.value).format('DD.MM.YYYY')
                }
            },
            filterDefs: [
                {
                    name: 'OrderDate', title: 'OrderDate', type: 'date',
                    fieldName: 'Order/OrderDate'
                },
                {
                    name: 'OrderDate2', title: 'OrderDate2', type: 'date2',
                    fieldName: 'Order/OrderDate'
                },
                {
                    name: 'Category', title: 'Category', type: 'select',
                    fieldName: 'Product/CategoryID',
                    single: true,
                    option: {
                        key: 'CategoryID',
                        label: 'CategoryName',
                    },
                    preLoad: true,
                    dataSource: { entityName: 'Categories' }
                },
                {
                    name: 'Product', title: 'Product', type: 'select',
                    hasNull: true,
                    fieldName: 'Product/ProductID',
                    //debounce: false,
                    //debounceTimeout: 500,
                    option: {
                        key: 'ProductID',
                        label: 'ProductName',
                        //count: 20,
                        labelFunc: ({value}) => <div><b>{value.ProductName}</b><br/>{value.Category.CategoryName}</div>
                    },
                    template: ({ filterDef, value, valueProps }) => !valueProps 
                        ? ((value && value.n) ? `${filterDef.title} = NULL` : null)
                        : <React.Fragment>{filterDef.title} = <WrappedList list={valueProps.options.map(e => `${e.ProductName}`)} length={2} /></React.Fragment>,
                    dataSource: {
                        //name: 'odata',
                        entityName: 'Products',
                        filter: ({ filters }) => !filters.Category ? null : `CategoryID eq ${filters.Category.s}`,
                        expand: ['Category($select=CategoryName)']
                        //searchFields: ['Name', "Code"]
                    }
                },
                {
                    name: 'Customer', title: 'Customer', type: 'select',
                    fieldName: 'Order/CustomerID',
                    keyType: 'string',
                    preLoad: true,
                    onlyUnique: true, // show unique
                    //debounce: false,
                    //debounceTimeout: 500,
                    option: {
                        key: 'CustomerID',
                        label: 'CustomerID'
                    },
                    dataSource: {
                        //name: 'odata',
                        entityName: 'Orders',
                        orderby: ["CustomerID"]
                        //searchFields: ['Name', "Code"]
                    }
                },
                {
                    name: 'DiscountSize', title: 'DiscountSize', type: 'select',
                    option: {
                        key: 'Key',
                        label: 'Value'
                    },
                    single: true,
                    options: [
                        {Key: '> 0', Value: '> 0'},
                        {Key: '>= 0.1', Value: '>= 0.1'},
                        {Key: '>= 0.2', Value: '>= 0.2'},
                    ],
                    dataSource: {
                        init: null,
                        //name: 'odata',
                        entityName: 'Orders',
                        orderby: ["CustomerID"]
                        //searchFields: ['Name', "Code"]
                    },
                    dataSources: {
                        odata: {
                            filter: ({ value }) => {return !value || value.length !== 1 ? undefined
                                : value[0] === '> 0' ? `Discount gt 0`
                                : value[0] === '>= 0.1' ? `Discount ge 0.1`
                                : value[0] === '>= 0.2' ? `Discount ge 0.2`
                                : undefined}
                        }
                    },
                    template: ({ filterDef, value, valueProps }) => !value || value.length !== 1 ? null : `${filterDef.title} ${filterDef.options.filter(_ => _.Key === value[0])[0].Value}`,
                }
            ],
            dataSources: {
                'odata': {
                    type: 'odata',
                    root: 'https://services.odata.org/V4/Northwind/Northwind.svc/',
                    //fetch: ({url}) => 
                }
            },
            filterTypes: {
                date2: date2Def
            },
            unitPriceGt20: false
        }

        this.protonState = new ProtonState(
            {
                history: props.history,
                onChange: this.onStateChange,
                rootComponent: this,
                externalFilterDefs: [
                    {
                        name: 'unitPriceGt20',
                        dataSources: { odata: { filter: ({ filterDef, value }) => value ? `UnitPrice gt 20` : undefined } },
                        serialize: ({ filterDef, value }) => value ? 'true' : undefined,
                        deserialize: ({ filterDef, value }) => value === 'true',
                    }
                ]
            });
    }


    componentDidMount() {
        this.protonState.updateState();
    }

    componentDidUpdate() {
        this.protonState.updateState();
    }
    
    onFilterReady = (api) => {
        this.filterApi = api;
        this.protonState.addStateProvider(new AntTagFilterPanelStateProvider({ api: api }))
    }

    onStateChange = (props) => {
        if (!this.gridApi) return;
        let { stateProvider } = props;
        if (!stateProvider || stateProvider.api !== this.gridApi) this.gridApi.purgeServerSideCache([]);
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.protonState.addStateProvider(new AgGridStateProvider({
            api: this.gridApi,
            columnApi: params.columnApi,
            columnDefs: {
                "Product.ProductName": {
                    stateName: 'ProductName'
                }
            }
        }))
        this.gridColumnApi = params.columnApi;
        params.api.setServerSideDatasource(
            new OdataProvider({
                callApi: (options) => fetch(`https://services.odata.org/V4/Northwind/Northwind.svc/Order_Details${options}`)
                    .then(response => {
                        if (!response.ok) {
                            return {
                                '@odata.count': 0,
                                value: []
                            };
                        }
                        return response.json()
                    })
                ,
                beforeRequest: (query) => {
                    query.expand = ["Order($expand=Customer)", "Product"];
                    let filters = [];
                    // filterApi
                    filters = [...filters, ...this.filterApi.dataSourceTypes.odata.instance.getFilters({
                        filterDefs: this.filterApi.getFullFilterDefs(),
                        filters: this.filterApi.getFilters()
                    })]
                    // exteralFilters
                    filters = [...filters, ...oDataDataSource.getFilters({
                        filterDefs: this.protonState.externalStateProvider.filterDefs,
                        filters: this.protonState.externalStateProvider.filterValues
                    })]

                    if (filters.length > 0) query.filter = filters;
                }
            })
        );
    };

    onPaste = async (e) => {
        const str = await e.clipboardData.getData('Text');
        this.protonState.setFromString(str);
        window.location.reload();
    };

    render() {
        return (
            <div style={{ width: '100%', height: '100vh' }}>
                <div style={{ height: '65px' }}>
                    <span style={{ marginRight: 20 }}><Switch checked={this.state.unitPriceGt20} onChange={() => this.setState({ unitPriceGt20: !this.state.unitPriceGt20 })} /> {`UnitPrice > 20`}</span>
                    <FilterPanel filterDefs={this.state.filterDefs}
                        dataSources={this.state.dataSources}
                        filterTypes={this.state.filterTypes}
                        //localeText={localeText}
                        onReady={({ api }) => this.onFilterReady(api)}
                    />
                    <br/>
                    <button onClick={() => {this.gridApi.setFilterModel(null); }}>Clear aggrid filters</button>
                    <button onClick={() => {this.protonState.clear(); window.location.reload();}}>Clear all state</button>
                    <button onClick={() => {this.protonState.clear('LocalStorage'); window.location.reload();}}>Clear local storage state</button>
                    <button onClick={() => {this.protonState.copyToClipboard();}}>Copy to clipboard</button>
                    <input type="text" onPaste={this.onPaste} value="Set from clipboard (insert here)" style={{width: 300}} readOnly={true}></input>
                </div>

                <div style={{ height: 'calc(100% - 65px)' }}>
                    <div
                        style={{
                            height: '100%',
                            width: '100%',
                        }}
                        className="ag-theme-balham"
                    >
                        <AgGridReact
                            defaultColDef={this.state.defaultColDef}
                            columnDefs={this.state.columnDefs}
                            rowData={this.state.rowData}
                            modules={AllModules}
                            rowModelType="serverSide"
                            cacheBlockSize={100}
                            onGridReady={this.onGridReady}
                            //localeText={agGridLocaleText}
                            columnTypes={this.state.columnTypes}
                            rowSelection="multiple"
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(AgGridExample);