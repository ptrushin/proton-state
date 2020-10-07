import React, { useState } from 'react';
import { Select, DatePicker, Space, InputNumber } from 'antd';

const { Option } = Select;
const { RangePicker } = DatePicker;

const dateFormat = 'DD/MM/YYYY';
const monthFormat = 'MM/YYYY';

export default function FilterDate(props) {
    let { value, onChange } = props;
    const [regime, setRegime] = useState((value || {}).type || 'D');
    const localOnChange = (value) => {
        if (!value || (!value[0] && !value[1])) onChange(undefined)
        else onChange({type: regime, value});
    }
    return <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={regime} onChange={(value) => {localOnChange(undefined); setRegime(value);}} style={{ width: '100%' }}>
            <Option key="D">{props.localeText.filterDate.dates}</Option>
            <Option key="M">{props.localeText.filterDate.months}</Option>
            <Option key="RM">{props.localeText.filterDate.relmonths}</Option>
            <Option key="RD">{props.localeText.filterDate.reldays}</Option>
        </Select>
        {regime === 'D'
            ? <RangePicker
                format={dateFormat}
                value={!value ? undefined : value.value}
                onChange={(value) => localOnChange(value)}
            />
            : regime === 'M'
                ? <RangePicker
                    format={monthFormat}
                    value={!value ? undefined : value.value}
                    onChange={(value) => localOnChange(value)}
                    picker="month"
                />
                : regime === 'RM'
                    ? <Space>
                        {props.localeText.filterDate.from}
                        <InputNumber min={-12} max={12}
                            value={!value || !value.value ? undefined : value.value[0]}
                            onChange={(newValue) => localOnChange([newValue, ((value || {}).value || [])[1]])}
                        />
                        {props.localeText.filterDate.till}
                        <InputNumber min={-12} max={12}
                            value={!value || !value.value ? undefined : value.value[1]}
                            onChange={(newValue) => localOnChange([((value || {}).value || [])[0], newValue])}
                        />
                    </Space>
                    : regime === 'RD'
                        ? <Space>
                            {props.localeText.filterDate.from}
                            <InputNumber min={-30} max={30} value={value} onChange={onChange} />
                            {props.localeText.filterDate.till}
                            <InputNumber min={-30} max={30} value={value} onChange={onChange} />
                        </Space>
                        : null}
    </Space>;
}