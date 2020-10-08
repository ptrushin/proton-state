import moment from 'moment';

const dateFormat = 'DD/MM/YYYY';
const monthFormat = 'MM/YYYY';

export let defaultFilterTypes = {
    select: {
        dataSources: {
            odata: {
                filter: ({ filterDef, value }) => {
                    let quoted = (value, keyType) => keyType === 'string' ? `'${value}'` : value;
                    return !value
                        ? undefined
                        : Array.isArray(value)
                            ? `(${value.map(v => `${filterDef.odata.name} eq ${quoted(v, filterDef.odata.keyType)}`).join(" or ")})`
                            : `${filterDef.odata.name} eq ${quoted(value)}`
                }
            }
        },
        template: ({ filterDef, value, entity }) => !entity ? null : `${filterDef.title} = ${entity.map(e => e.Name).join(', ')}`,
        serialize: ({ filterDef, value }) => JSON.stringify(value),
        deserialize: ({ filterDef, value }) => JSON.parse(value),
    },
    date: {
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
                    if (from) filters.push(`${filterDef.odata.name} ge ${from.format('YYYY-MM-DD')}T00:00:00Z`)
                    if (till) filters.push(`${filterDef.odata.name} lt ${till.add(1, 'D').format('YYYY-MM-DD')}T00:00:00Z`)
                    return filters.join(' and ');
                    //`Requirement/InvolvementDate lt ${moment(moment.now()).add(key, 'M').format('YYYY-MM-DD')}T00:00:00Z`,
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
                            ? `${value.value[0]} мес.`
                            : value.type === 'RD'
                                ? `${value.value[0]} дн.`
                                : undefined;

            let till = !value.value[1]
                ? undefined
                : value.type === 'D'
                    ? moment(value.value[1]).format(dateFormat)
                    : value.type === 'M'
                        ? moment(value.value[1]).format(monthFormat)
                        : value.type === 'RM'
                            ? `${value.value[1]} мес.`
                            : value.type === 'RD'
                                ? `${value.value[1]} дн.`
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