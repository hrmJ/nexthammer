
Nexthammer - a corpus front end
================================


This project was branched from Tampere university corpustools (aka TACT aka
Texthammer) and is an attempt to modernize the look of the project as well 
as to take advantage of AJAX and other more up-to-date ways to build wep applications
(the original texthammer interface can be accessed through [this link](https://puolukka.uta.fi/~texthammer/corpustools))

To try the project, you can check out [the test version at University of Tampere](https://puolukka.uta.fi/nexthammer).


Installing: a quick guide
==========================

Just for serving
-----------------

1. Clone the repository: `git clone https://github.com/hrmJ/nexthammer.git`
2. Create a `config.ini` file with the following information:
```
un = tester
pw = test_password
```
3. Place the config.ini file at one level above the nexthammer folder
4. Install [composer](https://getcomposer.org/) for managing php namespaces and
   packages (e.g. from the repositories if running Ubuntu: `sudo apt install composer` )
5. run `composer du` in the nexthammer folder to create an autoload file 

For develpoment
---------------

In addition to the steps in the previous section [gulp.js](https://gulpjs.com/)
is needed to combining the js and converting sass files to css.

1. Install `node` and `npm`
2. run `npm install` in the nexthammer folder


TODO
====

- containerized installation
- A more elaborate README is on the way.
