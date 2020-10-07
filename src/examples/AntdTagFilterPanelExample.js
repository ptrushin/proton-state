import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import FilterPanel from '../lib/antd-tag-filter-panel/FilterPanel'
//import { localeText } from '../lib/antd-tag-filter-panel/locale/ru'
import ProtonState from '../lib/core/ProtonState';
import AntTagFilterPanelStateProvider from '../lib/antd-tag-filter-panel/AntTagFilterPanelStateProvider'

export class AntdTagFilterPanelExample extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            filterDefs: [
                {
                    name: 'InvolvementDate', title: 'InvolvementDate', type: 'date',
                    fieldName: 'Requirement/InvolvementDate'
                },
                {
                    name: 'Product', title: 'Product', type: 'select',
                    fieldName: 'Requirement/WareId',
                    //debounce: false,
                    //debounceTimeout: 500,
                    option: {
                        key: 'ProductID',
                        label: 'ProductName',
                        //labelFunc: ({value}) => ``
                    },
                    dataSource: {
                        //name: 'odata',
                        entity: {
                            name: 'Products',
                            //count: 20,
                            //searchFields: ['Name', "Code"]
                        }
                    }
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

            }
        }

        this.protonState = new ProtonState({ history: props.history });
    }

    onReady = (api) => {
        this.protonState.addStateProvider(new AntTagFilterPanelStateProvider({
            api: api,
            /*columnDefs: {
                "Product.ProductName": {
                    stateName: 'ProductName'
                }
            }*/
        }))
    }

    render() {
        return (
            <FilterPanel filterDefs={this.state.filterDefs}
                dataSources={this.state.dataSources}
                filterTypes={this.state.filterTypes}
                //localeText={localeText}
                onChange={({ api }) => console.log(api.getODataFilters())}
                onReady={({ api }) => this.onReady(api)}
            />
        );
    }
}

export default withRouter(AntdTagFilterPanelExample);