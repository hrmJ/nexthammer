import { LIST_LANGUAGES, PICK_LANGUAGE } from './actiontypes';

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
