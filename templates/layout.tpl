<!DOCTYPE html>
<html>
<head>
<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<meta name='viewport' content='width=device-width, initial-scale=1'>
<link href="css/main.css" rel="stylesheet" type="text/css">
<link href="../js_libraries/jquery-ui-1.12.1.custom/jquery-ui.min.css" rel="stylesheet" type="text/css">
<script src="../js_libraries/jquery-3.2.1.min.js"></script>
<script src="../js_libraries/jquery-ui-1.12.1.custom/jquery-ui.min.js"></script>
<script src="js/build/main.js"></script>
</head>
<body>

<div class='container'>

    <nav>
        <ul>
            <li class="corpus_select"></li>
            <li class="lang_select"></li>
            <li class="current_subcorpus"><a href="javascript:void(0)">Current subcorpus: <span class='texts_picked'>0</span> texts</a></li>
            <li class="menucontainer select_action"><button>Select action</button></li>
        </ul>
    </nav>

    <div class='menubelow' id="corpusaction">
         <h2>Actions available for this (sub)corpus:</h2>
        <ul>
            <li><a class='ExamineTopics DisplayTexts' href='javascript:void(0);'>Examine topics in individual texts of the selected subcorpus</a></li>
        </ul>
    </div>
    
    <main>
            <div class='my-lightbox text_examiner data_picker'>
                 <a class="boxclose"></a>
                <div id="texts_to_examine"></div>
            </div>

            <div class='my-lightbox textpicker data_picker'>
                 <a class="boxclose"></a>
                <h2>Pick the current subcorpus (currently selected: <span class='texts_picked'>0</span> texts)</h2>
                <div id="text_picker_for_sobcorpus"></div>
            </div>

            [@maincontent]

    </main>

</div>


</body>

</html>
