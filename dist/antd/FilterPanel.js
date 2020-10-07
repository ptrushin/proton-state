function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

import React, { PureComponent } from "react";
import { Menu, Button, Space, Tag, Dropdown, Popover } from 'antd';
import SingleFilterPanel from './SingleFilterPanel';

const queryString = require('query-string'); //const { Header, Content, Sider } = Layout;


export default class FilterPanel extends PureComponent {
  constructor(...args) {
    super(...args);
    this.state = {
      addedFilterDef: null,
      filterValues: [],
      filterEntities: []
    };
    this.locationSearch = null;

    this.getFilterDef = name => {
      return this.props.filterDefs.filter(fd => fd.name === name)[0];
    };

    this.updateFilterValuesByLocationSearch = () => {
      let {
        history,
        defaultFilterDefs,
        dataSource,
        onChange,
        urlPrefix
      } = this.props;

      let quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;

      if (this.locationSearch !== history.location.search) {
        this.locationSearch = history.location.search;
        let pars = queryString.parse(this.locationSearch);
        let filterValues = {};

        for (let nameWithPrefix in pars) {
          let name = urlPrefix ? nameWithPrefix.replace(urlPrefix, '') : nameWithPrefix;
          let value = pars[nameWithPrefix];
          let filterDef = this.getFilterDef(name);
          if (!filterDef) continue;
          filterValues[name] = defaultFilterDefs[filterDef.type].deserialize({
            filterDef,
            value: value
          });

          if (filterDef.type === 'select') {
            const entityName = filterDef.odata.entity.name;
            /*get({
                url: `${dataSource.path}/${entityName}?$filter=${filterValues[name].map(v => `${filterDef.odata.entity.key} eq ${quoted(v, filterDef.odata.keyType)}`).join(' or ')
                    }`,
                callback: (json) => { this.setState({ filterEntities: { ...this.state.filterEntities, [name]: json.value } }) }
            })*/
          }
        }

        this.setState({
          filterValues: filterValues
        }, () => {
          if (onChange) onChange({
            api: this
          });
        });
      }
    };

    this.getODataFilters = () => {
      if (!this.state.filterValues) return null;
      let filter = [];

      for (let name in this.state.filterValues) {
        let value = this.state.filterValues[name];
        let filterDef = this.getFilterDef(name);
        if (!filterDef) continue;
        let odata = this.props.defaultFilterDefs[filterDef.type].odata;
        filter.push(odata.filter({
          filterDef,
          value
        }));
      }

      return filter;
    };

    this.renderFilters = () => {
      if (!this.state.filterValues) return null;
      return Object.keys(this.state.filterValues).map(name => {
        let value = this.state.filterValues[name];
        let filterDef = this.getFilterDef(name);
        if (!filterDef || !this.state.filterValues[name]) return null;
        let templateFunc = filterDef.template || this.props.defaultFilterDefs[filterDef.type].template;
        let template = templateFunc({
          filterDef,
          value,
          entity: this.state.filterEntities[name]
        });
        return /*#__PURE__*/React.createElement(Popover, {
          key: name,
          trigger: "click",
          overlayStyle: {
            width: '298px'
          },
          title: filterDef.title,
          placement: "bottomLeft",
          content: /*#__PURE__*/React.createElement(SingleFilterPanel, _extends({}, filterDef, {
            value: value,
            dataSource: this.props.dataSource,
            onOk: this.singleFilterPanelOnOk,
            onCancel: this.singleFilterPanelOnCancel
          }))
        }, /*#__PURE__*/React.createElement(Tag, {
          key: name,
          closable: true,
          onClose: () => this.updateFilter({
            filterDef: filterDef,
            value: null
          })
        }, template));
      });
    };

    this.renderFilterList = () => {
      return Object.keys(this.props.filterDefs).map(name => {
        const filterDef = this.props.filterDefs[name];
        return /*#__PURE__*/React.createElement(Menu.Item, {
          key: name,
          onClick: () => this.renderSingleFilterPanel({
            filterDef: filterDef
          })
        }, filterDef.title);
      });
    };

    this.renderSingleFilterPanel = props => {
      let {
        filterDef
      } = props;
      if (!filterDef) return null;
      this.setState({
        filterAddPanelVisible: true,
        addedFilterDef: filterDef,
        filterAddPanelTitle: filterDef.title
      });
    };

    this.singleFilterPanelOnCancel = () => {
      this.setState({
        filterAddPanelVisible: false
      });
    };

    this.singleFilterPanelOnOk = props => {
      let {
        filterDef,
        value
      } = props;
      this.setState({
        filterAddPanelVisible: false
      });
      this.updateFilter({
        filterDef: filterDef,
        value: value
      });
    };

    this.updateFilter = props => {
      let {
        filterDef,
        value
      } = props;
      let {
        urlPrefix,
        defaultFilterDefs,
        history
      } = this.props;
      let filters = { ...this.state.filterValues,
        [filterDef.name]: value
      };
      let pars = queryString.parse(this.locationSearch);

      for (let name in filters) {
        let nameWithPrefix = urlPrefix ? `${urlPrefix}${name}` : name;
        let value = filters[name];
        let filterDef = this.getFilterDef(name);
        if (!filterDef) continue;

        if (value === null || value === undefined || Array.isArray(value) && value.length === 0) {
          delete pars[nameWithPrefix];
        } else {
          pars[nameWithPrefix] = defaultFilterDefs[filterDef.type].serialize({
            filterDef,
            value: value
          });
        }
      }

      let locationSearch = queryString.stringify(pars);
      locationSearch = locationSearch ? '?' + locationSearch : locationSearch;
      history.push(history.location.pathname + locationSearch);
    };
  }

  componentDidMount() {
    if (this.props.onReady) this.props.onReady({
      api: this
    });
    this.updateFilterValuesByLocationSearch();
  }

  componentDidUpdate() {
    this.updateFilterValuesByLocationSearch();
  }

  render() {
    return /*#__PURE__*/React.createElement(Space, {
      size: "small"
    }, this.renderFilters(), /*#__PURE__*/React.createElement(Dropdown, {
      placement: "bottomRight",
      overlay: /*#__PURE__*/React.createElement(Menu, null, this.renderFilterList())
    }, /*#__PURE__*/React.createElement(Popover, {
      overlayStyle: {
        width: '398px'
      },
      title: this.state.filterAddPanelTitle,
      placement: "bottomLeft",
      content: /*#__PURE__*/React.createElement(SingleFilterPanel, _extends({}, this.state.addedFilterDef, {
        dataSource: this.props.dataSource,
        onOk: this.singleFilterPanelOnOk,
        onCancel: this.singleFilterPanelOnCancel,
        visible: this.state.filterAddPanelVisible
      })),
      visible: this.state.filterAddPanelVisible
    }, /*#__PURE__*/React.createElement(Button, {
      type: "link"
    }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440"))));
  }

}