export default class LocalStorageStoreProvider {
    constructor(props) {
        this.props = props;
        this.storageKey = this.props.storageKey;
    }

    save = (props) => {
        let { state } = props;
        localStorage.setItem(this.storageKey, JSON.stringify(state ? state : null));
    }

    load = (props) => {
        let stateStr = localStorage.getItem(this.storageKey);
        return !stateStr
            ? null 
            : JSON.parse(stateStr);
    }
}