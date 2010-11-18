var flvideoreplacerListener = {

    init: function() {
	var appcontent = document.getElementById("appcontent"); // browser
	if(appcontent)
	appcontent.addEventListener("DOMContentLoaded", flvideoreplacerListener.onPageLoad, true);
    },

    onPageLoad: function(aEvent) {

	//declare document and element
	var doc = aEvent.originalTarget; // doc is document that triggered "onload" event

	//declare page url
	var sourceurl = doc.location.href;

	if( (sourceurl.match("youtube.com") && sourceurl.match("watch") && sourceurl.match("v=")) 
	    || sourceurl.match(/vimeo.com\/\d{1,8}/) 
	    || sourceurl.match(/blip\.tv\/file\/.*/))
	{//match supported sites

	    //declare video should not be replaced
	    var replacevideo = false;

	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		    .getService(Components.interfaces.nsIPrefService)
		    .getBranch("extensions.flvideoreplacer.");

	    //fetch enabled sites from preferences
	    var replaceyoutube = this.prefs.getBoolPref("youtube");
	    var youtubequality = this.prefs.getCharPref("youtubequality");
	    var replacevimeo = this.prefs.getBoolPref("vimeo");
	    var replacebliptv = this.prefs.getBoolPref("bliptv");
	    var mimetype = this.prefs.getCharPref("mimetype");
	    var autoplay = this.prefs.getBoolPref("autoplay");
	    var strbundle = document.getElementById("flvideoreplacerstrings");
	    var original = strbundle.getString("original");

	    if(replaceyoutube == true && sourceurl.match("youtube.com") && sourceurl.match("watch") && sourceurl.match("v=")){//match youtube

		//fetch video ID from url
		var videoid = sourceurl.replace(/.*v=/, "").replace(/\&.*/,"");;
		//declare element to be replaced
		var testelement = doc.getElementById('movie_player');

		if (testelement != null) {//check if element exists

		    //declare youtube videos should not be replaced
		    var replaceyoutube = false;

		    //fetch page html content
		    var pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
		    var newline = pagecontent.split("\n");

		    for(var i=0; i< newline.length; i++){

			//match patterns
			var matchswfConfig = /var swfConfig/.test(newline[i]);

			if (matchswfConfig == true) {//if important line exists

			    //declare video uality based on user settings and video availability
			    var fmt = "18";

			    if (youtubequality == "LOW"){//match user option and video availability

				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    var fmt = "18";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				    var fmt = "34";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				    var fmt = "35";
				    var replaceyoutube = true;
				}
			    }

			    if (youtubequality == "MEDIUM"){//match user option and video availability

				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    var fmt = "18";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				    var fmt = "34";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				    var fmt = "35";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
				    var fmt = "22";
				    var replaceyoutube = true;
				}
			    }

			    if (youtubequality == "HIGH"){//match user option and video availability

				if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
				    var fmt = "18";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
				    var fmt = "34";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
				    var fmt = "35";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
				    var fmt = "22";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
				    var fmt = "37";
				    var replaceyoutube = true;
				}
				if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
				    var fmt = "38";
				    var replaceyoutube = true;
				}
			    }

			    if (replaceyoutube == true){

				//declare player params
				var videowidth = "100%";
				var videoheight = "100%";
				var videoelement = "movie_player";
				//fetch authentication string
				var authentication = newline[i].replace(/.*\"t\": \"/, "");
				var authentication = authentication.replace(/\"\,.*/, "");
				//var videourl = "http://www.youtube.com/get_video?video_id="+videoid+"&t="+authentication+"&fmt="+fmt;
				var videourl = "http://www.youtube.com/get_video?fmt="+fmt+"&video_id="+videoid+"&t="+authentication+"&asv=3";

				//declare the video should be replaced
				var replacevideo = true;
			    }
			}
		    }
		}
	    }

	    if(replacevimeo == true && sourceurl.match(/vimeo.com\/\d{1,8}/)){//match vimeo

		//fetch video ID from url
		var videoid = sourceurl.replace(/.*\//g, "");
		//declare element to be replaced
		var videoelement = "vimeo_player_"+videoid;
		var testelement = doc.getElementById(videoelement);

		if (testelement != null) {//check if element exists

		    var signature = false;
		    var signature_expires = false;

		    //declare xml file with authentication data to be downloaded
		    var xmlsource = "http://vimeo.com/moogaloop/load/clip:"+videoid;

		    //get xml document content
		    var req = new XMLHttpRequest();  
		    req.open('GET', xmlsource, false);   
		    req.send(null);  
		    if(req.status == 200) {//match if data has been downloaded and execute function

			//read lines
			var pagecontent = req.responseText;
			var newline = pagecontent.split("\n");
			for(var i=0; i< newline.length; i++){

			    //match patterns
			    var matchrequest_signature = /\<request_signature\>/.test(newline[i]);
			    var matchrequest_signature_expires = /\<request_signature_expires\>/.test(newline[i]);

			    if (matchrequest_signature == true) {//fetch line with matchrequest_signature

				//replace unneeded characters and declare new value
				var request_signature = newline[i].replace(/\<request_signature\>/, "");
				var request_signature = request_signature.replace(/\<\/request_signature\>/, "");
				var request_signature = request_signature.replace(/\s/g, "");
				//declare the video should be replaced
				var signature = true;
			    }

			    if (matchrequest_signature_expires == true) {//fetch line with matchrequest_signature_expires

				//replace unneeded characters and declare new value
				var request_signature_expires = newline[i].replace(/\<request_signature_expires\>/, "");
				var request_signature_expires = request_signature_expires.replace(/\<\/request_signature_expires\>/, "");
				var request_signature_expires = request_signature_expires.replace(/\s/g, "");
				//declare the video should be replaced
				var signature_expires = true;
			    }
			}

			if(signature == true && signature_expires == true){
			    //declare player params
			    var videowidth = "640";
			    var videoheight = "384";
			    var videourl = "http://vimeo.com/moogaloop/play/clip:"+videoid+"/"+request_signature+"/"+request_signature_expires+"/?q=sd";
			    var videoelement = "vimeo_player_"+videoid;
			    //declare the video should be replaced
			    var replacevideo = true;
			}
		    }
		}
	    }

	    if(replacebliptv == true && sourceurl.match(/blip\.tv\/file\/.*/)){//match blip.tv

		//fetch video ID from url
		var videoid = sourceurl.replace(/.*file\//, "");
		var videoid = videoid.replace(/\//, "");
		//declare element to be tested
		var testelement = doc.getElementById('video_player');

		if (testelement != null) {//check if element exists

		    //fetch page html content
		    var pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
		    var newline = pagecontent.split("\n");

		    for(var i=0; i< newline.length; i++){
			//match patterns
			var matchPrimaryMediaUrl = /player\.setPrimaryMediaUrl/.test(newline[i]);

			if (matchPrimaryMediaUrl == true) {//fetch line with PrimaryMediaUrl

			    //declare player params
			    var videowidth = "624";
			    var videoheight = "380";
			    var videoelement = "video_player";
			    //replace unneeded characters and declare new value
			    var videourl = newline[i].replace(/player\.setPrimaryMediaUrl\(\"/, "");
			    var videourl = videourl.replace(/\?.*/, "");
			    //declare the video should be replaced
			    var replacevideo = true;
			}
		    }
		}
	    }

	    //**********************check incompatible extensions************************************
	    //access preferences interface
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.");

	    var aSite = false;

	    if(replaceyoutube == true && sourceurl.match("youtube")){//match youtube
		var aSite = "YouTube";
		var aString = "youtube";
	    }
	    if(replacevimeo == true && sourceurl.match("vimeo")){//match vimeo
		var aSite = "Vimeo";
		var aString = "vimeo";
	    }
	    if(replacebliptv == true && sourceurl.match("blip")){//match blip.tv
		var aSite = "Blip.tv";
		var aString = "blip";
	    }

	    if(aSite !== false){
		//check enabled extensions
		try{
		    var enableditems = this.prefs.getCharPref("enabledAddons");
		}catch(e){
		    var enableditems = this.prefs.getCharPref("enabledItems");
		}finally{

		    if (enableditems.match(/\{3d7eb24f-2740-49df-8937-200b1cc08f8a\}/)) {//foxpvr integration

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			    .getService(Components.interfaces.nsIPrefService)
			    .getBranch("flashblock.");

			try{
			    var whitelist = this.prefs.getCharPref("whitelist");
			}catch(e){
			    var whitelist = "";
			}

			if(!whitelist.match(aString)){

			    replacevideo = false;

			    //get text from strbundle
			    var message = strbundle.getFormattedString("flashblock", [ aSite ]);
			    var messagetitle = strbundle.getString("flvideoreplaceralert");
			    //alert user
			    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
			    alertsService.showAlertNotification("chrome://flvideoreplacer/content/images/logo_large.png",
			    messagetitle, message,
			    false, "", null);
			}
		    }
		    if (enableditems.match(/\{84b24861-62f6-364b-eba5-2e5e2061d7e6\}/)) {//foxpvr integration

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			    .getService(Components.interfaces.nsIPrefService)
			    .getBranch("extensions.mediaplayerconnectivity.");

			try{
			    var whitelist = this.prefs.getCharPref("whiteList");
			}catch(e){
			    var whitelist = "";
			}

			if(!whitelist.match(aString)){

			    replacevideo = false;

			    //get text from strbundle
			    var message = strbundle.getFormattedString("mpc", [ aSite ]);
			    var messagetitle = strbundle.getString("flvideoreplaceralert");
			    //alert user
			    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
				.getService(Components.interfaces.nsIAlertsService);
			    alertsService.showAlertNotification("chrome://flvideoreplacer/content/images/logo_large.png",
			    messagetitle, message,
			    false, "", null);
			}
		    }
		}
	    }

	    if(replacevideo == true){//match if video should be replaced

		if(mimetype == "quicktime"){

		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);
		    //create the object element
		    var flvideoreplacer = doc.createElement('object');
		    flvideoreplacer.setAttribute("width", videowidth);
		    flvideoreplacer.setAttribute("height", videoheight);
		    flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
		    flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
		    flvideoreplacer.setAttribute("type", "video/quicktime");
		    //append innerHTML code
		    flvideoreplacer.innerHTML = "\
			<param name=\"src\" value=\""+videourl+"\"></param>\
			<param name=\"autoplay\" value=\""+autoplay+"\">\
			<param name=\"controller\" value=\"true\">\
			<param name=\"loop\" value=\"false\">\
			<param name=\"scale\" value=\"aspect\">\
			<embed src=\""+videourl+"\" \
			    width=\""+videowidth+"\" \
			    height=\""+videoheight+"\" \
			    scale=\"aspect\" \
			    type=\"video/quicktime\" \
			    autoplay=\""+autoplay+"\" \
			    controller=\"true\" \
			    loop=\"false\" \
			</embed>";
		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);
		    //replace video
		    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
		}

		if(mimetype == "x-mplayer2"){

		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);
		    //create the object element
		    var flvideoreplacer = doc.createElement('object');
		    flvideoreplacer.setAttribute("width", videowidth);
		    flvideoreplacer.setAttribute("height", videoheight);
		    flvideoreplacer.setAttribute("classid", "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6");
		    flvideoreplacer.setAttribute("codebase", "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112");
		    flvideoreplacer.setAttribute("standby", "Loading Microsoft Windows Media Player components...");
		    flvideoreplacer.setAttribute("type", "application/x-oleobject");
		    //append innerHTML code
		    flvideoreplacer.innerHTML = "\
			<param name=\"fileName\" value=\""+videourl+"\"></param>\
			<param name=\"autoStart\" value=\""+autoplay+"\">\
			<param name=\"showControls\" value=\"true\">\
			<param name=\"loop\" value=\"false\">\
			<embed type=\"application/x-mplayer2\" \
			    autostart=\""+autoplay+"\" \
			    showcontrols=\"true\" \
			    loop=\"false\" \
			    src=\""+videourl+"\" \
			    width=\""+videowidth+"\" \
			    height=\""+videoheight+"\" \
			</embed>";
		    //declare element to be replaced
		    var videoplayer = doc.getElementById(videoelement);
		    //replace video
		    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
		}

		if(videourl.match("youtube")){
		    if (fmt == "18" || fmt == "34") {
			var message = strbundle.getFormattedString("videores", [ "360p" ]);
		    }
		    if (fmt == "35") {
			var message = strbundle.getFormattedString("videores", [ "480p" ]);
		    }
		    if (fmt == "22") {
			var message = strbundle.getFormattedString("videores", [ "720p" ]);
		    }
		    if (fmt == "37") {
			var message = strbundle.getFormattedString("videores", [ "1080p" ]);
		    }
		    if (fmt == "38") {
			var message = strbundle.getFormattedString("videores", [ original ]);
		    }
		    var messagetitle = strbundle.getString("flvideoreplacermessage");
		    //alert user
		    var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
			.getService(Components.interfaces.nsIAlertsService);
		    alertsService.showAlertNotification("chrome://flvideoreplacer/content/images/logo_large.png",
		    messagetitle, message,
		    false, "", null);
		}
	    }
	}
    }
};
window.addEventListener("load", function() { flvideoreplacerListener.init(); }, false);