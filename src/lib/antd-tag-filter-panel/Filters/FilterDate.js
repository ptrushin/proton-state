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
            <Option key="D">Даты</Option>
            <Option key="M">Месяцы</Option>
            <Option key="RM">Относительные месяцы</Option>
            <Option key="RD">Относительные дни</Option>
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
                        От
                        <InputNumber min={-12} max={12}
                            value={!value || !value.value ? undefined : value.value[0]}
                            onChange={(newValue) => localOnChange([newValue, ((value || {}).value || [])[1]])}
                        />
                        До
                        <InputNumber min={-12} max={12}
                            value={!value || !value.value ? undefined : value.value[1]}
                            onChange={(newValue) => localOnChange([((value || {}).value || [])[0], newValue])}
                        />
                    </Space>
                    : regime === 'RD'
                        ? <Space>
                            От
                            <InputNumber min={-30} max={30} value={value} onChange={onChange} />
                            До
                            <InputNumber min={-30} max={30} value={value} onChange={onChange} />
                        </Space>
                        : null}
    </Space>;
}