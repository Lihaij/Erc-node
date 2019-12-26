Installation
------------
You should have a docker environment. Then everything will be done. :)
got docker from https://www.docker.com

# install oracle-client
# tar -xzvf instantclient_12_2.tar.gz
# mv instantclient_12_2 to ~
# add blew to .bash_profile
# export OCI_HOME=/Users/huliqun/instantclient_12_2
# export OCI_LIB_DIR=$OCI_HOME
# export OCI_INC_DIR=$OCI_HOME/sdk/include
# export OCI_VERSION=11
# export NLS_LANG=AMERICAN_AMERICA.UTF8
# export DYLD_LIBRARY_PATH=$OCI_LIB_DIR

Usage
-----
1.1st time init the project<br/>
bash init.sh<br/>
#mysql port 33306<br/>
#redis port 6379<br/>

2. When you reboot your computer. boot the database with docker<br/>
bash boot.sh<br/>

3. Start the server. <br/>
brew install wkhtmltopdf <br/>
brew install imagemagick
brew install graphicsmagick
npm run start <br/>
Start the web. <br/>
npm run dev <br/>

#for webstorm <br/>
#please add export NODE_ENV=test to .bash_profile
#run the project with local node
-----
http://localhost you will have the web home.
