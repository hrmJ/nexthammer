
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
is needed for combining the js and converting sass files to css.

1. Install `node` and `npm`
2. run `npm install` in the nexthammer folder

Installing using an lxc container (with a texthammer database dump)
--------------------------------------------------------------------

`TODO: make a shell script for all this...`

First, clone this repository to your desired location. (`git clone https://github.com/hrmJ/nexthammer.git`)

It is recommended to clone the repository inside a project folder (e.g.
`nexthammer/nexthammer`) so that you can put to `congig.ini` file (cf. above)
in the parent folder.


### Set up the container

The following assumes you're working on a linux distro supporting [lxc
containers](https://linuxcontainers.org/).

1. Set up a container with ubuntu 18.04: `sudo lxc-create -t download -n nexthammer`
    - answer to the questions about distro, release and architecture: ubuntu, bionic, amd64

2. Mount the actual project folder (where you cloned the repo) to the container:

Edit `/var/lib/lxc/nexthammer/config` (you need sudo powers) by adding the following line:

```
lxc.mount.entry = /path/to/nexthammer/ /var/lib/lxc/nexthammer/rootfs/opt/nexthammer/  none bind 0 0
```

5. Start the container by running `sudo lxc-start -n nexthammer`. Attach the
   container by running `sudo lxc-attach -n nexthammer`.

### Install the necessary software on the container

1. Install nginx, php, nodejs, npm, composer and postgresql on the container

```
apt update
apt install nginx php7.2-fpm nodejs npm postgresql php7.2-common php7.2-cli
```

PLus some php extensions not installed by default:

```
apt install php7.2-mbstring php7.2-xml php7.2-pgsql
```

### Set up postgresql in the container


First, lets fix possible issues with locales

Run these as the container root:

```
locale-gen en_US
locale-gen en_US.UTF-8
locale-gen de_DE
locale-gen de_DE.UTF-8
locale-gen fi_FI
locale-gen fi_FI.UTF-8
locale-gen fr_FR
locale-gen fr_FR.UTF-8
locale-gen ru_RU
locale-gen ru_RU.UTF-8
locale-gen sv_SE
locale-gen sv_SE.UTF-8
update-locale
```

Restart the container.


Now switch to the user postgres (`su postgres`). Create the database: `pg_create DB_NAME`

Start psql and run:


```
CREATE COLLATION "en_US" (LOCALE = "en_US.utf8");
CREATE COLLATION "fi_FI" (LOCALE = "fi_FI.utf8");
CREATE COLLATION "de_DE" (LOCALE = "fi_FI.utf8");
CREATE COLLATION "fr_FR" (LOCALE = "fi_FI.utf8");
CREATE COLLATION "fi_FI" (LOCALE = "fi_FI.utf8");
CREATE COLLATION "ru_RU" (LOCALE = "fi_FI.utf8");
CREATE COLLATION "sv_SE" (LOCALE = "fi_FI.utf8");
```

Restore the texthammer database dump: 

```
psql DB_NAME
\i DUMP_NAME.sql
```

Give the test user all the needed privileges:

```
CREATE USER tester WITH PASSWORD 'test_password';
GRANT ALL PRIVILEGES ON DATABASE "pest_inter" to tester;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tester;
```

Create the dbmain database and give the user privileges (TODO: more restricted):

```
su postgres
db_create dbmain

psql dbmain
CREATE TABLE topicwords_stopwords (
    lemma VARCHAR (300)
);

GRANT ALL PRIVILEGES ON DATABASE "dbmain" to tester;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tester;
```


### Set up developer tools

First SASS:

```

apt install ruby2.5 ruby2.5-dev
gem install sass
```

Then gulp + babel + webpack:


```
npm install gulp-cli -g
npm install --save-dev gulp-babel @babel/core @babel/preset-env
npm i -D webpack webpack-dev-server webpack-cli
npm i --save-dev style-loader css-loader
npm i --save-dev extract-text-webpack-plugin@next
npm i --save-dev sass-loader
npm i --save-dev uglifyjs-webpack-plugin
npm i --save-dev html-webpack-plugin
```


Now, go to the project folder (`opt/nexthammer/nexthammer`) and run `npm install --save-dev`.

Composer and phpunit

```
apt install composer
apt install phpunit
composer install
composer update
```

Finally, run the php tests (in the nexthammer folder):


```
phpunit --config=phpunit.xml
```



### Set up nginx and networking

1. check out the ip address of the container by running `sudo lxc-info -n nexthammer`
2. enter the ip address in your browser to make sure nginx is working and you can access the container
3. Go to `/etc/nginx/sites-available/` and create a file  called `nexthammer.test`
4. The file should have the following content (make sure the php version matches with what you installed)

``` 

server {
    listen 80;
    listen 443 ssl http2;
    server_name nexthammer.test;
    root "/opt/nexthammer/nexthammer";

    index index.html index.htm index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    access_log off;
    error_log  /var/log/nginx/nexthammer.test-error.log error;

    sendfile off;

    client_max_body_size 100m;

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;

        fastcgi_intercept_errors off;
        fastcgi_buffer_size 16k;
        fastcgi_buffers 4 16k;
        fastcgi_connect_timeout 300;
        fastcgi_send_timeout 300;
        fastcgi_read_timeout 300;
    }

    location ~ /\.ht {
        deny all;
    }

    #ssl_certificate     /etc/nginx/ssl/nexthammer.test.crt;
    #ssl_certificate_key /etc/nginx/ssl/nexthammer.test.key;
}

``` 

5. (re)Start nginx service and php `service ngingx restart && service php7.2-fpm restart`
6. edit /etc/hosts on the host computer (not the container) and combine the
   container's ip address with `nexthammer.test`   like this (append the line
   to the file):

```
10.0.3.121 nexthammer.test
```

7. Enter nexthammer.test in the browser and you should be good to go.


