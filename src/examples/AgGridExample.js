import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import OdataProvider from "ag-grid-odata";
import { AllModules } from "ag-grid-enterprise";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import ProtonState from '../lib/core/ProtonState';
import AgGridStateProvider from "../lib/aggrid/AgGridStateProvider";
import { ExceptionMap } from "antd/lib/result";

export class AgGridExample extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            columnDefs: [
                { headerName: "OrderId", field: "Order.OrderID", filter: 'agNumberColumnFilter' },
                { headerName: "Product", field: "Product.ProductName", filter: 'agTextColumnFilter' },
                { headerName: "Quantity", field: "Quantity", filter: 'agNumberColumnFilter' },
                { headerName: "UnitPrice", field: "UnitPrice", filter: 'agNumberColumnFilter' },
                { headerName: "Discount", field: "Discount", filter: 'agNumberColumnFilter' },
            ]
        }

        this.protonState = new ProtonState(props);
    }
    

    componentDidMount() {
        this.updateFilterValuesByLocationSearch();
    }

    componentDidUpdate() {
        this.updateFilterValuesByLocationSearch();
    }

    updateFilterValuesByLocationSearch = () => {
        if (this.protonState) this.protonState.updateStateFromUrl();
        /*let pars = queryString.parse(this.props.history.location.search);
        this.setState({ notOnlyProblem: pars['notOnlyProblem'] === 'true' });

        if (this.gridApi) {
            for (let name of Object.keys(pars)) {
                let value = pars[name];
                let filterInstance = this.gridApi.getFilterInstance(name);
                if (!filterInstance) continue;
                filterInstance.setModel({
                    filterType: 'text',
                    type: 'contains',
                    filter: value
                });
                filterInstance.onFilterChanged();
            }
        }*/
    }
    
    /*

    getAllRows() {
        let rowData = [];
        this.gridApi.forEachNode(node => rowData.push(node.data));
        return rowData;
    }
    */

    onGridReady = params => {
        this.gridApi = params.api;
        this.protonState.addStateProvider(new AgGridStateProvider({agGridApi: this.gridApi}))
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

    /*
    
    refresh() {
        if (!this.gridApi) return;
        this.gridApi.deselectAll()
        this.gridApi.purgeServerSideCache([]);
        this.setState({ currentOperations: null });
    }
    
    filterChanged(event) {
        const filterModel = event.api.getFilterModel();
        console.log('filterModel', filterModel);
        let { history } = this.props;
        let pars = queryString.parse(history.location.search);
        let isModified = false;
        for (let name of Object.keys(filterModel))
        {
            let singleFilterModel = filterModel[name];
            if (singleFilterModel.filterType === "text" && singleFilterModel.type === "contains") {
                if (pars[name] === singleFilterModel.filter) continue;
                pars[name] = singleFilterModel.filter;
                isModified = true;
            }
        }
        if (!isModified) return;
        let locationSearch = queryString.stringify(pars);
        console.log(locationSearch)
        locationSearch = locationSearch ? '?' + locationSearch : locationSearch;
        history.push(history.location.pathname + locationSearch);
    }*/

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