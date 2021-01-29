import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Select, Checkbox, Space, Popover, Alert, Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';
import '../style.css'
var debounce = require('lodash.debounce');

const { Option } = Select;


export default function FilterSelect(props) {
    const { localeText, filters, hasNull, dataSource, title, single, value, valueProps, onlyUnique, onChange, preLoad, option, options: preLoadOptions, name, visible, debounce: isDebounce, debounceTimeout, separators } = props;

    const handleSearch = (value) => {
        //setSearchValue(value);
        if (!value) return;
        
        let values = [value];
        const seps = separators || ["\t", "\n"]
        for (let separator of seps) {
            values = values.map(v => v.split(separator)).flat().filter(_ => _);
        }
        // unique
        values = [...new Set(values)]

        // if more then single then exact match
        if (values.length > 1) {
            dataSource.instance.searchByExactMatch({
                values: values,
                callback: (json) => { 
                    setOptions(json.value);
                    if (json.value.length < values.length) {
                        let founded = [];
                        const searchFields = dataSource.searchFields
                            ? dataSource.searchFields
                            : option.label
                                ? [option.label]
                                : null;
                        for (let v of values) {
                            for (let r of json.value) {
                                for (let f of searchFields) {
                                    if (r[f] == v) {
                                        founded.push(v);
                                        break;
                                    }
                                }
                            }
                        }
                        const notFounded = values.filter(_ => founded.indexOf(_) < 0);
                        setMessage({title: localeText.FilterSelect['Some values not founded'], message: notFounded.join("\n")});
                    }
                    if (json.value.length > 0) {
                        onChange(createValue([...(value || {}).s || [], ...json.value.map(_ => _[option.key])], (value || {}).n), {options: [...(valueProps || {}).options || [], ...json.value]})
                    }
                },
                dataSource: props.dataSource,
                option: props.option,
                onlyUnique: onlyUnique,
                filter: dataSource.filter ? dataSource.filter({ filters: filters }) : undefined
            })
        } else {
            dataSource.instance.searchByText({
                value: value,
                separators: separators,
                callback: (json) => { 
                    setOptions(json.value);
                },
                dataSource: props.dataSource,
                option: props.option,
                onlyUnique: onlyUnique,
                filter: dataSource.filter ? dataSource.filter({ filters: filters }) : undefined
            })
        }
    }

    const debounceHandleSearch = useCallback(
        isDebounce !== false
            ? debounce(handleSearch, debounceTimeout || 500)
            : handleSearch
        , [name]);

    const [message, setMessage] = useState();
    const [searchValue, setSearchValue] = useState(valueProps ? valueProps.options : preLoadOptions);
    const [options, setOptions] = useState(valueProps ? valueProps.options : preLoadOptions);
    const [_valueProps, _setValueProps] = useState(valueProps);
    if (_valueProps !== valueProps) {
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
    const valueToSelectValue = value === null || value === undefined ? undefined : single ? value.s[0] : value.s;
    const valueToHasNullChecked = value === null || value === undefined ? undefined : value.n;
    const createValue = (value, hasNullChecked) => isNull(value) && !hasNullChecked
        ? undefined
        : {s: isNull(value) ? undefined : single ? [value] : value, n: hasNullChecked};

        /*<div onPaste1={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSearch(e.clipboardData.getData('Text'));
        }}>*/
    return <Space direction="vertical" style={{width: '100%'}}>
        <Select
            //searchValue={searchValue}
            className="proton-antd-select"
            key={name}
            style={{ width: '100%' }}
            autoFocus={true}
            mode={single ? "single" : "multiple"}
            showSearch
            value={valueToSelectValue}
            placeholder={title}
            defaultActiveFirstOption={false}
            showArrow={true}
            filterOption={false}
            onSearch={(value) => {setSearchValue(value); debounceHandleSearch(value)}}
            ref={selectRef}
            onChange={(value, valueOption) => {
                onChange(
                    createValue(value, valueToHasNullChecked),
                    isNull(value) ? undefined : {
                        options: single ? [valueOption.data] : valueOption.map((o, idx) => {
                            return o.data || valueProps.options.filter(o => o[option.key] === value[idx])[0]
                        })
                    }
                ); selectRef.current.blur()
            }}
            notFoundContent={null}
        >
            {!options ? null : options.map(d => { return <Option key={d[option.key]} value={d[option.key]} data={d}>{option.labelFunc ? option.labelFunc({ value: d }) : d[option.label]}</Option> })}
        </ Select>
        {hasNull ? <Checkbox checked={valueToHasNullChecked} onChange={(e) => onChange(createValue(valueToSelectValue, e.target.checked), valueProps)}>{localeText.FilterSelect['Add Null']}</Checkbox> : null}{message ? <Popover content={
            <Space direction="vertical">
                {message.message}
                <Space direction="horizontal">
                    <Button onClick={() => setMessage(null)}>{localeText['Close']}</Button>
                    <Button onClick={() => {navigator.clipboard.writeText(message.message); setMessage(null)}}>{localeText['Copy']}</Button>
                </Space>
            </Space>
        } title={message.title} visible={true} trigger="click" /> : null}
    </Space>
}