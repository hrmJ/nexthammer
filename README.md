
Nexthammer - a corpus front end
================================


This project was branched from Tampere university corpustools (aka TACT aka
Texthammer) and is an attempt to modernize the look of the project as well 
as to take advantage of AJAX and other more up-to-date ways to build wep applications
(the original texthammer interface can be accessed through [this link](https://puolukka.uta.fi/~texthammer/corpustools))

Installing: a quick guide
==========================

1. Clone the repository: `git clone https://github.com/hrmJ/nexthammer.git`
2. Create a `config.ini` file with the following information:
```
un = tester
pw = test_password
```
3. Place the config.ini file at one level above the nexthammer folder
4. Install [composer](https://getcomposer.org/) for managing php namespaces and
   packages (e.g. from the repositories if running Ubuntu: )
5. run `composer du` in the nexthammer folder to create an autoload file 

TODO
====

A more elaborate README is on the way.
