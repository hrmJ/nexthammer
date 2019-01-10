import React from  'react'
import {pickLanguage} from '../redux/actions'

export default ( {corpus, dispatch}) => (

        <select onChange={ (ev) => dispatch(pickLanguage(ev.target.value))}>
                { 
                    corpus.available_languages.map((lang, id) => <option key={id}>{lang}</option>)
                }
        </select>
)


