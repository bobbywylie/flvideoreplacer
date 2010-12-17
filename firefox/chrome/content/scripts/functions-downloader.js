var flvideoreplacerDownloader = {

    startDownload: function() {

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get video path from prefs
	var downsource = this.prefs.getCharPref("downsource");
	var downfile = this.prefs.getCharPref("downfile");

	var file = Components.classes["@mozilla.org/file/local;1"]
		    .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(downfile);

	var wbp = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
		  .createInstance(Components.interfaces.nsIWebBrowserPersist);
	var ios = Components.classes['@mozilla.org/network/io-service;1']
		  .getService(Components.interfaces.nsIIOService);
	var uri = ios.newURI(downsource, null, null);
	wbp.persistFlags &= ~Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_NO_CONVERSION; // don't save gzipped
	wbp.saveURI(uri, null, null, null, null, file);
    }
};
window.addEventListener("load",function(){ flvideoreplacerDownloader.startDownload(); },true);