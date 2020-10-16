import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select } from 'antd';
//import { get } from '@custis/smart-mto-front-common/dist/inc/fetch';
var debounce = require('lodash.debounce');

const { Option } = Select;


export default function FilterSelect(props) {
    const { filters, dataSource, title, value, onlyUnique, onChange, preLoad, option, options: preLoadOptions, name, visible, debounce: isDebounce, debounceTimeout } = props;

    const getUnique = (options) => {
        let resultOptions = [];
        let keys = [];
        for (let o of options) {
            let key = o[option.key];
            if (!keys.includes(key)) {
                keys.push(key);
                resultOptions.push(o);
            }
        }
        return resultOptions;
    }

    const handleSearch = (value) => {
        if (!value) return;
        dataSource.instance.searchByText({
            value: value,
            callback: (json) => { setOptions(onlyUnique ? getUnique(json.value) : json.value); },
            props: props,
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
                filter: dataSource.filter ? dataSource.filter({ filters: filters }) : undefined
            })
        }
    }, [preLoad, dataSource, option, filters, visible, name, isPreLoaded]);

    useEffect(() => {
        setOptions(null);
        setIsPreLoaded(false); 
        selectRef.current.focus();
    }, [name, visible])

    const selectRef = useRef(null);

    let getOptionsByValue = (value) => {
        if (value === undefined || value === null) return undefined;
        let valueArr = Array.isArray(value) ? value : [value];
        // eslint-disable-next-line
        return valueArr.map(v => options.filter(o => o[option.key] == v)[0])
    }

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
        onChange={(value) => { onChange(value, { options: getOptionsByValue(value) }); selectRef.current.blur() }}
        notFoundContent={null}
    >
        {!options ? null : options.map(d => <Option key={d[option.key]}>{option.labelFunc ? option.labelFunc({ value: d }) : d[option.label]}</Option>)}
    </ Select>;
}