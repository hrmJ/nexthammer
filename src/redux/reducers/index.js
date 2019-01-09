import corpusReducer from './corpus'
import taskReducer from './task'
import { combineReducers } from 'redux'

const appReducer = combineReducers({
        corpus: corpusReducer,
        task: taskReducer,
})

export default appReducer
