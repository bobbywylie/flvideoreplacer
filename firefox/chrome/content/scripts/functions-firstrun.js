var flvideoreplacerFirstrun = {

    init: function(){//get current version from extension manager

	try {// Firefox <= 3.6

	    //get current version from extension manager
	    var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"]
		.getService(Components.interfaces.nsIExtensionManager);
	    var current = gExtensionManager.getItemForID("flvideoreplacer@lovinglinux.megabyet.net").version;

	    flvideoreplacerFirstrun.updateInstall(current);
	}
	catch(e){// Firefox >=4.0

	    //get current version from extension manager
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
	var ver = -1, firstrun = true;
	var current = aVersion;

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

		//set download dir
		var dir = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("Desk", Components.interfaces.nsIFile);

		this.prefs.setCharPref("downdir",dir.path);
	    }

	    if (ver!=current && !firstrun){//actions specific for extension updates

		//set preferences
		this.prefs.setCharPref("version",current);

		if(ver !== "2.0.0"){//actions specific for extension updates

		    //add toolbar button
		    var navbar = document.getElementById("nav-bar");
		    var newset = navbar.currentSet + ",flvideoreplacer-toolbar-button";
		    navbar.currentSet = newset;
		    navbar.setAttribute("currentset", newset );
		    document.persist("nav-bar", "currentset");

		    //set preferences
		    this.prefs.setBoolPref("firstrun",false);
		    this.prefs.setCharPref("version",current);

		    //set download dir
		    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
			    .getService(Components.interfaces.nsIProperties)
			    .get("Desk", Components.interfaces.nsIFile);

		    this.prefs.setCharPref("downdir",dir.path);
		}
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
	this.prefs.setBoolPref("pluginvmp4",false);
	this.prefs.setBoolPref("pluginxflv",false);
	this.prefs.setBoolPref("pluginaqt",false);
	this.prefs.setBoolPref("pluginawmp",false);

	//initiate file
	var pluginreg = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	pluginreg.append("pluginreg.dat");

	//read file
	var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);
	istream.init(pluginreg, 0x01, 0444, 0);
	istream.QueryInterface(Components.interfaces.nsILineInputStream);

	var line = {}, lines = [], hasmore;
	do {
	    hasmore = istream.readLine(line);
	    lines.push(line.value);

	    //check plugins by mime-type
	    var pluginxflv = /video.*x.*flv/.test(line.value);
	    if (pluginxflv == true) {
		this.prefs.setBoolPref("pluginxflv",true);
	    }
	    var pluginvmp4 = /video.*mp4/.test(line.value);
	    if (pluginvmp4 == true) {
		this.prefs.setBoolPref("pluginvmp4",true);
	    }
	    var pluginaqt = /video.*quicktime/.test(line.value);
	    if (pluginaqt == true) {
		this.prefs.setBoolPref("pluginaqt",true);
	    }
	    var pluginawmp = /application.*x-mplayer2/.test(line.value);
	    if (pluginawmp == true) {
		this.prefs.setBoolPref("pluginawmp",true);
	    }
	} while(hasmore);
	istream.close();
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
	this.prefs.setBoolPref("playervlc",false);
	this.prefs.setBoolPref("playersmplayer",false);
	this.prefs.setBoolPref("playerkmp",false);
	this.prefs.setBoolPref("playerwmp",false);
	this.prefs.setBoolPref("playerqt",false);
	this.prefs.setBoolPref("playerreal",false);
	this.prefs.setBoolPref("playerdivx",false);
	this.prefs.setBoolPref("playerwinp",false);
	this.prefs.setBoolPref("playergom",false);

	if(osString.match(/Windows/)){

	      //initiate file
/*
	      var playerwmp = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerwmp.initWithPath("C:\\Program Files\\Windows Media Player\\wmplayer.exe");

	      if(playerwmp.exists()){
		  this.prefs.setBoolPref("playerwmp",true);
	      }
*/
	      //initiate file
	      var playerqt = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerqt.initWithPath("C:\\Program Files\\QuickTime\\QuickTimePlayer.exe");

	      if(playerqt.exists()){
		  this.prefs.setBoolPref("playerqt",true);
	      }
	      //initiate file
/*
	      var playersmplayer = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playersmplayer.initWithPath("C:\\Program Files\\SMPlayer\\smplayer.exe");

	      if(playersmplayer.exists()){
		  this.prefs.setBoolPref("playersmplayer",true);
	      }

	      //initiate file
	      var playerdivx = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerdivx.initWithPath("C:\\Program Files\\DivX\\DivX Plus Player\\DivX Plus Player.exe");

	      if(playerdivx.exists()){
		  this.prefs.setBoolPref("playerdivx",true);
	      }
*/
	      //initiate file
	      var playergom = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playergom.initWithPath("C:\\Program Files\\GRETECH\\GomPlayer\\GOM.exe");

	      if(playergom.exists()){
		  this.prefs.setBoolPref("playergom",true);
	      }
	      //initiate file
	      var playerkmp = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerkmp.initWithPath("C:\\Program Files\\The KMPlayer\\KMPlayer.exe");

	      if(playerkmp.exists()){
		  this.prefs.setBoolPref("playerkmp",true);
	      }
/*
	      //initiate file
	      var playerwinp = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerwinp.initWithPath("C:\\Program Files\\Winamp\\winamp.exe");

	      if(playerwinp.exists()){
		  this.prefs.setBoolPref("playerwinp",true);
	      }

	      //initiate file
	      var playervlc = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playervlc.initWithPath("C:\\Program Files\\VideoLAN\\VLC\\vlc.exe");

	      if(playervlc.exists()){
		  this.prefs.setBoolPref("playervlc",true);
	      }

	      //initiate file
	      var playerreal = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerreal.initWithPath("C:\\Program Files\\Real\\RealPlayer\\realplay.exe");

	      if(playerreal.exists()){
		  this.prefs.setBoolPref("playerreal",true);
	      }
*/

	}else if(osString.match(/Linux/)){

	      //initiate file
	      var playertotem = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playertotem.initWithPath("/usr/bin/totem");

	      if(playertotem.exists()){
		  this.prefs.setBoolPref("playertotem",true);
	      }
	      //initiate file
	      var playergmplayer = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playergmplayer.initWithPath("/usr/bin/gnome-mplayer");

	      if(playergmplayer.exists()){
		  this.prefs.setBoolPref("playergmplayer",true);
	      }
	      //initiate file
	      var playerkaffeine = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerkaffeine.initWithPath("/usr/bin/kaffeine");

	      if(playerkaffeine.exists()){
		  this.prefs.setBoolPref("playerkaffeine",true);
	      }
	      //initiate file
	      var playerkmp = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playerkmp.initWithPath("/usr/bin/kmplayer");

	      if(playerkmp.exists()){
		  this.prefs.setBoolPref("playerkmp",true);
	      }
/*
	      //initiate file
	      var playervlc = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playervlc.initWithPath("/usr/bin/vlc");

	      if(playervlc.exists()){
		  this.prefs.setBoolPref("playervlc",true);
	      }
*/
	      //initiate file
	      var playersmplayer = Components.classes["@mozilla.org/file/local;1"]
		      .createInstance(Components.interfaces.nsILocalFile);
	      playersmplayer.initWithPath("/usr/bin/smplayer");

	      if(playersmplayer.exists()){
		  this.prefs.setBoolPref("playersmplayer",true);
	      }

	}else if(osString.match(/OSX/)){
	    this.prefs.setCharPref("playercustom",true);
	}else{
	    this.prefs.setCharPref("playercustom",true);
	}
    }
};
//event listeners to call the functions when Firefox starts and closes
window.addEventListener("load",function(){ flvideoreplacerFirstrun.init(); },true);
window.addEventListener("load", function(e) { setTimeout("flvideoreplacerFirstrun.pluginCheck()",150); }, false);
window.addEventListener("load", function(e) { setTimeout("flvideoreplacerFirstrun.playerCheck()",300); }, false);
