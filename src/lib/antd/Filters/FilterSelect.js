import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select } from 'antd';
//import { get } from '@custis/smart-mto-front-common/dist/inc/fetch';
var debounce = require('lodash.debounce');

const { Option } = Select;

export default function FilterSelect(props) {
    const { dataSource, odata, title, value, onChange, preLoad, options : preLoadOptions, name, visible } = props;
    const handleSearch = (value) => {
        if (!value) return;
        const entityName = odata.entity.name;
        const searchFields = odata.entity.searchFields
            ? odata.entity.searchFields
            : odata.entity.label
                ? [odata.entity.label]
                : null;
        if (!searchFields) return;
        const count = odata.entity.count || 20;

        /*get({
            url: `${dataSource.path}/${entityName}?$filter=${searchFields.map(k => `contains(tolower(${k}),'${value.toLowerCase()}')`).join(' or ')
                }&$top=${count}`,
            callback: (json) => { setOptions(json.value); }
        })*/
    }

    const debounceHandleSearch = useCallback(
        odata.entity.debounce !== false
            ? debounce(handleSearch, odata.entity.debounceTimeout || 500)
            : handleSearch
        , [name]);

    const [options, setOptions] = useState(preLoadOptions);

    useEffect(() => {
        if (preLoad) {
            /*get({
                url: `${dataSource.path}/${odata.entity.name}`,
                callback: (json) => { setOptions(json.value); }
            })*/
        }
    }, [preLoad, dataSource.path, odata.entity.name]);

    useEffect(() => {
        setOptions(null);
        selectRef.current.focus();
    }, [name, visible])

    const selectRef = useRef(null);

    return <Select
        style={{ width: '100%' }}
        mode="multiple"
        showSearch
        value={value}
        placeholder={title}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={debounceHandleSearch}
        ref={selectRef}
        onChange={(value) => {onChange(value); selectRef.current.blur()}}
        notFoundContent={null}
    >
        {!options ? null : options.map(d => <Option key={d[odata.entity.key]}>{odata.entity.labelFunc ? odata.entity.labelFunc({value: d}) : d[odata.entity.label]}</Option>)}
    </ Select>;
}