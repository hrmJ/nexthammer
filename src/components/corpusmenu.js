import React, {Component} from  'react'
import LanguagePicker from './languagepicker'

export default class CorpusMenu extends Component {

    render(){

        return (
            <div>

                <h3> Corpusmenu </h3>

                Here you can choose the current corpus and define
                subcorpora

                <div>
                    <strong>Current corpus:</strong> <span>{this.props.corpus.name}</span>
                </div>
                <div>
                    <LanguagePicker {...this.props} />
                </div>

            </div>
        )
    }

}
