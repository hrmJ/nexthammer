import React, {Component} from  'react'

export default class CorpusMenu extends Component {


    render(){
    

        return (
            <div>

                <h3> Corpusmenu </h3>

                Here you can choose the current corpus and define
                subcorpora

                <div><strong>Current corpus:</strong> <span>{this.props.corpusname}</span> </div>
            
            </div>
        )
    }

}
