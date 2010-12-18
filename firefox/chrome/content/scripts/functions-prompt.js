var flvideoreplacerPrompt = {

    toggleMime: function() {

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get plugin compatibility
	var filemime = this.prefs.getCharPref("filemime");
	var replacemethod = this.prefs.getCharPref("method");
	var pluginvmp4 = this.prefs.getBoolPref("pluginvmp4");
	var pluginxflv = this.prefs.getBoolPref("pluginxflv");
	var pluginaqt = this.prefs.getBoolPref("pluginaqt");
	var pluginawmp = this.prefs.getBoolPref("pluginawmp");

	if(pluginvmp4 == true){
	    document.getElementById("pluginvmp4").hidden=false;
	}else{
	    document.getElementById("pluginvmp4").hidden=true;
	}
	if(pluginxflv == true){
	    document.getElementById("pluginxflv").hidden=false;
	}else{
	    document.getElementById("pluginxflv").hidden=true;
	}
	if(pluginaqt == true){
	    document.getElementById("pluginaqt").hidden=false;
	}else{
	    document.getElementById("pluginaqt").hidden=true;
	}
	if(pluginawmp == true){
	    document.getElementById("pluginawmp").hidden=false;
	}else{
	    document.getElementById("pluginawmp").hidden=true;
	}
	if(pluginvmp4 == false && pluginxflv == false){
	    this.prefs.setCharPref("method","standalone");
	    document.getElementById("membed").hidden=true;
	    document.getElementById("mnewtab").hidden=true;
	    document.getElementById("mnewwin").hidden=true;
	}
	if(pluginvmp4 == true && pluginxflv == false){
	    this.prefs.setBoolPref("prefermp4",true);
	}
	if(pluginvmp4 == false && pluginxflv == true){
	    this.prefs.setBoolPref("prefermp4",false);
	}
    }
};
window.addEventListener("load",function(){ flvideoreplacerPrompt.toggleMime(); },true);