import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import TopBar from './layout/topbar'
import ActionMenu from './layout/actionmenu'
import CorpusMenu from './layout/corpusmenu'
import corpusReducer from  './redux/reducers/corpus'



export default class Main extends Component{

    state = {
    
        corpus : {
            name: "pest_inter",
            available_languages: ["fi", "ru", "en", "sv", "fr"],
            active_language: "fi",
            picked_codes: []
        }
    
    }

    constructor(props){
        super(props);
        //this.state = props.store.getState(this.state)
    }

    componentDidMount() {

        const { store } = this.props
        this.unsubscribe = store.subscribe( () => {
            this.setState({ ...store.getState() })
        })
    
    }

    componentWillUnmount ( ) {
        this.unsubscribe()
    }

    render() {
        console.log(this.state.corpus.name)
        return (
            <main>
                <TopBar store={this.props.store} />  
                <ActionMenu 
                />
                <CorpusMenu 
                    corpusname={this.state.corpus.name}
                />
            </main>
        )
    }

}
