import React, { useState, useRef, useEffect } from 'react';
import { Space, Button } from 'antd';
import FilterDate from './Filters/FilterDate';
import FilterSelect from './Filters/FilterSelect';
import FilterString from './Filters/FilterString';
export default function SingleFilterPanel(props) {
  const {
    visible,
    name,
    renderFilter,
    type,
    value: initialValue
  } = props;
  const {
    onOk,
    onCancel,
    ...restProps
  } = props;
  const [value, setValue] = useState(initialValue);
  const componentProps = { ...restProps,
    value: value,
    onChange: value => {
      console.log('11');
      setValue(value);
      buttonRef.current.focus();
    }
  };
  let FilterComponent = null;
  if (renderFilter) FilterComponent = renderFilter(componentProps);else if (type) {
    const component = type === "select" ? FilterSelect : type === "date" ? FilterDate : FilterString;
    FilterComponent = /*#__PURE__*/React.createElement(component, componentProps);
  }
  useEffect(() => {
    setValue(undefined);
  }, [name, visible]);
  const buttonRef = useRef(null);
  return /*#__PURE__*/React.createElement("div", {
    onKeyUp: event => {
      if (event.key === 'Enter') onOk({
        filterDef: restProps,
        value: value
      });
      if (event.keyCode === 27) onCancel();
    }
  }, FilterComponent, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement(Space, {
    align: "center",
    style: {
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement(Button, {
    ref: buttonRef,
    onClick: () => onOk({
      filterDef: restProps,
      value: value
    })
  }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C"), /*#__PURE__*/React.createElement(Button, {
    onClick: onCancel
  }, "\u041E\u0442\u043C\u0435\u043D\u0430")));
}