var flvideoreplacerFirstrun = {

	init: function(){//get current version from extension manager

	    try {//Firefox <= 3.6
		var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager);
		var current = gExtensionManager.getItemForID("flvideoreplacer@lovinglinux.megabyet.net").version;
		flvideoreplacerFirstrun.updateInstall(current);
	    }
	    catch(e){//Firefox >=4.0
		Components.utils.import("resource://gre/modules/AddonManager.jsm");
		AddonManager.getAddonByID("flvideoreplacer@lovinglinux.megabyet.net", function(addon) {
		    var current = addon.version;
		    flvideoreplacerFirstrun.updateInstall(current);
		});
	    }
	    window.removeEventListener("load",function(){ flvideoreplacerFirstrun.init(); },true);
	},

	updateInstall: function(aVersion){//check version and perform updates

	    //get osString
	    var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
	    .getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService)
	    .getBranch("extensions.flvideoreplacer.");

	    //firstrun, update and current declarations
	    var ver = -1, firstrun = true, current = aVersion, dir;

	    try{//check for existing preferences
		ver = this.prefs.getCharPref("version");
		firstrun = this.prefs.getBoolPref("firstrun");
	    }catch(e){
		//nothing
	    }finally{

		if (firstrun){//actions specific for first installation

		    //add toolbar button
		    var navbar = document.getElementById("nav-bar");
		    var newset = navbar.currentSet + ",flvideoreplacer-toolbar-button";
		    navbar.currentSet = newset;
		    navbar.setAttribute("currentset", newset );
		    document.persist("nav-bar", "currentset");

		    //set preferences
		    this.prefs.setBoolPref("firstrun",false);
		    this.prefs.setCharPref("version",current);

		    //set default dir pref
		    var dir = this.prefs.getCharPref("downdir");
		    if(dir === ""){
			//set download dir
			var defaultdir = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("Desk", Components.interfaces.nsIFile);

			this.prefs.setCharPref("downdir",defaultdir.path);
		    }
		}

		if (ver!=current && !firstrun){//actions specific for extension updates

		    if(ver !== "2.0.3" && ver !== "2.0.2" && ver !== "2.0.1" && ver !== "2.0.0"){

			//add toolbar button
			var navbar = document.getElementById("nav-bar");
			var newset = navbar.currentSet + ",flvideoreplacer-toolbar-button";
			navbar.currentSet = newset;
			navbar.setAttribute("currentset", newset );
			document.persist("nav-bar", "currentset");

			//set default dir pref
			var dir = this.prefs.getCharPref("downdir");
			if(dir === ""){
			    //set download dir
			    var defaultdir = Components.classes["@mozilla.org/file/directory_service;1"]
			    .getService(Components.interfaces.nsIProperties)
			    .get("Desk", Components.interfaces.nsIFile);

			    this.prefs.setCharPref("downdir",defaultdir.path);
			}
			//reset method because of deleted prompt method
			this.prefs.setCharPref("method","embedded");
			this.prefs.setCharPref("promptmethod","embedded");
		    }
		    //set preferences
		    this.prefs.setCharPref("version",current);
		}

		//get prefs
		var enabled = this.prefs.getBoolPref("enabled");
		//toggle toolbar button style
		if(enabled === true){
		    document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbaractive");
		}else{
		    document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbarinactive");
		}
	    }
	},

	pluginCheck: function() {

	    //get osString
	    var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
	    .getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService)
	    .getBranch("extensions.flvideoreplacer.");

	    //reset plugin check
	    this.prefs.setBoolPref("pluginmp4",false);
	    this.prefs.setBoolPref("pluginflv",false);
	    this.prefs.setBoolPref("pluginqt",false);
	    this.prefs.setBoolPref("pluginwmp",false);
	    this.prefs.setBoolPref("pluginwmv",false);
	    this.prefs.setBoolPref("pluginmov",false);
	    this.prefs.setBoolPref("pluginm4v",false);
	    //get prefs
	    var pluginforce = this.prefs.getBoolPref("pluginforce");

	    //initiate file
	    var pluginreg = Components.classes["@mozilla.org/file/directory_service;1"]
	    .getService(Components.interfaces.nsIProperties)
	    .get("ProfD", Components.interfaces.nsIFile);
	    pluginreg.append("pluginreg.dat");

	    if(pluginreg.exists()){

		//disable forceplugin
		//this.prefs.setBoolPref("pluginforce",false);

		//read file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pluginreg, 0x01, 444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		var line = {}, lines = [], hasmore;
		do {
		    hasmore = istream.readLine(line);
		    lines.push(line.value);

		    //check plugins by mime-type
		    var pluginflv = /video.*x.*flv/.test(line.value);
		    if (pluginflv === true) {
			this.prefs.setBoolPref("pluginflv",true);
		    }
		    var pluginmp4 = /video.*mp4/.test(line.value);
		    if (pluginmp4 === true) {
			this.prefs.setBoolPref("pluginmp4",true);
		    }
		    var pluginm4v = /video.*x-m4v/.test(line.value);
		    if (pluginm4v === true) {
			this.prefs.setBoolPref("pluginm4v",true);
		    }
		    var pluginqt = /video.*quicktime/.test(line.value);
		    if (pluginqt === true) {
			this.prefs.setBoolPref("pluginqt",true);
		    }
		    var pluginmov = /video.*x-quicktime/.test(line.value);
		    if (pluginmov === true) {
			this.prefs.setBoolPref("pluginmov",true);
		    }
		    var pluginwmp = /application.*x-mplayer2/.test(line.value);
		    if (pluginwmp === true) {
			this.prefs.setBoolPref("pluginwmp",true);
		    }
		    var pluginwmv = /application.*x-ms-wmv/.test(line.value);
		    if (pluginwmv === true) {
			this.prefs.setBoolPref("pluginwmv",true);
		    }
		} while(hasmore);
		istream.close();

	    }else{
		if (pluginforce === true){
		    this.prefs.setBoolPref("pluginmp4",true);
		    this.prefs.setBoolPref("pluginflv",true);
		    this.prefs.setBoolPref("pluginqt",true);
		    this.prefs.setBoolPref("pluginwmp",true);
		    this.prefs.setBoolPref("pluginwmv",true);
		    this.prefs.setBoolPref("pluginmov",true);
		    this.prefs.setBoolPref("pluginm4v",true);
		}
	    }
	},

	playerCheck: function() {

	    //get osString
	    var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
	    .getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService)
	    .getBranch("extensions.flvideoreplacer.");

	    //reset plugin check
	    this.prefs.setBoolPref("playertotem",false);
	    this.prefs.setBoolPref("playergmplayer",false);
	    this.prefs.setBoolPref("playerkaffeine",false);
	    this.prefs.setBoolPref("playersmplayer",false);
	    this.prefs.setBoolPref("playerkmp",false);
	    this.prefs.setBoolPref("playerqt",false);
	    this.prefs.setBoolPref("playerbsp",false);
	    this.prefs.setBoolPref("playerwmp",false);
	    this.prefs.setBoolPref("playervlc",false);

	    //declare variables
	    var playerpath = this.prefs.getCharPref("playerpath");
	    var playerqt, playerwmp, playerkmp, playerbsp, playervlc, playertotem, playerkaffeine, playergmplayer, playersmplayer;

	    if(osString.match(/Windows/)){

		//initiate file
		playerkmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerkmp.initWithPath("C:\\Program Files\\The KMPlayer\\KMPlayer.exe");
		if(playerkmp.exists()){
		    this.prefs.setBoolPref("playerkmp",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerkmp.path);
		    }
		}
		//initiate file
		playerbsp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerbsp.initWithPath("C:\\Program Files\\Webteh\\BSPlayer\\bsplayer.exe");
		if(playerbsp.exists()){
		    this.prefs.setBoolPref("playerbsp",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerbsp.path);
		    }
		}	
		//initiate file
		playerwmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerwmp.initWithPath("C:\\Program Files\\Windows Media Player\\wmplayer.exe");
		if(playerwmp.exists()){
		    this.prefs.setBoolPref("playerwmp",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerwmp.path);
		    }
		}
		//initiate file
		playerqt = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerqt.initWithPath("C:\\Program Files\\QuickTime\\QuickTimePlayer.exe");
		if(playerqt.exists()){
		    this.prefs.setBoolPref("playerqt",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerqt.path);
		    }
		}
		//initiate file
		playervlc = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playervlc.initWithPath("C:\\Program Files\\VideoLAN\\VLC\\vlc.exe");
		if(playervlc.exists()){
		    this.prefs.setBoolPref("playervlc",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playervlc.path);
		    }
		}

	    }else if(osString.match(/Linux/)){

		//initiate file
		playersmplayer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playersmplayer.initWithPath("/usr/bin/smplayer");
		if(playersmplayer.exists()){
		    this.prefs.setBoolPref("playersmplayer",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playersmplayer.path);
		    }
		}
		//initiate file
		playergmplayer = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playergmplayer.initWithPath("/usr/bin/gnome-mplayer");
		if(playergmplayer.exists()){
		    this.prefs.setBoolPref("playergmplayer",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playergmplayer.path);
		    }
		}
		//initiate file
		playerkaffeine = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerkaffeine.initWithPath("/usr/bin/kaffeine");
		if(playerkaffeine.exists()){
		    this.prefs.setBoolPref("playerkaffeine",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerkaffeine.path);
		    }
		}
		//initiate file
		playerkmp = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerkmp.initWithPath("/usr/bin/kmplayer");
		if(playerkmp.exists()){
		    this.prefs.setBoolPref("playerkmp",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerkmp.path);
		    }
		}
		//initiate file
		playertotem = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playertotem.initWithPath("/usr/bin/totem");
		if(playertotem.exists()){
		    this.prefs.setBoolPref("playertotem",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playertotem.path);
		    }
		}
		//initiate file
		playervlc = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playervlc.initWithPath("/usr/bin/vlc");
		if(playervlc.exists()){
		    this.prefs.setBoolPref("playervlc",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playervlc.path);
		    }
		}

	    }else if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
		//initiate file
		playerqt = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
		playerqt.initWithPath("/Applications/QuickTime Player.app/Contents/MacOS/QuickTime Player");
		if(playerqt.exists()){
		    this.prefs.setBoolPref("playerqt",true);
		    if(playerpath === ""){
			this.prefs.setCharPref("playerpath",playerqt.path);
		    }
		}
	    }else{
		this.prefs.setBoolPref("playercustom",true);
	    }
	}
};
//event listeners to call the functions when Firefox starts and closes
window.addEventListener("load",function(){ flvideoreplacerFirstrun.init(); },true);
window.addEventListener("load", function(e) { setTimeout(function () { flvideoreplacerFirstrun.pluginCheck(); }, 150); }, false);
window.addEventListener("load", function(e) { setTimeout(function () { flvideoreplacerFirstrun.playerCheck(); }, 300); }, false);
