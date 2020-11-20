import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select } from 'antd';
//import { get } from '@custis/smart-mto-front-common/dist/inc/fetch';
var debounce = require('lodash.debounce');

const { Option } = Select;


export default function FilterSelect(props) {
    const { filters, dataSource, title, single, value, valueProps, onlyUnique, onChange, preLoad, option, options: preLoadOptions, name, visible, debounce: isDebounce, debounceTimeout, separators } = props;

    const handleSearch = (value) => {
        if (!value) return;
        dataSource.instance.searchByText({
            value: value,
            separators: separators,
            callback: (json) => { setOptions(json.value); },
            dataSource: props.dataSource,
            option: props.option,
            onlyUnique: onlyUnique,
            filter: dataSource.filter ? dataSource.filter({ filters: filters }) : undefined
        })
    }

    const debounceHandleSearch = useCallback(
        isDebounce !== false
            ? debounce(handleSearch, debounceTimeout || 500)
            : handleSearch
        , [name]);

    const [options, setOptions] = useState(valueProps ? valueProps.options : preLoadOptions);
    const [_valueProps, _setValueProps] = useState(valueProps);
    if (_valueProps !== valueProps)
    {
        _setValueProps(valueProps);
        //setOptions(valueProps.options);
    }
    const [isPreLoaded, setIsPreLoaded] = useState(false);

    useEffect(() => {
        if (visible && preLoad && !isPreLoaded) {
            setIsPreLoaded(true); 
            dataSource.instance.getAll({
                callback: (json) => { setOptions(json.value); },
                dataSource: dataSource,
                option: option,
                onlyUnique: onlyUnique,
                filter: dataSource.filter ? dataSource.filter({ filters: filters }) : undefined
            })
        }
    }, [preLoad, dataSource, option, filters, visible, name, isPreLoaded, onlyUnique]);

    /*useEffect(() => {
        setOptions(null);
        setIsPreLoaded(false); 
        selectRef.current.focus();
    }, [name, visible])*/

    const selectRef = useRef(null);

    const isNull = (value) => value === null || value === undefined || (Array.isArray(value) && value.length === 0);

    return <Select
        key={name}
        style={{ width: '100%' }}
        autoFocus={true}
        mode={single ? "single" : "multiple"}
        showSearch
        value={value === null || value === undefined ? undefined : single ? value[0] : value}
        placeholder={title}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={debounceHandleSearch}
        ref={selectRef}
        onChange={(value, valueOption) => { 
            onChange(
                isNull(value) ? undefined : single ? [value] : value, 
                isNull(value) ? undefined : { options: single ? [valueOption.data] : valueOption.map((o, idx) => {
                        return o.data || valueProps.options.filter(o => o[option.key] === value[idx])[0]
                    })}
                ); selectRef.current.blur() 
        }}
        notFoundContent={null}
    >
        {!options ? null : options.map(d => {return <Option key={d[option.key]} value={d[option.key]} data={d}>{option.labelFunc ? option.labelFunc({ value: d }) : d[option.label]}</Option>})}
    </ Select>;
}