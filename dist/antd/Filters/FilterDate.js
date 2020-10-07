import React, { useState } from 'react';
import { Select, DatePicker, Space, InputNumber } from 'antd';
const {
  Option
} = Select;
const {
  RangePicker
} = DatePicker;
const dateFormat = 'DD/MM/YYYY';
const monthFormat = 'MM/YYYY';
export default function FilterDate(props) {
  let {
    value,
    onChange
  } = props;
  const [regime, setRegime] = useState((value || {}).type || 'D');

  const localOnChange = value => {
    if (!value || !value[0] && !value[1]) onChange(undefined);else onChange({
      type: regime,
      value
    });
  };

  return /*#__PURE__*/React.createElement(Space, {
    direction: "vertical",
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Select, {
    value: regime,
    onChange: value => {
      localOnChange(undefined);
      setRegime(value);
    },
    style: {
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement(Option, {
    key: "D"
  }, "\u0414\u0430\u0442\u044B"), /*#__PURE__*/React.createElement(Option, {
    key: "M"
  }, "\u041C\u0435\u0441\u044F\u0446\u044B"), /*#__PURE__*/React.createElement(Option, {
    key: "RM"
  }, "\u041E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u043C\u0435\u0441\u044F\u0446\u044B"), /*#__PURE__*/React.createElement(Option, {
    key: "RD"
  }, "\u041E\u0442\u043D\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0435 \u0434\u043D\u0438")), regime === 'D' ? /*#__PURE__*/React.createElement(RangePicker, {
    format: dateFormat,
    value: !value ? undefined : value.value,
    onChange: value => localOnChange(value)
  }) : regime === 'M' ? /*#__PURE__*/React.createElement(RangePicker, {
    format: monthFormat,
    value: !value ? undefined : value.value,
    onChange: value => localOnChange(value),
    picker: "month"
  }) : regime === 'RM' ? /*#__PURE__*/React.createElement(Space, null, "\u041E\u0442", /*#__PURE__*/React.createElement(InputNumber, {
    min: -12,
    max: 12,
    value: !value || !value.value ? undefined : value.value[0],
    onChange: newValue => localOnChange([newValue, ((value || {}).value || [])[1]])
  }), "\u0414\u043E", /*#__PURE__*/React.createElement(InputNumber, {
    min: -12,
    max: 12,
    value: !value || !value.value ? undefined : value.value[1],
    onChange: newValue => localOnChange([((value || {}).value || [])[0], newValue])
  })) : regime === 'RD' ? /*#__PURE__*/React.createElement(Space, null, "\u041E\u0442", /*#__PURE__*/React.createElement(InputNumber, {
    min: -30,
    max: 30,
    value: value,
    onChange: onChange
  }), "\u0414\u043E", /*#__PURE__*/React.createElement(InputNumber, {
    min: -30,
    max: 30,
    value: value,
    onChange: onChange
  })) : null);
}