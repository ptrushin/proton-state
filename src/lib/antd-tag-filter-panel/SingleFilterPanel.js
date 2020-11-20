import React, { useState, useRef, useEffect } from 'react';
import { Space, Button } from 'antd'

export default function SingleFilterPanel(props) {
    const { visible, name, renderFilter, type, value: initialValue, valueProps: initialValueProps, component: Component } = props;
    const { onOk, onCancel, ...restProps } = props;
    const [value, setValue] = useState(initialValue);
    const [_initialValue, _setInitialValue] = useState(initialValue);
    const [valueProps, setValueProps] = useState(initialValueProps);
    const [_initialValueProps, _setInitialValueProps] = useState(initialValueProps);
    if (initialValue !== _initialValue) {
        _setInitialValue(initialValue);
        setValue(initialValue);
    }

    if (initialValueProps !== _initialValueProps) {
        _setInitialValueProps(initialValueProps);
        setValueProps(initialValueProps);
    }

    const componentProps = {
        ...restProps,
        value: value,
        onChange: (value, valueProps) => {setValue(value); setValueProps(valueProps); buttonRef.current.focus();}
    }

    let FilterComponent = null;
    if (renderFilter) FilterComponent = renderFilter({...componentProps, key: name});
    else if (type) {
        FilterComponent = <Component {...componentProps} key={name} />;
    }

    /*useEffect(() => {
        setValue(undefined);
    }, [name, visible])*/

    const buttonRef = useRef(null);
    
    const ref = useRef(null);

    useEffect(() => {
        if (visible) setTimeout(() => ref.current.focus(), 100)
    }, [visible])

    return <div tabIndex="0" ref={ref} onKeyDown={(event) => {if (event.key === "Escape") onCancel();}}
        >
        {FilterComponent}
        <br />
        <Space align="center" style={{ marginTop: 10 }}>
            <Button tabIndex="0" ref={buttonRef} onClick={() => onOk({ filterDef: restProps, value: value, valueProps: valueProps })}>{props.localeText.AddButton}</Button>
            <Button tabIndex="1" onClick={onCancel}>{props.localeText.CancelButton}</Button>
        </Space>
    </div>
}