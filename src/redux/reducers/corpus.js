import { LIST_LANGUAGES, PICK_LANGUAGE } from './../actiontypes'
import { listLanguages } from './../actions'

export default function corpusReducer(state = {}, action) {

    const { type, ...corpus} = action;

    switch(type) {
        case PICK_LANGUAGE: {
            return { ...state, ...corpus }
        }
        default:
            return state
    }

    return state;

}
