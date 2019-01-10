import { FREQUENCYLIST_REQUEST } from '../actiontypes'
import api_url from './api_url'

/**
 *
 * A temporary fix?
 *
 */
function createCodes(codes){
    return "codes[]=" + codes.join("&codes[]=")
}


/**
 *
 * Starts a request for a frequency list
 *
 * @return a function with one argument
 *
 */
export function fetchFreqlist(task, corpus) {

    const {name, active_language, picked_codes} = corpus
    const url = `${api_url}/corpora/${name}/${active_language}/frequencylist/?${createCodes(picked_codes)}`
    fetch(url)
        .then(response => response.json())
        .then((myJson) => console.log(myJson))

    return {
        type: FREQUENCYLIST_REQUEST,
        tasktype: task.type
    } 

    //return (dispatch) => {
    //     dispatch({type: FREQUENCYLIST_REQUEST})
    //     return fetch(`${api_url}/cororpa/action/${corpus.name}/${corpus.active_language}/"`)
    //}

} 
