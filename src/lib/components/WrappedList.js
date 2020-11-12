import React from 'react';

export default function WrappedList(props) {
    let { list, separator, length, template } = props;

    if (!list || list.length === 0) return null;

    if (!separator) separator = ", ";
    if (!template) template = "{list}...[{length}]"
    let listLength = list.length;
    if (!length) length = listLength;

    let listStr = null;
    let str = null;
    let listAllStr = null;
    
    if (listLength > length) {
        listStr = list.slice(0, length).join(separator);
        listAllStr = list.join(separator);
        str = template.replaceAll("{list}", listStr).replaceAll("{length}", listLength);
    } else {
        str = list.join(separator);
    }

    if (listLength > length) list = list

    return <span title={listAllStr}>{str}</span>;
}