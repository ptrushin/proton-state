import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd';
import locale from 'antd/es/locale/en_US'
//import locale from 'antd/es/locale/ru_RU';
//import 'moment/locale/ru';
import 'antd/dist/antd.css';
import AgGridExample from './examples/AgGridExample'

function App() {
    return <BrowserRouter>
        <ConfigProvider locale={locale}>
            <Route exact path='/' render={(props) => <AgGridExample {...props} />} />
            <Route path='/AgGridExample' render={(props) => <AgGridExample {...props} />} />
        </ConfigProvider>
    </BrowserRouter>
}
export default App;