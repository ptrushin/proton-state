import React from 'react';
import { Route, BrowserRouter } from 'react-router-dom'
import AntExample from './examples/AntExample'
import { ConfigProvider } from 'antd';
import locale from 'antd/es/locale/ru_RU';
import 'moment/locale/ru';
import 'antd/dist/antd.css';

function App() {
    return <BrowserRouter>
        <ConfigProvider locale={locale}>
            <Route exact path='/' render={(props) => <AntExample {...props} />} />
            <Route path='/AntExample' render={(props) => <AntExample {...props} />} />
        </ConfigProvider>
    </BrowserRouter>
}
export default App;