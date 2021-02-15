import moment from 'moment';
import FilterDate from './FilterDate'
import FilterSelect from './FilterSelect'

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
                    let from = !value.value[0]
                        ? undefined
                        : value.type === 'D'
                            ? moment(value.value[0])
                            : value.type === 'M'
                                ? moment(value.value[0]).startOf('month')
                                : value.type === 'RM'
                                    ? moment(moment.now()).add(value.value[0], 'M')
                                    : value.type === 'RD'
                                        ? moment(moment.now()).add(value.value[0], 'D')
                                        : undefined;

                    let till = !value.value[1]
                        ? undefined
                        : value.type === 'D'
                            ? moment(value.value[1])
                            : value.type === 'M'
                                ? moment(value.value[1]).endOf('month')
                                : value.type === 'RM'
                                    ? moment(moment.now()).add(value.value[1], 'M')
                                    : value.type === 'RD'
                                        ? moment(moment.now()).add(value.value[1], 'D')
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
            let from = !value.value[0]
                ? undefined
                : value.type === 'D'
                    ? moment(value.value[0]).format(dateFormat)
                    : value.type === 'M'
                        ? moment(value.value[0]).format(monthFormat)
                        : value.type === 'RM'
                            ? `${value.value[0]} ${localeText.FilterDate.monthsShort}`
                            : value.type === 'RD'
                                ? `${value.value[0]} ${localeText.FilterDate.daysShort}`
                                : undefined;

            let till = !value.value[1]
                ? undefined
                : value.type === 'D'
                    ? moment(value.value[1]).format(dateFormat)
                    : value.type === 'M'
                        ? moment(value.value[1]).format(monthFormat)
                        : value.type === 'RM'
                            ? `${value.value[1]} ${localeText.FilterDate.monthsShort}`
                            : value.type === 'RD'
                                ? `${value.value[1]} ${localeText.FilterDate.daysShort}`
                                : undefined;

            return `${filterDef.title}${from ? ` ${localeText.FilterDate.from} ${from}` : ''}${till ? ` ${localeText.FilterDate.till} ${till}` : ''}`
        },
        serialize: ({ filterDef, value }) => !value ? undefined : JSON.stringify([value.type, value.value[0], value.value[1]]),
        deserialize: ({ filterDef, value }) => {
            if (!value) return undefined;
            let pars = JSON.parse(value);
            return {
                type: pars[0],
                value: [pars[1], pars[2]]
            }
        },
    }
}