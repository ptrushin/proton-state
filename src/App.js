import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd';
import locale from 'antd/es/locale/en_US'
import AgGridExample from './examples/AgGridExample'
import AntdTableExample from './examples/AntdTableExample'

function App() {
    return <BrowserRouter>
        <ConfigProvider locale={locale}>
            <Route exact path='/' render={(props) => <AgGridExample {...props} />} />
            <Route path='/AgGridExample' render={(props) => <AgGridExample {...props} />} />
            <Route path='/AntdTableExample' render={(props) => <AntdTableExample {...props} />} />
        </ConfigProvider>
    </BrowserRouter>
}
export default App;