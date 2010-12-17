var flvideoreplacerOptions = {

    toggleMime: function() {

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get plugin info
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
	    document.getElementById("mprompt").hidden=true;
	    document.getElementById("membed").hidden=true;
	    document.getElementById("mnewtab").hidden=true;
	    document.getElementById("mnewwin").hidden=true;
	}
	if((pluginvmp4 == false || pluginxflv == false) && (pluginvmp4 == true || pluginxflv == true || pluginaqt == true || pluginawmp == true)){
            if(replacemethod !== "standalone" && replacemethod !== "prompt" ){
		this.prefs.setCharPref("method","prompt");
	    }
	    document.getElementById("membed").hidden=true;
	    document.getElementById("mnewtab").hidden=true;
	    document.getElementById("mnewwin").hidden=true;
	}
    },

    togglePlayer: function() {

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get players info
	var playertotem = this.prefs.getBoolPref("playertotem");
	var playergmplayer = this.prefs.getBoolPref("playergmplayer");
	var playerkaffeine = this.prefs.getBoolPref("playerkaffeine");
	var playervlc = this.prefs.getBoolPref("playervlc");
	var playersmplayer = this.prefs.getBoolPref("playersmplayer");
	var playerkmp = this.prefs.getBoolPref("playerkmp");
	var playerwmp = this.prefs.getBoolPref("playerwmp");
	var playerqt = this.prefs.getBoolPref("playerqt");
	var playerreal = this.prefs.getBoolPref("playerreal");
	var playerdivx = this.prefs.getBoolPref("playerdivx");
	var playerwinp = this.prefs.getBoolPref("playerwinp");
	var playergom = this.prefs.getBoolPref("playergom");

	if(playertotem == true){
	    document.getElementById("playertotem").hidden=false;
	}else{
	    document.getElementById("playertotem").hidden=true;
	}
	if(playergmplayer == true){
	    document.getElementById("playergmplayer").hidden=false;
	}else{
	    document.getElementById("playergmplayer").hidden=true;
	}
	if(playerkaffeine == true){
	    document.getElementById("playerkaffeine").hidden=false;
	}else{
	    document.getElementById("playerkaffeine").hidden=true;
	}
	if(playervlc == true){
	    document.getElementById("playervlc").hidden=false;
	}else{
	    document.getElementById("playervlc").hidden=true;
	}
	if(playersmplayer == true){
	    document.getElementById("playersmplayer").hidden=false;
	}else{
	    document.getElementById("playersmplayer").hidden=true;
	}
	if(playerkmp == true){
	    document.getElementById("playerkmp").hidden=false;
	}else{
	    document.getElementById("playerkmp").hidden=true;
	}
	if(playerwmp == true){
	    document.getElementById("playerwmp").hidden=false;
	}else{
	    document.getElementById("playerwmp").hidden=true;
	}
	if(playerqt == true){
	    document.getElementById("playerqt").hidden=false;
	}else{
	    document.getElementById("playerqt").hidden=true;
	}
	if(playerreal == true){
	    document.getElementById("playerreal").hidden=false;
	}else{
	    document.getElementById("playerreal").hidden=true;
	}
	if(playerdivx == true){
	    document.getElementById("playerdivx").hidden=false;
	}else{
	    document.getElementById("playerdivx").hidden=true;
	}
	if(playerwinp == true){
	    document.getElementById("playerwinp").hidden=false;
	}else{
	    document.getElementById("playerwinp").hidden=true;
	}
	if(playergom == true){
	    document.getElementById("playergom").hidden=false;
	}else{
	    document.getElementById("playergom").hidden=true;
	}
    },

    toggleOptions: function() {

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var messagetitle = strbundle.getString("flvideoreplacermessage");
	var alerttitle = strbundle.getString("flvideoreplaceralert");

	var standalone = document.getElementById('standalone').value;
	var replacemethod = document.getElementById('method').value;

	if(osString.match(/Windows/)){

	    if(standalone == "playerwmp"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\Windows Media Player\\wmplayer.exe");
	    }
	    if(standalone == "playerqt"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\QuickTime\\QuickTimePlayer.exe");
	    }
	    if(standalone == "playersmplayer"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\SMPlayer\\smplayer.exe");
	    }
	    if(standalone == "playersmplayer"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\SMPlayer\\smplayer.exe");
	    }
	    if(standalone == "playerdivx"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\DivX\\DivX Plus Player\\DivX Plus Player.exe");
	    }
	    if(standalone == "playergom"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\GRETECH\\GomPlayer\\GOM.exe");
	    }
	    if(standalone == "playerkmp"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\The KMPlayer\\KMPlayer.exe");
	    }
	    if(standalone == "playerwinp"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\Winamp\\winamp.exe");
	    }
	    if(standalone == "playervlc"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\VideoLAN\\VLC\\vlc.exe");
	    }
	    if(standalone == "playerreal"){
		this.prefs.setCharPref("playerpath","C:\\Program Files\\Real\\RealPlayer\\realplay.exe");
	    }

	}else if(osString.match(/Linux/)){

	    if(standalone == "playertotem"){
		this.prefs.setCharPref("playerpath","/usr/bin/totem");
	    }
	    if(standalone == "playergmplayer"){
		this.prefs.setCharPref("playerpath","/usr/bin/gnome-mplayer");
	    }
	    if(standalone == "playerkaffeine"){
		this.prefs.setCharPref("playerpath","/usr/bin/kaffeine");
	    }
	    if(standalone == "playerkmp"){
		this.prefs.setCharPref("playerpath","/usr/bin/kmplayer");
	    }
	    if(standalone == "playervlc"){
		this.prefs.setCharPref("playerpath","/usr/bin/vlc");
	    }
	    if(standalone == "playersmplayer"){
		this.prefs.setCharPref("playerpath","/usr/bin/smplayer");
	    }
	}else if(osString.match(/OSX/)){

	}else{
	    //do nothing
	}

	if(replacemethod == "prompt"){

	    document.getElementById("selectplugin").hidden=false;
	    document.getElementById("standaloneplayer").hidden=false;
	    document.getElementById("downloader").hidden=false;
	    document.getElementById("checkplugin").hidden=false;
	}
	if(replacemethod == "newtab"){

	    document.getElementById("selectplugin").hidden=true;
	    document.getElementById("standaloneplayer").hidden=true;
	    document.getElementById("downloader").hidden=false;
	    document.getElementById("checkplugin").hidden=false;
	    document.getElementById('mimetype').value = "autodetect";
	}
	if(replacemethod == "newwindow"){

	    document.getElementById("selectplugin").hidden=true;
	    document.getElementById("standaloneplayer").hidden=true;
	    document.getElementById("downloader").hidden=false;
	    document.getElementById("checkplugin").hidden=false;
	    document.getElementById('mimetype').value = "autodetect";
	}
	if(replacemethod == "standalone"){

	    document.getElementById("selectplugin").hidden=true;
	    document.getElementById("standaloneplayer").hidden=false;
	    document.getElementById("downloader").hidden=false;
	    document.getElementById("checkplugin").hidden=false;
	}
	if(replacemethod == "embedded"){
	    document.getElementById("selectplugin").hidden=false;
	    document.getElementById("standaloneplayer").hidden=true;
	    document.getElementById("downloader").hidden=false;
	    document.getElementById("checkplugin").hidden=false;

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("media.");

	    //check webm status
	    var webm = this.prefs.getBoolPref("webm.enabled");

	    if(webm == true){
		document.getElementById("webmbox").hidden=false;
	    }else{
		document.getElementById("webmbox").hidden=true;

		//access preferences interface
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

		this.prefs.setBoolPref("preferwebm",false);
	    }
	}
	//toggle mime options
	flvideoreplacerOptions.toggleMime();
    },

    resetFile : function(aField) {//reset prefs file paths

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	if(aField == "standalone"){
	    if(osString.match(/Windows/)){
		//reset path
		this.prefs.setCharPref("playerpath","");
		document.getElementById('standalone').value = "playercustom";
	    }
	    if(osString.match(/Linux/)){
		//reset path
		this.prefs.setCharPref("playerpath","");
		document.getElementById('standalone').value = "playercustom";
	    }
	    if(osString.match(/OSX/)){
		//reset path
		this.prefs.setCharPref("playerpath","");
		document.getElementById('standalone').value = "playercustom";
	    }
	}
	if(aField == "downdir"){

	    //declare temporary selections file
	    var dir = Components.classes["@mozilla.org/file/directory_service;1"]
		    .getService(Components.interfaces.nsIProperties)
		    .get("Desk", Components.interfaces.nsIFile);

	    this.prefs.setCharPref("downdir",dir.path);
	}
    },

    openFile : function(aText) {//open file and set path in prefs

	//access preferences interface
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.flvideoreplacer.");

	//open file picker
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"]
		.createInstance(nsIFilePicker);
	fp.init(window, aText, nsIFilePicker.modeOpen);
	var rv = fp.show();
	if (rv == nsIFilePicker.returnOK) {
	  var file = fp.file;
	  //set path
	  this.prefs.setCharPref("playerpath", file.path);
	  document.getElementById('standalone').value = "playercustom";
	}
    },

    openDir : function(aText) {//open folder and set path in prefs

	  //access preferences interface
	  this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		  .getService(Components.interfaces.nsIPrefService)
		  .getBranch("extensions.flvideoreplacer.");

	  //open folder picker
	  var nsIFilePicker = Components.interfaces.nsIFilePicker;
	  var fp = Components.classes["@mozilla.org/filepicker;1"]
		  .createInstance(nsIFilePicker);
	  fp.init(window, aText, nsIFilePicker.modeGetFolder);
	  var rv = fp.show();
	  if (rv == nsIFilePicker.returnOK) {
	    var file = fp.file;
	    //set path
	    this.prefs.setCharPref("downdir", file.path);
	  }
    },

    checkPlugin: function() {

	//get osString
	var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
		.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

	//get localization
	var strbundle = document.getElementById("flvideoreplacerstrings");
	var messagetitle = strbundle.getString("flvideoreplacermessage");
	var alerttitle = strbundle.getString("flvideoreplaceralert");

	if(osString.match(/Windows/)){
	    var bestplugin = "QuickTime";
	}
	if(osString.match(/Linux/)){
	    var bestplugin = "gecko-mediaplayer";
	}
	if(osString.match(/OSX/)){
	    var bestplugin = "QuickTime";
	}

	//declare temporary selections file
	var pluginreg = Components.classes["@mozilla.org/file/directory_service;1"]
		.getService(Components.interfaces.nsIProperties)
		.get("ProfD", Components.interfaces.nsIFile);
	pluginreg.append("pluginreg.dat");

	var defaultplugin = false;
	var alternative = false;

	if(osString.match(/Windows/)){

	    //read file
	    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		    createInstance(Components.interfaces.nsIFileInputStream);
	    istream.init(pluginreg, 0x01, 0444, 0);
	    istream.QueryInterface(Components.interfaces.nsILineInputStream);

	    var line = {}, lines = [], hasmore;
	    do {
		hasmore = istream.readLine(line);
		lines.push(line.value);

		//check plugin by mime-type
		var pluginavaliable = /QuickTime/.test(line.value);
		if (pluginavaliable == true) {
		    var defaultplugin = true;
		}
	    } while(hasmore);
	    istream.close();

	    if(defaultplugin == false){

		//read file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
			createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pluginreg, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		var line = {}, lines = [], hasmore;
		do {
		    hasmore = istream.readLine(line);
		    lines.push(line.value);

		    //check plugin by mime-type
		    var pluginavaliable = /Windows.*Media.*Player.*Plug-in/.test(line.value);
		    if (pluginavaliable == true) {
			var alternative = true;
		    }
		} while(hasmore);
		istream.close();

		if(alternative == true){
		
		    var message = strbundle.getFormattedString("alternativeplugin", [ bestplugin ]);
		    //alert user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, alerttitle, message);

		}else{

		    var message = strbundle.getFormattedString("noplugin", [ bestplugin ]);
		    //alert user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, alerttitle, message);
		}

	    }else{
		var message = strbundle.getFormattedString("goodtogo", [ bestplugin ]);
		//alert user
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		prompts.alert(window, messagetitle, message);
	    }
	}

	if(osString.match(/Linux/)){

	    //read file
	    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		    createInstance(Components.interfaces.nsIFileInputStream);
	    istream.init(pluginreg, 0x01, 0444, 0);
	    istream.QueryInterface(Components.interfaces.nsILineInputStream);

	    var line = {}, lines = [], hasmore;
	    do {
		hasmore = istream.readLine(line);
		lines.push(line.value);

		//check plugin by mime-type
		var pluginavaliable = /gecko.*mediaplayer/.test(line.value);
		if (pluginavaliable == true) {
		    var defaultplugin = true;
		}
	    } while(hasmore);
	    istream.close();

	    if(defaultplugin == false){

		//read file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
			createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pluginreg, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		var line = {}, lines = [], hasmore;
		do {
		    hasmore = istream.readLine(line);
		    lines.push(line.value);

		    //check plugin by mime-type
		    var pluginavaliable = /gxine/.test(line.value);
		    if (pluginavaliable == true) {
			var alternative = true;
		    }
		    //check plugin by mime-type
		    var pluginavaliable = /Totem/.test(line.value);
		    if (pluginavaliable == true) {
			var alternative = true;
		    }
		} while(hasmore);
		istream.close();

		if(alternative == true){
		
		    var message = strbundle.getFormattedString("alternativeplugin", [ bestplugin ]);
		    //alert user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, alerttitle, message);

		}else{

		    var message = strbundle.getFormattedString("noplugin", [ bestplugin ]);
		    //alert user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, alerttitle, message);
		}

	    }else{
		var message = strbundle.getFormattedString("goodtogo", [ bestplugin ]);
		//alert user
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		prompts.alert(window, messagetitle, message);
	    }
	}

	if(osString.match(/OSX/)){

	    //read file
	    var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
		    createInstance(Components.interfaces.nsIFileInputStream);
	    istream.init(pluginreg, 0x01, 0444, 0);
	    istream.QueryInterface(Components.interfaces.nsILineInputStream);

	    var line = {}, lines = [], hasmore;
	    do {
		hasmore = istream.readLine(line);
		lines.push(line.value);

		//check plugin by mime-type
		var pluginavaliable = /QuickTime/.test(line.value);
		if (pluginavaliable == true) {
		    var defaultplugin = true;
		}
	    } while(hasmore);
	    istream.close();

	    if(defaultplugin == false){

		//read file
		var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].
			createInstance(Components.interfaces.nsIFileInputStream);
		istream.init(pluginreg, 0x01, 0444, 0);
		istream.QueryInterface(Components.interfaces.nsILineInputStream);

		var line = {}, lines = [], hasmore;
		do {
		    hasmore = istream.readLine(line);
		    lines.push(line.value);

		    //check plugin by mime-type
		    var pluginavaliable = /Windows.*Media.*Player.*Plug-in/.test(line.value);
		    if (pluginavaliable == true) {
			var alternative = true;
		    }
		} while(hasmore);
		istream.close();

		if(alternative == true){
		
		    var message = strbundle.getFormattedString("alternativeplugin", [ bestplugin ]);
		    //alert user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, alerttitle, message);

		}else{

		    var message = strbundle.getFormattedString("noplugin", [ bestplugin ]);
		    //alert user
		    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			    .getService(Components.interfaces.nsIPromptService);
		    prompts.alert(window, alerttitle, message);
		}

	    }else{
		var message = strbundle.getFormattedString("goodtogo", [ bestplugin ]);
		//alert user
		var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
			.getService(Components.interfaces.nsIPromptService);
		prompts.alert(window, messagetitle, message);
	    }
	}

	var loc = "about:plugins";

	//open in new tab
	var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
		getService();
	var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
	var win = wmed.getMostRecentWindow("navigator:browser");

	if ( !win ) {
	    win = window.openDialog("chrome://browser/content/browser.xul",
				    "_blank",
				    "chrome,all,dialog=no",
				    loc, null, null);
	}
	else {
	    var content = win.document.getElementById("content");
	    content.selectedTab = content.addTab(loc);
	}

	if(defaultplugin == false && alternative == true){

	    var loc = "http://www.webgapps.org/addons/flashvideoreplacer";

	    //open in new tab
	    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].
		    getService();
	    var wmed = wm.QueryInterface(Components.interfaces.nsIWindowMediator);
	    var win = wmed.getMostRecentWindow("navigator:browser");

	    if ( !win ) {
		win = window.openDialog("chrome://browser/content/browser.xul",
					"_blank",
					"chrome,all,dialog=no",
					loc, null, null);
	    }
	    else {
		var content = win.document.getElementById("content");
		content.selectedTab = content.addTab(loc);
	    }
	}
    }
};
window.addEventListener("load",function(){ flvideoreplacerOptions.toggleMime(); },true);
window.addEventListener("load",function(){ flvideoreplacerOptions.togglePlayer(); },true);