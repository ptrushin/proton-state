import React, { useState } from 'react';
import { Select, DatePicker, Space, InputNumber } from 'antd';
import moment from 'moment'

const { Option } = Select;
const { RangePicker } = DatePicker;

const dateFormat = 'DD/MM/YYYY';

export default function FilterDate2(props) {
    let { value, onChange } = props;
    let type0 = !value || !value.type ? null : value.type[0];
    let type1 = !value || !value.type ? null : value.type[1];
    const [regime, setRegime] = useState(type0 || 'I');
    const [regime1, setRegime1] = useState(type1 || 'M');
    const localOnChange = (value, regime1) => {
        if (regime1) setRegime1(regime1);
        if (!value) onChange(undefined)
        else onChange({ type: `${regime}${regime !== 'I' && regime1 ? regime1 : ''}`, value });
    }
    return <Space direction="vertical" style={{ width: '100%' }}>
        <Select value={regime} onChange={(value) => { localOnChange(undefined); setRegime(value); }} style={{ width: '100%' }}>
            <Option key="I">Интервал дат</Option>
            <Option key="P">За последние ...</Option>
            <Option key="N">В течение следующих ...</Option>
        </Select>
        {regime === 'P'
            ? <Space>
                <InputNumber value={!value || !value.value ? undefined : value.value}
                    onChange={(newValue) => localOnChange(newValue, regime1)}
                />
                <Select value={regime1} onChange={(regime) => { localOnChange(value.value, regime); }} style={{ width: '100px' }}>
                    <Option key="D">дней</Option>
                    <Option key="M">месяцев</Option>
                </Select>
            </Space>
            : regime === 'N'
                ? <Space>
                    <InputNumber value={!value || !value.value ? undefined : value.value}
                        onChange={(newValue) => localOnChange(newValue, regime1)}
                    />
                    <Select value={regime1} onChange={(regime) => { localOnChange(value.value, regime); }} style={{ width: '100px' }}>
                        <Option key="D">дней</Option>
                        <Option key="M">месяцев</Option>
                    </Select>
                </Space>
                : <RangePicker
                    format={dateFormat}
                    value={!value ? undefined : value.value}
                    onChange={(value) => localOnChange(value)} />
        }
    </Space>;
}

export const date2Def = {
    component: FilterDate2,
    dataSources: {
        odata: {
            filter: ({ filterDef, value }) => {
                if (!value) return undefined;
                let from = !value.value
                    ? undefined
                    : value.type === 'I'
                        ? moment(value.value[0])
                        : value.type === 'PM'
                            ? moment(moment.now()).add(-value.value, 'M')
                            : value.type === 'PD'
                                ? moment(moment.now()).add(-value.value, 'D')
                                : (value.type === 'NM' || value.type === 'ND')
                                    ? moment(moment.now())
                                    : undefined;
                let till = !value.value
                    ? undefined
                    : value.type === 'I'
                        ? moment(value.value[1])
                        : value.type === 'NM'
                            ? moment(moment.now()).add(value.value, 'M')
                            : value.type === 'ND'
                                ? moment(moment.now()).add(value.value, 'D')
                                : (value.type === 'PM' || value.type === 'PD')
                                    ? moment(moment.now())
                                    : undefined;

                let filters = [];
                if (from) filters.push(`${filterDef.fieldName} ge ${from.format('YYYY-MM-DD')}T00:00:00Z`)
                if (till) filters.push(`${filterDef.fieldName} lt ${till.add(1, 'D').format('YYYY-MM-DD')}T00:00:00Z`)
                return filters.join(' and ');
                //`Requirement/InvolvementDate lt ${moment(moment.now()).add(key, 'M').format('YYYY-MM-DD')}T00:00:00Z`,
            }
        }
    },
    template: ({ filterDef, value }) => {
        if (!value) return undefined;
        let template = !value.value
            ? undefined
            : value.type === 'I'
                ? `${value.value[0] ? `от ${moment(value.value[0]).format('DD.MM.YYYY')} ` : ''}${value.value[1] ? `до ${moment(value.value[1]).format('DD.MM.YYYY')}` : ''}`
                : (value.type === 'PM' || value.type === 'PD')
                    ? `за последние ${value.value} ${value.type === 'PM' ? 'месяцев' : 'дней'}`
                    : (value.type === 'NM' || value.type === 'ND')
                        ? `в течение следующих ${value.value} ${value.type === 'NM' ? 'месяцев' : 'дней'}`
                        : undefined;
        return `${filterDef.title} ${template}`
    },
    serialize: ({ filterDef, value }) => !value ? undefined : JSON.stringify(value),
    deserialize: ({ filterDef, value }) => {
        if (!value) return undefined;
        return JSON.parse(value);
    }
}