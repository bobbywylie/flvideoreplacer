// ==UserScript==
// @include http://www.youtube.com/watch?v=*
// @include http://youtube.com/watch?v=*
// @include http://vimeo.com/*
// @include http://www.metacafe.com/watch/*
// @include http://www.youporn.com/watch/*
// @include http://www.pornhub.com/view_video.php?viewkey=*
// @include http://www.redtube.com/*
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function() {

    //get page url
    var sourceurl = window.location.href;

    if(sourceurl.match(/youtube.*watch.*v\=/)
	  || sourceurl.match(/vimeo\.com\/\d{1,8}/)
	  || (sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))
	  || sourceurl.match(/youporn\.com\/watch\//)
	  || sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
	  || sourceurl.match(/redtube\.com\/\d{1,8}/)
	  ){

	if(sourceurl.match(/youporn\.com\/watch\//)){

	    //declare element to be replaced
	    videoelement = "player";
	    testelement = window.document.getElementById(videoelement);

	    if (testelement !== null) {

		//fetch page html content
		var pagecontent = window.document.getElementsByTagName("body").item(0).innerHTML;
		var newline = pagecontent.split("\n");

		for(var i=0; i< newline.length; i++){

		    //match patterns
		    matchpattern = /addVariable\('file'/.test(newline[i]);

		    if (matchpattern === true) {
			var xmlsource = newline[i].replace(/.*encodeURIComponent\('/,"").replace(/'.*/,"");
			opera.extension.postMessage(xmlsource);
		    }
		}
	    }
	}else{
	  opera.extension.postMessage(sourceurl);
	}
    }

    // to receive message from background
    opera.extension.onmessage = function (event){

	var sourceurl = window.location.href;
	var replacevideo = "0", pagecontent, testelement, newline, newlocation, fmt, videowidth, videohight, videourl, replaceother;
	var jsonObject = JSON.parse(event.data);
	var replacemethod = jsonObject.replacemethod;
	var videoquality = jsonObject.videoquality;
	var preferwebm = jsonObject.preferwebm;
	var prefermp4 = jsonObject.prefermp4;
	var mimetype = jsonObject.mimetype;
	var autoplay = jsonObject.autoplay;
	var videoid = jsonObject.videoid;
	var newmimetype = mimetype;

	if(sourceurl.match(/youtube.*watch.*v\=/)){

	    var replaceyoutube = jsonObject.youtube;

	    if(replaceyoutube === "1"){

		if(sourceurl.match(/html5=True/)){

		    if(preferwebm === "0"){
			newlocation = sourceurl.replace(/\&html5=True/,"");
			window.location.href = newlocation;
		    }
		}
		if(!sourceurl.match(/html5=True/)){

		    if(preferwebm === "1"){
			newlocation = sourceurl+"&html5=True";
			window.location.href = newlocation;
		    }else{

			//fetch page html content
			pagecontent = window.document.getElementsByTagName("body").item(0).innerHTML;
			//declare element to be replaced
			testelement = window.document.getElementById('movie_player');

			if(testelement !== null){

			    newline = pagecontent.split("\n");

			    for(var i=0; i< newline.length; i++){

				//match patterns
				matchpattern = /var swfConfig/.test(newline[i]);

				if (matchpattern === true) {

				    //declare video uality based on user settings and video availability
				    fmt = "18";

				    if (videoquality === "LOW"){

					if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
					    fmt = "5";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
					    fmt = "18";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
					if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
					    fmt = "34";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
					    fmt = "35";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if(prefermp4 === true){
					    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
						fmt = "18";
						videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
						replacevideo = "1";
						if(mimetype === "autodetect"){
						    newmimetype = "video/mp4";
						}
					    }
					}
				    }

				    if (videoquality === "MEDIUM"){

					if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
					    fmt = "5";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
					    fmt = "18";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
					if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
					    fmt = "34";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
					    fmt = "35";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if(prefermp4 === true){
					    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
						fmt = "18";
						videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
						replacevideo = "1";
						if(mimetype === "autodetect"){
						    newmimetype = "video/mp4";
						}
					    }
					}
					if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
					    fmt = "22";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*22\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
				    }

				    if (videoquality === "HIGH"){

					if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
					    fmt = "5";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*5\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
					    fmt = "18";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
					if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
					    fmt = "34";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*34\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
					    fmt = "35";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*35\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "application/x-flv";
					    }
					}
					if(prefermp4 === true){
					    if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
						fmt = "18";
						videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*18\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
						replacevideo = "1";
						if(mimetype === "autodetect"){
						    newmimetype = "video/mp4";
						}
					    }
					}
					if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
					    fmt = "22";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*22\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
					if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
					    fmt = "37";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*37\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
					if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
					    fmt = "38";
					    videourl = newline[i].replace(/.*"fmt_url_map":/,"").replace(/.*38\|/g,"").replace(/\|.*/g,"").replace(/",.*/g,"").replace(/,.*/g,"").replace(/\\/g,"");
					    replacevideo = "1";
					    if(mimetype === "autodetect"){
						newmimetype = "video/mp4";
					    }
					}
				    }

				    if (replacevideo === "1"){

					//declare player params
					videowidth = "100%";
					videoheight = "100%";
					videoelement = "movie_player";
//opera.postError(mimetype);
				    }
				}
			    }
			}
		    }
		}
	    }
	}
	if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){

	    var replacevimeo = jsonObject.vimeo;
	    videourl = jsonObject.videourl;

	    if(replacevimeo === "1"){

		//declare element to be replaced
		videoelement = "meat";
		testelement = window.document.getElementById(videoelement);

		if (testelement !== null) {

		    replacevideo = "1";

		    //declare player params
		    videowidth = "640";
		    videoheight = "384";
		    //declare auto selected mime type
		    if(mimetype === "autodetect"){
			newmimetype = "video/mp4";
		    }
		}
	    }
	}
	if((sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))){

	    var replacemetacafe = jsonObject.metacafe;

	    if(replacemetacafe === "1"){

		//declare element to be replaced
		videoelement = "FlashWrap";
		testelement = window.document.getElementById(videoelement);

		if (testelement !== null) {

		    //fetch page html content
		    pagecontent = window.document.getElementsByTagName("body").item(0).innerHTML;
		    newline = pagecontent.split("\n");

		    for(var i=0; i< newline.length; i++){

			//match patterns
			var matchpattern = /flashVars.*mediaURL\=.*gdaKey\=/.test(newline[i]);
			var matchpattern2 = /flashVars.*mediaURL.*/.test(newline[i]);

			if (matchpattern === true) {
			    videourl = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*mediaURL\=/g,"").replace(/\&gdaKey\=.*/,"").replace(/\&amp.gdaKey\=.*/,"").replace(/\\/g,"");
			    key = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*gdaKey\=/,"").replace(/\&postRollContentURL.*/,"").replace(/\&amp;postRollContentURL.*/,"");
			    videourl = videourl+"?__gda__="+key;
			    replacevideo = "1";
			}else{

			    if (matchpattern2 === true) {
				videourl = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*mediaURL":"http/,"http").replace(/",.*/,"").replace(/\\/g,"");
				key = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*key":"/,"").replace(/"\}.*/,"");
				videourl = videourl+"?__gda__="+key;
				replacevideo = "1";
			    }
			}
		    }

		    if(replacevideo === "1"){

			//declare player params
			videowidth = "615";
			videoheight = "400";
			//declare auto selected mime type
			if(mimetype === "autodetect"){
			    newmimetype = "video/mp4";
			}
		    }
		}
	    }
	}
	if(sourceurl.match(/youporn\.com\/watch\//)){

	    replaceother = jsonObject.other;
	    videourl = jsonObject.videourl;
	    videoid = sourceurl.replace(/.*watch\//g, "").replace(/\/.*/,"");

	    if(replaceother === "1"){

		//declare element to be replaced
		videoelement = "player";
		testelement = window.document.getElementById(videoelement);

		if (testelement !== null) {

		    replacevideo = "1";

		    //declare player params
		    videowidth = "600";
		    videoheight = "470";
		    //declare auto selected mime type
		    if(mimetype === "autodetect"){
			newmimetype = "application/x-flv";
		    }
		}

	    }
	}
	if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){

	    replaceother = jsonObject.other;

	    if(replaceother === "1"){

		//declare element to be replaced
		videoelement = "VideoPlayer";
		testelement = window.document.getElementById(videoelement);

		if (testelement !== null) {

		    //fetch page html content
		    pagecontent = window.document.getElementsByTagName("body").item(0).innerHTML;
		    newline = pagecontent.split("\n");

		    for(var i=0; i< newline.length; i++){

			//match patterns
			matchpattern = /addVariable\("video_url"/.test(newline[i]);

			if (matchpattern === true) {
			    videourl = newline[i].replace(/.*addVariable\("video_url","/,"").replace(/".*/,"");
			    replacevideo = "1";
			}
		    }

		    if(replacevideo === "1"){

			//declare player params
			videowidth = "610";
			videoheight = "480";
			//declare auto selected mime type
			if(mimetype === "autodetect"){
			    newmimetype = "application/x-flv";
			}
		    }
		}
	    }
	}
	if(sourceurl.match(/redtube\.com\/\d{1,8}/)){

	    replaceother = jsonObject.other;

	    if(replaceother === "1"){

		//declare element to be replaced
		videoelement = "redtube_flv_player";
		testelement = window.document.getElementById(videoelement);
opera.postError("checking");
		if (testelement !== null) {
opera.postError("ok");
		    //fetch page html content
		    pagecontent = window.document.getElementsByTagName("body").item(0).innerHTML;
		    newline = pagecontent.split("\n");

		    for(var i=0; i< newline.length; i++){

			//match patterns
			var matchpattern = /FlashVars.*hashlink=/.test(newline[i]);

			if (matchpattern === true) {

			    videourl = newline[i].replace(/.*hashlink=/,"").replace(/\&embed.*/g,"").replace(/\&.*/g,"");
			    videourl = decodeURIComponent(videourl);
			    replacevideo = "1";
opera.postError(videourl);
			}
		    }

		    if(replacevideo === "1"){

			//declare player params
			videowidth = "584";
			videoheight = "468";
			//declare auto selected mime type
			if(mimetype === "autodetect"){
			    newmimetype = "application/x-flv";
			}
		    }
		}
	    }
	}
	if(replacevideo === "1"){

	    //declare variables
	    var videoplayer,flvideoreplacer,childdivs,videodiv;

	    if(replacemethod === "embedded"){

		//get plugin compatibility
		var pluginvmp4 = "1";
		var pluginxflv = "1";
		var pluginaqt = "1";
		var pluginawmp = "1";

		if(newmimetype === "application/x-flv"){

		    //declare element to be replaced
		    videoplayer = window.document.getElementById(videoelement);

		    if(pluginxflv === "1"){

			//create the object element
			flvideoreplacer = window.document.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("type", "application/x-flv");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"application/x-flv\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
			    childdivs = videoplayer.getElementsByTagName("div");
			    videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback
			newmimetype = "video/mp4";
		    }
		}

		if(newmimetype === "video/mp4"){

		    //declare element to be replaced
		    videoplayer = window.document.getElementById(videoelement);

		    if(pluginvmp4 === "1"){

			//create the object element
			flvideoreplacer = window.document.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
			flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
			flvideoreplacer.setAttribute("type", "video/mp4");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"> <embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/mp4\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";

			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
			    childdivs = videoplayer.getElementsByTagName("div");
			    videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);
			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}

		    }else{//fallback
			newmimetype = "video/quicktime";
		    }
		}

		if(newmimetype === "video/quicktime"){

		    //declare element to be replaced
		    videoplayer = window.document.getElementById(videoelement);

		    if(pluginaqt === "1"){

			//create the object element
			flvideoreplacer = window.document.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
			flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");
			flvideoreplacer.setAttribute("type", "video/quicktime");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/quicktime\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
			    childdivs = videoplayer.getElementsByTagName("div");
			    videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback
			newmimetype = "application/x-mplayer2";
		    }
		}
		if(newmimetype === "application/x-mplayer2"){

		    //declare element to be replaced
		    videoplayer = window.document.getElementById(videoelement);

		    if(pluginawmp === "1"){

			//create the object element
			flvideoreplacer = window.document.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("classid", "clsid:6BF52A52-394A-11D3-B153-00C04F79FAA6");
			flvideoreplacer.setAttribute("codebase", "http://activex.microsoft.com/activex/controls/mplayer/en/nsmp2inf.cab#Version=6,4,7,1112");
			flvideoreplacer.setAttribute("standby", "Loading Microsoft Windows Media Player components...");
			flvideoreplacer.setAttribute("type", "application/x-oleobject");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"fileName\" value=\""+videourl+"\"></param><param name=\"autoStart\" value=\""+autoplay+"\"><param name=\"showControls\" value=\"true\"><param name=\"loop\" value=\"false\"><embed type=\"application/x-mplayer2\" autostart=\""+autoplay+"\" showcontrols=\"true\" loop=\"false\" src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" </embed>";
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
			    childdivs = videoplayer.getElementsByTagName("div");
			    videodiv = childdivs[2];
			    //replace video
			    videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
			    //replace video
			    videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		    }else{//fallback

			var fmt = "99";
/*
			//create the object element
			flvideoreplacer = window.document.createElement('object');
			flvideoreplacer.setAttribute("width", videowidth);
			flvideoreplacer.setAttribute("height", videoheight);
			flvideoreplacer.setAttribute("type", "application/x-shockwave-flash");
			flvideoreplacer.setAttribute("data", "http://www.webgapps.org/flowplayer/flowplayer-3.2.5.swf");
			//append innerHTML code
			flvideoreplacer.innerHTML = "<param name=\"movie\" value=\"http://www.webgapps.org/flowplayer/flowplayer-3.2.5.swf\"></param><param name=\"allowfullscreen\" value=\"true\"></param><param name=\"flashvars\" value='config={\"playlist\":[\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\", {\"url\": \""+videourl+"\",\"autoPlay\":"+autoplay+",\"autoBuffering\":true}]}'></param><img src=\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\" width=\""+videowidth+"\" height=\""+videowidth+"\" alt=\"FlashVideoReplacer\" title=\"No video playback capabilities.\" />";
*/
		    }
		}
	    }

	    if(replacemethod === "newtab"){

		//declare element to be replaced
		videoplayer = window.document.getElementById(videoelement);

		if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		    childdivs = videoplayer.getElementsByTagName("div");
		    videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
		}

		//content.window.location.href = videourl;
	    }

	    if(replacemethod === "newwindow"){

		//declare element to be replaced
		videoplayer = window.document.getElementById(videoelement);

		if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
		    childdivs = videoplayer.getElementsByTagName("div");
		    videodiv = childdivs[2];
		    //replace video
		    videodiv.parentNode.removeChild(videodiv);

		}else{
		    //replace video
		    videoplayer.parentNode.removeChild(videoplayer);
		}

		//set videourl pref
		//this.prefs.setCharPref("videourl",videourl);
		//launch player
		//if(osString.match(/Windows/)){
		   // window.open(videourl, 'flvideoreplacer-player', 'content,centerscreen,alwaysRaised,resizable=yes,width=600em,height=400em').focus();
		//}else{
		   // window.openDialog('chrome://flvideoreplacer/content/player.xul', 'flvideoreplacer-player', 'chrome,centerscreen,alwaysRaised,resizable=yes,width=600em,height=400em').focus();
		//}
	    }
	}
    };

}, false);