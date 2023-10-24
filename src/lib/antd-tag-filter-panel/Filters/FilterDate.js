import React, { useState } from 'react';
import { Select, DatePicker, Space, InputNumber } from 'antd';
import dayjs from "dayjs";

const { Option } = Select;
const { RangePicker } = DatePicker;

const dateFormat = 'DD/MM/YYYY';
const monthFormat = 'MM/YYYY';

export default function FilterDate(props) {
    let { value, onChange } = props;
    const [regime, setRegime] = useState((value || {}).type || 'D');
    const localOnChange = (value) => {
        if (!value || (!value[0] && !value[1])) onChange(undefined)
        else onChange({type: regime, from: value[0], till: value[1]});
    }
    const localGetValue = () => {
        return !value ? value : [value.from, value.till];
    }
    return <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={regime} onChange={(value) => {localOnChange(undefined); setRegime(value);}} style={{ width: '100%' }}>
            <Option key="D">{props.localeText.FilterDate.Dates}</Option>
            <Option key="M">{props.localeText.FilterDate.Months}</Option>
            <Option key="RM">{props.localeText.FilterDate.Relative_months}</Option>
            <Option key="RD">{props.localeText.FilterDate.Relative_days}</Option>
        </Select>
        {regime === 'D'
            ? <RangePicker
                format={dateFormat}
                value={localGetValue()}
                onChange={(value) => localOnChange(value)}
            />
            : regime === 'M'
                ? <RangePicker
                    format={monthFormat}
                    value={localGetValue()}
                    onChange={(value) => localOnChange(value)}
                    picker="month"
                />
                : regime === 'RM'
                    ? <Space>
                        {props.localeText.FilterDate.From}
                        <InputNumber min={-12} max={12}
                            value={!value || !value.value ? undefined : value.value[0]}
                            onChange={(newValue) => localOnChange([newValue, ((value || {}).value || [])[1]])}
                        />
                        {props.localeText.FilterDate.Till}
                        <InputNumber min={-12} max={12}
                            value={!value || !value.value ? undefined : value.value[1]}
                            onChange={(newValue) => localOnChange([((value || {}).value || [])[0], newValue])}
                        />
                    </Space>
                    : regime === 'RD'
                        ? <Space>
                            {props.localeText.FilterDate.From}
                            <InputNumber min={-30} max={30} value={value} onChange={onChange} />
                            {props.localeText.FilterDate.Till}
                            <InputNumber min={-30} max={30} value={value} onChange={onChange} />
                        </Space>
                        : null}
    </Space>;
}