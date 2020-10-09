# proton-state

# examples
https://codesandbox.io/s/github/ptrushin/proton-state-examples

Try to play:
* Add filter Category - Address bar and Grid changed
* Add filter Product, it depends on Category
* Change filter on column OrderDate in Gird - Address bar and Grid changed
* Click with alt key on cell in column Quantity - all filtered by its value - Address bar and Grid changed
* Now you can copy address from address bar and open it in other tab - all filters applied

# install
npm install proton-state

# add to AgGrid

## in component ctor
```
this.protonState = new ProtonState(
            {
                history: props.history,
                onChange: this.onStateChange
            });
```

## in onGridReady AgGrid event

```
onGridReady = params => {
        this.protonState.addStateProvider(new AgGridStateProvider({api: params.api}))
```