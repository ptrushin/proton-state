import React, { useState, useRef, useEffect } from 'react';
import { Space, Button } from 'antd'
import FilterDate from './Filters/FilterDate'
import FilterSelect from './Filters/FilterSelect'
import FilterString from './Filters/FilterString'

export default function SingleFilterPanel(props) {
    const { visible, name, renderFilter, type, value: initialValue, valueProps: initialValueProps } = props;
    const { onOk, onCancel, ...restProps } = props;
    const [value, setValue] = useState(initialValue);
    const [valueProps, setValueProps] = useState(initialValueProps);
    const componentProps = {
        ...restProps,
        value: value,
        onChange: (value, valueProps) => {setValue(value); setValueProps(valueProps); buttonRef.current.focus();}
    }

    let FilterComponent = null;
    if (renderFilter) FilterComponent = renderFilter(componentProps);
    else if (type) {
        const component = type === "select"
            ? FilterSelect
            : type === "date"
                ? FilterDate
                : FilterString;
        FilterComponent = React.createElement(component, componentProps);
    }

    useEffect(() => {
        setValue(undefined);
    }, [name, visible])

    const buttonRef = useRef(null);

    return <div onKeyUp={(event) => {
        if (event.key === 'Enter') onOk({ filterDef: restProps, value: value, valueProps: valueProps });
        if (event.keyCode === 27) onCancel();
    }
    }>
        {FilterComponent}
        <br />
        <Space align="center" style={{ marginTop: 10 }}>
            <Button ref={buttonRef} onClick={() => onOk({ filterDef: restProps, value: value, valueProps: valueProps })}>{props.localeText.AddButton}</Button>
            <Button onClick={onCancel}>{props.localeText.CancelButton}</Button>
        </Space>
    </div>
}