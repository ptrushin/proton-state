import FilterDate from './FilterDate'
import FilterSelect from './FilterSelect'
import dayjs from 'dayjs';

const dateFormat = 'DD/MM/YYYY';
const monthFormat = 'MM/YYYY';

export let defaultFilterTypes = {
    select: {
        component: FilterSelect,
        dataSources: {
            odata: {
                filter: ({ filterDef, value }) => {
                    let quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;
                    if (!value) return undefined;
                    const parts = [];
                    if (Array.isArray(value.s) && value.s.length > 0) parts.push(`(${value.s.map(v => `${filterDef.fieldName} eq ${quoted(v, filterDef.keyType)}`).join(" or ")})`)
                    if (value.n) parts.push(`${filterDef.fieldName} eq null`)
                    return '(' + parts.join(' or ') + ')';
                },
                init: ({ filterDef, value, callback }) => {
                    filterDef.dataSource.instance.searchByKeys({
                        value: (value || {}).s, 
                        callback: json => callback({options: json.value}),
                        dataSource: filterDef.dataSource,
                        option: filterDef.option,
                        keyType: filterDef.keyType,
                        onlyUnique: filterDef.onlyUnique
                    })
                },
            }
        },
        template: ({ filterDef, value, valueProps }) => {
            return `${filterDef.title} = ${!valueProps || !valueProps.options
                ? null
                : Array.isArray(valueProps.options)
                    ? valueProps.options.map(e => filterDef.option.labelFunc ? filterDef.option.labelFunc({value: e}) : e[filterDef.option.label]).join(', ')
                    : filterDef.option.labelFunc ? filterDef.option.labelFunc({value: valueProps.options}) : valueProps.options[filterDef.option.label]}`
        },
        serialize: ({ filterDef, value }) => filterDef.hasNull ? JSON.stringify(value) : JSON.stringify((value || {}).s),
        deserialize: ({ filterDef, value }) => {
            const json = JSON.parse(value);
            return Array.isArray(json) ? {s: json} : json;
        }
    },
    date: {
        component: FilterDate,
        dataSources: {
            odata: {
                filter: ({ filterDef, value }) => {
                    if (!value) return undefined;
                    let from = !value.from
                        ? undefined
                        : value.type === 'D'
                            ? dayjs(value.from)
                            : value.type === 'M'
                                ? dayjs(value.from).startOf('month')
                                : value.type === 'RM'
                                    ? dayjs().add(value.from, 'M')
                                    : value.type === 'RD'
                                        ? dayjs().add(value.from, 'D')
                                        : undefined;

                    let till = !value.till
                        ? undefined
                        : value.type === 'D'
                            ? dayjs(value.till)
                            : value.type === 'M'
                                ? dayjs(value.till).endOf('month')
                                : value.type === 'RM'
                                    ? dayjs().add(value.till, 'M')
                                    : value.type === 'RD'
                                        ? dayjs().add(value.till, 'D')
                                        : undefined;

                    let filters = [];
                    if (from) filters.push(`${filterDef.fieldName} ge ${from.format('YYYY-MM-DD')}T00:00:00Z`)
                    if (till) filters.push(`${filterDef.fieldName} lt ${till.add(1, 'D').format('YYYY-MM-DD')}T00:00:00Z`)
                    return filters.join(' and ');
                }
            }
        },
        template: ({ filterDef, value, localeText }) => {
            if (!value) return undefined;
            let from = !value.from
                ? undefined
                : value.type === 'D'
                    ? value.from.format(dateFormat)
                    : value.type === 'M'
                        ? value.from.format(monthFormat)
                        : value.type === 'RM'
                            ? `${value.from} ${localeText.FilterDate.monthsShort}`
                            : value.type === 'RD'
                                ? `${value.from} ${localeText.FilterDate.daysShort}`
                                : undefined;

            let till = !value.till
                ? undefined
                : value.type === 'D'
                    ? value.till.format(dateFormat)
                    : value.type === 'M'
                        ? value.till.format(monthFormat)
                        : value.type === 'RM'
                            ? `${value.till} ${localeText.FilterDate.monthsShort}`
                            : value.type === 'RD'
                                ? `${value.till} ${localeText.FilterDate.daysShort}`
                                : undefined;

            return `${filterDef.title}${from ? ` ${localeText.FilterDate.from} ${from}` : ''}${till ? ` ${localeText.FilterDate.till} ${till}` : ''}`
        },
        serialize: ({ filterDef, value }) => {
            return !value ? undefined : JSON.stringify({
                "ty": value.type, 
                "f": dayjs(value.from["$d"]).format(dateFormat), 
                "t": dayjs(value.till["$d"]).format(dateFormat)
            })
        },
        deserialize: ({ filterDef, value }) => {
            if (!value) return undefined;
            let pars = JSON.parse(value);
            let parsed = {
                type: pars.ty,
                from: dayjs(pars.f, dateFormat), 
                till: dayjs(pars.t, dateFormat)
            }
            return parsed;
        },
    }
}