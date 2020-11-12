import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select } from 'antd';
//import { get } from '@custis/smart-mto-front-common/dist/inc/fetch';
var debounce = require('lodash.debounce');

const { Option } = Select;


export default function FilterSelect(props) {
    const { filters, dataSource, title, single, value, onlyUnique, onChange, preLoad, option, options: preLoadOptions, name, visible, debounce: isDebounce, debounceTimeout } = props;

    const handleSearch = (value) => {
        if (!value) return;
        dataSource.instance.searchByText({
            value: value,
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

    const [options, setOptions] = useState(preLoadOptions);
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

    useEffect(() => {
        setOptions(null);
        setIsPreLoaded(false); 
        selectRef.current.focus();
    }, [name, visible])

    const selectRef = useRef(null);

    return <Select
        style={{ width: '100%' }}
        mode={single ? "single" : "multiple"}
        showSearch
        value={value}
        placeholder={title}
        defaultActiveFirstOption={false}
        showArrow={true}
        filterOption={false}
        onSearch={debounceHandleSearch}
        ref={selectRef}
        onChange={(value, option) => { onChange(value, { options: option.map(o => o.data) }); selectRef.current.blur() }}
        notFoundContent={null}
    >
        {!options ? null : options.map(d => <Option key={d[option.key]} data={d}>{option.labelFunc ? option.labelFunc({ value: d }) : d[option.label]}</Option>)}
    </ Select>;
}