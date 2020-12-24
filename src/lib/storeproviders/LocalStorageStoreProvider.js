export default class LocalStorageStoreProvider {
    constructor(props) {
        this.props = props;
        this.storageKey = this.props.storageKey;
    }

    save = (props) => {
        if (!props) return;
        let { state } = props;
        localStorage.setItem(this.storageKey, JSON.stringify(state ? state : null));
    }

    load = (props) => {
        let stateStr = localStorage.getItem(this.storageKey);
        return !stateStr
            ? null
            : this.parse(stateStr);
    }

    parse = (str) => {
        try {
            return JSON.parse(str);
        } catch(e) {
            return null;
        }
    }

    clear = () => {
        this.save({state: null});
    }

    copyToClipboard = () => {
        const state = this.load();
        navigator.clipboard.writeText(JSON.stringify(state ? state : null));
    }

    setFromString = async (str) => {
        const state = this.parse(str);
        this.save({state: state})
    } 
}