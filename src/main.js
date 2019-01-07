import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import TopBar from './layout/topbar'
import ActionMenu from './layout/actionmenu'
import CorpusMenu from './layout/corpusmenu'
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
                <ActionMenu />
                <CorpusMenu {...this.props} />
            </main>
        )
    }

}
