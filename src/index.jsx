import React from 'react'
import ReactDOM from 'react-dom'
import Main from './main'
import {createStore} from 'redux'
import appReducer from  './redux/reducers/app'

const store = createStore(appReducer);

ReactDOM.render(<Main store={store}/>, 
    document.getElementById('root'));

