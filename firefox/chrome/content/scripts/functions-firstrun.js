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

		var navbar = document.getElementById("nav-bar");
		var newset = navbar.currentSet + ",flvideoreplacerbutton-1";
		navbar.currentSet = newset;
		navbar.setAttribute("currentset", newset );
		document.persist("nav-bar", "currentset");

		//set preferences
		this.prefs.setBoolPref("firstrun",false);
		this.prefs.setCharPref("version",current);
	    }

	    if (ver!=current && !firstrun){//actions specific for extension updates

		//set preferences
		this.prefs.setCharPref("version",current);

		if(ver !== "1.0.5" && ver !== "1.0.4" && ver !== "1.0.3" && ver !== "1.0.2" && ver !== "1.0.1"){//actions specific for extension updates

		    window.openDialog('chrome://flvideoreplacer/content/options.xul', 'flvideoreplacer-prefs', 'chrome,centerscreen');

		}
	    }
	}
    }
};
//event listeners to call the functions when Firefox starts and closes
window.addEventListener("load",function(){ flvideoreplacerFirstrun.init(); },true);
