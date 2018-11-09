//import '../assets/styles/styles.css';
import '../assets/styles/sass/main.scss';
import Loaders from './loaders';
import actions from './actions/events.js';
import Utilities from './utilities';
require("jquery-ui/ui/widgets/autocomplete");
require("jquery-ui/ui/widgets/draggable");
require("jquery-ui/ui/widgets/selectmenu");
require("jquery-ui/ui/widgets/slider");
require('jquery-ui/themes/base/all.css');

$(document).ready(() => {
    //Load the name of the corpus. When done, load the list of languages available
    Loaders.SetCurrentCorpus(Loaders.ListLanguagesInThisCorpus);
    actions.Initialize()
});
