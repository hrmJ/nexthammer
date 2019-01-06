import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import {createStore} from 'redux'
import TopBar from './layout/topbar.jsx'
import appReducer from  './redux/reducers/app'
import corpusReducer from  './redux/reducers/corpus'
import {pickLanguage} from './redux/actions'


//const store = createStore();
//
export default class Main extends Component{

    state = {
    
        corpus : {
            name: "pest_inter",
            available_languages: ["fi", "ru", "en", "sv", "fr"],
            active_language: "fi",
            picked_codes: []
        }
    
    }

    constructor(){
        super();
        //const newState = appReducer(this.state, pickLanguage("en"))
        let store = createStore(appReducer, this.state)
        const unsubscribe = store.subscribe(() => {
            console.log("STATE changed:", store.getState())
        })

        console.log(store.getState())
        store.dispatch(pickLanguage("en"))
    }

    render() {
        return (
            <main> <TopBar />  </main>
        )
    }

}
