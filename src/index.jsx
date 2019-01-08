import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import {createStore} from 'redux'
import appReducer from  './redux/reducers/app'
import {Provider} from 'react-redux'


const store = createStore(appReducer,
    {
        corpus : {
            name: "pest_inter",
            available_languages: ["fi", "ru", "en", "sv", "fr"],
            active_language: "fi",
            picked_codes: []
        }
    }
);

ReactDOM.render(
   <Provider store={store}> <App /> </Provider>, 
    document.getElementById('root'));
