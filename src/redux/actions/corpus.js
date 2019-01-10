import { LIST_LANGUAGES, PICK_LANGUAGE} from '../actiontypes';

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
