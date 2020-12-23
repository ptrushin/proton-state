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

    setFromClipboard = async () => {
        console.log(window.clipboardData.getData('Text'));
        setTimeout(async()=>console.log(
            await window.navigator.clipboard.readText()), 3000)
        navigator.clipboard.readText()
            .then(text => {
                console.log('Pasted content: ', text);
            })
        //console.log(await navigator.clipboard.readText());
        const state = this.parse(await navigator.clipboard.readText());
        this.save({state: state})
    } 
}