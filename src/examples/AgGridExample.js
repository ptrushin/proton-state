import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import OdataProvider from "ag-grid-odata";
import { AllModules } from "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import ProtonState from '../lib/core/ProtonState';
import AgGridStateProvider from "../lib/ag-grid/AgGridStateProvider";
import moment from "moment";

export class AgGridExample extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: "OrderId", field: "Order.OrderID", filter: 'agNumberColumnFilter' },
                { headerName: "OrderDate", field: "Order.OrderDate", type: 'dateColumn' },
                { headerName: "Product", field: "Product.ProductName", filter: 'agTextColumnFilter' },
                { headerName: "Quantity", field: "Quantity", filter: 'agNumberColumnFilter' },
                { headerName: "UnitPrice", field: "UnitPrice", filter: 'agNumberColumnFilter' },
                { headerName: "Discount", field: "Discount", filter: 'agNumberColumnFilter' },
            ],
            defaultColDef: {
                sortable: true
            },
            columnTypes: {
                'dateColumn': {
                    filter: 'agDateColumnFilter',
                    valueFormatter: (params) => params.value == null ? null : moment(params.value).format('DD.MM.YYYY')
                }
            }
        }

        this.protonState = new ProtonState({ history: props.history });
    }


    componentDidMount() {
        this.updateFilterValuesByLocationSearch();
    }

    componentDidUpdate() {
        this.updateFilterValuesByLocationSearch();
    }

    updateFilterValuesByLocationSearch = () => {
        if (this.protonState) this.protonState.updateStateFromUrl();
    }

    onGridReady = params => {
        this.gridApi = params.api;
        this.protonState.addStateProvider(new AgGridStateProvider({
            api: this.gridApi,
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
                }
            })
        );
    };

    render() {
        return (
            <div style={{ width: '100%', height: '100vh' }}>
                <div style={{ height: '30px' }}>12</div>

                <div style={{ height: 'calc(100% - 30px)' }}>
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
                            //Enable server mode DataSource
                            rowModelType="serverSide"
                            // fetch 100 rows per at a time
                            cacheBlockSize={100}
                            onGridReady={this.onGridReady}
                            //localeText={agGridLocaleText}
                            columnTypes={this.state.columnTypes}
                            //onRowSelected={this.onRowSelected.bind(this)}
                            //tooltipShowDelay={600}
                            rowSelection="multiple"
                        //onFilterChanged={(event) => this.filterChanged(event)}
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(AgGridExample);