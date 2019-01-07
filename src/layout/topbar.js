import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {pickLanguage} from './../redux/actions'

export default class extends Component{


    pickLang(select) {
        console.log("Moro")
        console.log(ev)
        //this.props.store.dispatch(pickLanguage(this.))
    }

    render() {

        return (
            <nav>
                <span>Corpus</span>
                <span>Action</span>
            </nav>
        )

    
    }

}
