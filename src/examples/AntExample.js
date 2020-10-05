import React, { PureComponent } from "react";
import { withRouter } from "react-router-dom";
import FilterPanel from '../lib/antd/FilterPanel'
import { defaultFilterDefs } from '../lib/antd/Filters/defaultFilterDefs'

export class AntExample extends PureComponent {
    filterDefs = [
        {
            name: 'InvolvementDate',
            title: 'Дата вовлечения',
            type: 'date',
            odata: {
                name: 'Requirement/InvolvementDate'
            }
        },
        {
            name: 'Ware',
            title: 'МТР',
            type: 'select',
            odata: {
                name: 'Requirement/WareId',
                entity: {
                    name: 'Ware',
                    key: 'Id',
                    label: 'Name',
                    //debounce: false,
                    //debounceTimeout: 500,
                    //count: 20,
                    searchFields: ['Name', "Code"],
                    //labelFunc: ({value}) => ``
                }
            }
        }
    ]

    render() {
        return (
            <FilterPanel filterDefs={this.filterDefs} defaultFilterDefs={defaultFilterDefs}
                history={this.props.history}
                dataSource={{ type: 'odata', path: '' }}
                onChange={({api}) => console.log(api.getODataFilters())}
            />
        );
    }
}

export default withRouter(AntExample);