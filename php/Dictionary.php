<?php


namespace Texthammer;

/**
 *
 * A simple interface for getting rough translations to words
 * using third-party data.
 *
 *
 * @param Array $target_langs array of target languages, specified as two-character codes (fi, sv, fr...)
 * @param string $wiktionary_url the url for wiktionary api. Includes everything but the language code in the end
 * @param Array $translations an array containing the possible translations
 *
 **/
class Dictionary{

    private $wiktionary_url = "https://en.wiktionary.org/w/api.php?action=query&prop=iwlinks&format=json&titles=NONE&iwprefix=";
    //TODO: iwlinks?
    private $target_langs = [];
    private $translations = [];

    /**
     *
     * Sets up a starting word, from which we will start translating
     *
     * @param $start_word the lemma of the word we will start with
     *
     */
    public function SetStartWord($start_word){
        $this->wiktionary_url = preg_replace("/titles=[^&]+/i",
            "titles=$start_word",
            $this->wiktionary_url);
        return $this;
    }

    /**
     *
     * Sets the langs to which we'll translate
     *
     * @param Array $target_langs an array of the languages
     *
     */
    public function SetTargetLangs($target_langs){
        $this->target_langs = $target_langs;
        return $this;
    }

    /**
     *
     * Adds another target language
     *
     */
    public function AddTargetLang($target_lang){
    }


    /**
     *
     * Translates to all the specified languages and saves the result in $translations
     *
     */
    public function Translate(){
        foreach($this->target_langs as $lang){
            $json = file_get_contents($this->wiktionary_url . $lang);
            $obj = json_decode($json);
            $p = $obj->query->pages;
            $this->translations[$lang] = Array();
            foreach($p as $sp){
                foreach($sp->iwlinks as $entry){
                    $prop = "*";
                    $this->translations[$lang][] =  $entry->$prop;
                }
                break;
            }
        }
    }

    /**
     *
     * Gets the translations to a specific language
     *
     * @param $lang the language to translate into
     *
     **/
    public function GetTranslationsForLanguage($lang){
    
        return $this->translations[$lang];
    }

    /**
     *
     * Gets all the translations 
     *
     *
     **/
    public function GetAllTranslations(){
        return $this->translations;
    }



}



?>
