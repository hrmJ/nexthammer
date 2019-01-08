import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import TopBar from './components/topbar'
import ActionMenu from './components/actionmenu'
import CorpusMenu from './components/corpusmenu'
import corpusReducer from  './redux/reducers/corpus'

import {createStore} from 'redux';

export default class Main extends Component{


    constructor(props){
        super(props);
        //this.state = props.store.getState(this.state)
    }

    componentDidMount() {

        //const { store } = this.props
        //this.unsubscribe = store.subscribe( () => {
        //    console.log("A change!");
        //    this.setState({ ...store.getState() })
        //})
    
    }

    componentWillUnmount ( ) {
        this.unsubscribe()
    }

    render() {

        return (
            <main>
            current lang: {this.props.corpus.active_language}
                <TopBar />  
                <CorpusMenu {...this.props} />
                <ActionMenu {...this.props} />
            </main>
        )
    }

}
