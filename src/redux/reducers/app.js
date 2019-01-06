import corpusReducer from './corpus'

export default function(state = {}, action) {

    return {
        corpus: corpusReducer(state.corpus, action),
    }

}
