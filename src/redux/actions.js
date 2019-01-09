import { LIST_LANGUAGES, PICK_LANGUAGE, FREQUENCYLIST_REQUEST } from './actiontypes';

//TODO: separate dev and prod modes
const api_url = "http://nexthammer.test/ap1/v1"


export function listLanguages(langs){

    return {
        type: LIST_LANGUAGES,
        languages: ["t1", "t2"]
        } 

} 


/**
 *
 * Sets the active in the current corpus.
 *
 */
export function pickLanguage(language){

    return {
        type: PICK_LANGUAGE,
        active_language: language
    } 

} 

/**
 *
 * Starts a request for a frequency list
 *
 * @return a function with one argument
 *
 */
export function fetchFreqlist(task, corpus) {

    return {
        type: FREQUENCYLIST_REQUEST,
        tasktype: task.type
    } 
    //return (dispatch) => {
    //     dispatch({type: FREQUENCYLIST_REQUEST})
    //     return fetch(api_url + "cororpa/action/")
    //}

} 

//    return {
//        type: FREQUENCYLIST_REQUEST,
//        active_language: language
//    } 
//
//} 
