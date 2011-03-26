var flvideoreplacerListener = {

		init: function() {
			var appcontent = document.getElementById("appcontent"); // browser
			if(appcontent) {
				appcontent.addEventListener("DOMContentLoaded", function (event) { flvideoreplacerListener.onPageLoad(event); }, true);
			}
		},

		onPageLoad: function(aEvent) {

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var delay = this.prefs.getIntPref("delay");
			var enabled = this.prefs.getBoolPref("enabled");

			if(enabled === true){

				setTimeout(function () { 

					//get original target document and url
					var doc = aEvent.originalTarget;
					var sourceurl = doc.location.href;

					//declare variables
					var replacevideo = false, replacemethod, preferwebm, videoelement, testelement;

					if(sourceurl.match(/youtube.*watch.*v\=.*html5=True/)){
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.");

						//get prefs
						preferwebm = this.prefs.getBoolPref("preferwebm");
						replacevideo = this.prefs.getBoolPref("youtube");
						//redirect webm
						if(preferwebm === false && replacevideo == true){
							var newlocation = sourceurl.replace(/\&html5=True/,"");
							doc.location.href = newlocation;
						}
					}

					if((sourceurl.match(/youtube.*watch.*v\=/)  && !sourceurl.match("html5=True")) 
							|| sourceurl.match(/vimeo\.com\/\d{1,8}/)
							|| (sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))
							|| sourceurl.match(/blip\.tv\/file\/.*/)
							|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
							|| sourceurl.match(/youporn\.com\/watch\//)
							|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
							|| sourceurl.match(/redtube\.com\/\d{1,8}/)
					){

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.");

						//get prefs
						replacemethod = this.prefs.getCharPref("method");
						preferwebm = this.prefs.getBoolPref("preferwebm");
						//reset promptmethod
						this.prefs.setCharPref("promptmethod",replacemethod);

						//check if video should be replaced
						if(sourceurl.match(/youtube.*watch.*v\=/)){
							replacevideo = this.prefs.getBoolPref("youtube");
							videoelement = "movie_player";
						}
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							replacevideo = this.prefs.getBoolPref("vimeo");
							videoelement = "meat";
						}
						if(sourceurl.match(/metacafe\.com\/watch\//)){
							replacevideo = this.prefs.getBoolPref("metacafe");
							videoelement = "FlashWrap";
						}
						if(sourceurl.match(/blip\.tv\/file\/.*/)){
							replacevideo = this.prefs.getBoolPref("bliptv");
							videoelement = "video_player";
						}
						if(sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){
							replacevideo = this.prefs.getBoolPref("ustream");
							videoelement = "v2";
						}	    
						if(sourceurl.match(/youporn\.com\/watch\//)){
							replacevideo = this.prefs.getBoolPref("other");
							videoelement = "player";
						}
						if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){
							replacevideo = this.prefs.getBoolPref("other");
							videoelement = "VideoPlayer";
						}
						if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
							replacevideo = this.prefs.getBoolPref("other");
							videoelement = "redtube_flv_player";
						}

						//declare element to be replaced
						testelement = doc.getElementById(videoelement);

						if (testelement !== null) {

							if(replacevideo === true){

								if(sourceurl.match(/youtube.*watch.*v\=/)){

									//fetch video ID from url
									var videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");

									if(preferwebm === true && replacemethod === "embedded"){

										try{
											//redirect to webm page
											var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
											var webmRequest = new XMLHttpRequest();
											webmRequest.open('GET', webmurl, true);
											webmRequest.onreadystatechange=function(){
												if (this.readyState === 4 && this.status === 200) {
													var webmsource = webmRequest.responseText;
													var newlinewebm = webmsource.split("\n");
													var replacewebm = false;
													for(var i=0; i< newlinewebm.length; i++){
														//match patterns
														var html5player = /html5-player/.test(newlinewebm[i]);
														if (html5player === true) {
															replacewebm = true;
														}
													}
													if(replacewebm === true){
														flvideoreplacerListener.webmReplace(aEvent);
													}else{
														flvideoreplacerListener.videoFetch(aEvent);
													}
												}
											};
											webmRequest.send(null);
										}catch(e){
											flvideoreplacerListener.videoFetch(aEvent);
										}
									}else{
										flvideoreplacerListener.videoFetch(aEvent);
									}
								}
								if(sourceurl.match(/vimeo\.com\/\d{1,8}/) 
										|| sourceurl.match(/metacafe\.com\/watch\//) 
										|| sourceurl.match(/blip\.tv\/file\/.*/)
										|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
										|| sourceurl.match(/youporn\.com\/watch\//)
										|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
										|| sourceurl.match(/redtube\.com\/\d{1,8}/)
								){
									flvideoreplacerListener.videoFetch(aEvent);
								}
							}else{
								if(sourceurl.match(/youporn\.com\/watch\//)
										|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
										|| sourceurl.match(/redtube\.com\/\d{1,8}/)
								){

									//get osString
									var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
									.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

									//get alert pref
									var alertsinfo = this.prefs.getBoolPref("alertsinfo");

									if(alertsinfo === true && !osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){

										//get localization
										var strbundle = document.getElementById("flvideoreplacerstrings");
										var message = strbundle.getString("supported");
										var messagetitle = strbundle.getString("flvideoreplacermessage");
										//alert user
										alertsService = Components.classes["@mozilla.org/alerts-service;1"]
										.getService(Components.interfaces.nsIAlertsService);
										alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
												messagetitle, message,
												false, "", null);
									}
								}
							}
						}
					}
				}, delay);
			}
		},

		videoFetch: function(aEvent) {

			//get original target document and url
			var doc = aEvent.originalTarget;
			var sourceurl = doc.location.href;

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var replacemethod = this.prefs.getCharPref("promptmethod");
			var prefermp4 = this.prefs.getBoolPref("prefermp4");
			var videoquality = this.prefs.getCharPref("videoquality");
			var placeholder = this.prefs.getBoolPref("placeholder");
			var performance = this.prefs.getIntPref("performance");

			//get mime prefs and declare variables
			var mimetype = this.prefs.getCharPref("mimetype");
			var newmimetype = mimetype;

			//declare video variables
			var videowidth, videoheight, fmt, videourl, downloader;

			//declare XMLHttpRequest variables
			var req, xmlsource, pagecontent, newline, matchpattern, matchpattern2, key;

			//declare test variables
			var videoid, videoelement, testelement, replacevideo = false;

			//declare json variables
			var JSONStrings, videojson;

			if(sourceurl.match(/youtube.*watch.*v\=/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");
				//declare element to be replaced
				testelement = doc.getElementById('movie_player');

				if (testelement !== null) {

					if(performance === 3){

						//injected empty div
						var divreplacer = doc.createElement('div');
						divreplacer.setAttribute("id", "movie_player");
						divreplacer.setAttribute("style"," width:"+videowidth+";"+" height:"+videoheight+";"+" text-align:center; vertical-align:middle; margin: auto;");
						testelement.parentNode.replaceChild(divreplacer, testelement);
					}

					//get xml document content
					req = new XMLHttpRequest();   
					req.open('GET', "http://www.youtube-nocookie.com/watch?v="+videoid, true);
					req.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							if(replacemethod === "standalone"){
								//fetch page html content
								pagecontent = req.responseText;
							}else{
								//fetch page html content
								//pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
								pagecontent = doc.getElementById("postpage").innerHTML;
							}
							pagecontent = req.responseText;
							newline = pagecontent.split("\n");

							for(var i=0; i< newline.length; i++){

								//match patterns
								matchpattern = /var swfConfig/.test(newline[i]);

								if (matchpattern === true) {

									newline[i] = newline[i].replace(/.*"fmt_stream_map": /,"").replace(/\\u0026/g,"&");

									//declare video quality based on user settings and video availability
									fmt = "18";

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.downloadersource.");

									if(performance === 4){

										if (videoquality === "LOW"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}
											}
										}

										if (videoquality === "MEDIUM"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
												fmt = "35";
												videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
										}

										if (videoquality === "HIGH"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
												fmt = "35";
												videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
												fmt = "22";
												videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
										}

										if (videoquality === "SUPER"){

											if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
												fmt = "5";
												videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
												fmt = "34";
												videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
												fmt = "35";
												videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "application/x-flv";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if(prefermp4 === true){
												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
												fmt = "22";
												videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
												fmt = "37";
												videourl = decodeURIComponent(newline[i]).replace(/.*37\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
											if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
												fmt = "38";
												videourl = decodeURIComponent(newline[i]).replace(/.*38\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}
										}

									}else{

										if (videoquality === "LOW"){

											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if((replacevideo === false) || (replacevideo === true && prefermp4 === false)){

												if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
													fmt = "34";
													videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "application/x-flv";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false){

													if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
														fmt = "5";
														videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "application/x-flv";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}
												}
											}
										}

										if (videoquality === "MEDIUM"){

											if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
												fmt = "18";
												videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if(replacevideo === false || (replacevideo === true && prefermp4 === false)){

												if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
													fmt = "35";
													videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "application/x-flv";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false){

													if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
														fmt = "34";
														videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "application/x-flv";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}

													if(replacevideo === false){
														if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
															fmt = "5";
															videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
															replacevideo = true;
															if(mimetype === "autodetect"){
																newmimetype = "application/x-flv";
															}
															//store download path
															this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
														}
													}
												}
											}
										}

										if (videoquality === "HIGH"){

											if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
												fmt = "22";
												videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if(replacevideo === false){

												if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
													fmt = "18";
													videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false || (replacevideo === true && prefermp4 === false)){

													if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
														fmt = "35";
														videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "application/x-flv";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}
													if(replacevideo === false){

														if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
															fmt = "34";
															videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
															replacevideo = true;
															if(mimetype === "autodetect"){
																newmimetype = "application/x-flv";
															}
															//store download path
															this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
														}

														if(replacevideo === false){
															if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
																fmt = "5";
																videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																replacevideo = true;
																if(mimetype === "autodetect"){
																	newmimetype = "application/x-flv";
																}
																//store download path
																this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
															}
														}
													}
												}
											}
										}
										if (videoquality === "SUPER"){

											if (newline[i].match(/\,38\|http\:/) || newline[i].match(/\"38\|http\:/)) {
												fmt = "38";
												videourl = decodeURIComponent(newline[i]).replace(/.*38\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
												replacevideo = true;
												if(mimetype === "autodetect"){
													newmimetype = "video/mp4";
												}
												//store download path
												this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
											}

											if(replacevideo === false){

												if (newline[i].match(/\,37\|http\:/) || newline[i].match(/\"37\|http\:/)) {
													fmt = "37";
													videourl = decodeURIComponent(newline[i]).replace(/.*37\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
													replacevideo = true;
													if(mimetype === "autodetect"){
														newmimetype = "video/mp4";
													}
													//store download path
													this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
												}

												if(replacevideo === false){

													if (newline[i].match(/\,22\|http\:/) || newline[i].match(/\"22\|http\:/)) {
														fmt = "22";
														videourl = decodeURIComponent(newline[i]).replace(/.*22\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
														replacevideo = true;
														if(mimetype === "autodetect"){
															newmimetype = "video/mp4";
														}
														//store download path
														this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
													}

													if(replacevideo === false){

														if (newline[i].match(/\,18\|http\:/) || newline[i].match(/\"18\|http\:/)) {
															fmt = "18";
															videourl = decodeURIComponent(newline[i]).replace(/.*18\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
															replacevideo = true;
															if(mimetype === "autodetect"){
																newmimetype = "video/mp4";
															}
															//store download path
															this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
														}

														if(replacevideo === false || (replacevideo === true && prefermp4 === false)){

															if (newline[i].match(/\,35\|http\:/) || newline[i].match(/\"35\|http\:/)) {
																fmt = "35";
																videourl = decodeURIComponent(newline[i]).replace(/.*35\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																replacevideo = true;
																if(mimetype === "autodetect"){
																	newmimetype = "application/x-flv";
																}
																//store download path
																this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
															}
															if(replacevideo === false){

																if (newline[i].match(/\,34\|http\:/) || newline[i].match(/\"34\|http\:/)) {
																	fmt = "34";
																	videourl = decodeURIComponent(newline[i]).replace(/.*34\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																	replacevideo = true;
																	if(mimetype === "autodetect"){
																		newmimetype = "application/x-flv";
																	}
																	//store download path
																	this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
																}

																if(replacevideo === false){
																	if (newline[i].match(/\,5\|http\:/) || newline[i].match(/\"5\|http\:/)) {
																		fmt = "5";
																		videourl = decodeURIComponent(newline[i]).replace(/.*5\|/g,"").replace(/\\/g,"").replace(/\|\|.*/g,"");
																		replacevideo = true;
																		if(mimetype === "autodetect"){
																			newmimetype = "application/x-flv";
																		}
																		//store download path
																		this.prefs.setCharPref("youtube."+videoid+"."+fmt,videourl);
																	}
																}
															}
														}
													}
												}
											}
										}
									}
									if (replacevideo === true){

										//access preferences interface
										this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
										.getService(Components.interfaces.nsIPrefService)
										.getBranch("extensions.flvideoreplacer.");
										//set file mime type
										if(mimetype === "autodetect"){
											this.prefs.setCharPref("filemime",newmimetype);
										}else{
											this.prefs.setCharPref("filemime",mimetype);
										}

										//access preferences interface
										this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
										.getService(Components.interfaces.nsIPrefService)
										.getBranch("extensions.flvideoreplacer.video.");

										//store video branch
										videojson = {};
										videojson.sitename = "YouTube";
										videojson.sitestring = "youtube";
										videojson.videowidth = "100%";
										videojson.videoheight = "100%";
										videojson.videoelement = "movie_player";
										videojson.videofmt = fmt;
										videojson.videomime = newmimetype;
										videojson.videourl = videourl;
										JSONStrings = JSON.stringify(videojson);
										this.prefs.setCharPref("youtube."+videoid,JSONStrings);

										//replace
										if(replacemethod === "embedded"){
											if(placeholder === true){
												flvideoreplacerListener.placeHolder(aEvent,"youtube."+videoid);
											}else{
												flvideoreplacerListener.videoReplace(aEvent,"youtube."+videoid);
											}
										}else{
											flvideoreplacerListener.placeHolder(aEvent,"youtube."+videoid);
										}
									}
									break;    
								}
							}
						}
					};
					req.send(null);
				}
			}
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*\//g, "");
				//declare element to be replaced
				videoelement = "meat";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					var signature = false;
					var signature_expires = false;

					//declare xml file with authentication data to be downloaded
					xmlsource = "http://vimeo.com/moogaloop/load/clip:"+videoid;

					//get xml document content
					req = new XMLHttpRequest();   
					req.open('GET', xmlsource, true);
					req.onreadystatechange = function () {

						if (this.readyState == 4 && this.status == 200) {

							//read lines
							pagecontent = req.responseText;
							newline = pagecontent.split("\n");

							for(var i=0; i< newline.length; i++){

								//match patterns
								var matchrequest_signature = /<request_signature>/.test(newline[i]);
								var matchrequest_signature_expires = /<request_signature_expires>/.test(newline[i]);

								if (matchrequest_signature === true) {

									//replace unneeded characters and declare new value
									request_signature = newline[i].replace(/<request_signature>/, "");
									request_signature = request_signature.replace(/<\/request_signature>/, "");
									request_signature = request_signature.replace(/\s/g, "");
									//declare the video should be replaced
									signature = true;
								}

								if (matchrequest_signature_expires === true) {

									//replace unneeded characters and declare new value
									request_signature_expires = newline[i].replace(/<request_signature_expires>/, "");
									request_signature_expires = request_signature_expires.replace(/<\/request_signature_expires>/, "");
									request_signature_expires = request_signature_expires.replace(/\s/g, "");
									//declare the video should be replaced
									signature_expires = true;
								}
							}
							if(signature === true && signature_expires === true){

								//access preferences interface
								this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService)
								.getBranch("extensions.flvideoreplacer.");

								//declare video url
								videourl = "http://vimeo.com/moogaloop/play/clip:"+videoid+"/"+request_signature+"/"+request_signature_expires+"/?q=sd";
								//declare and store file mime
								if(mimetype === "autodetect"){
									newmimetype = "video/mp4";
									this.prefs.setCharPref("filemime",newmimetype);
								}else{
									this.prefs.setCharPref("filemime",mimetype);
								}
								//access preferences interface
								this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService)
								.getBranch("extensions.flvideoreplacer.downloadersource.");
								//store download path
								this.prefs.setCharPref("vimeo."+videoid,videourl);

								//access preferences interface
								this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
								.getService(Components.interfaces.nsIPrefService)
								.getBranch("extensions.flvideoreplacer.video.");

								//store video branch
								videojson = {};
								videojson.sitename = "Vimeo";
								videojson.sitestring = "vimeo";
								videojson.videowidth = "640";
								videojson.videoheight = "384";
								videojson.videoelement = "meat";
								videojson.videofmt = "97";
								videojson.videomime = newmimetype;
								videojson.videourl = videourl;
								JSONStrings = JSON.stringify(videojson);
								this.prefs.setCharPref("vimeo."+videoid,JSONStrings);

								//replace
								if(replacemethod === "embedded"){
									if(placeholder === true){
										flvideoreplacerListener.placeHolder(aEvent,"vimeo."+videoid);
									}else{
										flvideoreplacerListener.videoReplace(aEvent,"vimeo."+videoid);
									}
								}else{
									flvideoreplacerListener.placeHolder(aEvent,"vimeo."+videoid);
								}
							}
						}
					};
					req.send(null);
				}
			}
			if((sourceurl.match(/metacafe\.com\/watch\//) && !sourceurl.match(/http.*http:\/\/www.metacafe\.com/))){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*watch\//, "").replace(/\/.*/,"");
				//declare element to be replaced
				videoelement = "FlashWrap";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /flashVars.*mediaURL\=.*gdaKey\=/.test(newline[i]);
						matchpattern2 = /flashVars.*mediaURL.*/.test(newline[i]);

						if (matchpattern === true) {
							videourl = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*mediaURL\=/g,"").replace(/\&gdaKey\=.*/,"").replace(/\&amp.gdaKey\=.*/,"").replace(/\\/g,"");
							key = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*gdaKey\=/,"").replace(/\&postRollContentURL.*/,"").replace(/\&amp;postRollContentURL.*/,"");
							videourl = videourl+"?__gda__="+key;
							replacevideo = true;
						}else{

							if (matchpattern2 === true) {
								videourl = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*mediaURL":"http/,"http").replace(/",.*/,"").replace(/\\/g,"");
								key = decodeURIComponent(newline[i]).replace(/\t/g,"").replace(/\n/g,"").replace(/ /g,"").replace(/.*key":"/,"").replace(/"\}.*/,"");
								videourl = videourl+"?__gda__="+key;
								replacevideo = true;
							}
						}
					}

					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							newmimetype = "video/mp4";
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("metacafe."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "Metacafe";
						videojson.sitestring = "metacafe";
						videojson.videowidth = "615";
						videojson.videoheight = "400";
						videojson.videoelement = "FlashWrap";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("metacafe."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(placeholder === true){
								flvideoreplacerListener.placeHolder(aEvent,"metacafe."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"metacafe."+videoid);
							}
						}else{
							flvideoreplacerListener.placeHolder(aEvent,"metacafe."+videoid);
						}
					}
				}
			}
			if(sourceurl.match(/blip\.tv\/file\/.*/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*file\//, "").replace(/\//, "").replace(/\?.*/, "");
				//declare element to be replaced
				videoelement = "video_player";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						var matchpattern = /player\.setPrimaryMediaUrl/.test(newline[i]);

						if (matchpattern == true) {//fetch line with PrimaryMediaUrl

							videourl = newline[i].replace(/player\.setPrimaryMediaUrl\(\"/, "").replace(/\?.*/, "").replace(/.*http/g,"http");
							replacevideo = true;
						}
					}
					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							if(videourl.match(/\.mp4/)){
								newmimetype = "video/mp4";
							}
							if(videourl.match(/\.mov/)){
								newmimetype = "video/x-quicktime";
							}
							if(videourl.match(/\.m4v/)){
								newmimetype = "video/x-m4v";
							}
							if(videourl.match(/\.wmv/)){
								newmimetype = "application/x-ms-wmv";
							}
							if(videourl.match(/\.flv/)){
								newmimetype = "application/x-flv";
							}
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("bliptv."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "Bliptv";
						videojson.sitestring = "bliptv";
						videojson.videowidth = "624";
						videojson.videoheight = "380";
						videojson.videoelement = "video_player";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("bliptv."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(placeholder === true){
								flvideoreplacerListener.placeHolder(aEvent,"bliptv."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"bliptv."+videoid);
							}
						}else{
							flvideoreplacerListener.placeHolder(aEvent,"bliptv."+videoid);
						}
					}
				}
			}
			if(sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*recorded\//, "").replace(/\/.*/g, "");
				//declare element to be replaced
				videoelement = "v2";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("head").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /ustream\.vars\.liveHttpUrl/.test(newline[i]);
						matchpattern2 = /ustream\.vars\.videoPictureUrl/.test(newline[i]);

						if (matchpattern == true) {//fetch line with liveHttpUrl
							videourl = newline[i].replace(/.*ustream\.vars\.liveHttpUrl=\"/, "").replace(/".*/g, "").replace(/\\/g, "");
							//declare and store file mime
							if(mimetype === "autodetect"){
								if(videourl.match(/\.mp4/)){
									newmimetype = "video/mp4";
								}
								if(videourl.match(/\.mov/)){
									newmimetype = "video/x-quicktime";
								}
								if(videourl.match(/\.m4v/)){
									newmimetype = "video/x-m4v";
								}
								if(videourl.match(/\.wmv/)){
									newmimetype = "application/x-ms-wmv";
								}
								if(videourl.match(/\.flv/)){
									newmimetype = "application/x-flv";
								}
								this.prefs.setCharPref("filemime",newmimetype);
							}else{
								this.prefs.setCharPref("filemime",mimetype);
							}
							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.downloadersource.");
							//store download path
							this.prefs.setCharPref("ustream."+videoid,videourl);

							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.video.");

							//store video branch
							videojson = {};
							videojson.sitename = "Ustream";
							videojson.sitestring = "ustream";
							videojson.videowidth = "608";
							videojson.videoheight = "368";
							videojson.videoelement = "v2";
							videojson.videofmt = "97";
							videojson.videomime = newmimetype;
							videojson.videourl = videourl;
							JSONStrings = JSON.stringify(videojson);
							this.prefs.setCharPref("ustream."+videoid,JSONStrings);

							//replace
							if(replacemethod === "embedded"){
								if(placeholder === true){
									flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
								}else{
									flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
								}
							}else{
								flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
							}
						}else{
							if (matchpattern2 == true){
								var pd;
								for (pd=1; pd<=10; pd++){
									var testurl = newline[i].replace(/.*videopic/,"http://ustream.vo.llnwd.net/pd"+pd).replace(/_\d{1,3}x.*/,".flv").replace(/\\/g, "");

									//get xml document content
									req = new XMLHttpRequest();   
									req.open('GET', testurl, true);
									req.onreadystatechange = function () {
										if (this.readyState == 4 && this.status == 200) {

											//declare video url
											videourl = newline[i].replace(/.*videopic/,"http://ustream.vo.llnwd.net/pd"+pd).replace(/_\d{1,3}x.*/,".flv").replace(/\\/g, "");

											//access preferences interface
											this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getBranch("extensions.flvideoreplacer.");

											//declare and store file mime
											if(mimetype === "autodetect"){
												if(videourl.match(/\.mp4/)){
													newmimetype = "video/mp4";
												}
												if(videourl.match(/\.mov/)){
													newmimetype = "video/x-quicktime";
												}
												if(videourl.match(/\.m4v/)){
													newmimetype = "video/x-m4v";
												}
												if(videourl.match(/\.wmv/)){
													newmimetype = "application/x-ms-wmv";
												}
												if(videourl.match(/\.flv/)){
													newmimetype = "application/x-flv";
												}
												this.prefs.setCharPref("filemime",newmimetype);
											}else{
												this.prefs.setCharPref("filemime",mimetype);
											}
											//access preferences interface
											this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getBranch("extensions.flvideoreplacer.downloadersource.");
											//store download path
											this.prefs.setCharPref("ustream."+videoid,videourl);

											//access preferences interface
											this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getBranch("extensions.flvideoreplacer.video.");

											//store video branch
											videojson = {};
											videojson.sitename = "Ustream";
											videojson.sitestring = "ustream";
											videojson.videowidth = "608";
											videojson.videoheight = "368";
											videojson.videoelement = "v2";
											videojson.videofmt = "97";
											videojson.videomime = newmimetype;
											videojson.videourl = videourl;
											JSONStrings = JSON.stringify(videojson);
											this.prefs.setCharPref("ustream."+videoid,JSONStrings);

											//replace
											if(replacemethod === "embedded"){
												if(placeholder === true){
													flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
												}else{
													flvideoreplacerListener.videoReplace(aEvent,"ustream."+videoid);
												}
											}else{
												flvideoreplacerListener.placeHolder(aEvent,"ustream."+videoid);
											}
										}
									};
									req.send(null);
								}
							}
						}
					}
				}
			}
			if(sourceurl.match(/youporn\.com\/watch\//)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*watch\//g, "").replace(/\/.*/,"");

				//declare element to be replaced
				videoelement = "player";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /addVariable\('file'/.test(newline[i]);

						if (matchpattern === true) {
							xmlsource = newline[i].replace(/.*encodeURIComponent\('/,"").replace(/'.*/,"");
							replacevideo = true;
						}
					}

					if(replacevideo === true){

						replacevideo = false;

						//get xml document content
						req = new XMLHttpRequest();   
						req.open('GET', xmlsource, true);
						req.onreadystatechange = function () {
							if (this.readyState == 4 && this.status == 200) {
								//read lines
								pagecontent = req.responseXML;

								var eltrackList = pagecontent.getElementsByTagName('trackList');
								var eltrack = pagecontent.getElementsByTagName('track');
								var elurl = pagecontent.getElementsByTagName('location');

								if (eltrackList.length > 0){
									try{
										for(var i=0; i< eltrack.length; i++){
											if(eltrack[0]){
												videourl = elurl[0].firstChild.nodeValue;
												if(elurl[0]){
													replacevideo = true;
												}
											}
										}
									}catch(e){
										//do nothing
									}
								}
								if(replacevideo === true){
									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.");
									//declare and store file mime
									if(mimetype === "autodetect"){
										newmimetype = "application/x-flv";
										this.prefs.setCharPref("filemime",newmimetype);
									}else{
										this.prefs.setCharPref("filemime",mimetype);
									}
									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.downloadersource.");
									//store download path
									this.prefs.setCharPref("youporn."+videoid,videourl);

									//access preferences interface
									this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
									.getService(Components.interfaces.nsIPrefService)
									.getBranch("extensions.flvideoreplacer.video.");

									//store video branch
									videojson = {};
									videojson.sitename = "YouPorn";
									videojson.sitestring = "youporn";
									videojson.videowidth = "600";
									videojson.videoheight = "470";
									videojson.videoelement = "player";
									videojson.videofmt = "97";
									videojson.videomime = newmimetype;
									videojson.videourl = videourl;
									JSONStrings = JSON.stringify(videojson);
									this.prefs.setCharPref("youporn."+videoid,JSONStrings);

									//replace
									if(replacemethod === "embedded"){
										if(placeholder === true){
											flvideoreplacerListener.placeHolder(aEvent,"youporn."+videoid);
										}else{
											flvideoreplacerListener.videoReplace(aEvent,"youporn."+videoid);
										}
									}else{
										flvideoreplacerListener.placeHolder(aEvent,"youporn."+videoid);
									}
								}
							}
						};
						req.send(null);
					}
				}
			}
			if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*viewkey=/g, "");
				//declare element to be replaced
				videoelement = "VideoPlayer";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						matchpattern = /addVariable\("video_url"/.test(newline[i]);

						if (matchpattern === true) {
							videourl = decodeURIComponent(newline[i]).replace(/.*addVariable\("video_url","/,"").replace(/".*/,"");
							replacevideo = true;
						}
					}

					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							newmimetype = "application/x-flv";
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("pornhub."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "PornHub";
						videojson.sitestring = "pornhub";
						videojson.videowidth = "610";
						videojson.videoheight = "480";
						videojson.videoelement = "VideoPlayer";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("pornhub."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(placeholder === true){
								flvideoreplacerListener.placeHolder(aEvent,"pornhub."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"pornhub."+videoid);
							}
						}else{
							flvideoreplacerListener.placeHolder(aEvent,"pornhub."+videoid);
						}
					}
				}
			}
			if(sourceurl.match(/redtube\.com\/\d{1,8}/)){

				//fetch video ID from url
				videoid = sourceurl.replace(/.*redtube\.com\//g, "");
				//declare element to be replaced
				videoelement = "redtube_flv_player";
				testelement = doc.getElementById(videoelement);

				if (testelement !== null) {

					//fetch page html content
					pagecontent = doc.getElementsByTagName("body").item(0).innerHTML;
					newline = pagecontent.split("\n");

					for(var i=0; i< newline.length; i++){

						//match patterns
						var matchpattern = /FlashVars.*hashlink=/.test(newline[i]);

						if (matchpattern === true) {

							videourl = newline[i].replace(/.*hashlink=/,"").replace(/\&.*/g,"");
							videourl = decodeURIComponent(videourl);
							replacevideo = true;
						}
					}

					if(replacevideo === true){
						//declare and store file mime
						if(mimetype === "autodetect"){
							newmimetype = "application/x-flv";
							this.prefs.setCharPref("filemime",newmimetype);
						}else{
							this.prefs.setCharPref("filemime",mimetype);
						}
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");
						//store download path
						this.prefs.setCharPref("redtube."+videoid,videourl);

						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.video.");

						//store video branch
						videojson = {};
						videojson.sitename = "RedTube";
						videojson.sitestring = "redtube";
						videojson.videowidth = "584";
						videojson.videoheight = "468";
						videojson.videoelement = "redtube_flv_player";
						videojson.videofmt = "97";
						videojson.videomime = newmimetype;
						videojson.videourl = videourl;
						JSONStrings = JSON.stringify(videojson);
						this.prefs.setCharPref("redtube."+videoid,JSONStrings);

						//replace
						if(replacemethod === "embedded"){
							if(placeholder === true){
								flvideoreplacerListener.placeHolder(aEvent,"redtube."+videoid);
							}else{
								flvideoreplacerListener.videoReplace(aEvent,"redtube."+videoid);
							}
						}else{
							flvideoreplacerListener.placeHolder(aEvent,"redtube."+videoid);
						}
					}
				}
			}
		},

		placeHolder: function(aEvent,aBranch) {

			//get original target document and url
			var doc = aEvent.originalTarget;
			var sourceurl = doc.location.href;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var replacemethod = this.prefs.getCharPref("promptmethod");

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.video.");

			//get video json from prefs
			var videodata = this.prefs.getCharPref(aBranch);

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var embeddedstring = flvideoreplacerListener.sanitizeString(strbundle.getString("embedded"));
			var newtabstring = flvideoreplacerListener.sanitizeString(strbundle.getString("newtab"));
			var newwindowstring = flvideoreplacerListener.sanitizeString(strbundle.getString("newwindow"));
			var standalonestring = flvideoreplacerListener.sanitizeString(strbundle.getString("standalone"));

			//parse json
			jsonObjectLocal = JSON.parse(videodata);
			//declare video variables
			var sitename = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitename);
			var sitestring = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitestring);
			var videowidth = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videowidth);
			var videoheight = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoheight);
			var videoelement = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoelement);
			var videourl = jsonObjectLocal.videourl;
			var newmimetype = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videomime);
			var fmt = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videofmt);

			var params, videoplayer, flvideoreplacer, childdivs, videodiv;

			//declare element to be replaced
			videoplayer = doc.getElementById(videoelement);
			//create injected script
			var script = doc.createElement('script');
			script.setAttribute("id", "flvideoreplacer");
			script.setAttribute("branch", aBranch);
			script.textContent = "function sendToFLV(){ " +
			"var method = document.getElementById(\"methodselector\").value; " +
			"var branch = document.getElementById(\"flvideoreplacer\").getAttribute(\"branch\"); " +
			"var element = document.createElement(\"FLVDataElement\"); " +
			"element.setAttribute(\"branch\", branch); " +
			"element.setAttribute(\"method\", method);  " +
			"document.documentElement.appendChild(element); " +
			"var evt = document.createEvent(\"Events\"); " +
			"evt.initEvent(\"FLVReplaceEvent\", true, false); " +
			"element.dispatchEvent(evt);}";
			doc.body.appendChild(script);
			//create the injected placeholder
			flvideoreplacer = doc.createElement('div');
			flvideoreplacer.setAttribute("id", videoelement);
			flvideoreplacer.setAttribute("style"," width:"+videowidth+";"+" height:"+videoheight+";"+" text-align:center; vertical-align:middle; margin: auto;");
			//append innerHTML code
			if(replacemethod === "embedded"){
				flvideoreplacer.innerHTML = "<img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%02X%00%00%01%10%08%06%00%00%00l%85%0A%40%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%0A%08%08%12%A9Cv%00%00%00%20%00IDATx%5E%ED%9D%09%7CT%D5%D9%C6%CF%CC%24%99%EC%0BY%80%2C%90%106%11AvAq%C5%15q%AFkq%ABZ%97%DAZ%DB%EF%EBg%ED%AA%D6Vk%B5uC%5B%15q%A7X%ABE%85%BA%80%0B%EE%80%20%20%82%40%C2%1A%F6%84%EC%99d%E6~%CF%7B%E7%DE0%C9%DC%7Bg%A2A2%C9s~%BF%E3%9D9%CB%7B%CE%F9_3%F7%E1%3D%E7%9E%A3%14%03%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%F4h%02%AE%1E%3Dz%0E%9E%04H%E0%A0%12x%B6%B4%D4%ED%F3%F9%92%DDn%F7ptd%94%CB%E5%1A%AAiZ%11%3E%17%22%F6A%CCFL%B6%E9d%00%E5%2BQ~%17%F2%B7!n%94%88%B4%2F%90%B6%C4%E3%F1T%7C%7F%C3%86f%9B%BAL%26%01%12%20%81%03J%80%02%EB%80%E2%A5q%12%20%81P%02%B3%FA%F7O%C4%F7b%08%A0%D3!%AA%8E%0A%04%02%22%AA%FAI%19%5C%15%D2%E5%A3%86%CFa%BFM%92%D7%3E94%0D%9F%A5rh%3D%11W%9F%23.A%D6%3C%5C%3F%B8%7C%D3%A6%BD%D2%00%03%09%90%00%09%1Ch%02a%3Fb%07%BAA%DA'%01%12%E8Y%04%20%AA%C4%0Bu%1C%E2%C5%10%3A%93%20%92z%1B%04t!%25%C2%C8JP%7DSJ%A1%F6%2CD%D7R%D8%9D%8F%F6%9E%83%B8%FB%12%82KWt%0C%24%40%02%24%D0%D9%04(%B0%3A%9B(%ED%91%00%09%A8%A7%8A%8B%BD%107%A7%00%C5u%88G%23%26%09%96%10%0FT%7Bo%D3wA-%E8%1E%83%9E3%FA%B2%0E%7D%9C%83%3E%CD%BA%B4%BC%7C%CDw%D1%01%B6A%02%24%D0s%08P%60%F5%9C%7B%CD%91%92%C0%01'%00oU)%1A%B9%11%F1b%C4%5CCP%99N%A5%83!%AA%9C%C6%AC%F7%07%9D%932%1F%E3%FA%17x%B4%5Et%AA%C0%3C%12%20%01%12%88%96%00%05V%B4%A4X%8E%04H%C0%96%C0%93%FD%FA%8DA%E6%ED%10T'%23%BA%5B%15%15%3Et%E6%F4%9Fm%07%BEa%86%88%2B%F4O%EF%AEab%3B%3E%DF%85%F5a%0F%C1%AB%C5%05%F2%DF%90%2B%AB%91%00%09%B4%5D%10J%1E%24%40%02%24%D0!%02%F0X%8DD%85%FB%11e%1AP%82%EE%15%0A%99%0A4%92%BB%FAE%DCX%FA%C2%FA%A0%E4r%BBj%DC%5E%EF%1D%DF_%BD%FA%EE%AE%DEs%F6%8F%04H%A0k%12%A0%07%ABk%DE%17%F6%8A%04%BA4%01x%AC%B2!%A2%9E%40'%CF%90%8E%8A%17H.%9D%D5i%C3%B3%D4j.%F4%BB%CDgs%BA%AF%E3%1E%B3%E0%14%A1%AE%AF4%B7GSn%8FKy%3CZ%20!%C1%A5RS%AB%0A%8E%9C%F8%D3%93%EE%B9%E7%C9%CE%1A%1B%ED%90%00%09%F4%0C%02%9D%F6%83%D83pq%94%24%40%02%F0Z%FD%06%14~%2F%24%BE%89%A7*dZ%CE0%D1f%8A%CE%04%BC%15%1F%CA%11%2BP~%0F%A6%ECjpmD%D4%F09%0E%97%14%E4e%22%E6!%CA%9EY%B2%F6K_H%2F%C1F%F0%85%88%40%7C%94YA%F9%05t%7B%94%8A%8FW%01O%9Cre%A4%AB%B4%82B%955p%80%D6%AB%7F%7FWz~%BE%16%97%92%E2%F2%24'%AFm%D8%B6%ED%EC%D2%F3%CE%FB%D2l%83W%12%20%01%12p%22%40%81%E5D%87y%24%40%02%AD%04%20%ACF%E1%CB%5C%C4%02%C4%8En%B1%D0%EAaB%5D%7Da9%84%92%EC%7B%D5%88%EF%0B%10%3F%40%FC%04%DF%97a%A1%F9%9E%D6F%3B%F8%01%7D%1C%86*%E3%10'%20%1E%8BxH%3B%13%FA%A2%2B%97(%AB%B8x%A5!%AA%B4%14%95%3Dd%88%CA%1B%3E%5C%F5*-V%899%B9*!%3DCAX)%08%2B%15%E7%F5*W%5C%9C%E6%8E%8Bs%D5m%D9r_%F6%A1%87%DE%DC%C1n%B18%09%90%40%0F%24%40%81%D5%03o%3A%87L%02%1D%25%00%E1r%17%EA%FC%AF%8Dg%C8%D6%9C%08)%A9%83%10%FA%5B%B3%08%15%E6%20%BEz%D9%C6%8D%1Bl%2BwR%06%B6%8C8%15%EDOCG.T.w%96J%F0*-%D1%AB%25%E6%17%BA%F2%C7%8D%D1%0A%0E%3B%CC%95%98%9B%A3%1223U%7C%06%84UR%92.%AA%DC%F0j%B9%20%021%5D%18%F4%88%89%2Cs%BB%5D%BE%AA%AA-%1B%5Ey%E5%D4C%AF%BCre'u%91fH%80%04%BA!%01%0A%ACnxS9%24%12%E8%2C%02%10V%E2%AD%9A%8F(G%D9%E8%FB%19%E8%0E%20%87%A0%AB)CUIq%A3%E8%A7H%9E%81%E3k%9E%9F%5EV%D6%E4P%FD%80f%3D9a%D2%D8%A4%DE%B9%D3%87%9Cr%CA%E5%BD%06%96%A6%7B%B3z%A9%C4%EC%5E%1A%3CU.%11V%F0R%89%B7*(%AC0L%B79%D4%B6C%D6%02%CD%CD%AE%DD_%7CqS%9Fq%E3%FEv%40%3BL%E3%24%40%021K%C0%F1%872fG%C5%8E%93%00%09%7Ck%02%10W%A7%C2%C8%2B%88q%91D%95%D1%98%B9%C6%C9%F4XU%23%FD%EF%A8%3B%03%5B%1E%1CpOUG%07%BCs%C9%92s0%0D%F8%8B%D4%C2%C2%F1%EE%84%04Q%8E%9Ax%A8%DA%EBG%F3%BB%E1%8D%93iM%5Dh%8A%D2%DC%F7%F5%D7%F3.%1D%3Cx%1A%E6M%FD%1Dm%9F%E5I%80%04%BA7%01%0A%AC%EE%7D%7F9%3A%12%F8F%040%AD%F6%07%E8%88_%A2r4o%E5%B5Y_%05%DD%B1%1D%C7%D0%DC%8E%FA%FF%B8b%F3%E6.%BF%97%D4%AA%C7%1F%3F%3C%7F%F2%E4%DB%D2%8A%8B%A7%89%07%2Bt%CC%A6%A8%B2%80%A8%05d%DA3%10P%0D%BBvm-%9F%3B%F7%98%E1%D7%5C%B3%DE%A2%1C%93H%80%04z(%01%0A%AC%1Ez%E39l%12%B0%22%F0X~%BE%2B%3E%3E%FE%25%E4%9D%85(%E2J%8AE%FA%9D0%3DV%95(%FBk%9F%CF%F7%C8%D5%15%151%E7%D1Y%FE%C0%03%87%F6%3F%E5%94%BB%D3KKO3%C6%EExN%22%04%16%FCV~%D5%5CW%A7U%97%955o%FD%E8%E3%93F%5D%7F%DD%BBV%5C%99F%02%24%D0%F3%08%60%05'%03%09%90%00%09(9%3F0%01%E2%EAC%B08K%84%951W%E6(%AEDY%89%97%07%F1%AF(_%80E%EB%0F%C5%A2%B8%92%FB%3F%F2%C6%1BWe%0E%1A4%F5%AB%C7%1F%9F%04%AF%D4%3A%F3%FF%09%7D%80%11%82%E6%F7%C7%EF-%2B%7B%E7%C9%11%A3%CF%8FP%94%D9%24%40%02%3D%84%00%05V%0F%B9%D1%1C%26%098%11%98YT%94%0C%1D%F19%CA%1C%01%A1%14IPH%BE%A9%3B%3EE%F9!%D8Z%E1%A7Xg%D5%E0%D4F%AC%E4%0D%BB%FA%EA%8FRz%F7%1E%BCk%E9%D2%9F%FB%1B%1B%03Q%F4%5BW%A3B%C4%D5T%3F%7BVq%F1%D5Q%D4a%11%12%20%81nN%40_p%C0%40%02%24%D0s%09%88%B8%C2%9ET%CB%A0%11%06E%E3%AD%11R%A2%25p%F9)%3CV%7F%EDLrXX%3F%18%FD8%0Ck%B8Jp%1D%0A%DB%FD%11%FB%22%CA%A6%A2%89%882m%D7%82%BCZ%7C%DE%8D%B8%19%E2f%BD%96%94%FC%B5%CA%2F%5Cs%C8%A8%11%9FO%B8%E7%1E%C9%FB%D6!o%CC%98%BF%7C%F4%CB_%CE%19y%D3M%FFN%CA%CD%1D-%06%85%0F%DA%B6%F1%EA%09%13q%E7%A9%BFc%1Cq%603%E3%5Bw%82%06H%80%04b%96%80%CD%0FE%CC%8E%87%1D'%01%12%E8%00%01%99%16%14%CF%154%C30C%3CHm%DB%DF%05%94%91%FCm(%7F%2C%3CV_w%A0)%CB%A2h_%C4%D4T%D8%93uO%93%10%B1%ADz0%88%8E%91%F6%CCkH%BA%DEU%F9%AEk%1Do%92%D2%B2%B3%D4%88%0B%2FR%7D%C6%8CV%89%7D%FAT%B8%3D%9E%D7%EB%B7m%9B%7F%E1%A4I%FF~%B7%13%DE%F0%DB%B5l%D9%9D%D9%23F%DC%82%26u%00%22%B2B%D6%60%A9%7D%EB%D7%AB%95%CF%3F%AF%B6%CC%7DU%A9%C6%06s%D1%FFe%F0%EC%3De%F6%9BW%12%20%81%9EE%C0%F6%87%B4ga%E0hI%A0%E7%110%16%B4%CB%9A%AB%23%10m%17%B4%9B%C2%CB%105s%E1%99%D1%CF%1F%FC%A6%01%DE%9D!%A8%7B%0D%E2%95%B0%99%A9%8B%24%04%5Cua%12%95%5D%11zR%2F!Q%B9rs%D5%E1W%5C%A6%F2F%8CP)EEZBz%BAK%B6%5D%80%C8R~%9FO5%EC%DC%B9%A8i%EF%DEGr%0F%3F%FC%D9%A8l%DB%14*%9B%3Bwr%E1%09'%2C%F0%24%26z%AC%05%D6%0B%10Xs%95%AB%B1%11*LW%A2Rl%1A%84(T%17%03%09%90%40O%23%C05X%3D%ED%8Es%BC%24%60%100%DE%16%D4%D7%5C%19%22%C7V%DC%18%E2%EA%AEo%23%AE%20%AC.D%5C%8D%B6%BEB%17%E4%B8%19%11Wz%DBr%C5w%DB%F6%DB%DE4S%5Cy%95%A7wo5%FA%F2%CBU%EE%A8%C3Uj%FF%FE%CA%9B%91%E1%F2%40%5C%C9%0E%EC%E2%FD%C2g-%AD%A8%E8%A8%9C%91%23%9Fi%AE%AF%D7%EAw%EE%9C%F1%CE%F5%D7%E7%7F%93%FF%09J%A6M%7B%7F%C5%C3%0F%976%D7%D4%04%8F%F2%91%06%0C%8FV%D0%9E%EE%DC%D2%83(%2B%19%13%C2%2B8%18%5B%9F%5Ed%20%01%12%E8Y%04(%B0z%D6%FD%E6hI%40'%20%FB%5C%E1%A2%BF-%88%20%FF%B1%147%A2%10%8C%BC%CB!%AE%FEO%AF%DC%C1%80%B6~%02a%25%EB%A2%9EG%14%EF%95%3E%B5gD%B3%5D%CB%F6-%9B%92%D9A%1Cw%A3rr%D4%88%E9%DFW%D9%87%8FPi%85E8%3F0%5D%E9%1B%86B%5C%B5%B7%2F%E3%90%9D%DA%13ss%7Fx%CCC%0Fm%AD%DB%BE%7D%DEgw%DC1%D0%D2%BEC%E2%E8%9F%FF%7C%D3%3FG%8C(%AA%DB%B6m%B9lJj%14%DD%AF%ACB%EA%0A%BA%A0%CEr%BD%0F%91%25k%C8%18H%80%04z%10%01%0A%AC%1Et%B39T%12%10%02%B2C%3B%1E%FE%FA%26%A2NDD%94%20%88F8%13%E2j%96SY%AB%3C%B4s%09b%25l%C8B%F8d)%23%C6%AC%CAF%9F%86.%CB!%CDi%E9j%F8%85%17%AA%DC%C3G%AA%D4~%FDT%7CZZ%EB%117!%E2%AA%D5lk%BB%C15d*)%2F%EF%E4%B1%B7%DE%FAu%F5%C6%8D%FFz%E5%E4%93%3B%24~%A6o%DC%D8xmA%C1%E8%9A%F2%F2%0Ft%25%17%0Ca%2C%8D6%25%3F%09%9F%DF%8E~%8C%2CI%02%24%D0%1D%08P%60u%87%BB%C81%90%40%94%04%20x%E4lA9%FE%C6%9C%16%B4%AC%19%22%AE%A6b%0D%D1%7F%2C%0B%D9%24%C2%5B3%14%ED%7C%0E%1B%CF%40XdH1%11%1B%FB%B5%88M%C5H%C9%22%8E%DCq%CA%9F%92%AC%86%9Cy%26%16%B4%8FQ%A9EE%CA%0Bq%E51%0EfF%9B!%9A'%DC%60h'd%8C%A8%7F%F6%D4%97_%AE%DC%B1x%B1%2C%60%8F%3A%3C%A3T%60xI%C9%E4%9A%8D%1B%DF%17O%96%B4%8B%DE%05EV%3B%09i%B49%1A%5C%1E%8D%BA%01%16%24%01%12%88y%02%14X1%7F%0B9%00%12%E8%10%019%B8%D9%3C%5B0%CC%9Bd%08%2B%7DZ%10%5B7%88%E7%EA%F5%8EX%C7t%E0o%20(V%A3%CEH%D4o%7D%0B%B0%236%A4%0Ff%F9%D6%8F%BA%B8%82%BD%C4D%D5w%F2dUx%D4%24x%AE%20%AE22%14%B6%9E%D7%5CX%D0.%02N%DA%8C%26%04%F5%5E%F0%BFn%AFW%C3%96%0Cw%D6%ED%D8%B1z%F9%FD%F7%0F%8B%A6%BE%94%D9%0CA5%B9%B4%F4%D8%86%DD%BB%3FU%01%BF%88%2C%F0%0Csd%B5%0E%05%AD%5D%23%DE%C3h%ED%B3%1C%09%90%40l%13%88%EE%D7(%B6%C7%C8%DE%93%00%09%80%00%1E%EEw%E12%3C%D4%8B%D3%1E%8C%88%14%04%F9%CF%E5%1D%F1%5CAX%F5B%5C%0A%91%F1%7B%D8h%DD%2B%CA%A9%AD%90%B6uUb%88%3B%BD%7D%DD%23%84%FD%AE%F0y%07%AE_C%3D-%D7%12%BC%9F%26%0F%1B%F6%C9%A0%13%8E_%12%9F%91%F9%25vO%DF%84%85%EB%D5%86X%D2%05%96%D8%08%B1%DB%A1%8F%D8%EBj%C8%A1%D7%5C%B3j%CB%BB%EF%5E%17m%C5%15%F0d%3D0%60%C0%91%CD%B5u%EB5_%B3%EE%C6r%08%92%FB%0A%EEC%AAC%19f%91%00%09t%13%02a%FF%82%ED%26%E3%E20H%80%04B%08%E0%A1%3E%0A_%97%22%3Al%94%A9%8B%1C%A9%25o%0BF%BD%A0%1DS_'A%DC%CCE%BDxCP%89%91H%BF-%A2%85%A4Lh%D9%8D%F8%BE%04q!%E2%C7%88%3B%E0%91%AA%9C%5EVf%B9q%E8%AC%A2%A2%B8%81%17%5E%98%99%98%9D%9D%9D1h%D0%A0%F4%01%03%8EO%CE%CB%9B%E8%CD%CC%1C%13%97%9C%1C%AF7%20%AA%AB%03%C1%ACS%B9f%CD%7F~7t%E89%F7G%B9%87%D6%CEO%3E%CB%5C%FC%C8%8C%AD%BB%DE%7B%2FI%B5%B4%40%ECY%8F%DF%10%80%EF%83%EF1%1D%E8%16%8B%92%00%09%C4%20%81%0E%FD%F8%C4%E0%F8%D8e%12%20%01%10%80%C0%DA%02%AD%91%2F%02%CANt%18%E2%AAC%FB%5C%C1%EE%F50%FF%10bTb%C6h%DF%F44%89%A7j%3D%FA3G%BA%88%EBzx%CD%9A%BF%ED%0D%7B%FB%CA%2B%7B%F5%9F%3A%F5%98%DE%13%26%FC%20)'g%AA%C7%EB%D5%DB%93q%9B%D7%D06%8Cq%07%93%F0E6%10%C5%0F%A3%AB~%FB%F6%2F%17%DFq%C7%84%E3%1Ey%C4R%E0%B5%EF%E7%AC%89G%0E%D7*%B6%AD%90%89Q%E4%D9%FE%B6%1A%0C.%C1X%9Fko%83%DFI%80%04%BA%0F%01%DB%1F%81%EE3D%8E%84%04z6%01%88%A0%DF%80%C0%EF%A1%2F%EC%40%E8n%2B%3C%F8%2B%E0Y%91E%F0Q%05%D8%BD%03%05o%15%DDbT%B0m%C0%B0o%B6%23ZG%D6%82%FD%1E%ED%89%A7%EA%80%85%B9%A7%9C%92q%E4%7D%F7%FD(%A5o%DF%9F%25ddd9%09%2C%11%3EZ%20%A00%F5%A8%FCMM%AA%B9%AEN6)%DD%91%90%944%3Cs%C8%109%96'b%98U%5C%FC%7D%80%7C%DA%89%B5!%E8%9A%FD~%7F%CA%95%5B%B6%C84(%03%09%90%407%24%E0%F8%83%D8%0D%C7%CB!%91%40%8F%22%80%E9%BBl%3C%ECE%1C8y%98L%DD18%DA%E3o%B0%DE%EA%3ET%BA%C9%B0%2BLm%7FK%0C%8F%8D%DE%06%CA%CDE%7Fn%40%3BX%23%FE%DD%86%3D%ABV%FD0%AD_%BF%7B%E2SS%CD5P%D0S%01%11%7BAa%05q%15%C0%CE%EF%BE%9A%1A%D5%B8g%8Fj%A8%D8%AE%F6%AE%FBZm%FA%F8%93%EA%ED%CB%96%0D%BAz%F9%B2%9D%D1%F4%18%C2%F3%05%94%BB%C0Nd%19%02KL%CD%82%C0%BC%3C%1A%9B%2CC%02%24%10%7B%04l%7F%14co(%EC1%09%90%40%7B%02x%D8%CB%96%0Cg%D8%3D%EC%A5%BC%F1%C0%8F%FA%E0f%D3s%25Uuub%13L%D5%26%F6%11%CB%E5%ADD%08%AB%2Fl%8A%7Fg%C9%7BW%AF%BE3c%E0%C0%5B%F0%E6%A1%3E%95%17%80%C7J%BCV-%F5%F5%0AG%EA(l%22%AA%F6%AC%5C%A9%D6-%7CG%DB%B7%E6%2B%E5%F65%BB%94%CFW%E5%F6%FBK%A6o%2C%AF%8A%D4%D1%17%06%0F%F6455%89%A8m%DD%A2%A2%7D%1Da%23m%23%0E%82%C8Z%D7%3E%9F%DFI%80%04b%9F%80%ED%8Fc%EC%0F%8D%23%20%81%9EM%00Bh%24%08%2C%D3%3D4%08Vb%C8x%D0%7F%8A%87%BC%9CG%181D%B9%E6J%17%0F%A6%88%40%BB%BF%85%B0%BA-%A2%F1%EF%B0%C0%D2%BB%EE%CA%3F%E4%AA%AB%16%25df%96%04%7CM%9A%AF%BAF%D6%5C%A9%9A%B22%B5z%DE%3C%B5s%F1b%E5%C1%14%A1jl2%86%A1%7B%DF6B%24%0E%C5%A2%FB%C6H%5D%05%A7%C9(%F3%1E%A2%25w%A9%1F%D4Xj%01%D8%9F%10%C9%1E%F3I%80%04b%8F%00%05V%EC%DD3%F6%98%04%A2%22%80%87%FC%BB(x%B4%8D%93%C9%5C%0F%25%8B%DE%87D35h%BC-%F8_%94%B7%5Dse%A8%11%E9%9F%FC%B6%D4%E2%FB%98%CB7mZ%1BU%87%0FB%A1%5D_%2C%7F8)'%F7%BA%DAM%9B%B5%DD%2BW%B8%96%CD%9E%AD%FC%DB*%94%AB%A1%01%EF%0F%FA%D1%23%0C%D5p%D2%19%82%E8%23%08%A2I%D1t%15%FC%E5p%E9%8Bu%18%16%8E%3Ea%25%A2%17%97q%B0%B98%1A%9B%2CC%02%24%10%3B%04%B8%0FV%EC%DC%2B%F6%94%04%A2%26%0014%06%85E%5C%99b%A8%7D%5D%7DcL%C4%BFE%23%AEd%9F%2B%D8%92%AD%18l%C5%95%E4%19BB%C4%D5G%F8%9C%DB%95%C5%95%00%C9%1D1%F2%FA%3D%CB%97_%5C%F6%EE%3B%AE%CF%1E%FD%BB%16%D8%BCE%B9%EA%F0%D2%A0%88%2B%19E%8802%C66%11%C2%E9%BE%F60%AD%BE%A3%FCO%90.%DE.a%16v%1F%0Cq%25%E2%EB%CFV%F5%99F%02%24%10%DB%04%E8%C1%8A%ED%FB%C7%DE%93%80%25%01%08%AC%D7%F1%E0%3E%D5%10%05%ED%CB%98%8E%A6*%E4%17%40%60%C1%5D%E3%1C%8CMD%0F%17Q%60S%D2%B4)%F9s%E0%919%DF%A6%5CT%C9w%95%0E%F1%9Ez%D3%0D9I%85%85c%D2%8B%8A%0EI%EE%9B_%88%ED%16%920%AF%E6%C2%16%F3~%EC%9E%BE%BBv%F3%E6%0DU_%7D%B5%EC%EB%E7%9F_s%EE%07%1F%D4De%D8%A6%D0%DFG%8C%1C%E7mhX%84%B5V%D8%CB%CBv%C1%BE%E9%F5%931%9E%811%8A%E0t%0C%B8%0F%BF%00%B2%3F%D9a3%A0%89%BD%11%B0%87%7DK%19H%80%04%BA%0B%01%BB%1F%CB%EE2%3E%8E%83%04z%1C%01xXJ1h%99%96%13%3Dd%F97%8E%07%BBp%F9%11%1E%EA%B2%87%95c%90%E3oP%FE%F76%A6%CC%F5%5Dr%95%B6%9E%81%CD%E9%8E%06m2%9F..%C9%0C(%D7%E9Zj%EA%05%FD%A7%9E%3Aa%C8%B4%D3s3%06%0F%09%1E%87%13%17gN%B3%85%ADi%F2%E3%CD%BF%C6%DD%BB%97%E1%ED%BF%85%E5%AF%BD%F6%C4%E8%9F%FDl%A5M%13%8E%C9O%F6%2F%19%E1R%81OP%C8k%C7%0Dy%A6%C8%AA%C1%1B%88%05Wl%DE%EC%B8G%D6%CC%A2%A2x%AC%DB%927%26%F3%A4q%2B%BB%C6%BDx%01%DC.r%EC%203I%80%04b%8A%00%A7%08c%EAv%B1%B3%24%10%15%81%1B%F1%20%97%BF%ED0qexLD%A4l%F7%F9%7C%8FD%B2%26%077%1B%E2%CAr%9A%0B%F5C%BD%3A%E2%B9%EA%B0%B8%82%20%3C%14%F1%F9%80%16%D8%AE%E2%3CO%C7%E5%F4%9A%DA%EF%88%F19%F0Z)%EC%C8%AE%C9%19%84%A6%B8%B3%12(%9E%84%04%95%DC%B7%EF%C8%AC!C~%3A%EA%E6%9BW%D4n%DB%B6j%F3%5Bo%5D%F5%C2%C8%91%09%91%C6%17%9A%7F%F9%C62y%C3q%22%A2%DFt%C7Y%D4%17%A6%12%D3!%9C%9E%B6%C8o%93%04%01%26%1B%A7%FEV%EAX%F5%DD(%2C%0C%CF%06%EB%DCH%F6%98O%02%24%10%3B%04(%B0b%E7%5E%B1%A7%24%10%91%00%BCM%5E%14%BAX%04%82)JB%2B%C9C%5E%B2%E0%7D%B9%FD%EA%8A%0AY%C5%ED%18P%FCy%14%10%01%60%0A%8B%F6%E5%CDtY%FC%DD%A1iA%08%8A%22%08%AB%FF%C0%A0x%9C.%84%26L%D00%0BX%7C%F41*%B9%A8%9F%0B%1B%83*O%7C%F0%F4%1D%F1%F2X%8D%C7%ECL%A8xI%EE%D3%E7%90%C2%13N%F8%C7%99o%BF%BDi%CB%82%05W%B5%EF%B0%D3w%8Ca%19%DA%3A%D9%18%AF%60%D4%05%A4E%90%F4%B30%86%E3-%F2%DA%24aC%D1%C7%90%20%7Bh%D9%89Ta%E8%85%60%D3%17%C43%90%00%09t%0F%02%14X%DD%E3%3Er%14%24%A0%13%80%1E8%05%97%5C%3Bo%89!%18%AAq%FDG%24d%10%3F%97%A0%9C%ED%BA%2B%5D%7D%20%C0N-%DA%8B(4B%DB%83m%D9%01~%23%D2%A6I%B7uW%5B%5C%BC%CB%DB%B7%AF*%18%3B%D6%95%9C%93%2B%DE%2B%25%DE%2BYh.%E2*%D8T%A4%5E%EF%CF%F7%F6%EA%95%97%7F%DCq%FF%A8%DE%BCy%D5%E7%F7%DDW%1CmM%2C%CC_%80%F6nE%7B%821%CC%0B(v%8Cd%0D%A2%E8%A9Hv%B1%5B%BB%08%D9%7B%C4%9E%C4%F6%E5aK%1A%12%94Q%1F2%DD%DE%06%BF%93%00%09t%3D%02%14X%5D%EF%9E%B0G%24%F0m%08%5Cg%88%910%CF%8B!P%E4%01%FFwc%EA*R%3B%0FB%40%C8%83%3F%CC%96T4%C4%87(%831X(%1Fqo(%A9%03%0F%5B%1A%C4%95%2C%E6%96cvt%A1%A2%DB%81%90%0A%24%C4%AB~G%1D%A9R%F2%FB%AA%F8%F4t%85%8D%40%15%16%B4%9Be%1C%3DX%A1%031%FA%15LB%D7qL%CE!%C3%AE%BA%AAl%DB%07%1F%C8%B9%89Q%05%8C%E7N%14%7C%CD(l5~iF%C6%5E%80%F1D%B4%8B%A2%8F%C2%96%1C%8Bci%0B%E9r_%86%C0%23vXT%1Dd!%12%20%81.O%80%02%AB%CB%DF%22v%90%04%A2%23%80%07%7D6J%1E%8D%18%B6%10%5C%2C%88%1E0%AE3%22Y%84%10%92-%062!%20t!%D1%BE%BCh.%89%C8%FAm%B4%5B1%C0f%09%EAl%85%ADC%CD%BE%E8vE%BF%C5%25%A8%24%AC%B9%CA%1F3J%25%E6%E4%A88%1C%D0%2C%02K%82E%F3%ED%BBc%F7%5D%04%90%0A%B4%B4%B8%FC%8D%8D%9A%3B%3E%FE%A1%8F%FE%F8%C7%88c7%8Da%1A%F5%1C%D4w%12%8E%BA%E7%09%E5%EF%B6%EB%80%99%0E%C1V%8D%CFr%A8%B5%DE%A7%F6%C1L%83%BD%CB%DA%E7%F1%3B%09%90%40l%12%A0%C0%8A%CD%FB%C6%5E%93%80%15%81%E3%90%98%24%A2%C8%22%13%C9z%FA%A7x%D8o%B0%C8o%93%84%B2%7F%40%82%E5%3A.)(%C2%02%A1%1C%B6n%8BdK%F2%E1%99%19%85%F2%D2n*%EAJ%3F%E4%12%EC'.%01%BC%25X0i%92J%CE%CF%D7%BDWn%7C%87%F7L%17W%A6%F8%88%A6%1D)%23%E5%5B%EB%C8%F9%82M%3EU%BF%7B%97%DA%BB%E6%2Bm%F5%CB%AF%5C%3Bk%E0%60%D33%E5h%12%5E%3E%1F%DA%3F%D7%E0fUV%1F%07b%0A%C6%17%D1%8B%05%3B%BA%B83%87%1DjP%D2%10EyM%7D%BA%A4%C4%EA%FEY%B5%CF4%12%20%81.L%80%02%AB%0B%DF%1Cv%8D%04%3AH%C0%DC5%3C%DCE%12%14%02%22%3C%22zp%E0%09%BB%10%ED%A6%20Z%3E%E8aC%02f%EF%DCgF%D3%3F%F1%5CA%3C%2C%15%01%81%D8%D6%A6%EE%BD%8AW%09yy%AA%EF%A8%91*%B1W%2F%0D%FB%5D%89%F7J%DA%D0%C5%88D%F9%0C%8F%92%1EqBsX%B3za%04%E3%12%14Y(%E7onV%BE%DAj%D5%B0u%ABk%F5%AB%AF%A9%B8%EAjM%B5%F8N%C3%18%C5%9B%141%40%40%BE%8EB%8BL%FBV%15%8CqE%14%9A%F0%F4%BD%8F%FA%7B%C5%96%8D%3Da3%14%8B%E2%8B%AD%DAa%1A%09%90%40l%11%A0%C0%8A%AD%FB%C5%DE%92%80%25%01%08%86D%3C%B4'%19%FA%25L%18%99%0Ft%8F%C7%23o%05F%0A%BFE%01K%EF%15%EC%98u%E7B%7CD%3C%B8Y%D6%5C%A1%CEr%B1%87%18%D6%2FI%D20%15%D8g%F4(M%F7%5E%A5%A5)7%B6%5D%0847%BBj7mz%A3f%D3%A6%1F%AD%9C1c%F4%9F%DC%EE%24%F4%1D%BA%CB%E3r%23%BE%F7%A3%1F%15lz%E3%8D3%EAw%EE%FC%ABl%3A%0AEenY%DF%DAA%11b~%1CyS%BFc%97%DA%FA%F92U%B3%FA%2B%97jj2U%D8y%60v%7B%24%10%92%8F%FE%7F%DF%E8%BB%95p%95%7C%19W6%C6zb%14%F6f%8A%AD0%A1%19lG%B7%8F%BC%A8%84k%14m%B1%08%09%90%C0A%24%40%81u%10%E1%B3i%12%E8D%02%C5x0%F7%B6%B2g%88%22%11%01%8BpP1%14%86%7D%80%E8%18%02%3BC%AD%04%80%D4%12%01'%82%02%E1%06%7B%2B%FBsP%F6C%7C3%A7%05%DBV%11%B1%26%EB%AC23U%1Fx%AF%92%B2%B1%84L%0B%D4T%AD%5E%FD%3Fw%8C%19%E3M%2F.%FE%DF%B4~%FD%DC%C3%AF%BB%EE%A6%5B4%EDI%D8%FA%0Cq%05%E2%5BG%3F%F8%E0%5D%FDN%3A%E9%84%E4%BC%BC%8F%93rr%86%AD%9B3gbMy%F9%9B%BA%D0%92%01%8B%C7%AB%B9Yk%AA%D6%BDWj%C3%9Bo%2Bw%03%96S%05Z%F4%A1!%8A%98%F9%15D%D1%D4H%E3%80%E7i%23%CA%BF%144%BB_a%9A%F5%C4%1E%824%FB%F3H%B6P%C6%F4%9C%85%895%E9%98%D1%2F%D9%26%82%81%04H%20%C6%09P%60%C5%F8%0Dd%F7I%40%08%E0%C1%7D%BAA%C2%EA%C1%ADk%0E%84h%A6%C5%AE1%CAZ%81%15%3B%A2%AE%E6%C3%7B%25%BB%93%3B%06%88%B5%5BQ%60%B8!%40%C2%CB%8AX%C3%F4%60%E6%E0AZ%E6%80%01.%88%A1%3F%D76%F9%86g%1FvX%C3%EFV%ADz%0E%15d%23T%D9%BA%E0x%C4%C9%88%B2C%7D%3F%C4%91%88%C7!%8A%A7%E7%16%C49%83.%B8%E0%22%08%B2_%AD%9F3g%1Cvu%DF%22%02%AB%05%DE%AB%C6%9D%3B%B5%0D%8B%DEW%CD%10Y%AA%D9%87%A2z%10E%24%11N%AE%C0%D3%E8%A7L%87%3A%06%0C%5B%DA%D1%15%90UA%23%FD%24%D8%8A%B3%CA7%D3%20%D6d%A7x%9F%60%B4*%17%C4%EB%1A%8F%1D%E0e%3F3%06%12%20%81%18%26%40%81%15%C37%8F%5D'%01%93%00%D6C%1D%85%CF%A2%A2%C2%1E%DC%22%98d%C18%C2%ABQ%10%BB%D2%AE%8C!%0A%C4%FE%EF%ED%CA%98%E9%B2%89(%3E%CB%14%9Ch%B2%F0%E2%E2d%C2f%F3%81%C4D%ADh%DC%B8j%7FS%D3%F8%DCQ%A3%3E%CC-(%F8%1D%0A_%8Bx%02%E2a%A8%9B%8F%98%82(S%A0%01D%5D%9C%20%26%23%CA%5B%8E%25(7%1E%F1%1C%C4%3F%0C%BC%E0%82)%F1YY'%EE%5D%BD%FA%F1%E6%9A%1A%17%CE%2BT%9B%3F%FEXs5%E1%B8E%BD%1Fm%F0%88.%CABb%C4ui%D8%80T%8E%1E%FA%10%EDY%0C%069A%F62%D8K%F4o%0E%01m%CA%BA.%CB%20%FA%0D6z%E1~%E5%5B%16%60%22%09%90%40%CC%10%A0%C0%8A%99%5B%C5%8E%92%805%81gKK%DD%F0%C4%8C%B2%F3%AE%A0%96%08%92F%88%04%C7%B7%071%5D%26%82%26%13%E5mE%04%F2%D7%C3%CE%C7%D6%3D%D9%9F%8A%BE%C8%19%87%D2%25%3D%84%97G%12%16%B2%A7%94%14%EF%1At%DA%D4%D1%85%C7%9F%20%5B7%DC%8Cr%B25B1%A2%1CW%23%87P%CBQ3%B2Q%A7%ACl7%FB%25WI%93%7D%A5Dp%D5!%8A%08%93-*%AE%8D%8B%8B%FBI%C6%D0%A1O%D4%94%95%DF%BEq%E9R%97%A9%03%DE%5D%00%00%20%00IDAT%DA%5B%A94%BF%3FXW%F4%91%11%8DNI%FA%F4Y%FD%FA%1D%8Ak%A4%F0%00%0AX%8CE%AF%A6%A7c%0C%D1%EC%C6%3E%DF%AE!%8C%C1%1C%E31ve%98N%02%24%10%1B%04(%B0b%E3%3E%B1%97%24%60K%00g%0A%26%E3%C1%DE%2F%E4%E1%DC%A6%2C%F2%E4%A1%BD%C0%D6%80%91%01%916U%B4%90%B5%20%0Az%C7%90%17q%9A%11%D3d%22V%F4%1D%DA%ED%DA%C4%04%99%A6%12%93%AA%FB_r%F1%91I%C5%FDe%0A%F0%D7%E8%FF%08D%11R%B2%F7%94m%5D%1B%9B%22%B8%F6%A1~%16%FAx%01D%D6%AD%7D%8E%9E%FC%DA%CEM%5B%EE%81%92s%E1%CC%9D%E0%AE%F0%B2%E6K%A2%3B%18%B1b%1E%9B%9CJZ%FC%9Fl%EC%B6%26%83%8Fl%EF%E0%B4%86M%FA%7CR%24%3B%E8%E3%3Bve%84%BD%DC%03%049%13%91%81%04H%20%86%09P%60%C5%F0%CDc%D7I%40%08%60%3Ai%B8%5Cm%84%91L9%C9%13%FB%83H%B4P%FF4%A3%8C%95%B81%3D7%B3%22%D9A%FE%AF%EC%FA%A3%8B%40%89%106%E9%C3%86%9F%3E%F6%DCsG%A0%DD%3B!%5E2%90%DC%2C%02%CB%2C%F2%0D%AE%E2%A9%F3%C1%96%5Ce%DA%F0%CEs%9Fx%EC%C1%E4C%86%BE%934x%B0%2Bi%E8%10%958%24%18%93%06%0FU%89%83%8D%CFC%06kIC%07%9F%3E%F7%A6%9B%8B%9D%C6%86%7D%B1j%90%BF%00%B6%AD%F8%B4%F2%87'%F0%08'%3B%F0%00%AEq%CA7%EC%1F%E2T%86y%24%40%02%5D%9F%80%E3%82%CC%AE%DF%7D%F6%90%04H%00%04dz0%12%08Y%5C%1D)%C86%0F%22%1E%C2%8C%19%0F%FDM%C8_%EFd%04%E2B%D6E%9DmgGD%A0%AEO%E2%13%FE%7C%DA%D33e%1D%D5%1F%8C4K%D1%E2%D4%96C%9E_l%22%7F8%C4%E7%EF%A6%DE%7F%DF%D5%BB%96-%5B%11%F07%7B%B1B_%06'%3Br!%5B%D6%81%E9%83E%9Ftk7%A8%BF%DE%FB%3F%0Ev%25%EB_%88%A7%3A%95%C1%98%26!%3F%D24%AA%1Cp%AD%0B%E3%F6%C1%E01%B4%7D%3A%BF%93%00%09%C4%16%01%0A%AC%D8%BA_%EC-%09%84%11%C0%03y%A8%88%96%A0%A6%08%CB%D6%13%90%BF%CC%3A'%98%8Ai%BD%C1%F8%84%B92%DB%20%8Ad%09%DE%1E%945Q%B6%01%ED%C8%DB%8C%96o%C0%19%22M%A6%E7j%CE_%F6%F93%B2V%0Ae%FB%22%DD%D2%A6h1%E4%CB%AA%EFDx%A5D4%89%C7%5D%04Z%00%83m6%F2-%FB%22mIy%E9Ob%5E%DE%7F%93%F2%F2nO%EE%DB%E7%0F%FA%FA%2B%EB%A0%F9%AA%AB%CF%9AU%D8%EF%96%CB%B6l%92%B5%5D%96%016%C5%83%25%3C%C36M5%D3p%8D8%BD%07%3B%9F%A3%9C%AC%3B%B3%13%B3%B9%10%ABq%E0m%DB%17%CB%0E2%91%04H%A0%CB%10%E0%14a%97%B9%15%EC%08%09%7C3%02xP%CB%1B%7B%B6%CAA%ACb%7B%80%3DN%D6%F1%9C%B7%3DdX%84%83Qw%A1%93%0D%23%EF%02%E9KH%9D%D6*A1%01%9F%91%DBs%7BBB%FC%04%94%99%8A(%8B%D9%F5YC%AB%E8oiI%AA%AB%A9I%F5%C4%C5e%20%A6a%FB%F8T%C4t%14%CE%0E%F8%FD%19%88%22%A2%2C%EB%EA%BB%BEk%9A%07%D7%AB2%87%0F%FFO%9C7%B1%3E1%3BW3%A2%C254%BA2%06%0E%1A8%F4%EA%1F%14%3B%8D%11c%D8%8E%FC%ADV%C2%C8L%C3U%A6'%1D%03%FA%B4%0A%05%C2%C4%95T%0A%B1-%F7%95%81%04H%20F%09P%60%C5%E8%8Dc%B7I%20%84%40%A1%D5%03_%F2E%7C%20%C8%01%CB%8E%01%0F%FC%12%BB%02!%B6%1D%A7%BD%E0q%11%CF%D5%04%94%B7%5C%0F%86%BE%A03.%F5%BD%C5%9F.D%7BG%E3k%3A%A2%ED%9A%2B%88%A7L%18J%91%11%FC%F9%EE%BB%D5%E2%CF%3ES%10%5C%C1n%8A%E3%C7%E5%C2%CAu%D5%0B%E5%12%ECD%16%D2e%F1%FB(%C4%89%CD%F5%F5%8F%B9%13%E2%5D%EE%F88%89*%2Cb%F1%7B%C1q%C7%99%FB%89Y%E2%C0F%AD%F2fcyp%2C%E1E%8C~%F4%09%CFi%9B%02F%8ES%ADF%E9%E2Hv%98O%02%24%D0u%09P%60u%DD%7B%C3%9E%91%40%B4%04l%1F%E8%22v%10%CA%23%19B9%D9%BD%DD%A9%98(%9B%1DN%05%20.r%90%9F%8BhiH%17j%1E%CF%1Bq))%13%20%B0%246%19%5E%A60%0F%94!%AE%E2E%B0%C8%1E%5E%8B%17%2FV%0F%3F%FC%B0%9A7o%9E%AA%DE%B7Oaz1XG%3A%E4r%A5%A3%7C%9C%9D%C8B%1B%5E%E4M%AC%DB%B6m!*%E9S%A9VQDS%E6%A0A%B2%9FX%A4%F0%95%C3%18%A5%AE%07S%AE%05NF%D0%D4F%A7%7C%23%CF%D1F%14%F5Y%84%04H%E0%20%12%E0%1A%AC%83%08%9FM%93%40'%11%C0%193%8E%A1%C217%98%D9_%04%8A%95%C8%92t%84%3D%10%3A%95NvPn%8CQ_*%84%89%2C%DD%8E%A6%FE%83%BC!%F8%5C%88k%9D%95%3Dl%AF%9E%84i%C0V%C1%24ez%E30%E8%B7%17%2CP%0D%F5%F5%BA%C0%1A7~%BC%1A2t%A8j%81GKD%1A%82%BC%85h9%0D%8At%1F%FA5%3A%7B%D4%A8%97%9Akk%5B%12%D2%D2%C2~%F7%8C1%BA%B0_%96%ACE%8B%14D%609%05%0F%DA%EB%8B%02%B6%9EC%E4G%BC'%E8S%9ES%23%CC%23%01%12%E8%DA%04%E8%C1%EA%DA%F7%87%BD%23%81h%08%24%3B%15%B2%13%1E%ED%EA%F4%B5%12WR%C6H%AF%C6%F4X%ADS%3B(gn-%10%26%AE%CCz%C5%E7%7Fo%0D%FA%23%5E.%FB%DF%1E%97%2Bl%3C%F1%F1%F1*%1F%87Ao%D9%B2E%3D%FD%CC3j%CE%9C9j%D7%8E%1D%B2%81%A8%AE%E4%20%C8%5C%10f%896%FD%13%056%10%ED%164UU-j_%C6%10Wz%B2'%D1%DB%FF~%97Jh_%26%F4%3B%CAo%B4c%15R%CEQ%F4B%14Z%8A%C1v%ED%CA.%F3%0C%24%40%021J%C0%FEG.F%07%C4n%93%00%09%EC'%20%E2%01%9E'%D9%BF)R%90%ED%15l%CB%40P%D4%DBf%EE%CF%10%AF%94M%80mO%9C%1Aq%F3%CD%0D%10%17%E2m%B2%5C%DC.S%7D0%A0o%E5%60F(%3C%15%07%81%95%98%98%A8%B2q%20tFz%BA%FA%7C%E9R%F5%AB_%FFZ%AD%5B%B7N%D5%D5%D6*%3F%84%16%82L%05%86M7%22M%CE%1CL%40%99%9C%B8%E4%E40%EF%93%A9%06%B5%80_y%92%93%D2%13%92%92%9C%DE%A6%14%C1%B9%DBf%90%AD%C9h2%DD%A9%0C%F6%D4%92%B5%5C%B6%01m%C8%5B%8A%11%CFH%B45%C0%0C%12%20%81%83N%80%02%EB%A0%DF%02v%80%04%0E%1C%01%F1%B4%E0a%2F%3B%A3G%0Av%DE%1F%BD%1El8%ED%60n%DAN%92%A2%D6%0Da%DD%13%0EvN%CA%C8%C8%40%BEx%A8%EC%16%B7%B7YK%25k%A6%24x%B0%00%3D%D1%EBUIII*55Ueee%A9F%1C%E6%7C%C7%1Dw%A8%F7%DE%7F_%9F6D%10qfiW%D2%11S%E2%D3%D2%AAt%83F%10%EBz%0Bh%07%3BA(%17%DAI-(%88%24%B0%9AD%C8E%08%96%5BUD%A8%13%9A%ED2%A6%3E%3BP%85EI%80%04%BA%12%81%B0%B5%08%5D%A9s%EC%0B%09%90%40%A7%10%88%A8%06%D0%0A%B4%98%ED%CC%9Et%22*%1Bb'%BC%C7%F0*%C9%8C%20%04%12%84%89%88%17%5B%F1%60%8A%9DP%1B%92%26%02K%A6%09%13%12%12tO%96%2C%7C%97%85%EE%F5X%93%F5%E4%93O%AA%AA%CAJu%FC%F1%C7%BB%F2z%F7%F6%B6%04%02%3E%EB~%A8x%8CRwu%B5%06C(%F9%03%FB%B7%9B%F2%24%26Z%8C!%B4%8A%BD%BA%0A%11%5E%DF%FA%1F%AF%18%A3c%3F%DA%8C%83_H%80%04%BA%1C%01%0A%AC.wK%D8!%12%E8%3C%02%F2%C0%87p%8A%F8w%8Er-2-%85%96%ED%1E%EA%D1%D8%90%CD%40%C3%3B%8F%AD%AF%5C%D8%16!.W%5E2T%D0%3F%01CG%85k6%99%CB%83z%0A%B3%E1%86%5D%11U%22%B4%24%CAg%99%16%14%C1u%F1%19g%A8%11%87%1D%A6%D2RS1%C3%E8o%C1X%C2%3A!i%A8%D3%12hjJ%82Rkc_%A6%06%95~%04%22%AA%A1%9D%FA%AD%15%FA%AAy%87%20%8B%D8-%B3%0D%8F%A10%B7%DC%3C%D5%B2%92E%22%FA%2Bp%C2%01Y%94e%12%09%90%40%D7%24%10%F1G%B3kv%9B%BD%22%01%12%88%86%80%F1%C0%8F%B8%96%07%E5j%F1L%CF%B3%13%0EhK%A6%FF%1C%03%04%CC%EE%10%0F%8EQ6%A8%D94L%0F%F69%FCpU%BFcG%5CBvv%23%DA%09%1E%99%D3%CE%22J7%9B%D3%82%ADY%ED%D6U%E1pk%25%82%0B%DE*u%F2%C9'%AB%E1%C3%87%2B%2F%BCZ-~%BF%CF%1F%9CW%0BS%3FhN6%1C%AD%0BTW%0FH%C0%14%A3%04%B3%AF%C1%8D%E1%83%A2%AE%A5%BE%3E%E0k%A8k%EB%E5%0A%1Fu%9A%D4u%60%255%1C%D7%AC%3D%96%9F%2F%08%C2-%EFO%91%7C%EE%E2%EED%88y%24%D0%C5%09%84%FFS%B1%8Bw%98%DD%23%01%12%08%23%10%C9%E3%92%19V%23%3C!%D2%C2%EDT%EC%ED%E4%F8%0F2%88%8E%0Daf%83%F3%7BJ%83%A8%C9%1F%3DJ%B5TWg%A3%5C5%A2%A5-%D1%5DP%3E%BA%F7GD%8C.d%10%B1%B0J%04%94%AA%A9%A9%C1L%A3W%1D%3Ej%94%3A%E1%84%13%D4%A4%A3%8ER%89%C9%C9z%1E%DCW%F5(o%A9Z%90.%EB%A6%F6%A2%3BcB%FB(%E2J%DA0%9DE%BE%9A%9Am%B5%0D%8D%91%BCO%F9a%E3%0COh%B3%D6%AB%7D6%3CoY%C1v%DB%E7%EC%FF%0EAXm%9F%CB%1C%12%20%81%AEN%C0%F2G%AE%ABw%9A%FD%23%01%12%D8O%00%A2%A4%12%0F%EBl%2B%8F%88%F1%10%8Ff%3F%A5%CD%A8%EFt%C4K%26%F2E%A89%09%B1%F0%F3%0Ee%91%3D%BCW%BD%06%0FR)%05%F9*!)q%24l%ECD4%A7%F2%C2%A6%C1%D0%E7%1A%A8%A4%5E%E6x%E4%80f%D9%C1%BD%BE%AEN%E5%E6%E6%AA%B1c%C7%AA)S%A6%A8%DE%7D%FA%A8Z%BCA%A8%1B%08%04%1A%E1R%D2%85%A6%85p%81%C3%CB%B5%C5%D7%D8%B8%2B3%2F%AF%14%F9A%B7%9AT%F3%C3I%84o%C1I%CB%80%16h%F6%AD%C3i%CF%91%3CX%03%A5%1D%87%20M8n%CA%8A%BA%11%EF%89x%04%1D%DA%60%16%09%90%40%17'%40%0FV%17%BFA%EC%1E%09D%22%80%87%F9.%2Bq%25%F5%8Ct%87%ED%13Z%AD%EBG%B7X%88%13%3D%19Q%8E%B5q%DC%DB%09m%ADi%B5%A6%7F%08%EA%98%00%A6%EF%0A%C6%8FUI%10G%9E%A4%E4%EFC8%C8%5EX%B2%D1%A6%E5%DBz%B0%23o%02%B6%F1%DE446%AA4l%CFp%F6%D9g%AB%F3%CE%3BOe%F5%EA%A5%24%CD%10Wx%FD%CF%E5%B4G%97%ECk%F5%99%BB%AEn%90%1B%0B%E3%25%08%17%F1%5E%05p%92%0E%FE%0B%3Bh%12%3B%23%F8%9B%9BW%E8%05%9C%C3%A1%CE%D9J%A6%F6l7%19%95%BA%18_4%F7%24%E2f%A4%11%FA%C1l%12%20%81%83H%80%02%EB%20%C2g%D3%24%D0I%04%B69%D8%11%0DR%EA%90%AFg%E1%81%FF%B5%88%2B%1B%A1%A6O%BB!%7F%90%93%9DK%CB%CBe%BF-%F1b%05%BDR2%5B%87E%E8%C9%D8%204%F7%90C%947%23SK%CE%C9%CD%A9%DD%B0A%B6%8DX%8E%D8v%B5y%88q%F4%C3%87%F6d%E7x%99'Tu%F0%5E%FD%DF%FF%FD%9F%9Av%E6%99%FABt%AC%94%D7Kc%A3Q%F1%5C9%EE0%0F%5BnL%B7%BD%87%1F%BB3%0C%D7Up%9F-%D8pinD%2C%C2%87%9B%0CK%E8%D5%EEO%3E%9B%17%D2%0D%BB%8F%03%F4~Y%04%F4Y%D2%9B.%DB%B8%D1q%EF1%F4i%80%0Dk%E1%AC%DB%C6e%B3E%13L%22%01%12%88%11%02%14X1r%A3%D8M%12p%20%B0%D1%7C(%5B%94%11q%14%CD%02u%DD%FBd%3C%DB-%CC%60%EBu%B7%FBx%CB%8C%B6%89%0Ba%23%B8%0EJ%BCDxc%AF%EF%84q*1'G%C5%A5%A6%E2%2CB%B7JJK%3B%1Fe%A4%9C%08%AD6%9B%8AJ%FBfD%9E%BCq%B8%17%C7%E1%04n%FB%DD%EF%B4%FE%FD%FAi%FA%A6%A2--~%11V%B8V%8A%E7*%B4N%FB%CFb%1F6%96%D6o%D8P%99ZX8A%8C%1B%F3%88%B0%0E%17Z%00o%25b9%98%3B%E0%D1%B4%BA%26%FF%D7%B3_%FC%D0i%8C8%D0Z%5E%85%2C%858%B2%5C%EB%25%E9hb%A5%93%0D%23o%10%CAY%8A%B4%10%DB%D1%1C%08%1DES%2CB%02%24p0%08P%60%1D%0C%EAl%93%04%3A%97%C0F%98%B3%7C%E0%9B%0Fq%2CP%1F%E6%D4%24%B67%F8%5C%F2E%1F%D8%94%13S%13m%F2Z%93Q%E6%09%FD%8BX%C1%DA%2Bwv%8E*%C4%DB%83%5E%EC%C0%EE%817K%EC%A7%F5%EBwb%7DY%99%2C%02%7F%13%E5%93EgXE%08%23%11%2B%1A6%FF%DC%97%9E%95U%85%E9%BD%BDxKp7%04R%25%CC%D7%C2%98%E5n%F0%A6-%BD%1B%9A%96%84%F8Xr%AF%5E7K%3A%16%C2cA%97_%B5%F8Zd%11%98j%86%DC%F2%05%FCZ%0B%AEuU%95%0B%A6%BD%FA%1F%7D%C7R%BB%00%1BC%91g%BB)%AB%B4%811%3A%8A4%A3_%23%EDD%9A%D1v%D84%A9%5D%9F%98N%02%24%D05%09P%60u%CD%FB%C2%5E%91%40%D4%04%F0%A0%FEB%0A%8B%18i_)%E4!%3E%AE%7D%5E%E8w%1C%DD%22%9E%A0%0ADK%A1%26v%10%C6%CC%2C*%EA%E5d%E7%F2M%9B%C4%7B%F3%25%ACh%F0%5Ei%05GL%D0%A7%08%13%D2%D2%95%AC%7F%D2%CF%0C%84%C8J%EF%DB%F7%8Fh%EB9%C42%D8u%7C%D9%06%F9xIP%DF%DF*l%7C%0E%7D%91%DF6Y%E35%A7%A9%BC%3C%C7%9B%95u%04%0Ez%D6%10U%13%DEDl%AC%DD%A7%1A%EB%F6%A9%A6%BAj%E5%AB%DB%E7%F25%D4%BAv-%5D%F2%90%83%3D3%EB%3C%F9%60%D5%173%0D%FD%FD4%0A%3Br%3F%9C%C6%B3%06%2C%9D%F2%A3h%82EH%80%04%0E%26%01%C7%1F%B6%83%D91%B6M%02%24%10%1D%01%3C%D8%97HIQ%40V5%90%2C%CF%FE%09%C8%9Be%95o%A6%A1%DC%EB%F8%FC%03%D11V%A6%90%1E%8FM%3E%8FA%99%7F%3B%DAQ%EA%3E%BC9%F8%0F%0F%16%B5%F7%1F%3F%5E%25%E5%E5%E1%10%E5D%11Wz5y%A5%2F9%2F%AFh%D7%CA%95%E7y%F2%F3g%C0%E6%FF%229%0DQ%3CR%22*%CCq%C8y%7C%BA%C8%90%FE%98%02%26%E4%BB%3E%BDh%E4%85%D6%91%DF5%F1%00-i%D9%BB%E7El.%FA%E2%BE5_%E9%96est%AD9%B8%0BC%B0)%98%0D.%C6%DF%BA%F0%B2%2B_%13%DB%11%C2%89%C8%97~%D9%B1%96~.p%B2%F1tII%3C%BCs%B6%5Bg%18%E3%5C%EDd%83y%24%40%02%5D%9F%00%05V%D7%BFG%EC!%098%12%80%40%A9%80%87GT%83%DD%A2q%11%03%C7%3A%1A%09f%CE%C7%E5%076%DAA%9F%DEC%F8%01%CA8%0A%2C%A5y%9E%D2%12%12%EE%E8s%C4%84%BC%D4~E%0A%E7%FF%B9%DC%B2%7B%3A4%89)%94D%DC%E4%0C%1F~%E9%C6E%8Bv%24%0D%1A4%1B%C7%DE%9C%89q%E4%20%5D%D6L%85yn%8C%B6%A5%972%16%0D%EB%C1%A4%2F%D2!%5D%EB%88%3D%09H%97%B3%0C%7D%E0%B1lOE%C5s%1Bg%CD%9A%A9%B5%B4%24%40Ca%2Bx%2C%8E%AF%AAR%1A6*%95%80%5D%E3%E5%E2%92kBV%D6%5D%3F%AC%ADr%DC%D8%13%EB%AF%86%C0%F60%2B%3Ezg%82%9D%DC%82%05%EE%BB%F4%06l%02%C6g%AEe%0B%15%93%A1%A5e%8C%D1%BC%CDh%D3%02%93I%80%04%BA%02%01%0A%AC%AEp%17%D8%07%12%F8%16%04%BE%BFaC3%D6X%7D%8Eg%FC8%5DmX%87C%AC%93%F7%A7B%E4%FC%1B%0B%CAuO%91%8D%1D%B1%3D%F5%C9~%FD20%7De%BBV%E9%D2M%1B%7CO%9F%FB%BD_%15%8D%19%FD%0F%2F%16%B7%C7c%23P%5D%5C%C1%83%25B%C8%10%22Z%B3%CF%A7%F5%19%3B%F6%7F%BE~%F7%DD%07%E3%FB%F7%FFOzz%FA%A98o%B0%2F%F2%E3%20B%14%FA%22%BB%AF%8B%92%D2%85YP%BF%04%BB%26%9F%D1%17%F9%A2%AB%249%3EG%3ECX5655-%2B%FB%F8%E3%7F%97%FF%FA7w%B7%F8%5B%B2%F1%9E%A0Kv~%97%E0j%0A%3D%F7%1A%FA%2C8K%B7%D5%BDu%EB%8C%FD%24%AC%3F%A1%1F7H%3F%AC%F8%18c%92%8A%2FX%D7%DE%9F%8A%FA%C7C%08%EA%DDq(%FB%8EC%1E%B3H%80%04b%80%00%D7%60%C5%C0Mb%17I%20%0A%022M%E8%F4%C0V%F0%C0%9C%EAd%E7%92%F5%EBe%8AnQ%24%3B%10%13%3Fr%B2%23y%D3%FF5%E7%B1%CC%01%25_%26%A4%A7kP%3F%BA%40%92%60%5EE%C3%89%88jnn%D6z%8F%1A%F5%A3%86%ED%DB'%7D%FC%DE%7B%2FTVVn%C0Q8%01%A4%BB%11%E3%F09%01W%2FDSbccc%92q%95%CF%89%3E_%93%17y%F1%10U%1ED%CC%046%D6m%DE%BCy%FE%CB7%DE%B8%7C%D5%CF~v_%7D%7D%5D6%BCU%D8%F0%01%1E%AB%A6%26%E5%F25%C9%FC%A4%B8%B9%24%06W%9BI%870%9E%E90%E04%26%88%CA8%14%BD%CAJ%5C%19%F5%CC%A9%CC%D9Nv%0C%06g%8Ah%B4%09z%06%F2%97%DA%E43%99%04H%20F%08%D0%83%15%237%8A%DD%24%01'%02x%20%CF%83%00%B8.B%99i%C8w%DC%E7%09%9E%95G%60%EB('!%81%BC%9F%C1%CE%1F%9C%DA%92%BC%1D%9F-%99%9A9dh%99%DB%E3%11%17%94%24%B5%11%80%86%D7G%CEw%D6%D2%0A%0B'%F6%D6%B41%FF%7C%EC%B1%D9%89yyK%8E%3C%F2%C8%13%FB%F4%E9S(%9E)%A8%0D%993%D4%A7%03%8D6u%CF%95x%81%10%5D%10%5BM%EB%D6%AD%5B%BA%E0%B9g%3F%8E%7B%FB%ED%D33%5D%EE%11x%CDOK%90%05WF%AB%A6%B0%0B%E9%B3i%EBEL%E9%BD%12%92n%F9%11%F5%AFA%FBI%16v%CC%F2bo%0F%F6%02%5Bli%C0H%84%C8%95%0D%5B%87%E0%AB%DD%F4%A0%94%5C%01%0F!%8F%C9q%02%C9%3C%12%88%01%02%14X1p%93%D8E%12%88%82%C0%07F%19%AB%07%B7%99v!%CA%5C%EFd%0B%02%E1YL7%3E%23%E2%C7%AA%9C%91%9E%852%3F%840y%D4%AA%8C%996%E2%FA%EB%CA%B7%1Ev%D8%0D%7D%8E%9C%F4%90%B8dPW%EF%07%3E%EA%9E%2C%11H%10P%D8%85%C1%A30%3D%A9R%B2%B2%E2'%9Er%CA%F4%8A%8D%1B%7D%FF%9E%3D%7BqYY%D9%F2%A1%23F%E4%96%96%96%F6NNI%F1%F6%EA%D5%2BY%A6%FA%20%A8%1A%EB%1B%EA%1B*%F7VV%AE%5C%B1b%FD%CEO%3FM%C8%DE%BBwdz%5D%DD%F1IhA%D6%B1%8B%A0%936l%86%A1O%F3%A1%2F%15%E8%C3%C5Nc%08%C9%BB%03%9F%AD%D8J%111'%BC%1E%88d%0B%E5%CE%912v%7C%25%0Be%22n%F3%10%A9%1D%E6%93%00%09%1C%7C%02%96%3F%A2%07%BF%5B%EC%01%09%90%40G%09%40%F4%2C%C1%83%7B%14%EA%85%FD%5D%1B%82B%D2%C7A%189zY%60g%06%EC%FC%D0h%BF%BD-%C3%94%AA%83%1Dy%F3%2Fb%D8%B3j%D5%8C%ACa%C3%AE%D5%17%60I%E7Di%E1%A3%CC%CAa%0AP%04%93jhh%90s%05%B5%7D%FB%F6%B90M%A8_w%EE%DC%A9%1Ajj%02%D5%7B%F7nk%F0%F9%AA%B0%C0%AA%B1%A9%B22P%BBy%8B%C7%D3%D0%90%1AWW%9B%E7%DA%B7%2F%2B%016%92!%D6%121%ED%97%0C%C1%E6%85%B0J%40%8CG%C4%BC%9E%92u%10%E6%1A%2Ci%DF%18%40%0B%BAQ%00A%E9%B8%20%5D%CA%83%C7Oq%B9%D7N%AC%196E0%26O%2F%2Bk%90%EFv%01%B6%16%22%EFX%3B%5B%06%A2)%60%FB%B6%9D%0D%A6%93%00%09%C4%06%01z%B0b%E3%3E%B1%97%24%10%0D%81%F9x%40%8F%B6yx%9BBi%3A%0C9%0A%2C%D4%BF%1Dv%AE%B5%B3%23%E9%C8O%85X%B8%13B%E0%97%91%3A%96%7D%E8%A1%D7%ED%2B%2B%EB%97%5E%5C%7C%9A%88%1B%09%B0!A_%9C%8E%85%ED%BA%F6%0A%F8%F5%8DEu%CF%967%D1%AB%92%92%92T%7D%7D%BD%DBWPP%D8%B8o_a%5DE%85%DA%F4%C5%0A%D5%B2v%AD%F2%E0%90f%11O%10RZ%22%BC_%5EL%07BP%B9%DA%0B%2B%19t%A8B%94%B6%25%09aL4%E2%0ASz%B2Q%E9%DD%D2W%B3%DF%ED%C6%AB%8BF%E4%BD%1CI%5Ca%7B%86tL%87%1E%2B%C5%DBu%CB4)%5C%EAQ%C6%F1%FE%B4k%9F_I%80%04%BA(%01.r%EF%A27%86%DD%22%81%8E%12%C0%C3%F99%BB%3A%22%10%10%E5%01~%B9%5D%193%1D%C2C%CE6%94-%1BD%08%E8%02%A2%7D%10%7B%08%B7%60%F1w~%FB%3C%AB%EF%19%25%25S%AB%D6%AD%7B%11%F5Z%F5%8E%7C4%05%96%D7%EBU%C9)%C9*%23%23Ceee%B9r%B0%03%7C%9F%DE%BDU~%DF%BE%AA%2F%F6%D3%CAMKS%A9%D8%BF%CA%B3c%87%CA%C2%1C%60%16%84Y%26b%06%3CV%A9%10W%C9%B0%85%05RJ%BCW%E2%B9%92%1DF%C5ke4f%8A%20%B9%8A%E7j%04%C6%18%D56%08%10N%B3PG%FE!j%FBf%25%CA%E0%05I%F7%CF%AD%C6%1D%9A%06%E1t%99q%1F%DA%7B%05u%F1%26v%10%179%BD%A1%19%A9%0D%E6%93%00%09t%1D%02%14X%5D%E7%5E%B0'%24%F0%AD%08%E0%01%FE%25%1E%E0%EB%60%C4R%14!%5D%1E%E0%E9%F0%CA%E8%EB%80%22%84%1B%E5%81oWFW%03%22%D8%DCny%EB0%AA%905h%D0%F7v.Yr%07%D4%84%F4C%EA%EB%DE*Y%7F%A5%0B%2Cl%E7%90%9A%9A%AA233U%0E%B6w%90%D8%3B'We%A7%A7%ABL%D9%C3j%C3%06%95%857%013Q%2F%03u%D2!%B0R%11S%60C%A6%08%93%10%C5%83%25%9E-%8F%D8F%AF0%00S%5CI%1F%2B%D0%A6L%0BF%25%AE%C0%E9t%D4%F9%9E%A1%09%C3X%60%08%E6t%E3%7C%D8%DC%10%05%049%AE%C7R%B4%A2%0D%D3%FE%CC(%EC%B0%08%09%90%40%0C%10%A0%C0%8A%81%9B%C4.%92%404%04%E4h%15%849(%ABO%B5Y%04Sl%FC%C2%22%AFM%12%A6%FED%A8%BDdc'%B8H%5B%17%60%AE%92'%C7%8C%7B8%92%3D3%BF%F7%D8%B1%BF%DE%BAp%E1%E9MUUU%86%A6%90MCu%91%95%88%DD%DEM%91%85%3D%B1T%AF%AC%5E*%0BWx%A9T%C2%BE%7D%CA%0F%81%95%81q%A5%A1%3C%BCV%ADQ%84%15%A6%08%F7%AF%BBBc%F8a%D3B%D6%5D%89xy%11%ED%14G3-(%7D%85g.%17c%7FYD%A4%DD%D8%24%0FA%B4%91%B9%5E%CD%AE%A8%D8%3B%0A%99%C5%86%90%B2%12k%D2N%0D%E2%1B%B6F%98A%02%24%10S%04(%B0b%EAv%B1%B3%24%E0L%00%0F%F0Y%22%8Al%84%81%3C%D8%E5A%3E%1E%EB%A7%0Ew%B6%84%82%C1%5D%DB%F5%3A%12%DA%96%97%AF%C8JN%D62%87%0C%BEn%D3%BCy%17E%B2g%E6%17M%99%F2%DA%A2%1Bo%2C%DA%FB%E5%97Oc%A5%3Bv%01%D5%7F%86t%8F%969e(b%2B%15S%86%C9%F1%10%5E%CD%3EU%89%B5Wi%0D%8D*%1Dm%A6C%8C%A5%89%E7%0A%11%0B%DBuq%A5O%0B%22%A2G%BA%1D%DD%60%B0%CB%5B%F1%F1%2C%08%C6%EFa%8DT%F0%8C%9C(%3A%0A%1Br%9E%A0%E1%04%B3%AD%20z%E9A%88%B6M%B6%25%8C%0C%94%FBmH%9F%DA%147%FA)%9D~%0B%FD%AC%8Cd%8B%F9%24%40%02%B1A%80%02%2B6%EE%13%7BI%02Q%11%C0%C3~%0D%0A~%2C%9E%15%5C%C3%BC%2F%A2%08%0CC%B7E2%08%8F%98x%99~)%B6B%EA%05%AB%89yo%A2%8A%EB%DD%DB5%FC%9C%B3%B4%94%92%92%E7%D6%CE%99%EDx%A0th%7B'%3E%FBl%1D%16%BF_%BA%E2%91G%86%EF%5B%B7%EEU%1Cg%A3%F7K%84%9C%DEElB%EA%C7t%A0%AF%AARU%AD%DF%A0v-%5B%AE%5C%FA%19%82aC2%AB%99%D3u%A1%C2%EAF%F1ZA%B4D%DC%E7*%B4o%10%9F%AF%E2%BBx%9BB%93C%3FK7%25%EC%C3%B4lDo%20%BCW%C3Py%0A%EC%B5%8A%BFPc!%ED%FC%C5%AEA%A6%93%00%09%C4%1E%01%0A%AC%D8%BBg%EC1%098%12%C0%83%DF%7CP%5B*%04y%D0%C3%C04%08%89C%1D%0D!%13%82%ED%8F%B8%C8I%C9m%95M%3C%8E%F7%C3%F4%DD%88%0B%CEW%19%03%06%B8%92rs%B4~'%9E%BCh%D5%E3%8F%8F%88d34%FF%F0%1F%FFx%15%D6fM%5Bz%D7%5D%25%7BW%AD%BA%A7~%FB%F6%F5p%BF%E9%E7%046%D7%D4j%F5%DB*%D4%FAw%DFU%9E%DAZ%1C%05%ED77%2Cm5a%08%1Ds%9C%01%8C%ED-%C4%B3%20%ACJ%20%AC%1E%84%D7%CAq%87%F6%F6%7D%05%93g%916%D5%60%D4%3E%3B%F4%3B%8A%B8%AE%BAb%F3%E6z%A7B%92%87%BE%08C%09a%F7%C3%E8%BF%B0%5D%87%FE%9A%7B%99%19%C5y!%01%12%88e%02a%7F%F0%B1%3C%18%F6%9D%04H%20H%00B%A1%02%9Fz%1B%DE%91%B0%BFsC%2F%BD%8E%87%FA%D4H%CC%B0%D8%7B%18%CA%AFj%15%1D%EE8%97%1Fo%F5%0D%3E%F7%1CUr%C2q*%7D%40%A9%F2fe*w%5C%BC%E6%C7%AE%EA%EB_%7Cq%E2!%97_%BE%2C%92%5D%AB%FC%A7%FB%F7%8F%1Br%E5%95%C5%85S%A6%9C%EEN%88%3Fj%D7%AAU%83%17%DF%FF%60%7Fwee%3A%F6q%08%AD%22g%10%CA%DB%8E%B2Vl%05%FA'%3B%D9%7F%88%F1%D8%9E%91h%D5%5Eh%9A%88%2B%D8%B9%18%82%C8%14%93a%DC%A4%BC%B0C%5B%2FA%7C%9E%1B%85M%99%8A%FD%DC%60giO%8E%0CB%FE%D5%E8%FBc%91%EC1%9F%04H%20v%08X%FE%C1%C7N%F7%D9S%12%20%01%2B%02%98%96%BA%09%0F%ED%FB%0C%81eUD%8E%A8%91%ED%05%26A(%7CdU%204%0D%E2C%8E%E1y%D8%E5%81%88JMq%95N%3B%5D%95%9E4%05%E2j%A0%C2%16%EB%CA%83%B7%00e-%95%1C%7B%A357%FB7%CD%9F%7Fr%E9%D9g%2F%88d7%9A%FC%A7%A6LMPe%1B%3C%81%E6%3A%D9%7DAV%96%8B%A7%CA%8F%BE7%A3%EF%1D%F2P%D9%B5gL%0B%EA%9E%2BC%40Y%FE6%EA%99%10v%D8%24%B5%F4%CA-%5Bp%B8%A1s%80%DDwas2%AA%E1%D2%D6%A4aK%0CT%81%5B.%BCa%9D2%16%E7%1E1%97%04H%E0%BB%22%60%F9%23%F2%5D5%CEvH%80%04%0E%0C%01x%9D%E2%F1%00%DF%03%EB%A9%D2B%D8%D3%1Di%C6%03%5E%A6%A6%06G%D3%8B'%07%0E~EKJ%3Cc%00%C4%D5%80)'%A8%F4%D2R%95%D8%2B%5By%B0%20%5D%C4%95%08%08%89bW%C3%E2u%2Cb%BF5w%E4%C8%3B%A3%B1%7D%B0%CA%C8%DB%82%E8%B3%2Ch%975WN%9E%2B%3DO%84%12.%87%83%D9%F2H%7D%C6%3D8%1B%E5_%92jV%FC%0D%7Br%F9%05%EC%DD%1D%C9%1E%F3I%80%04b%8B%00%D7%60%C5%D6%FDboI%20*%02%F0%EC%C8%8Ap9%3FO%9E%ED%96%FF%902%D2%07A%08%C8%E1%CD%11%C3%9A%CA%AAs%06%9D%7F%DE%97%A5S%C4s%05q%95%9D%AD%99%9E%2B%A9l6%A37%88%03%9EsF%8C%F8C%CD%E6%CD%AF%FEF%A9%84%88%C6%0FB%01%D9%E7%0A%3D%95%A9%D4%FE%B8%3A%89%2B%7DZ%D0%10W%17G%23%AE%20%DC%E2a%F7%09D%CB%85%ED%86%3Di%B3%06%9E%B8%7B%0F%C2%F0%D9%24%09%90%C0%01%26%40%81u%80%01%D3%3C%09%1C%2C%02%E2%15%C1%83%BCJ%1CJV%7D0%D2%25%EF.Le%F5%B3*%13%9A%F6%C7%3D%3B%FD%99%B9y%13R%FB%F5%DB%01q%A5%3C%09%5E%AC%BB%8A%D3%05%04D%82%F9%F6%5E%1B3)%85%85S%7FU%5B%BB%AF%E2%A3%8FN%8Bd%FF%BB%CA%97%E3o0%DE%7Fb%FCs%D1wl%97%A5%0BP3%86u%C3%E0%24%F9%B7%80%E9%F3a%05%2C%12%60r%06%EAaO%D4V%DB%EDK%09w%99%8F%FC5%16%E2%B7%B4%CF%E4w%12%20%81%D8'%40%81%15%FB%F7%90%23%20%01%5B%02x%BE%CBA%C5%B6%1E%2Cy%FE%E3!%2F%BF%03%FF%B65%12%921%FC%DAkk7%FD%F7%BF%C3%03%3E_5%C4%95%BE%A1iPC%EC%F7%60IqCX%E8sjq%C9%C9%DE%3EG%1C%F1Z%DD%8E%1D%EF%7Ft%CB-%FD%A3i%E7%40%95%81%B0%FA)%BAT%0D%FB%B6%3B%B4%87%B6m%8A%2B%5C%EF%85%B8%FAS4%FDB%1B%C7%A0%DC%0FL.%16u%CC)%C3%1D%D8%0A%E3o%16%F9L%22%01%12%E8%06%04%2C%7Fx%BB%C1%B88%04%12%20%01%83%00%1E%F8%B27%D6%20%E3%81%1F%FE7%2F%D3_R%D6%E5%FE%E3e%E5e%11%0Fo%96%A2%2Bg%CC%C8%2B%BD%E0%825%DE%AC%AC%CCp%83%D6%E8E%AC%88%F0%AA%DB%B6%ED%A5U%8F%3Ez%CB%84%DBn%5Bk%5D%B2sS1%5D%87%D3s%5C%D7%C0%AAL%99f%19%1Ct%0F%92CK%86%B6%D2%BDL%F7B%08E5%8D%8A%B6%D2a%7F%3Bb%A2a%DB%B2%0D%D8%94%EC%D3%20%DA%E69%F4%81Y%24%40%021L%C0%F2%8F%3F%86%C7%C3%AE%93%00%09%B4%23%20%1B%5Db%0Ao%95.pZE%C5%FEO%98%DF%C3fM%1E%9C-%E3QMiiG_%B3%E4%B3%F7%A3%81%F8%D1%AD%B7f%8E%F8%F1%8F%97%25%E5%E5%F5%97%1F%12S%409%D55%CAH%11W%ED%B6m%1F%EEY%BE%FC%81e%0F%DC%FF%DAY%F3%E6%CB11%9D%1A0%158%04%ED%DD%00%B1s%15%AEI%D2E%11x%D1%F4S%CA%06q%E9%D3%82Qy%AE%A4%F3%10%B3%9F%A0%89q%A8k%F9b%81%941%DA%7F%0B%EB%E4N%EA%D4%01%D3%18%09%90%40%97%22%40%81%D5%A5n%07%3BC%02%07%86%C0%93%25%03%EEuk%DAOq%16%8D%CC%DF%89%D2%10%8F%95%D2p%EC%8C%2B9Iyss%B5%CC%81%A5%AA%EF%B0a%FE%CC%A2%A2%D2%FE%A7%9F%BE)%9A%9E%FCs%EC%D8%C4S%5E%7CqAZ%FF%FE%13E8H%1D%111%11%EA%EA%5BD%A0%8C%B8%CE%5C%D8%AD%BD%A9j%ED%DA%05%8D%7B%F7%FE%EB%CD%87%FF%BE%20%A9%C1%B7%7D%FA%C2%F9%0D%11l%84eCP%E5%A0%0BC%91q%1E%E2%89%88%C3%A4%2BQ%0A%AAV%7B%C68%A4%7F%B2%A0%3D%AA5WR%19B%F6q%B4w%A5%DD%F0%8D~HQWKKK*%B6y%A8km%94%1FH%80%04%BA%1D%81H%3F%84%DDn%C0%1C%10%09%F4T%02%2F%1Cy%D4fOZZ%81'%25E%C5e%A4%BB%D2%F3%F2TJn%AEJ%EF%DDGa'v%D9%2CT%8B%C3%06%A2X%BC%BEg%DE%A9%A7%16%5D%B4vmc%B4%ACv-%5Bv_%AF%E1%C3o%C2v%0D%B6%5B%12%88-C%83%05%AF%D0c%01%1C%7F%D3%B8g%8F%DA%B7v%AD%B6%E4%A9g%5CU%1F%7F%ACTc%FDV%14(G%F1%AF%24%A2%CEF%88%96%DD%F8%2C%FBN%89%88%93%FD%B0%D2%10%F3%11%07%22%CA%8E%F4%03%10K%11%CD%A9%B9%8Ex%ABP-8K%8A%B6%E47Q%CE%2F%9C%1A%CD%DB%82RQ%02%C4%9D%AC%ED%BA%D7N%5C%99%E5%8C%F1_%02%DB%CF%99i%BC%92%00%09tO%02%14X%DD%F3%BErT%24%10F%A0%EC%9F%FF%1C%AE%25zW%C4%A7%A5iq%D8%BB%CA%ED%F5%BAd%0F%2B%89%F1%89I%F2%5D%C5%E1%CD%40%17%0EXn%DC%BD%7B%F9%B5%85%85%A3qn%8C%EC%98%1EU%D8%F0%CA%2B%D3%0A%8E%3B%EE%19%D8O7%95T%A87%AB%8D%B8%82%C5%40K%8Bj%AE%AEV%D5%E5ej%FD%1Bo%AB%AF%E7%CCQ%AE%7DU%9AK%F3c%1AO%17%3C%FA%EF%93)Z%CC%FA%86WJO7%D3P%ACU%D8!%CDQ%E4Y%0DF%EA%04%9Br%BD%04%EF%D2%C5%D1l%22j%DA%C1%B4%A0x%CC%E6%A0%3F%BA%99%D01%87%B6%25y%88%AFc%3DW%C4%DD%F3%AD%FA%C84%12%20%81%D8%22%40%81m%A7%1E%C4%00%00%0C%8BIDAT%15%5B%F7%8B%BD%25%81oE%60%CB%C2%85%3F%C9%1A6%EC%AF%AE8%0F%96%5D%C5%C96%0B%FA%26%A1%CA%E3%C6R%AC%E0%F4!d%8D%E6r%7B%5C5%E5%E5%1F%8C%2C)%99%5Cnxw%A2i%F8%E5%93ON%3D%E6%81%07%9E%CE%184%E8%2CQ%13%226Du%18W%DD%84.4%FC~%D5%D2%D8%A0%EA%B6lQ%BB%3F_%A6%3Ey%F4Q%EC%8F%BE%5D%A9%16_4%CDtJ%19C%0C%E9%C2%0A%9F%F7%A1%8FWa%5D%D4%8B%1D1%0Eq%25bI%0E%87%B6%15u2~c%DCU%5E%AF7%F7%A2%AF%BF%E6%8E%ED%1D%81%CC%B2%24%10%A3%04(%B0b%F4%C6%B1%DB%24%F0M%09%EC%5D%BB%F6%F5%F4%92%92S%B1%03TP%3A%19K%A6%C4%23d%84%D6%B5T%D5%E5%E5%EF%9FRRr%2C%CE%D2%89%DA%93%256%D6%BF%FC%F2%F1%05%C7%1C%F3%9473%B3%A0%8D%C0%92iA%9C%BD%E7%F7%F9T%C3%CE%1D%AA%EA%CB%2F%D5%E2%A7%9EV%F5%CB%BE%C0%04%A0%2C%BBju%5C%7D%D3%E1ES%CF%14Uf%D7%1ED%9F~%11%CD%C1%CD%A1%C6E%5C%C1%C0%AB%C6%D9%85v%BF%A5%A6%BE%12%117%1E%DE%AB%CF%A2%E9%20%CB%90%00%09%C4%3E%01%BB%1F%85%D8%1F%19G%40%02%24%60I%00%AF%AEy%5E%A9%AC%DC%98%90%9E%9Eo%88%AA%D6%DF%01Sd%B5%AA%02%24%607%F6O%7F%D3%AF%DF%91%7F%85%7F%C9%D2%A0C%E2%EE%95%2B%AFO%EF%DF%FF%EE%B8%D4%D4%14%ACl%17u%E5%F2cj%B0i%EF%5EU%BD%FEk%B5%E6%D5%D7%D4%A6%D7%E6)w%1D%D6%7Bk%D0p%11%D7%C7%3B4%169%CBTo%BA%B0B%F1%F9%18%DE%0F%E1%B5%8AjA%7F%A8%F9v%D3%82%E2%A0%B3m%1DmI%DEUXw%F5%B8m!f%90%00%09t%3B%02%DCh%B4%DB%DDR%0E%88%04%9C%09%BC%A1%94%FF%AB'%9E8%C6%DF%D8(%C7%E9%E8k%99%CCh%D64%15%83(%91%B4%A2%A2%F1w%EE%DA%F5%D5%82%2B%AE%C8t%B6%1C%9E%9B3%7C%F8%C3%09ii%A9%FB%D6%AD%BB%A1%A9%B2r%AF%16%F0%CB%BA%2B%AD~%EB%16%B5u%E9%E7%DA%C6%B7%DEV%EE%06%AC%A5%17%11%E2%20R%C2-GN1E%22J%9ASt%FA%C6%A8%F0V%BD%8C%F1%95B%F0%9C%FAM%C4%95%2Ch%87%CD9%86%5D%3Bqe%B6)%1D%9DIq%15%F9~%B1%04%09t7%02%F6%FF%EC%EAn%23%E5xH%80%04%DA%10X%F7%E2%8B%C7%14O%9B%F6%8E%3B%3E%DEq%FD%90(%08%11%2B-%0D%0D%0D%EB%FF%F5%AF%09%87%5Cz%E9%CAo%8A%B2%FC%8D7NL%CA%CA%FC%F9%8E%E5%CBOZ6%F3I%A5%ED%D8%A9T%B3%EF%5B-Po%DF%17SX%19%FD6%B3%E5%E0%EB%070%9Dw7%8E%A6%E9%F0%16%10%A6%91%90%AD%18%9C%E62%5B%05%1D%EA-%80%B8%3A%A1%7D%1F%F9%9D%04H%A0%FB%13%A0%C0%EA%FE%F7%98%23%24%01%5B%02%1B%E7%CF%3F%BFp%CA%94%D9%91%B6W%10%03%22%5CpD%8Ek%F7%B2e%D3q%F4%CD3%B6F%A3%C8%C8V*%EE%DEC%87_%A2jk%2F%86%E5%D6%0D7%C5%93f%B4%D5%FA%F6%60%14%E6%F4%BE%85%0A*%B1%83%A4-%A8%FB%02%3E%CF%86%A7jq4v%EC%CA%18%3B%B4%BF%89%FC%F1%86m%3BQ%DA%AA%EFPv%99%DF%EF%1F%8B7%12%B9%A8%DD%0E%2C%D3I%A0%1B%13%A0%C0%EA%C67%97C%23%81h%08lY%B0%E0%EA%FC%A3%8F%FE%3B%5E%23%B4%13%0D%BA%99P%CF%106%06%9D%3Dm%C8%90K%16a%BA1%9A6%22%95%C1%B4%DB%11%B0%3F%09%E5%26B%C0%8C%C7%E7%3E%F8%2C%FB%5DIt%0A%E2-%92%B5aM%A8%B3%12u%3FD%FC%14%9F%C5s%B4%CB%A9b%B4y%C6%D9%82%F3%60W%F6%D8r%FA%CD%0C%15Wk%F1e%04%16%B5%CB%DE%5D%0C%24%40%02%3D%90%80%D3%8FE%0F%C4%C1!%93%40%CF%24%B0y%E1%C2%EB%0A%26O~8%92%C82%E9%E8%AA%A6%B6%B6%AA%FC%D5W%CF%18%7C%D1EQ%1D%AD%D3Q%B2%106%05%105%7DQ%2F%1BbE%CE%F8%F3b%FD%14f%F9%DC%B2v%AC%1E%B1%0A%E9%3Bp%DD%0A1%D5%E9G%ED%C0k%15%8F6g%C0%BE%1C%DC%AC%8B'%5C%ED~3C%A7%05E%5C%8D%82%B8%92%3E2%90%00%09%F4P%02v%3F%16%3D%14%07%87M%02%3D%97%C0%A67%DF%BC%B4%E0%D8cg%B9%3C%1E%5D%2C8%88%09%1D%92(%0E)S%F9%D5W%CF%AD%9A1%E3'%93%EF%BF_v%5B%EF%16%01%1E%B5%B31%90'0%C4LCS9%AD%B92y%C8u%19%EA%1CA%CFU%B7%F8%DF%80%83%20%81oE%80%02%EB%5B%E1ce%12%E8%5E%04%CA%E6%CE%3D%BD%F0%C4%13_%F1%24%24%88vr%FC%7D%D0%5D%3A%12P%AE%A5%AE%BEq%CF%CA%15%BF%9Bw%D6Y%F7%5E%B9%7D%BB%FEvb%2C%06x%CD%0EG%BF%FF%86x4%A2%E3%94%A91%3E%5Dx%19(%16%60%CD%D5I%5Cs%15%8Bw%9E%7D%26%81%CE'%E0%F8%03%DA%F9%CD%D1%22%09%90%40W'%F0%E5%CC%99%A3%07%9D%7F%FE%FB%9E%A4%A4%24%3B%91%25%82B%F4%97l%1A*2L%0B%04%DDY%0D%15%15%3Bj7o%FA%ED%8C%89%93%1E%BB%AD%93%D6g%7D%17%BC0%1D8%0CS%8F%7F%C4(%CE%C0%B8t%EDh%E8K%DB%DF%C8V%81%19%5C%97%25%5B1%5C%F9%5D%F4%95m%90%00%09%C4%06%01%DB%1F%8F%D8%E8%3E%7BI%02%24p%20%08%CC%BB%E0%82%CC%C9%F7%DD%F7vJ%DF%BE%A3C%85%84%88%0E%C3%5B%A37%8B%CDCE%5C%E1%5CA%9F%E6olra%AF%2B%ADa%C7%0EW%D5%86%F5%3B%97%CE%9E%7D%8F%BF%C9%F7%E8%A5o%BCQ%7D%20%FA%D8%196!%AC%8E%C2%98~%0B%5BS%C4%9E!%AE%ECte%9B%26%0D.%F2%1B%CAMD%3B%E3f%D0%06%09t3%02%14X%DD%EC%86r8%24%D0%99%04v%7F%F1%C5%A3%D9%87%1DvM%88%98%08%9E%25%08a%25A%F3%B7(%08%2B%D5%5CS%A3%EA%B7W%A8%86%ED%3B%B4u%EF%BD%E7%DA%B2%E8%03%CD%B5w%8FK5%F9Z%A0%C0%E6%A0%FE%0C%ACK%3A%20%8B%E1%3B%3A%DE%A7KJ%D2%E1y%BB%0C%F5nF%2C%96%FA%22%AC%E4%12%C9%96p%10%F5%25%22%13%B1%12%E5O%E6%F17%91%A81%9F%04z%26%81%88%3F(%3D%13%0BGM%02%24%60%12(%9F%3F%FFT%BCa%F8%8A%3B11%0E%AA%C2%25G%DE%04ZZ%5C%D8%13K5%D7%D6%AA%C6%DD%BBU%E3%8E%EDj%DB%17%2B%D4%FA7%DFT%CD%DB%B6)WC%83%86%03%9DMw%97%F9%3B%B3%176gB%98%CC%81(%F9%E4%BB%24%8CE%EB%E9h%F7%1C%B4)%C2%EAX%C3%13%D7*%96%E4%7B%94A%D7X%88%AF%E3%E0%E63xps%94%D4X%8C%04z%20%81%A8%7FUz%20%1B%0E%99%04H%C0%20%F0%CF%89%13SO%99%3D%FB%B5%C4%5E%BD%8En%86x%C2%16%0D%98%0E%DC%AB%9Av%EEV%7B%D6%AFW%1B%DE~%5BU%AF%5D%AB%DCM8%F6%A6%19k%DCC%8E%BE%11o%8F)h%60%CE%FC%CD%F1!%EDu%7C%9F%8F%FCw%B0~iMg%C2%86%97*%1E%5E%AA%E3a%FBx%B4s%26l%0F%09%B1o.%5E%8F%CAk%85z%E6BvS%90%5D%82%FE%3E%D7%99%FD%A5-%12%20%81%EEG%80%02%AB%FB%DDS%8E%88%04%0E%18%81-%EF%2C%BC%D8%9D%900%B3i%E7%CE%84%8AU%AB%B5%8A%C5%8B%5D%D5%EB%D7)O%93O)%1F%F6%D44%5E%2C%B4%EA%80%EE%FA%09%BA%8A%F4%8F%16ed%A3%D0%CF!%8CV%E1%BA%1Ee6%E2Z%81%EF%7B%AE%D8%BC%B9%CD%F16%8F%E5%E7%BB%12%12%12%B2%60%23%0F%E5%0AQn%00%3E%0F%C2%E7%91%B8%8EC%D4%CFM%94%E6%90%26%1F%A3y%23P%CA%B5%86%D0z%F2%19%B6%DElii9%1Bo%09%E2dj%06%12%20%01%12p%26%60%F5%23%E7%5C%83%B9%24%40%02%3D%9A%C0%5B%17%5C%1C%B7%B5%BA%EA1%AD%BC%FC2%97%1F%1B%B9%FB%9AD-%89%92%11E%F3%AD%D8%88%F2%82%81%88FB%84%93%DE%9E%F1%BD%BDg**%5B%ED%3B%2C%7D%80%BD%E0%AB%84%C1%BE%C8f%A6W%C0k5%AF%7DY~'%01%12%20%01%3B%02%11%7F%C8%EC*2%9D%04H%A0g%13%98U%3Ap%A0ji~%14ZD%A6%E2%04F%87%BDD%5D%89%A0%85%B0%AAA%DA%AF%B1%5EL%F6%C5b%20%01%12%20%81%0E%11%A0%C0%EA%10.%16%26%01%12hO%00%9Bs%8E%85%C8%FA3%C4%C8%B1F%9E%EE9%12'%90%5C%DB%97%EFj%DFE%1C%9A%1E0%C3y%25o%07%FE%09%FBb%DD%3B%BD%ACL%CE9d%20%01%12%20%81%0E%13%E8%F2%3F~%1D%1E%11%2B%90%00%09%1C%14%02%10Z%87%A1%E1_%22%CA13%5ES%60%99%02%E6%A0t%CA%A6Q%0Bo%95%94%5C%87x%17%D6%7C%CD%C4%9A%AFN9%C4%DA%A6y%26%93%00%09%F4%00%02%14X%3D%E0%26s%88%24%F0%5D%12%C0%E6%9D%B9%F0%FE%5C%0C%11s%1D%DA%D5%DF%DE%0B%11%5B%5Da%1AQ%D7W%06%139%24%FA-%C4%BF%60%8D%D5%07%DF%25'%B6E%02%24%D0%BD%09P%60u%EF%FB%CB%D1%91%C0A%25%00%B1u%18%C4%D5e%E8%C4T%C4%A1%D2%19%11%5B%C6T%9C%BC%E1%F7%5D%08.%7D%81%984%8D%E6%A4%FD%3A%5C%17%E1%FBL%C47%20%ACdJ%90%81%04H%80%04%3A%95%00%05V%A7%E2%A41%12%20%01%2B%02%D8%97%0A%2F%1C%FA%8B!ndO%AA%93q%1D%0F%91%D3K%CA%9A%EB%9Fp%DD%AF%BC%AC%8C8%A4%B5%17j%F2%5DL%87TY%81%A4%0F%D1%84%EC*%BF%18%0B%D7%F79%98c%16%09%90%00%09%7Ck%02%14X%DF%1A!%0D%90%00%09t%94%C0%CC%A2%22%2F%A6%11%F3Q%EF%18%C4%89%88%87%20%8A%87%2B%D7%CA%96%A9%BD%8C%BC%F6%E2)%B4%8A%9C%E1%23%9B%96%AEF%5C%81%F8%0E%04%D5R%08%AA.%7B%1E%A2%D5x%99F%02%24%10%FB%04(%B0b%FF%1Er%04%24%D0m%08%E0H%9B8%0C%A6%08%B1%18%B1%00%E2(%0F%D7%2C%08%AC%94%A0SJ%F7J%C9%B4b%0B%16%A3WC%A4%ED%C6%F7%0A%E4m%C6U6'%AD%86%982%A7%04%91%C4%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%D0%F9%04%FE%1F%16(%A9%BB%0A%EC%FF%BD%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\" selected=\"true\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div>";
			}
			if(replacemethod === "newtab"){
				flvideoreplacer.innerHTML = "<img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%02X%00%00%01%10%08%06%00%00%00l%85%0A%40%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%0A%08%08%12%A9Cv%00%00%00%20%00IDATx%5E%ED%9D%09%7CT%D5%D9%C6%CF%CC%24%99%EC%0BY%80%2C%90%106%11AvAq%C5%15q%AFkq%ABZ%97%DAZ%DB%EF%EBg%ED%AA%D6Vk%B5uC%5B%15q%A7X%ABE%85%BA%80%0B%EE%80%20%20%82%40%C2%1A%F6%84%EC%99d%E6~%CF%7B%E7%DE0%C9%DC%7Bg%A2A2%C9s~%BF%E3%9D9%CB%7B%CE%F9_3%F7%E1%3D%E7%9E%A3%14%03%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%F4h%02%AE%1E%3Dz%0E%9E%04H%E0%A0%12x%B6%B4%D4%ED%F3%F9%92%DDn%F7ptd%94%CB%E5%1A%AAiZ%11%3E%17%22%F6A%CCFL%B6%E9d%00%E5%2BQ~%17%F2%B7!n%94%88%B4%2F%90%B6%C4%E3%F1T%7C%7F%C3%86f%9B%BAL%26%01%12%20%81%03J%80%02%EB%80%E2%A5q%12%20%81P%02%B3%FA%F7O%C4%F7b%08%A0%D3!%AA%8E%0A%04%02%22%AA%FAI%19%5C%15%D2%E5%A3%86%CFa%BFM%92%D7%3E94%0D%9F%A5rh%3D%11W%9F%23.A%D6%3C%5C%3F%B8%7C%D3%A6%BD%D2%00%03%09%90%00%09%1Ch%02a%3Fb%07%BAA%DA'%01%12%E8Y%04%20%AA%C4%0Bu%1C%E2%C5%10%3A%93%20%92z%1B%04t!%25%C2%C8JP%7DSJ%A1%F6%2CD%D7R%D8%9D%8F%F6%9E%83%B8%FB%12%82KWt%0C%24%40%02%24%D0%D9%04(%B0%3A%9B(%ED%91%00%09%A8%A7%8A%8B%BD%107%A7%00%C5u%88G%23%26%09%96%10%0FT%7Bo%D3wA-%E8%1E%83%9E3%FA%B2%0E%7D%9C%83%3E%CD%BA%B4%BC%7C%CDw%D1%01%B6A%02%24%D0s%08P%60%F5%9C%7B%CD%91%92%C0%01'%00oU)%1A%B9%11%F1b%C4%5CCP%99N%A5%83!%AA%9C%C6%AC%F7%07%9D%932%1F%E3%FA%17x%B4%5Et%AA%C0%3C%12%20%01%12%88%96%00%05V%B4%A4X%8E%04H%C0%96%C0%93%FD%FA%8DA%E6%ED%10T'%23%BA%5B%15%15%3Et%E6%F4%9Fm%07%BEa%86%88%2B%F4O%EF%AEab%3B%3E%DF%85%F5a%0F%C1%AB%C5%05%F2%DF%90%2B%AB%91%00%09%B4%5D%10J%1E%24%40%02%24%D0!%02%F0X%8DD%85%FB%11e%1AP%82%EE%15%0A%99%0A4%92%BB%FAE%DCX%FA%C2%FA%A0%E4r%BBj%DC%5E%EF%1D%DF_%BD%FA%EE%AE%DEs%F6%8F%04H%A0k%12%A0%07%ABk%DE%17%F6%8A%04%BA4%01x%AC%B2!%A2%9E%40'%CF%90%8E%8A%17H.%9D%D5i%C3%B3%D4j.%F4%BB%CDgs%BA%AF%E3%1E%B3%E0%14%A1%AE%AF4%B7GSn%8FKy%3CZ%20!%C1%A5RS%AB%0A%8E%9C%F8%D3%93%EE%B9%E7%C9%CE%1A%1B%ED%90%00%09%F4%0C%02%9D%F6%83%D83pq%94%24%40%02%F0Z%FD%06%14~%2F%24%BE%89%A7*dZ%CE0%D1f%8A%CE%04%BC%15%1F%CA%11%2BP~%0F%A6%ECjpmD%D4%F09%0E%97%14%E4e%22%E6!%CA%9EY%B2%F6K_H%2F%C1F%F0%85%88%40%7C%94YA%F9%05t%7B%94%8A%8FW%01O%9Cre%A4%AB%B4%82B%955p%80%D6%AB%7F%7FWz~%BE%16%97%92%E2%F2%24'%AFm%D8%B6%ED%EC%D2%F3%CE%FB%D2l%83W%12%20%01%12p%22%40%81%E5D%87y%24%40%02%AD%04%20%ACF%E1%CB%5C%C4%02%C4%8En%B1%D0%EAaB%5D%7Da9%84%92%EC%7B%D5%88%EF%0B%10%3F%40%FC%04%DF%97a%A1%F9%9E%D6F%3B%F8%01%7D%1C%86*%E3%10'%20%1E%8BxH%3B%13%FA%A2%2B%97(%AB%B8x%A5!%AA%B4%14%95%3Dd%88%CA%1B%3E%5C%F5*-V%899%B9*!%3DCAX)%08%2B%15%E7%F5*W%5C%9C%E6%8E%8Bs%D5m%D9r_%F6%A1%87%DE%DC%C1n%B18%09%90%40%0F%24%40%81%D5%03o%3A%87L%02%1D%25%00%E1r%17%EA%FC%AF%8Dg%C8%D6%9C%08)%A9%83%10%FA%5B%B3%08%15%E6%20%BEz%D9%C6%8D%1Bl%2BwR%06%B6%8C8%15%EDOCG.T.w%96J%F0*-%D1%AB%25%E6%17%BA%F2%C7%8D%D1%0A%0E%3B%CC%95%98%9B%A3%1223U%7C%06%84UR%92.%AA%DC%F0j%B9%20%021%5D%18%F4%88%89%2Cs%BB%5D%BE%AA%AA-%1B%5Ey%E5%D4C%AF%BCre'u%91fH%80%04%BA!%01%0A%ACnxS9%24%12%E8%2C%02%10V%E2%AD%9A%8F(G%D9%E8%FB%19%E8%0E%20%87%A0%AB)CUIq%A3%E8%A7H%9E%81%E3k%9E%9F%5EV%D6%E4P%FD%80f%3D9a%D2%D8%A4%DE%B9%D3%87%9Cr%CA%E5%BD%06%96%A6%7B%B3z%A9%C4%EC%5E%1A%3CU.%11V%F0R%89%B7*(%AC0L%B79%D4%B6C%D6%02%CD%CD%AE%DD_%7CqS%9Fq%E3%FEv%40%3BL%E3%24%40%021K%C0%F1%872fG%C5%8E%93%00%09%7Ck%02%10W%A7%C2%C8%2B%88q%91D%95%D1%98%B9%C6%C9%F4XU%23%FD%EF%A8%3B%03%5B%1E%1CpOUG%07%BCs%C9%92s0%0D%F8%8B%D4%C2%C2%F1%EE%84%04Q%8E%9Ax%A8%DA%EBG%F3%BB%E1%8D%93iM%5Dh%8A%D2%DC%F7%F5%D7%F3.%1D%3Cx%1A%E6M%FD%1Dm%9F%E5I%80%04%BA7%01%0A%AC%EE%7D%7F9%3A%12%F8F%040%AD%F6%07%E8%88_%A2r4o%E5%B5Y_%05%DD%B1%1D%C7%D0%DC%8E%FA%FF%B8b%F3%E6.%BF%97%D4%AA%C7%1F%3F%3C%7F%F2%E4%DB%D2%8A%8B%A7%89%07%2Bt%CC%A6%A8%B2%80%A8%05d%DA3%10P%0D%BBvm-%9F%3B%F7%98%E1%D7%5C%B3%DE%A2%1C%93H%80%04z(%01%0A%AC%1Ez%E39l%12%B0%22%F0X~%BE%2B%3E%3E%FE%25%E4%9D%85(%E2J%8AE%FA%9D0%3DV%95(%FBk%9F%CF%F7%C8%D5%15%151%E7%D1Y%FE%C0%03%87%F6%3F%E5%94%BB%D3KKO3%C6%EExN%22%04%16%FCV~%D5%5CW%A7U%97%955o%FD%E8%E3%93F%5D%7F%DD%BBV%5C%99F%02%24%D0%F3%08%60%05'%03%09%90%00%09(9%3F0%01%E2%EAC%B08K%84%951W%E6(%AEDY%89%97%07%F1%AF(_%80E%EB%0F%C5%A2%B8%92%FB%3F%F2%C6%1BWe%0E%1A4%F5%AB%C7%1F%9F%04%AF%D4%3A%F3%FF%09%7D%80%11%82%E6%F7%C7%EF-%2B%7B%E7%C9%11%A3%CF%8FP%94%D9%24%40%02%3D%84%00%05V%0F%B9%D1%1C%26%098%11%98YT%94%0C%1D%F19%CA%1C%01%A1%14IPH%BE%A9%3B%3EE%F9!%D8Z%E1%A7Xg%D5%E0%D4F%AC%E4%0D%BB%FA%EA%8FRz%F7%1E%BCk%E9%D2%9F%FB%1B%1B%03Q%F4%5BW%A3B%C4%D5T%3F%7BVq%F1%D5Q%D4a%11%12%20%81nN%40_p%C0%40%02%24%D0s%09%88%B8%C2%9ET%CB%A0%11%06E%E3%AD%11R%A2%25p%F9)%3CV%7F%EDLrXX%3F%18%FD8%0Ck%B8Jp%1D%0A%DB%FD%11%FB%22%CA%A6%A2%89%882m%D7%82%BCZ%7C%DE%8D%B8%19%E2f%BD%96%94%FC%B5%CA%2F%5Cs%C8%A8%11%9FO%B8%E7%1E%C9%FB%D6!o%CC%98%BF%7C%F4%CB_%CE%19y%D3M%FFN%CA%CD%1D-%06%85%0F%DA%B6%F1%EA%09%13q%E7%A9%BFc%1Cq%603%E3%5Bw%82%06H%80%04b%96%80%CD%0FE%CC%8E%87%1D'%01%12%E8%00%01%99%16%14%CF%154%C30C%3CHm%DB%DF%05%94%91%FCm(%7F%2C%3CV_w%A0)%CB%A2h_%C4%D4T%D8%93uO%93%10%B1%ADz0%88%8E%91%F6%CCkH%BA%DEU%F9%AEk%1Do%92%D2%B2%B3%D4%88%0B%2FR%7D%C6%8CV%89%7D%FAT%B8%3D%9E%D7%EB%B7m%9B%7F%E1%A4I%FF~%B7%13%DE%F0%DB%B5l%D9%9D%D9%23F%DC%82%26u%00%22%B2B%D6%60%A9%7D%EB%D7%AB%95%CF%3F%AF%B6%CC%7DU%A9%C6%06s%D1%FFe%F0%EC%3De%F6%9BW%12%20%81%9EE%C0%F6%87%B4ga%E0hI%A0%E7%110%16%B4%CB%9A%AB%23%10m%17%B4%9B%C2%CB%105s%E1%99%D1%CF%1F%FC%A6%01%DE%9D!%A8%7B%0D%E2%95%B0%99%A9%8B%24%04%5Cua%12%95%5D%11zR%2F!Q%B9rs%D5%E1W%5C%A6%F2F%8CP)EEZBz%BAK%B6%5D%80%C8R~%9FO5%EC%DC%B9%A8i%EF%DEGr%0F%3F%FC%D9%A8l%DB%14*%9B%3Bwr%E1%09'%2C%F0%24%26z%AC%05%D6%0B%10Xs%95%AB%B1%11*LW%A2Rl%1A%84(T%17%03%09%90%40O%23%C05X%3D%ED%8Es%BC%24%60%100%DE%16%D4%D7%5C%19%22%C7V%DC%18%E2%EA%AEo%23%AE%20%AC.D%5C%8D%B6%BEB%17%E4%B8%19%11Wz%DBr%C5w%DB%F6%DB%DE4S%5Cy%95%A7wo5%FA%F2%CBU%EE%A8%C3Uj%FF%FE%CA%9B%91%E1%F2%40%5C%C9%0E%EC%E2%FD%C2g-%AD%A8%E8%A8%9C%91%23%9Fi%AE%AF%D7%EAw%EE%9C%F1%CE%F5%D7%E7%7F%93%FF%09J%A6M%7B%7F%C5%C3%0F%976%D7%D4%04%8F%F2%91%06%0C%8FV%D0%9E%EE%DC%D2%83(%2B%19%13%C2%2B8%18%5B%9F%5Ed%20%01%12%E8Y%04(%B0z%D6%FD%E6hI%40'%20%FB%5C%E1%A2%BF-%88%20%FF%B1%147%A2%10%8C%BC%CB!%AE%FEO%AF%DC%C1%80%B6~%02a%25%EB%A2%9EG%14%EF%95%3E%B5gD%B3%5D%CB%F6-%9B%92%D9A%1Cw%A3rr%D4%88%E9%DFW%D9%87%8FPi%85E8%3F0%5D%E9%1B%86B%5C%B5%B7%2F%E3%90%9D%DA%13ss%7Fx%CCC%0Fm%AD%DB%BE%7D%DEgw%DC1%D0%D2%BEC%E2%E8%9F%FF%7C%D3%3FG%8C(%AA%DB%B6m%B9lJj%14%DD%AF%ACB%EA%0A%BA%A0%CEr%BD%0F%91%25k%C8%18H%80%04z%10%01%0A%AC%1Et%B39T%12%10%02%B2C%3B%1E%FE%FA%26%A2NDD%94%20%88F8%13%E2j%96SY%AB%3C%B4s%09b%25l%C8B%F8d)%23%C6%AC%CAF%9F%86.%CB!%CDi%E9j%F8%85%17%AA%DC%C3G%AA%D4~%FDT%7CZZ%EB%117!%E2%AA%D5lk%BB%C15d*)%2F%EF%E4%B1%B7%DE%FAu%F5%C6%8D%FFz%E5%E4%93%3B%24~%A6o%DC%D8xmA%C1%E8%9A%F2%F2%0Ft%25%17%0Ca%2C%8D6%25%3F%09%9F%DF%8E~%8C%2CI%02%24%D0%1D%08P%60u%87%BB%C81%90%40%94%04%20x%E4lA9%FE%C6%9C%16%B4%AC%19%22%AE%A6b%0D%D1%7F%2C%0B%D9%24%C2%5B3%14%ED%7C%0E%1B%CF%40XdH1%11%1B%FB%B5%88M%C5H%C9%22%8E%DCq%CA%9F%92%AC%86%9Cy%26%16%B4%8FQ%A9EE%CA%0Bq%E51%0EfF%9B!%9A'%DC%60h'd%8C%A8%7F%F6%D4%97_%AE%DC%B1x%B1%2C%60%8F%3A%3C%A3T%60xI%C9%E4%9A%8D%1B%DF%17O%96%B4%8B%DE%05EV%3B%09i%B49%1A%5C%1E%8D%BA%01%16%24%01%12%88y%02%14X1%7F%0B9%00%12%E8%10%019%B8%D9%3C%5B0%CC%9Bd%08%2B%7DZ%10%5B7%88%E7%EA%F5%8EX%C7t%E0o%20(V%A3%CEH%D4o%7D%0B%B0%236%A4%0Ff%F9%D6%8F%BA%B8%82%BD%C4D%D5w%F2dUx%D4%24x%AE%20%AE22%14%B6%9E%D7%5CX%D0.%02N%DA%8C%26%04%F5%5E%F0%BFn%AFW%C3%96%0Cw%D6%ED%D8%B1z%F9%FD%F7%0F%8B%A6%BE%94%D9%0CA5%B9%B4%F4%D8%86%DD%BB%3FU%01%BF%88%2C%F0%0Csd%B5%0E%05%AD%5D%23%DE%C3h%ED%B3%1C%09%90%40l%13%88%EE%D7(%B6%C7%C8%DE%93%00%09%80%00%1E%EEw%E12%3C%D4%8B%D3%1E%8C%88%14%04%F9%CF%E5%1D%F1%5CAX%F5B%5C%0A%91%F1%7B%D8h%DD%2B%CA%A9%AD%90%B6uUb%88%3B%BD%7D%DD%23%84%FD%AE%F0y%07%AE_C%3D-%D7%12%BC%9F%26%0F%1B%F6%C9%A0%13%8E_%12%9F%91%F9%25vO%DF%84%85%EB%D5%86X%D2%05%96%D8%08%B1%DB%A1%8F%D8%EBj%C8%A1%D7%5C%B3j%CB%BB%EF%5E%17m%C5%15%F0d%3D0%60%C0%91%CD%B5u%EB5_%B3%EE%C6r%08%92%FB%0A%EEC%AAC%19f%91%00%09t%13%02a%FF%82%ED%26%E3%E20H%80%04B%08%E0%A1%3E%0A_%97%22%3Al%94%A9%8B%1C%A9%25o%0BF%BD%A0%1DS_'A%DC%CCE%BDxCP%89%91H%BF-%A2%85%A4Lh%D9%8D%F8%BE%04q!%E2%C7%88%3B%E0%91%AA%9C%5EVf%B9q%E8%AC%A2%A2%B8%81%17%5E%98%99%98%9D%9D%9D1h%D0%A0%F4%01%03%8EO%CE%CB%9B%E8%CD%CC%1C%13%97%9C%1C%AF7%20%AA%AB%03%C1%ACS%B9f%CD%7F~7t%E89%F7G%B9%87%D6%CEO%3E%CB%5C%FC%C8%8C%AD%BB%DE%7B%2FI%B5%B4%40%ECY%8F%DF%10%80%EF%83%EF1%1D%E8%16%8B%92%00%09%C4%20%81%0E%FD%F8%C4%E0%F8%D8e%12%20%01%10%80%C0%DA%02%AD%91%2F%02%CANt%18%E2%AAC%FB%5C%C1%EE%F50%FF%10bTb%C6h%DF%F44%89%A7j%3D%FA3G%BA%88%EBzx%CD%9A%BF%ED%0D%7B%FB%CA%2B%7B%F5%9F%3A%F5%98%DE%13%26%FC%20)'g%AA%C7%EB%D5%DB%93q%9B%D7%D06%8Cq%07%93%F0E6%10%C5%0F%A3%AB~%FB%F6%2F%17%DFq%C7%84%E3%1Ey%C4R%E0%B5%EF%E7%AC%89G%0E%D7*%B6%AD%90%89Q%E4%D9%FE%B6%1A%0C.%C1X%9Fko%83%DFI%80%04%BA%0F%01%DB%1F%81%EE3D%8E%84%04z6%01%88%A0%DF%80%C0%EF%A1%2F%EC%40%E8n%2B%3C%F8%2B%E0Y%91E%F0Q%05%D8%BD%03%05o%15%DDbT%B0m%C0%B0o%B6%23ZG%D6%82%FD%1E%ED%89%A7%EA%80%85%B9%A7%9C%92q%E4%7D%F7%FD(%A5o%DF%9F%25ddd9%09%2C%11%3EZ%20%A00%F5%A8%FCMM%AA%B9%AEN6)%DD%91%90%944%3Cs%C8%109%96'b%98U%5C%FC%7D%80%7C%DA%89%B5!%E8%9A%FD~%7F%CA%95%5B%B6%C84(%03%09%90%407%24%E0%F8%83%D8%0D%C7%CB!%91%40%8F%22%80%E9%BBl%3C%ECE%1C8y%98L%DD18%DA%E3o%B0%DE%EA%3ET%BA%C9%B0%2BLm%7FK%0C%8F%8D%DE%06%CA%CDE%7Fn%40%3BX%23%FE%DD%86%3D%ABV%FD0%AD_%BF%7B%E2SS%CD5P%D0S%01%11%7BAa%05q%15%C0%CE%EF%BE%9A%1A%D5%B8g%8Fj%A8%D8%AE%F6%AE%FBZm%FA%F8%93%EA%ED%CB%96%0D%BAz%F9%B2%9D%D1%F4%18%C2%F3%05%94%BB%C0Nd%19%02KL%CD%82%C0%BC%3C%1A%9B%2CC%02%24%10%7B%04l%7F%14co(%EC1%09%90%40%7B%02x%D8%CB%96%0Cg%D8%3D%EC%A5%BC%F1%C0%8F%FA%E0f%D3s%25Uuub%13L%D5%26%F6%11%CB%E5%ADD%08%AB%2Fl%8A%7Fg%C9%7BW%AF%BE3c%E0%C0%5B%F0%E6%A1%3E%95%17%80%C7J%BCV-%F5%F5%0AG%EA(l%22%AA%F6%AC%5C%A9%D6-%7CG%DB%B7%E6%2B%E5%F65%BB%94%CFW%E5%F6%FBK%A6o%2C%AF%8A%D4%D1%17%06%0F%F6455%89%A8m%DD%A2%A2%7D%1Da%23m%23%0E%82%C8Z%D7%3E%9F%DFI%80%04b%9F%80%ED%8Fc%EC%0F%8D%23%20%81%9EM%00Bh%24%08%2C%D3%3D4%08Vb%C8x%D0%7F%8A%87%BC%9CG%181D%B9%E6J%17%0F%A6%88%40%BB%BF%85%B0%BA-%A2%F1%EF%B0%C0%D2%BB%EE%CA%3F%E4%AA%AB%16%25df%96%04%7CM%9A%AF%BAF%D6%5C%A9%9A%B22%B5z%DE%3C%B5s%F1b%E5%C1%14%A1jl2%86%A1%7B%DF6B%24%0E%C5%A2%FB%C6H%5D%05%A7%C9(%F3%1E%A2%25w%A9%1F%D4Xj%01%D8%9F%10%C9%1E%F3I%80%04b%8F%00%05V%EC%DD3%F6%98%04%A2%22%80%87%FC%BB(x%B4%8D%93%C9%5C%0F%25%8B%DE%87D35h%BC-%F8_%94%B7%5Dse%A8%11%E9%9F%FC%B6%D4%E2%FB%98%CB7mZ%1BU%87%0FB%A1%5D_%2C%7F8)'%F7%BA%DAM%9B%B5%DD%2BW%B8%96%CD%9E%AD%FC%DB*%94%AB%A1%01%EF%0F%FA%D1%23%0C%D5p%D2%19%82%E8%23%08%A2I%D1t%15%FC%E5p%E9%8Bu%18%16%8E%3Ea%25%A2%17%97q%B0%B98%1A%9B%2CC%02%24%10%3B%04%B8%0FV%EC%DC%2B%F6%94%04%A2%26%0014%06%85E%5C%99b%A8%7D%5D%7DcL%C4%BFE%23%AEd%9F%2B%D8%92%AD%18l%C5%95%E4%19BB%C4%D5G%F8%9C%DB%95%C5%95%00%C9%1D1%F2%FA%3D%CB%97_%5C%F6%EE%3B%AE%CF%1E%FD%BB%16%D8%BCE%B9%EA%F0%D2%A0%88%2B%19E%8802%C66%11%C2%E9%BE%F60%AD%BE%A3%FCO%90.%DE.a%16v%1F%0Cq%25%E2%EB%CFV%F5%99F%02%24%10%DB%04%E8%C1%8A%ED%FB%C7%DE%93%80%25%01%08%AC%D7%F1%E0%3E%D5%10%05%ED%CB%98%8E%A6*%E4%17%40%60%C1%5D%E3%1C%8CMD%0F%17Q%60S%D2%B4)%F9s%E0%919%DF%A6%5CT%C9w%95%0E%F1%9Ez%D3%0D9I%85%85c%D2%8B%8A%0EI%EE%9B_%88%ED%16%920%AF%E6%C2%16%F3~%EC%9E%BE%BBv%F3%E6%0DU_%7D%B5%EC%EB%E7%9F_s%EE%07%1F%D4De%D8%A6%D0%DFG%8C%1C%E7mhX%84%B5V%D8%CB%CBv%C1%BE%E9%F5%931%9E%811%8A%E0t%0C%B8%0F%BF%00%B2%3F%D9a3%A0%89%BD%11%B0%87%7DK%19H%80%04%BA%0B%01%BB%1F%CB%EE2%3E%8E%83%04z%1C%01xXJ1h%99%96%13%3Dd%F97%8E%07%BBp%F9%11%1E%EA%B2%87%95c%90%E3oP%FE%F76%A6%CC%F5%5Dr%95%B6%9E%81%CD%E9%8E%06m2%9F..%C9%0C(%D7%E9Zj%EA%05%FD%A7%9E%3Aa%C8%B4%D3s3%06%0F%09%1E%87%13%17gN%B3%85%ADi%F2%E3%CD%BF%C6%DD%BB%97%E1%ED%BF%85%E5%AF%BD%F6%C4%E8%9F%FDl%A5M%13%8E%C9O%F6%2F%19%E1R%81OP%C8k%C7%0Dy%A6%C8%AA%C1%1B%88%05Wl%DE%EC%B8G%D6%CC%A2%A2x%AC%DB%927%26%F3%A4q%2B%BB%C6%BDx%01%DC.r%EC%203I%80%04b%8A%00%A7%08c%EAv%B1%B3%24%10%15%81%1B%F1%20%97%BF%ED0qexLD%A4l%F7%F9%7C%8FD%B2%26%077%1B%E2%CAr%9A%0B%F5C%BD%3A%E2%B9%EA%B0%B8%82%20%3C%14%F1%F9%80%16%D8%AE%E2%3CO%C7%E5%F4%9A%DA%EF%88%F19%F0Z)%EC%C8%AE%C9%19%84%A6%B8%B3%12(%9E%84%04%95%DC%B7%EF%C8%AC!C~%3A%EA%E6%9BW%D4n%DB%B6j%F3%5Bo%5D%F5%C2%C8%91%09%91%C6%17%9A%7F%F9%C62y%C3q%22%A2%DFt%C7Y%D4%17%A6%12%D3!%9C%9E%B6%C8o%93%04%01%26%1B%A7%FEV%EAX%F5%DD(%2C%0C%CF%06%EB%DCH%F6%98O%02%24%10%3B%04(%B0b%E7%5E%B1%A7%24%10%91%00%BCM%5E%14%BAX%04%82)JB%2B%C9C%5E%B2%E0%7D%B9%FD%EA%8A%0AY%C5%ED%18P%FCy%14%10%01%60%0A%8B%F6%E5%CDtY%FC%DD%A1iA%08%8A%22%08%AB%FF%C0%A0x%9C.%84%26L%D00%0BX%7C%F41*%B9%A8%9F%0B%1B%83*O%7C%F0%F4%1D%F1%F2X%8D%C7%ECL%A8xI%EE%D3%E7%90%C2%13N%F8%C7%99o%BF%BDi%CB%82%05W%B5%EF%B0%D3w%8Ca%19%DA%3A%D9%18%AF%60%D4%05%A4E%90%F4%B30%86%E3-%F2%DA%24aC%D1%C7%90%20%7Bh%D9%89Ta%E8%85%60%D3%17%C43%90%00%09t%0F%02%14X%DD%E3%3Er%14%24%A0%13%80%1E8%05%97%5C%3Bo%89!%18%AAq%FDG%24d%10%3F%97%A0%9C%ED%BA%2B%5D%7D%20%C0N-%DA%8B(4B%DB%83m%D9%01~%23%D2%A6I%B7uW%5B%5C%BC%CB%DB%B7%AF*%18%3B%D6%95%9C%93%2B%DE%2B%25%DE%2BYh.%E2*%D8T%A4%5E%EF%CF%F7%F6%EA%95%97%7F%DCq%FF%A8%DE%BCy%D5%E7%F7%DDW%1CmM%2C%CC_%80%F6nE%7B%821%CC%0B(v%8Cd%0D%A2%E8%A9Hv%B1%5B%BB%08%D9%7B%C4%9E%C4%F6%E5aK%1A%12%94Q%1F2%DD%DE%06%BF%93%00%09t%3D%02%14X%5D%EF%9E%B0G%24%F0m%08%5Cg%88%910%CF%8B!P%E4%01%FFwc%EA*R%3B%0FB%40%C8%83%3F%CC%96T4%C4%87(%831X(%1Fqo(%A9%03%0F%5B%1A%C4%95%2C%E6%96cvt%A1%A2%DB%81%90%0A%24%C4%AB~G%1D%A9R%F2%FB%AA%F8%F4t%85%8D%40%15%16%B4%9Be%1C%3DX%A1%031%FA%15LB%D7qL%CE!%C3%AE%BA%AAl%DB%07%1F%C8%B9%89Q%05%8C%E7N%14%7C%CD(l5~iF%C6%5E%80%F1D%B4%8B%A2%8F%C2%96%1C%8Bci%0B%E9r_%86%C0%23vXT%1Dd!%12%20%81.O%80%02%AB%CB%DF%22v%90%04%A2%23%80%07%7D6J%1E%8D%18%B6%10%5C%2C%88%1E0%AE3%22Y%84%10%92-%062!%20t!%D1%BE%BCh.%89%C8%FAm%B4%5B1%C0f%09%EAl%85%ADC%CD%BE%E8vE%BF%C5%25%A8%24%AC%B9%CA%1F3J%25%E6%E4%A88%1C%D0%2C%02K%82E%F3%ED%BBc%F7%5D%04%90%0A%B4%B4%B8%FC%8D%8D%9A%3B%3E%FE%A1%8F%FE%F8%C7%88c7%8Da%1A%F5%1C%D4w%12%8E%BA%E7%09%E5%EF%B6%EB%80%99%0E%C1V%8D%CFr%A8%B5%DE%A7%F6%C1L%83%BD%CB%DA%E7%F1%3B%09%90%40l%12%A0%C0%8A%CD%FB%C6%5E%93%80%15%81%E3%90%98%24%A2%C8%22%13%C9z%FA%A7x%D8o%B0%C8o%93%84%B2%7F%40%82%E5%3A.)(%C2%02%A1%1C%B6n%8BdK%F2%E1%99%19%85%F2%D2n*%EAJ%3F%E4%12%EC'.%01%BC%25X0i%92J%CE%CF%D7%BDWn%7C%87%F7L%17W%A6%F8%88%A6%1D)%23%E5%5B%EB%C8%F9%82M%3EU%BF%7B%97%DA%BB%E6%2Bm%F5%CB%AF%5C%3Bk%E0%60%D33%E5h%12%5E%3E%1F%DA%3F%D7%E0fUV%1F%07b%0A%C6%17%D1%8B%05%3B%BA%B83%87%1DjP%D2%10EyM%7D%BA%A4%C4%EA%FEY%B5%CF4%12%20%81.L%80%02%AB%0B%DF%1Cv%8D%04%3AH%C0%DC5%3C%DCE%12%14%02%22%3C%22zp%E0%09%BB%10%ED%A6%20Z%3E%E8aC%02f%EF%DCgF%D3%3F%F1%5CA%3C%2C%15%01%81%D8%D6%A6%EE%BD%8AW%09yy%AA%EF%A8%91*%B1W%2F%0D%FB%5D%89%F7J%DA%D0%C5%88D%F9%0C%8F%92%1EqBsX%B3za%04%E3%12%14Y(%E7onV%BE%DAj%D5%B0u%ABk%F5%AB%AF%A9%B8%EAjM%B5%F8N%C3%18%C5%9B%141%40%40%BE%8EB%8BL%FBV%15%8CqE%14%9A%F0%F4%BD%8F%FA%7B%C5%96%8D%3Da3%14%8B%E2%8B%AD%DAa%1A%09%90%40l%11%A0%C0%8A%AD%FB%C5%DE%92%80%25%01%08%86D%3C%B4'%19%FA%25L%18%99%0Ft%8F%C7%23o%05F%0A%BFE%01K%EF%15%EC%98u%E7B%7CD%3C%B8Y%D6%5C%A1%CEr%B1%87%18%D6%2FI%D20%15%D8g%F4(M%F7%5E%A5%A5)7%B6%5D%0847%BBj7mz%A3f%D3%A6%1F%AD%9C1c%F4%9F%DC%EE%24%F4%1D%BA%CB%E3r%23%BE%F7%A3%1F%15lz%E3%8D3%EAw%EE%FC%ABl%3A%0AEenY%DF%DAA%11b~%1CyS%BFc%97%DA%FA%F92U%B3%FA%2B%97jj2U%D8y%60v%7B%24%10%92%8F%FE%7F%DF%E8%BB%95p%95%7C%19W6%C6zb%14%F6f%8A%AD0%A1%19lG%B7%8F%BC%A8%84k%14m%B1%08%09%90%C0A%24%40%81u%10%E1%B3i%12%E8D%02%C5x0%F7%B6%B2g%88%22%11%01%8BpP1%14%86%7D%80%E8%18%02%3BC%AD%04%80%D4%12%01'%82%02%E1%06%7B%2B%FBsP%F6C%7C3%A7%05%DBV%11%B1%26%EB%AC23U%1Fx%AF%92%B2%B1%84L%0B%D4T%AD%5E%FD%3Fw%8C%19%E3M%2F.%FE%DF%B4~%FD%DC%C3%AF%BB%EE%A6%5B4%EDI%D8%FA%0Cq%05%E2%5BG%3F%F8%E0%5D%FDN%3A%E9%84%E4%BC%BC%8F%93rr%86%AD%9B3gbMy%F9%9B%BA%D0%92%01%8B%C7%AB%B9Yk%AA%D6%BDWj%C3%9Bo%2Bw%03%96S%05Z%F4%A1!%8A%98%F9%15D%D1%D4H%E3%80%E7i%23%CA%BF%144%BB_a%9A%F5%C4%1E%824%FB%F3H%B6P%C6%F4%9C%85%895%E9%98%D1%2F%D9%26%82%81%04H%20%C6%09P%60%C5%F8%0Dd%F7I%40%08%E0%C1%7D%BAA%C2%EA%C1%ADk%0E%84h%A6%C5%AE1%CAZ%81%15%3B%A2%AE%E6%C3%7B%25%BB%93%3B%06%88%B5%5BQ%60%B8!%40%C2%CB%8AX%C3%F4%60%E6%E0AZ%E6%80%01.%88%A1%3F%D76%F9%86g%1FvX%C3%EFV%ADz%0E%15d%23T%D9%BA%E0x%C4%C9%88%B2C%7D%3F%C4%91%88%C7!%8A%A7%E7%16%C49%83.%B8%E0%22%08%B2_%AD%9F3g%1Cvu%DF%22%02%AB%05%DE%AB%C6%9D%3B%B5%0D%8B%DEW%CD%10Y%AA%D9%87%A2z%10E%24%11N%AE%C0%D3%E8%A7L%87%3A%06%0C%5B%DA%D1%15%90UA%23%FD%24%D8%8A%B3%CA7%D3%20%D6d%A7x%9F%60%B4*%17%C4%EB%1A%8F%1D%E0e%3F3%06%12%20%81%18%26%40%81%15%C37%8F%5D'%01%93%00%D6C%1D%85%CF%A2%A2%C2%1E%DC%22%98d%C18%C2%ABQ%10%BB%D2%AE%8C!%0A%C4%FE%EF%ED%CA%98%E9%B2%89(%3E%CB%14%9Ch%B2%F0%E2%E2d%C2f%F3%81%C4D%ADh%DC%B8j%7FS%D3%F8%DCQ%A3%3E%CC-(%F8%1D%0A_%8Bx%02%E2a%A8%9B%8F%98%82(S%A0%01D%5D%9C%20%26%23%CA%5B%8E%25(7%1E%F1%1C%C4%3F%0C%BC%E0%82)%F1YY'%EE%5D%BD%FA%F1%E6%9A%1A%17%CE%2BT%9B%3F%FEXs5%E1%B8E%BD%1Fm%F0%88.%CABb%C4ui%D8%80T%8E%1E%FA%10%EDY%0C%069A%F62%D8K%F4o%0E%01m%CA%BA.%CB%20%FA%0D6z%E1~%E5%5B%16%60%22%09%90%40%CC%10%A0%C0%8A%99%5B%C5%8E%92%805%81gKK%DD%F0%C4%8C%B2%F3%AE%A0%96%08%92F%88%04%C7%B7%071%5D%26%82%26%13%E5mE%04%F2%D7%C3%CE%C7%D6%3D%D9%9F%8A%BE%C8%19%87%D2%25%3D%84%97G%12%16%B2%A7%94%14%EF%1At%DA%D4%D1%85%C7%9F%20%5B7%DC%8Cr%B25B1%A2%1CW%23%87P%CBQ3%B2Q%A7%ACl7%FB%25WI%93%7D%A5Dp%D5!%8A%08%93-*%AE%8D%8B%8B%FBI%C6%D0%A1O%D4%94%95%DF%BEq%E9R%97%A9%03%DE%5D%00%00%20%00IDAT%DA%5B%A94%BF%3FXW%F4%91%11%8DNI%FA%F4Y%FD%FA%1D%8Ak%A4%F0%00%0AX%8CE%AF%A6%A7c%0C%D1%EC%C6%3E%DF%AE!%8C%C1%1C%E31ve%98N%02%24%10%1B%04(%B0b%E3%3E%B1%97%24%60K%00g%0A%26%E3%C1%DE%2F%E4%E1%DC%A6%2C%F2%E4%A1%BD%C0%D6%80%91%01%916U%B4%90%B5%20%0Az%C7%90%17q%9A%11%D3d%22V%F4%1D%DA%ED%DA%C4%04%99%A6%12%93%AA%FB_r%F1%91I%C5%FDe%0A%F0%D7%E8%FF%08D%11R%B2%F7%94m%5D%1B%9B%22%B8%F6%A1~%16%FAx%01D%D6%AD%7D%8E%9E%FC%DA%CEM%5B%EE%81%92s%E1%CC%9D%E0%AE%F0%B2%E6K%A2%3B%18%B1b%1E%9B%9CJZ%FC%9Fl%EC%B6%26%83%8Fl%EF%E0%B4%86M%FA%7CR%24%3B%E8%E3%3Bve%84%BD%DC%03%049%13%91%81%04H%20%86%09P%60%C5%F0%CDc%D7I%40%08%60%3Ai%B8%5Cm%84%91L9%C9%13%FB%83H%B4P%FF4%A3%8C%95%B81%3D7%B3%22%D9A%FE%AF%EC%FA%A3%8B%40%89%106%E9%C3%86%9F%3E%F6%DCsG%A0%DD%3B!%5E2%90%DC%2C%02%CB%2C%F2%0D%AE%E2%A9%F3%C1%96%5Ce%DA%F0%CEs%9Fx%EC%C1%E4C%86%BE%934x%B0%2Bi%E8%10%958%24%18%93%06%0FU%89%83%8D%CFC%06kIC%07%9F%3E%F7%A6%9B%8B%9D%C6%86%7D%B1j%90%BF%00%B6%AD%F8%B4%F2%87'%F0%08'%3B%F0%00%AEq%CA7%EC%1F%E2T%86y%24%40%02%5D%9F%80%E3%82%CC%AE%DF%7D%F6%90%04H%00%04dz0%12%08Y%5C%1D)%C86%0F%22%1E%C2%8C%19%0F%FDM%C8_%EFd%04%E2B%D6E%9DmgGD%A0%AEO%E2%13%FE%7C%DA%D33e%1D%D5%1F%8C4K%D1%E2%D4%96C%9E_l%22%7F8%C4%E7%EF%A6%DE%7F%DF%D5%BB%96-%5B%11%F07%7B%B1B_%06'%3Br!%5B%D6%81%E9%83E%9Ftk7%A8%BF%DE%FB%3F%0Ev%25%EB_%88%A7%3A%95%C1%98%26!%3F%D24%AA%1Cp%AD%0B%E3%F6%C1%E01%B4%7D%3A%BF%93%00%09%C4%16%01%0A%AC%D8%BA_%EC-%09%84%11%C0%03y%A8%88%96%A0%A6%08%CB%D6%13%90%BF%CC%3A'%98%8Ai%BD%C1%F8%84%B92%DB%20%8Ad%09%DE%1E%945Q%B6%01%ED%C8%DB%8C%96o%C0%19%22M%A6%E7j%CE_%F6%F93%B2V%0Ae%FB%22%DD%D2%A6h1%E4%CB%AA%EFDx%A5D4%89%C7%5D%04Z%00%83m6%F2-%FB%22mIy%E9Ob%5E%DE%7F%93%F2%F2nO%EE%DB%E7%0F%FA%FA%2B%EB%A0%F9%AA%AB%CF%9AU%D8%EF%96%CB%B6l%92%B5%5D%96%016%C5%83%25%3C%C36M5%D3p%8D8%BD%07%3B%9F%A3%9C%AC%3B%B3%13%B3%B9%10%ABq%E0m%DB%17%CB%0E2%91%04H%A0%CB%10%E0%14a%97%B9%15%EC%08%09%7C3%02xP%CB%1B%7B%B6%CAA%ACb%7B%80%3DN%D6%F1%9C%B7%3DdX%84%83Qw%A1%93%0D%23%EF%02%E9KH%9D%D6*A1%01%9F%91%DBs%7BBB%FC%04%94%99%8A(%8B%D9%F5YC%AB%E8oiI%AA%AB%A9I%F5%C4%C5e%20%A6a%FB%F8T%C4t%14%CE%0E%F8%FD%19%88%22%A2%2C%EB%EA%BB%BEk%9A%07%D7%AB2%87%0F%FFO%9C7%B1%3E1%3BW3%A2%C254%BA2%06%0E%1A8%F4%EA%1F%14%3B%8D%11c%D8%8E%FC%ADV%C2%C8L%C3U%A6'%1D%03%FA%B4%0A%05%C2%C4%95T%0A%B1-%F7%95%81%04H%20F%09P%60%C5%E8%8Dc%B7I%20%84%40%A1%D5%03_%F2E%7C%20%C8%01%CB%8E%01%0F%FC%12%BB%02!%B6%1D%A7%BD%E0q%11%CF%D5%04%94%B7%5C%0F%86%BE%A03.%F5%BD%C5%9F.D%7BG%E3k%3A%A2%ED%9A%2B%88%A7L%18J%91%11%FC%F9%EE%BB%D5%E2%CF%3ES%10%5C%C1n%8A%E3%C7%E5%C2%CAu%D5%0B%E5%12%ECD%16%D2e%F1%FB(%C4%89%CD%F5%F5%8F%B9%13%E2%5D%EE%F88%89*%2Cb%F1%7B%C1q%C7%99%FB%89Y%E2%C0F%AD%F2fcyp%2C%E1E%8C~%F4%09%CFi%9B%02F%8ES%ADF%E9%E2Hv%98O%02%24%D0u%09P%60u%DD%7B%C3%9E%91%40%B4%04l%1F%E8%22v%10%CA%23%19B9%D9%BD%DD%A9%98(%9B%1DN%05%20.r%90%9F%8BhiH%17j%1E%CF%1Bq))%13%20%B0%246%19%5E%A60%0F%94!%AE%E2E%B0%C8%1E%5E%8B%17%2FV%0F%3F%FC%B0%9A7o%9E%AA%DE%B7Oaz1XG%3A%E4r%A5%A3%7C%9C%9D%C8B%1B%5E%E4M%AC%DB%B6m!*%E9S%A9VQDS%E6%A0A%B2%9FX%A4%F0%95%C3%18%A5%AE%07S%AE%05NF%D0%D4F%A7%7C%23%CF%D1F%14%F5Y%84%04H%E0%20%12%E0%1A%AC%83%08%9FM%93%40'%11%C0%193%8E%A1%C217%98%D9_%04%8A%95%C8%92t%84%3D%10%3A%95NvPn%8CQ_*%84%89%2C%DD%8E%A6%FE%83%BC!%F8%5C%88k%9D%95%3Dl%AF%9E%84i%C0V%C1%24ez%E30%E8%B7%17%2CP%0D%F5%F5%BA%C0%1A7~%BC%1A2t%A8j%81GKD%1A%82%BC%85h9%0D%8At%1F%FA5%3A%7B%D4%A8%97%9Akk%5B%12%D2%D2%C2~%F7%8C1%BA%B0_%96%ACE%8B%14D%609%05%0F%DA%EB%8B%02%B6%9EC%E4G%BC'%E8S%9ES%23%CC%23%01%12%E8%DA%04%E8%C1%EA%DA%F7%87%BD%23%81h%08%24%3B%15%B2%13%1E%ED%EA%F4%B5%12WR%C6H%AF%C6%F4X%ADS%3B(gn-%10%26%AE%CCz%C5%E7%7Fo%0D%FA%23%5E.%FB%DF%1E%97%2Bl%3C%F1%F1%F1*%1F%87Ao%D9%B2E%3D%FD%CC3j%CE%9C9j%D7%8E%1D%B2%81%A8%AE%E4%20%C8%5C%10f%896%FD%13%056%10%ED%164UU-j_%C6%10Wz%B2'%D1%DB%FF~%97Jh_%26%F4%3B%CAo%B4c%15R%CEQ%F4B%14Z%8A%C1v%ED%CA.%F3%0C%24%40%021J%C0%FEG.F%07%C4n%93%00%09%EC'%20%E2%01%9E'%D9%BF)R%90%ED%15l%CB%40P%D4%DBf%EE%CF%10%AF%94M%80mO%9C%1Aq%F3%CD%0D%10%17%E2m%B2%5C%DC.S%7D0%A0o%E5%60F(%3C%15%07%81%95%98%98%A8%B2q%20tFz%BA%FA%7C%E9R%F5%AB_%FFZ%AD%5B%B7N%D5%D5%D6*%3F%84%16%82L%05%86M7%22M%CE%1CL%40%99%9C%B8%E4%E40%EF%93%A9%06%B5%80_y%92%93%D2%13%92%92%9C%DE%A6%14%C1%B9%DBf%90%AD%C9h2%DD%A9%0C%F6%D4%92%B5%5C%B6%01m%C8%5B%8A%11%CFH%B45%C0%0C%12%20%81%83N%80%02%EB%A0%DF%02v%80%04%0E%1C%01%F1%B4%E0a%2F%3B%A3G%0Av%DE%1F%BD%1El8%ED%60n%DAN%92%A2%D6%0Da%DD%13%0EvN%CA%C8%C8%40%BEx%A8%EC%16%B7%B7YK%25k%A6%24x%B0%00%3D%D1%EBUIII*55Ueee%A9F%1C%E6%7C%C7%1Dw%A8%F7%DE%7F_%9F6D%10qfiW%D2%11S%E2%D3%D2%AAt%83F%10%EBz%0Bh%07%3BA(%17%DAI-(%88%24%B0%9AD%C8E%08%96%5BUD%A8%13%9A%ED2%A6%3E%3BP%85EI%80%04%BA%12%81%B0%B5%08%5D%A9s%EC%0B%09%90%40%A7%10%88%A8%06%D0%0A%B4%98%ED%CC%9Et%22*%1Bb'%BC%C7%F0*%C9%8C%20%04%12%84%89%88%17%5B%F1%60%8A%9DP%1B%92%26%02K%A6%09%13%12%12tO%96%2C%7C%97%85%EE%F5X%93%F5%E4%93O%AA%AA%CAJu%FC%F1%C7%BB%F2z%F7%F6%B6%04%02%3E%EB~%A8x%8CRwu%B5%06C(%F9%03%FB%B7%9B%F2%24%26Z%8C!%B4%8A%BD%BA%0A%11%5E%DF%FA%1F%AF%18%A3c%3F%DA%8C%83_H%80%04%BA%1C%01%0A%AC.wK%D8!%12%E8%3C%02%F2%C0%87p%8A%F8w%8Er-2-%85%96%ED%1E%EA%D1%D8%90%CD%40%C3%3B%8F%AD%AF%5C%D8%16!.W%5E2T%D0%3F%01CG%85k6%99%CB%83z%0A%B3%E1%86%5D%11U%22%B4%24%CAg%99%16%14%C1u%F1%19g%A8%11%87%1D%A6%D2RS1%C3%E8o%C1X%C2%3A!i%A8%D3%12hjJ%82Rkc_%A6%06%95~%04%22%AA%A1%9D%FA%AD%15%FA%AAy%87%20%8B%D8-%B3%0D%8F%A10%B7%DC%3C%D5%B2%92E%22%FA%2Bp%C2%01Y%94e%12%09%90%40%D7%24%10%F1G%B3kv%9B%BD%22%01%12%88%86%80%F1%C0%8F%B8%96%07%E5j%F1L%CF%B3%13%0EhK%A6%FF%1C%03%04%CC%EE%10%0F%8EQ6%A8%D94L%0F%F69%FCpU%BFcG%5CBvv%23%DA%09%1E%99%D3%CE%22J7%9B%D3%82%ADY%ED%D6U%E1pk%25%82%0B%DE*u%F2%C9'%AB%E1%C3%87%2B%2F%BCZ-~%BF%CF%1F%9CW%0BS%3FhN6%1C%AD%0BTW%0FH%C0%14%A3%04%B3%AF%C1%8D%E1%83%A2%AE%A5%BE%3E%E0k%A8k%EB%E5%0A%1Fu%9A%D4u%60%255%1C%D7%AC%3D%96%9F%2F%08%C2-%EFO%91%7C%EE%E2%EED%88y%24%D0%C5%09%84%FFS%B1%8Bw%98%DD%23%01%12%08%23%10%C9%E3%92%19V%23%3C!%D2%C2%EDT%EC%ED%E4%F8%0F2%88%8E%0Daf%83%F3%7BJ%83%A8%C9%1F%3DJ%B5TWg%A3%5C5%A2%A5-%D1%5DP%3E%BA%F7GD%8C.d%10%B1%B0J%04%94%AA%A9%A9%C1L%A3W%1D%3Ej%94%3A%E1%84%13%D4%A4%A3%8ER%89%C9%C9z%1E%DCW%F5(o%A9Z%90.%EB%A6%F6%A2%3BcB%FB(%E2J%DA0%9DE%BE%9A%9Am%B5%0D%8D%91%BCO%F9a%E3%0COh%B3%D6%AB%7D6%3CoY%C1v%DB%E7%EC%FF%0EAXm%9F%CB%1C%12%20%81%AEN%C0%F2G%AE%ABw%9A%FD%23%01%12%D8O%00%A2%A4%12%0F%EBl%2B%8F%88%F1%10%8Ff%3F%A5%CD%A8%EFt%C4K%26%F2E%A89%09%B1%F0%F3%0Ee%91%3D%BCW%BD%06%0FR)%05%F9*!)q%24l%ECD4%A7%F2%C2%A6%C1%D0%E7%1A%A8%A4%5E%E6x%E4%80f%D9%C1%BD%BE%AEN%E5%E6%E6%AA%B1c%C7%AA)S%A6%A8%DE%7D%FA%A8Z%BCA%A8%1B%08%04%1A%E1R%D2%85%A6%85p%81%C3%CB%B5%C5%D7%D8%B8%2B3%2F%AF%14%F9A%B7%9AT%F3%C3I%84o%C1I%CB%80%16h%F6%AD%C3i%CF%91%3CX%03%A5%1D%87%20M8n%CA%8A%BA%11%EF%89x%04%1D%DA%60%16%09%90%40%17'%40%0FV%17%BFA%EC%1E%09D%22%80%87%F9.%2Bq%25%F5%8Ct%87%ED%13Z%AD%EBG%B7X%88%13%3D%19Q%8E%B5q%DC%DB%09m%ADi%B5%A6%7F%08%EA%98%00%A6%EF%0A%C6%8FUI%10G%9E%A4%E4%EFC8%C8%5EX%B2%D1%A6%E5%DBz%B0%23o%02%B6%F1%DE446%AA4l%CFp%F6%D9g%AB%F3%CE%3BOe%F5%EA%A5%24%CD%10Wx%FD%CF%E5%B4G%97%ECk%F5%99%BB%AEn%90%1B%0B%E3%25%08%17%F1%5E%05p%92%0E%FE%0B%3Bh%12%3B%23%F8%9B%9BW%E8%05%9C%C3%A1%CE%D9J%A6%F6l7%19%95%BA%18_4%F7%24%E2f%A4%11%FA%C1l%12%20%81%83H%80%02%EB%20%C2g%D3%24%D0I%04%B69%D8%11%0DR%EA%90%AFg%E1%81%FF%B5%88%2B%1B%A1%A6O%BB!%7F%90%93%9DK%CB%CBe%BF-%F1b%05%BDR2%5B%87E%E8%C9%D8%204%F7%90C%947%23SK%CE%C9%CD%A9%DD%B0A%B6%8DX%8E%D8v%B5y%88q%F4%C3%87%F6d%E7x%99'Tu%F0%5E%FD%DF%FF%FD%9F%9Av%E6%99%FABt%AC%94%D7Kc%A3Q%F1%5C9%EE0%0F%5BnL%B7%BD%87%1F%BB3%0C%D7Up%9F-%D8pinD%2C%C2%87%9B%0CK%E8%D5%EEO%3E%9B%17%D2%0D%BB%8F%03%F4~Y%04%F4Y%D2%9B.%DB%B8%D1q%EF1%F4i%80%0Dk%E1%AC%DB%C6e%B3E%13L%22%01%12%88%11%02%14X1r%A3%D8M%12p%20%B0%D1%7C(%5B%94%11q%14%CD%02u%DD%FBd%3C%DB-%CC%60%EBu%B7%FBx%CB%8C%B6%89%0Ba%23%B8%0EJ%BCDxc%AF%EF%84q*1'G%C5%A5%A6%E2%2CB%B7JJK%3B%1Fe%A4%9C%08%AD6%9B%8AJ%FBfD%9E%BCq%B8%17%C7%E1%04n%FB%DD%EF%B4%FE%FD%FAi%FA%A6%A2--~%11V%B8V%8A%E7*%B4N%FB%CFb%1F6%96%D6o%D8P%99ZX8A%8C%1B%F3%88%B0%0E%17Z%00o%25b9%98%3B%E0%D1%B4%BA%26%FF%D7%B3_%FC%D0i%8C8%D0Z%5E%85%2C%858%B2%5C%EB%25%E9hb%A5%93%0D%23o%10%CAY%8A%B4%10%DB%D1%1C%08%1DES%2CB%02%24p0%08P%60%1D%0C%EAl%93%04%3A%97%C0F%98%B3%7C%E0%9B%0Fq%2CP%1F%E6%D4%24%B67%F8%5C%F2E%1F%D8%94%13S%13m%F2Z%93Q%E6%09%FD%8BX%C1%DA%2Bwv%8E*%C4%DB%83%5E%EC%C0%EE%817K%EC%A7%F5%EBwb%7DY%99%2C%02%7F%13%E5%93EgXE%08%23%11%2B%1A6%FF%DC%97%9E%95U%85%E9%BD%BDxKp7%04R%25%CC%D7%C2%98%E5n%F0%A6-%BD%1B%9A%96%84%F8Xr%AF%5E7K%3A%16%C2cA%97_%B5%F8Zd%11%98j%86%DC%F2%05%FCZ%0B%AEuU%95%0B%A6%BD%FA%1F%7D%C7R%BB%00%1BC%91g%BB)%AB%B4%811%3A%8A4%A3_%23%EDD%9A%D1v%D84%A9%5D%9F%98N%02%24%D05%09P%60u%CD%FB%C2%5E%91%40%D4%04%F0%A0%FEB%0A%8B%18i_)%E4!%3E%AE%7D%5E%E8w%1C%DD%22%9E%A0%0ADK%A1%26v%10%C6%CC%2C*%EA%E5d%E7%F2M%9B%C4%7B%F3%25%ACh%F0%5Ei%05GL%D0%A7%08%13%D2%D2%95%AC%7F%D2%CF%0C%84%C8J%EF%DB%F7%8Fh%EB9%C42%D8u%7C%D9%06%F9xIP%DF%DF*l%7C%0E%7D%91%DF6Y%E35%A7%A9%BC%3C%C7%9B%95u%04%0Ez%D6%10U%13%DEDl%AC%DD%A7%1A%EB%F6%A9%A6%BAj%E5%AB%DB%E7%F25%D4%BAv-%5D%F2%90%83%3D3%EB%3C%F9%60%D5%173%0D%FD%FD4%0A%3Br%3F%9C%C6%B3%06%2C%9D%F2%A3h%82EH%80%04%0E%26%01%C7%1F%B6%83%D91%B6M%02%24%10%1D%01%3C%D8%97HIQ%40V5%90%2C%CF%FE%09%C8%9Be%95o%A6%A1%DC%EB%F8%FC%03%D11V%A6%90%1E%8FM%3E%8FA%99%7F%3B%DAQ%EA%3E%BC9%F8%0F%0F%16%B5%F7%1F%3F%5E%25%E5%E5%E1%10%E5D%11Wz5y%A5%2F9%2F%AFh%D7%CA%95%E7y%F2%F3g%C0%E6%FF%229%0DQ%3CR%22*%CCq%C8y%7C%BA%C8%90%FE%98%02%26%E4%BB%3E%BDh%E4%85%D6%91%DF5%F1%00-i%D9%BB%E7El.%FA%E2%BE5_%E9%96est%AD9%B8%0BC%B0)%98%0D.%C6%DF%BA%F0%B2%2B_%13%DB%11%C2%89%C8%97~%D9%B1%96~.p%B2%F1tII%3C%BCs%B6%5Bg%18%E3%5C%EDd%83y%24%40%02%5D%9F%00%05V%D7%BFG%EC!%098%12%80%40%A9%80%87GT%83%DD%A2q%11%03%C7%3A%1A%09f%CE%C7%E5%076%DAA%9F%DEC%F8%01%CA8%0A%2C%A5y%9E%D2%12%12%EE%E8s%C4%84%BC%D4~E%0A%E7%FF%B9%DC%B2%7B%3A4%89)%94D%DC%E4%0C%1F~%E9%C6E%8Bv%24%0D%1A4%1B%C7%DE%9C%89q%E4%20%5D%D6L%85yn%8C%B6%A5%972%16%0D%EB%C1%A4%2F%D2!%5D%EB%88%3D%09H%97%B3%0C%7D%E0%B1lOE%C5s%1Bg%CD%9A%A9%B5%B4%24%40Ca%2Bx%2C%8E%AF%AAR%1A6*%95%80%5D%E3%E5%E2%92kBV%D6%5D%3F%AC%ADr%DC%D8%13%EB%AF%86%C0%F60%2B%3Ezg%82%9D%DC%82%05%EE%BB%F4%06l%02%C6g%AEe%0B%15%93%A1%A5e%8C%D1%BC%CDh%D3%02%93I%80%04%BA%02%01%0A%AC%AEp%17%D8%07%12%F8%16%04%BE%BFaC3%D6X%7D%8Eg%FC8%5DmX%87C%AC%93%F7%A7B%E4%FC%1B%0B%CAuO%91%8D%1D%B1%3D%F5%C9~%FD20%7De%BBV%E9%D2M%1B%7CO%9F%FB%BD_%15%8D%19%FD%0F%2F%16%B7%C7c%23P%5D%5C%C1%83%25B%C8%10%22Z%B3%CF%A7%F5%19%3B%F6%7F%BE~%F7%DD%07%E3%FB%F7%FFOzz%FA%A98o%B0%2F%F2%E3%20B%14%FA%22%BB%AF%8B%92%D2%85YP%BF%04%BB%26%9F%D1%17%F9%A2%AB%249%3EG%3ECX5655-%2B%FB%F8%E3%7F%97%FF%FA7w%B7%F8%5B%B2%F1%9E%A0Kv~%97%E0j%0A%3D%F7%1A%FA%2C8K%B7%D5%BDu%EB%8C%FD%24%AC%3F%A1%1F7H%3F%AC%F8%18c%92%8A%2FX%D7%DE%9F%8A%FA%C7C%08%EA%DDq(%FB%8EC%1E%B3H%80%04b%80%00%D7%60%C5%C0Mb%17I%20%0A%022M%E8%F4%C0V%F0%C0%9C%EAd%E7%92%F5%EBe%8AnQ%24%3B%10%13%3Fr%B2%23y%D3%FF5%E7%B1%CC%01%25_%26%A4%A7kP%3F%BA%40%92%60%5EE%C3%89%88jnn%D6z%8F%1A%F5%A3%86%ED%DB'%7D%FC%DE%7B%2FTVVn%C0Q8%01%A4%BB%11%E3%F09%01W%2FDSbccc%92q%95%CF%89%3E_%93%17y%F1%10U%1ED%CC%046%D6m%DE%BCy%FE%CB7%DE%B8%7C%D5%CF~v_%7D%7D%5D6%BCU%D8%F0%01%1E%AB%A6%26%E5%F25%C9%FC%A4%B8%B9%24%06W%9BI%870%9E%E90%E04%26%88%CA8%14%BD%CAJ%5C%19%F5%CC%A9%CC%D9Nv%0C%06g%8Ah%B4%09z%06%F2%97%DA%E43%99%04H%20F%08%D0%83%15%237%8A%DD%24%01'%02x%20%CF%83%00%B8.B%99i%C8w%DC%E7%09%9E%95G%60%EB('!%81%BC%9F%C1%CE%1F%9C%DA%92%BC%1D%9F-%99%9A9dh%99%DB%E3%11%17%94%24%B5%11%80%86%D7G%CEw%D6%D2%0A%0B'%F6%D6%B41%FF%7C%EC%B1%D9%89yyK%8E%3C%F2%C8%13%FB%F4%E9S(%9E)%A8%0D%993%D4%A7%03%8D6u%CF%95x%81%10%5D%10%5BM%EB%D6%AD%5B%BA%E0%B9g%3F%8E%7B%FB%ED%D33%5D%EE%11x%CDOK%90%05WF%AB%A6%B0%0B%E9%B3i%EBEL%E9%BD%12%92n%F9%11%F5%AFA%FBI%16v%CC%F2bo%0F%F6%02%5Bli%C0H%84%C8%95%0D%5B%87%E0%AB%DD%F4%A0%94%5C%01%0F!%8F%C9q%02%C9%3C%12%88%01%02%14X1p%93%D8E%12%88%82%C0%07F%19%AB%07%B7%99v!%CA%5C%EFd%0B%02%E1YL7%3E%23%E2%C7%AA%9C%91%9E%852%3F%840y%D4%AA%8C%996%E2%FA%EB%CA%B7%1Ev%D8%0D%7D%8E%9C%F4%90%B8dPW%EF%07%3E%EA%9E%2C%11H%10P%D8%85%C1%A30%3D%A9R%B2%B2%E2'%9Er%CA%F4%8A%8D%1B%7D%FF%9E%3D%7BqYY%D9%F2%A1%23F%E4%96%96%96%F6NNI%F1%F6%EA%D5%2BY%A6%FA%20%A8%1A%EB%1B%EA%1B*%F7VV%AE%5C%B1b%FD%CEO%3FM%C8%DE%BBwdz%5D%DD%F1IhA%D6%B1%8B%A0%936l%86%A1O%F3%A1%2F%15%E8%C3%C5Nc%08%C9%BB%03%9F%AD%D8J%111'%BC%1E%88d%0B%E5%CE%912v%7C%25%0Be%22n%F3%10%A9%1D%E6%93%00%09%1C%7C%02%96%3F%A2%07%BF%5B%EC%01%09%90%40G%09%40%F4%2C%C1%83%7B%14%EA%85%FD%5D%1B%82B%D2%C7A%189zY%60g%06%EC%FC%D0h%BF%BD-%C3%94%AA%83%1Dy%F3%2Fb%D8%B3j%D5%8C%ACa%C3%AE%D5%17%60I%E7Di%E1%A3%CC%CAa%0AP%04%93jhh%90s%05%B5%7D%FB%F6%B90M%A8_w%EE%DC%A9%1Ajj%02%D5%7B%F7nk%F0%F9%AA%B0%C0%AA%B1%A9%B22P%BBy%8B%C7%D3%D0%90%1AWW%9B%E7%DA%B7%2F%2B%016%92!%D6%121%ED%97%0C%C1%E6%85%B0J%40%8CG%C4%BC%9E%92u%10%E6%1A%2Ci%DF%18%40%0B%BAQ%00A%E9%B8%20%5D%CA%83%C7Oq%B9%D7N%AC%196E0%26O%2F%2Bk%90%EFv%01%B6%16%22%EFX%3B%5B%06%A2)%60%FB%B6%9D%0D%A6%93%00%09%C4%06%01z%B0b%E3%3E%B1%97%24%10%0D%81%F9x%40%8F%B6yx%9BBi%3A%0C9%0A%2C%D4%BF%1Dv%AE%B5%B3%23%E9%C8O%85X%B8%13B%E0%97%91%3A%96%7D%E8%A1%D7%ED%2B%2B%EB%97%5E%5C%7C%9A%88%1B%09%B0!A_%9C%8E%85%ED%BA%F6%0A%F8%F5%8DEu%CF%967%D1%AB%92%92%92T%7D%7D%BD%DBWPP%D8%B8o_a%5DE%85%DA%F4%C5%0A%D5%B2v%AD%F2%E0%90f%11O%10RZ%22%BC_%5EL%07BP%B9%DA%0B%2B%19t%A8B%94%B6%25%09aL4%E2%0ASz%B2Q%E9%DD%D2W%B3%DF%ED%C6%AB%8BF%E4%BD%1CI%5Ca%7B%86tL%87%1E%2B%C5%DBu%CB4)%5C%EAQ%C6%F1%FE%B4k%9F_I%80%04%BA(%01.r%EF%A27%86%DD%22%81%8E%12%C0%C3%F99%BB%3A%22%10%10%E5%01~%B9%5D%193%1D%C2C%CE6%94-%1BD%08%E8%02%A2%7D%10%7B%08%B7%60%F1w~%FB%3C%AB%EF%19%25%25S%AB%D6%AD%7B%11%F5Z%F5%8E%7C4%05%96%D7%EBU%C9)%C9*%23%23Ceee%B9r%B0%03%7C%9F%DE%BDU~%DF%BE%AA%2F%F6%D3%CAMKS%A9%D8%BF%CA%B3c%87%CA%C2%1C%60%16%84Y%26b%06%3CV%A9%10W%C9%B0%85%05RJ%BCW%E2%B9%92%1DF%C5ke4f%8A%20%B9%8A%E7j%04%C6%18%D56%08%10N%B3PG%FE!j%FBf%25%CA%E0%05I%F7%CF%AD%C6%1D%9A%06%E1t%99q%1F%DA%7B%05u%F1%26v%10%179%BD%A1%19%A9%0D%E6%93%00%09t%1D%02%14X%5D%E7%5E%B0'%24%F0%AD%08%E0%01%FE%25%1E%E0%EB%60%C4R%14!%5D%1E%E0%E9%F0%CA%E8%EB%80%22%84%1B%E5%81oWFW%03%22%D8%DCny%EB0%AA%905h%D0%F7v.Yr%07%D4%84%F4C%EA%EB%DE*Y%7F%A5%0B%2Cl%E7%90%9A%9A%AA233U%0E%B6w%90%D8%3B'We%A7%A7%ABL%D9%C3j%C3%06%95%857%013Q%2F%03u%D2!%B0R%11S%60C%A6%08%93%10%C5%83%25%9E-%8F%D8F%AF0%00S%5CI%1F%2B%D0%A6L%0BF%25%AE%C0%E9t%D4%F9%9E%A1%09%C3X%60%08%E6t%E3%7C%D8%DC%10%05%049%AE%C7R%B4%A2%0D%D3%FE%CC(%EC%B0%08%09%90%40%0C%10%A0%C0%8A%81%9B%C4.%92%404%04%E4h%15%849(%ABO%B5Y%04Sl%FC%C2%22%AFM%12%A6%FED%A8%BDdc'%B8H%5B%17%60%AE%92'%C7%8C%7B8%92%3D3%BF%F7%D8%B1%BF%DE%BAp%E1%E9MUUU%86%A6%90MCu%91%95%88%DD%DEM%91%85%3D%B1T%AF%AC%5E*%0BWx%A9T%C2%BE%7D%CA%0F%81%95%81q%A5%A1%3C%BCV%ADQ%84%15%A6%08%F7%AF%BBBc%F8a%D3B%D6%5D%89xy%11%ED%14G3-(%7D%85g.%17c%7FYD%A4%DD%D8%24%0FA%B4%91%B9%5E%CD%AE%A8%D8%3B%0A%99%C5%86%90%B2%12k%D2N%0D%E2%1B%B6F%98A%02%24%10S%04(%B0b%EAv%B1%B3%24%E0L%00%0F%F0Y%22%8Al%84%81%3C%D8%E5A%3E%1E%EB%A7%0Ew%B6%84%82%C1%5D%DB%F5%3A%12%DA%96%97%AF%C8JN%D62%87%0C%BEn%D3%BCy%17E%B2g%E6%17M%99%F2%DA%A2%1Bo%2C%DA%FB%E5%97Oc%A5%3Bv%01%D5%7F%86t%8F%969e(b%2B%15S%86%C9%F1%10%5E%CD%3EU%89%B5Wi%0D%8D*%1Dm%A6C%8C%A5%89%E7%0A%11%0B%DBuq%A5O%0B%22%A2G%BA%1D%DD%60%B0%CB%5B%F1%F1%2C%08%C6%EFa%8DT%F0%8C%9C(%3A%0A%1Br%9E%A0%E1%04%B3%AD%20z%E9A%88%B6M%B6%25%8C%0C%94%FBmH%9F%DA%147%FA)%9D~%0B%FD%AC%8Cd%8B%F9%24%40%02%B1A%80%02%2B6%EE%13%7BI%02Q%11%C0%C3~%0D%0A~%2C%9E%15%5C%C3%BC%2F%A2%08%0CC%B7E2%08%8F%98x%99~)%B6B%EA%05%AB%89yo%A2%8A%EB%DD%DB5%FC%9C%B3%B4%94%92%92%E7%D6%CE%99%EDx%A0th%7B'%3E%FBl%1D%16%BF_%BA%E2%91G%86%EF%5B%B7%EEU%1Cg%A3%F7K%84%9C%DEElB%EA%C7t%A0%AF%AARU%AD%DF%A0v-%5B%AE%5C%FA%19%82aC2%AB%99%D3u%A1%C2%EAF%F1ZA%B4D%DC%E7*%B4o%10%9F%AF%E2%BBx%9BB%93C%3FK7%25%EC%C3%B4lDo%20%BCW%C3Py%0A%EC%B5%8A%BFPc!%ED%FC%C5%AEA%A6%93%00%09%C4%1E%01%0A%AC%D8%BBg%EC1%098%12%C0%83%DF%7CP%5B*%04y%D0%C3%C04%08%89C%1D%0D!%13%82%ED%8F%B8%C8I%C9m%95M%3C%8E%F7%C3%F4%DD%88%0B%CEW%19%03%06%B8%92rs%B4~'%9E%BCh%D5%E3%8F%8F%88d34%FF%F0%1F%FFx%15%D6fM%5Bz%D7%5D%25%7BW%AD%BA%A7~%FB%F6%F5p%BF%E9%E7%046%D7%D4j%F5%DB*%D4%FAw%DFU%9E%DAZ%1C%05%ED77%2Cm5a%08%1Ds%9C%01%8C%ED-%C4%B3%20%ACJ%20%AC%1E%84%D7%CAq%87%F6%F6%7D%05%93g%916%D5%60%D4%3E%3B%F4%3B%8A%B8%AE%BAb%F3%E6z%A7B%92%87%BE%08C%09a%F7%C3%E8%BF%B0%5D%87%FE%9A%7B%99%19%C5y!%01%12%88e%02a%7F%F0%B1%3C%18%F6%9D%04H%20H%00B%A1%02%9Fz%1B%DE%91%B0%BFsC%2F%BD%8E%87%FA%D4H%CC%B0%D8%7B%18%CA%AFj%15%1D%EE8%97%1Fo%F5%0D%3E%F7%1CUr%C2q*%7D%40%A9%F2fe*w%5C%BC%E6%C7%AE%EA%EB_%7Cq%E2!%97_%BE%2C%92%5D%AB%FC%A7%FB%F7%8F%1Br%E5%95%C5%85S%A6%9C%EEN%88%3Fj%D7%AAU%83%17%DF%FF%60%7Fwee%3A%F6q%08%AD%22g%10%CA%DB%8E%B2Vl%05%FA'%3B%D9%7F%88%F1%D8%9E%91h%D5%5Eh%9A%88%2B%D8%B9%18%82%C8%14%93a%DC%A4%BC%B0C%5B%2FA%7C%9E%1B%85M%99%8A%FD%DC%60giO%8E%0CB%FE%D5%E8%FBc%91%EC1%9F%04H%20v%08X%FE%C1%C7N%F7%D9S%12%20%01%2B%02%98%96%BA%09%0F%ED%FB%0C%81eUD%8E%A8%91%ED%05%26A(%7CdU%204%0D%E2C%8E%E1y%D8%E5%81%88JMq%95N%3B%5D%95%9E4%05%E2j%A0%C2%16%EB%CA%83%B7%00e-%95%1C%7B%A357%FB7%CD%9F%7Fr%E9%D9g%2F%88d7%9A%FC%A7%A6LMPe%1B%3C%81%E6%3A%D9%7DAV%96%8B%A7%CA%8F%BE7%A3%EF%1D%F2P%D9%B5gL%0B%EA%9E%2BC%40Y%FE6%EA%99%10v%D8%24%B5%F4%CA-%5Bp%B8%A1s%80%DDwas2%AA%E1%D2%D6%A4aK%0CT%81%5B.%BCa%9D2%16%E7%1E1%97%04H%E0%BB%22%60%F9%23%F2%5D5%CEvH%80%04%0E%0C%01x%9D%E2%F1%00%DF%03%EB%A9%D2B%D8%D3%1Di%C6%03%5E%A6%A6%06G%D3%8B'%07%0E~EKJ%3Cc%00%C4%D5%80)'%A8%F4%D2R%95%D8%2B%5By%B0%20%5D%C4%95%08%08%89bW%C3%E2u%2Cb%BF5w%E4%C8%3B%A3%B1%7D%B0%CA%C8%DB%82%E8%B3%2Ch%975WN%9E%2B%3DO%84%12.%87%83%D9%F2H%7D%C6%3D8%1B%E5_%92jV%FC%0D%7Br%F9%05%EC%DD%1D%C9%1E%F3I%80%04b%8B%00%D7%60%C5%D6%FDboI%20*%02%F0%EC%C8%8Ap9%3FO%9E%ED%96%FF%902%D2%07A%08%C8%E1%CD%11%C3%9A%CA%AAs%06%9D%7F%DE%97%A5S%C4s%05q%95%9D%AD%99%9E%2B%A9l6%A37%88%03%9EsF%8C%F8C%CD%E6%CD%AF%FEF%A9%84%88%C6%0FB%01%D9%E7%0A%3D%95%A9%D4%FE%B8%3A%89%2B%7DZ%D0%10W%17G%23%AE%20%DC%E2a%F7%09D%CB%85%ED%86%3Di%B3%06%9E%B8%7B%0F%C2%F0%D9%24%09%90%C0%01%26%40%81u%80%01%D3%3C%09%1C%2C%02%E2%15%C1%83%BCJ%1CJV%7D0%D2%25%EF.Le%F5%B3*%13%9A%F6%C7%3D%3B%FD%99%B9y%13R%FB%F5%DB%01q%A5%3C%09%5E%AC%BB%8A%D3%05%04D%82%F9%F6%5E%1B3)%85%85S%7FU%5B%BB%AF%E2%A3%8FN%8Bd%FF%BB%CA%97%E3o0%DE%7Fb%FCs%D1wl%97%A5%0BP3%86u%C3%E0%24%F9%B7%80%E9%F3a%05%2C%12%60r%06%EAaO%D4V%DB%EDK%09w%99%8F%FC5%16%E2%B7%B4%CF%E4w%12%20%81%D8'%40%81%15%FB%F7%90%23%20%01%5B%02x%BE%CBA%C5%B6%1E%2Cy%FE%E3!%2F%BF%03%FF%B65%12%921%FC%DAkk7%FD%F7%BF%C3%03%3E_5%C4%95%BE%A1iPC%EC%F7%60IqCX%E8sjq%C9%C9%DE%3EG%1C%F1Z%DD%8E%1D%EF%7Ft%CB-%FD%A3i%E7%40%95%81%B0%FA)%BAT%0D%FB%B6%3B%B4%87%B6m%8A%2B%5C%EF%85%B8%FAS4%FDB%1B%C7%A0%DC%0FL.%16u%CC)%C3%1D%D8%0A%E3o%16%F9L%22%01%12%E8%06%04%2C%7Fx%BB%C1%B88%04%12%20%01%83%00%1E%F8%B27%D6%20%E3%81%1F%FE7%2F%D3_R%D6%E5%FE%E3e%E5e%11%0Fo%96%A2%2Bg%CC%C8%2B%BD%E0%825%DE%AC%AC%CCp%83%D6%E8E%AC%88%F0%AA%DB%B6%ED%A5U%8F%3Ez%CB%84%DBn%5Bk%5D%B2sS1%5D%87%D3s%5C%D7%C0%AAL%99f%19%1Ct%0F%92CK%86%B6%D2%BDL%F7B%08E5%8D%8A%B6%D2a%7F%3Bb%A2a%DB%B2%0D%D8%94%EC%D3%20%DA%E69%F4%81Y%24%40%021L%C0%F2%8F%3F%86%C7%C3%AE%93%00%09%B4%23%20%1B%5Db%0Ao%95.pZE%C5%FEO%98%DF%C3fM%1E%9C-%E3QMiiG_%B3%E4%B3%F7%A3%81%F8%D1%AD%B7f%8E%F8%F1%8F%97%25%E5%E5%F5%97%1F%12S%409%D55%CAH%11W%ED%B6m%1F%EEY%BE%FC%81e%0F%DC%FF%DAY%F3%E6%CB11%9D%1A0%158%04%ED%DD%00%B1s%15%AEI%D2E%11x%D1%F4S%CA%06q%E9%D3%82Qy%AE%A4%F3%10%B3%9F%A0%89q%A8k%F9b%81%941%DA%7F%0B%EB%E4N%EA%D4%01%D3%18%09%90%40%97%22%40%81%D5%A5n%07%3BC%02%07%86%C0%93%25%03%EEuk%DAOq%16%8D%CC%DF%89%D2%10%8F%95%D2p%EC%8C%2B9Iyss%B5%CC%81%A5%AA%EF%B0a%FE%CC%A2%A2%D2%FE%A7%9F%BE)%9A%9E%FCs%EC%D8%C4S%5E%7CqAZ%FF%FE%13E8H%1D%111%11%EA%EA%5BD%A0%8C%B8%CE%5C%D8%AD%BD%A9j%ED%DA%05%8D%7B%F7%FE%EB%CD%87%FF%BE%20%A9%C1%B7%7D%FA%C2%F9%0D%11l%84eCP%E5%A0%0BC%91q%1E%E2%89%88%C3%A4%2BQ%0A%AAV%7B%C68%A4%7F%B2%A0%3D%AA5WR%19B%F6q%B4w%A5%DD%F0%8D~HQWKKK*%B6y%A8km%94%1FH%80%04%BA%1D%81H%3F%84%DDn%C0%1C%10%09%F4T%02%2F%1Cy%D4fOZZ%81'%25E%C5e%A4%BB%D2%F3%F2TJn%AEJ%EF%DDGa'v%D9%2CT%8B%C3%06%A2X%BC%BEg%DE%A9%A7%16%5D%B4vmc%B4%ACv-%5Bv_%AF%E1%C3o%C2v%0D%B6%5B%12%88-C%83%05%AF%D0c%01%1C%7F%D3%B8g%8F%DA%B7v%AD%B6%E4%A9g%5CU%1F%7F%ACTc%FDV%14(G%F1%AF%24%A2%CEF%88%96%DD%F8%2C%FBN%89%88%93%FD%B0%D2%10%F3%11%07%22%CA%8E%F4%03%10K%11%CD%A9%B9%8Ex%ABP-8K%8A%B6%E47Q%CE%2F%9C%1A%CD%DB%82RQ%02%C4%9D%AC%ED%BA%D7N%5C%99%E5%8C%F1_%02%DB%CF%99i%BC%92%00%09tO%02%14X%DD%F3%BErT%24%10F%A0%EC%9F%FF%1C%AE%25zW%C4%A7%A5iq%D8%BB%CA%ED%F5%BAd%0F%2B%89%F1%89I%F2%5D%C5%E1%CD%40%17%0EXn%DC%BD%7B%F9%B5%85%85%A3qn%8C%EC%98%1EU%D8%F0%CA%2B%D3%0A%8E%3B%EE%19%D8O7%95T%A87%AB%8D%B8%82%C5%40K%8Bj%AE%AEV%D5%E5ej%FD%1Bo%AB%AF%E7%CCQ%AE%7DU%9AK%F3c%1AO%17%3C%FA%EF%93)Z%CC%FA%86WJO7%D3P%ACU%D8!%CDQ%E4Y%0DF%EA%04%9Br%BD%04%EF%D2%C5%D1l%22j%DA%C1%B4%A0x%CC%E6%A0%3F%BA%99%D01%87%B6%25y%88%AFc%3DW%C4%DD%F3%AD%FA%C84%12%20%81%D8%22%40%81m%A7%1E%C4%00%00%0C%8BIDAT%15%5B%F7%8B%BD%25%81oE%60%CB%C2%85%3F%C9%1A6%EC%AF%AE8%0F%96%5D%C5%C96%0B%FA%26%A1%CA%E3%C6R%AC%E0%F4!d%8D%E6r%7B%5C5%E5%E5%1F%8C%2C)%99%5Cnxw%A2i%F8%E5%93ON%3D%E6%81%07%9E%CE%184%E8%2CQ%13%226Du%18W%DD%84.4%FC~%D5%D2%D8%A0%EA%B6lQ%BB%3F_%A6%3Ey%F4Q%EC%8F%BE%5D%A9%16_4%CDtJ%19C%0C%E9%C2%0A%9F%F7%A1%8FWa%5D%D4%8B%1D1%0Eq%25bI%0E%87%B6%15u2~c%DCU%5E%AF7%F7%A2%AF%BF%E6%8E%ED%1D%81%CC%B2%24%10%A3%04(%B0b%F4%C6%B1%DB%24%F0M%09%EC%5D%BB%F6%F5%F4%92%92S%B1%03TP%3A%19K%A6%C4%23d%84%D6%B5T%D5%E5%E5%EF%9FRRr%2C%CE%D2%89%DA%93%256%D6%BF%FC%F2%F1%05%C7%1C%F3%9473%B3%A0%8D%C0%92iA%9C%BD%E7%F7%F9T%C3%CE%1D%AA%EA%CB%2F%D5%E2%A7%9EV%F5%CB%BE%C0%04%A0%2C%BBju%5C%7D%D3%E1ES%CF%14Uf%D7%1ED%9F~%11%CD%C1%CD%A1%C6E%5C%C1%C0%AB%C6%D9%85v%BF%A5%A6%BE%12%117%1E%DE%AB%CF%A2%E9%20%CB%90%00%09%C4%3E%01%BB%1F%85%D8%1F%19G%40%02%24%60I%00%AF%AEy%5E%A9%AC%DC%98%90%9E%9Eo%88%AA%D6%DF%01Sd%B5%AA%02%24%607%F6O%7F%D3%AF%DF%91%7F%85%7F%C9%D2%A0C%E2%EE%95%2B%AFO%EF%DF%FF%EE%B8%D4%D4%14%ACl%17u%E5%F2cj%B0i%EF%5EU%BD%FEk%B5%E6%D5%D7%D4%A6%D7%E6)w%1D%D6%7Bk%D0p%11%D7%C7%3B4%169%CBTo%BA%B0B%F1%F9%18%DE%0F%E1%B5%8AjA%7F%A8%F9v%D3%82%E2%A0%B3m%1DmI%DEUXw%F5%B8m!f%90%00%09t%3B%02%DCh%B4%DB%DDR%0E%88%04%9C%09%BC%A1%94%FF%AB'%9E8%C6%DF%D8(%C7%E9%E8k%99%CCh%D64%15%83(%91%B4%A2%A2%F1w%EE%DA%F5%D5%82%2B%AE%C8t%B6%1C%9E%9B3%7C%F8%C3%09ii%A9%FB%D6%AD%BB%A1%A9%B2r%AF%16%F0%CB%BA%2B%AD~%EB%16%B5u%E9%E7%DA%C6%B7%DEV%EE%06%AC%A5%17%11%E2%20R%C2-GN1E%22J%9ASt%FA%C6%A8%F0V%BD%8C%F1%95B%F0%9C%FAM%C4%95%2Ch%87%CD9%86%5D%3Bqe%B6)%1D%9DIq%15%F9~%B1%04%09t7%02%F6%FF%EC%EAn%23%E5xH%80%04%DA%10X%F7%E2%8B%C7%14O%9B%F6%8E%3B%3E%DEq%FD%90(%08%11%2B-%0D%0D%0D%EB%FF%F5%AF%09%87%5Cz%E9%CAo%8A%B2%FC%8D7NL%CA%CA%FC%F9%8E%E5%CBOZ6%F3I%A5%ED%D8%A9T%B3%EF%5B-Po%DF%17SX%19%FD6%B3%E5%E0%EB%070%9Dw7%8E%A6%E9%F0%16%10%A6%91%90%AD%18%9C%E62%5B%05%1D%EA-%80%B8%3A%A1%7D%1F%F9%9D%04H%A0%FB%13%A0%C0%EA%FE%F7%98%23%24%01%5B%02%1B%E7%CF%3F%BFp%CA%94%D9%91%B6W%10%03%22%5CpD%8Ek%F7%B2e%D3q%F4%CD3%B6F%A3%C8%C8V*%EE%DEC%87_%A2jk%2F%86%E5%D6%0D7%C5%93f%B4%D5%FA%F6%60%14%E6%F4%BE%85%0A*%B1%83%A4-%A8%FB%02%3E%CF%86%A7jq4v%EC%CA%18%3B%B4%BF%89%FC%F1%86m%3BQ%DA%AA%EFPv%99%DF%EF%1F%8B7%12%B9%A8%DD%0E%2C%D3I%A0%1B%13%A0%C0%EA%C67%97C%23%81h%08lY%B0%E0%EA%FC%A3%8F%FE%3B%5E%23%B4%13%0D%BA%99P%CF%106%06%9D%3Dm%C8%90K%16a%BA1%9A6%22%95%C1%B4%DB%11%B0%3F%09%E5%26B%C0%8C%C7%E7%3E%F8%2C%FB%5DIt%0A%E2-%92%B5aM%A8%B3%12u%3FD%FC%14%9F%C5s%B4%CB%A9b%B4y%C6%D9%82%F3%60W%F6%D8r%FA%CD%0C%15Wk%F1e%04%16%B5%CB%DE%5D%0C%24%40%02%3D%90%80%D3%8FE%0F%C4%C1!%93%40%CF%24%B0y%E1%C2%EB%0A%26O~8%92%C82%E9%E8%AA%A6%B6%B6%AA%FC%D5W%CF%18%7C%D1EQ%1D%AD%D3Q%B2%106%05%105%7DQ%2F%1BbE%CE%F8%F3b%FD%14f%F9%DC%B2v%AC%1E%B1%0A%E9%3Bp%DD%0A1%D5%E9G%ED%C0k%15%8F6g%C0%BE%1C%DC%AC%8B'%5C%ED~3C%A7%05E%5C%8D%82%B8%92%3E2%90%00%09%F4P%02v%3F%16%3D%14%07%87M%02%3D%97%C0%A67%DF%BC%B4%E0%D8cg%B9%3C%1E%5D%2C8%88%09%1D%92(%0E)S%F9%D5W%CF%AD%9A1%E3'%93%EF%BF_v%5B%EF%16%01%1E%B5%B31%90'0%C4LCS9%AD%B92y%C8u%19%EA%1CA%CFU%B7%F8%DF%80%83%20%81oE%80%02%EB%5B%E1ce%12%E8%5E%04%CA%E6%CE%3D%BD%F0%C4%13_%F1%24%24%88vr%FC%7D%D0%5D%3A%12P%AE%A5%AE%BEq%CF%CA%15%BF%9Bw%D6Y%F7%5E%B9%7D%BB%FEvb%2C%06x%CD%0EG%BF%FF%86x4%A2%E3%94%A91%3E%5Dx%19(%16%60%CD%D5I%5Cs%15%8Bw%9E%7D%26%81%CE'%E0%F8%03%DA%F9%CD%D1%22%09%90%40W'%F0%E5%CC%99%A3%07%9D%7F%FE%FB%9E%A4%A4%24%3B%91%25%82B%F4%97l%1A*2L%0B%04%DDY%0D%15%15%3Bj7o%FA%ED%8C%89%93%1E%BB%AD%93%D6g%7D%17%BC0%1D8%0CS%8F%7F%C4(%CE%C0%B8t%EDh%E8K%DB%DF%C8V%81%19%5C%97%25%5B1%5C%F9%5D%F4%95m%90%00%09%C4%06%01%DB%1F%8F%D8%E8%3E%7BI%02%24p%20%08%CC%BB%E0%82%CC%C9%F7%DD%F7vJ%DF%BE%A3C%85%84%88%0E%C3%5B%A37%8B%CDCE%5C%E1%5CA%9F%E6olra%AF%2B%ADa%C7%0EW%D5%86%F5%3B%97%CE%9E%7D%8F%BF%C9%F7%E8%A5o%BCQ%7D%20%FA%D8%196!%AC%8E%C2%98~%0B%5BS%C4%9E!%AE%ECte%9B%26%0D.%F2%1B%CAMD%3B%E3f%D0%06%09t3%02%14X%DD%EC%86r8%24%D0%99%04v%7F%F1%C5%A3%D9%87%1DvM%88%98%08%9E%25%08a%25A%F3%B7(%08%2B%D5%5CS%A3%EA%B7W%A8%86%ED%3B%B4u%EF%BD%E7%DA%B2%E8%03%CD%B5w%8FK5%F9Z%A0%C0%E6%A0%FE%0C%ACK%3A%20%8B%E1%3B%3A%DE%A7KJ%D2%E1y%BB%0C%F5nF%2C%96%FA%22%AC%E4%12%C9%96p%10%F5%25%22%13%B1%12%E5O%E6%F17%91%A81%9F%04z%26%81%88%3F(%3D%13%0BGM%02%24%60%12(%9F%3F%FFT%BCa%F8%8A%3B11%0E%AA%C2%25G%DE%04ZZ%5C%D8%13K5%D7%D6%AA%C6%DD%BBU%E3%8E%EDj%DB%17%2B%D4%FA7%DFT%CD%DB%B6)WC%83%86%03%9DMw%97%F9%3B%B3%176gB%98%CC%81(%F9%E4%BB%24%8CE%EB%E9h%F7%1C%B4)%C2%EAX%C3%13%D7*%96%E4%7B%94A%D7X%88%AF%E3%E0%E63xps%94%D4X%8C%04z%20%81%A8%7FUz%20%1B%0E%99%04H%C0%20%F0%CF%89%13SO%99%3D%FB%B5%C4%5E%BD%8En%86x%C2%16%0D%98%0E%DC%AB%9Av%EEV%7B%D6%AFW%1B%DE~%5BU%AF%5D%AB%DCM8%F6%A6%19k%DCC%8E%BE%11o%8F)h%60%CE%FC%CD%F1!%EDu%7C%9F%8F%FCw%B0~iMg%C2%86%97*%1E%5E%AA%E3a%FBx%B4s%26l%0F%09%B1o.%5E%8F%CAk%85z%E6BvS%90%5D%82%FE%3E%D7%99%FD%A5-%12%20%81%EEG%80%02%AB%FB%DDS%8E%88%04%0E%18%81-%EF%2C%BC%D8%9D%900%B3i%E7%CE%84%8AU%AB%B5%8A%C5%8B%5D%D5%EB%D7)O%93O)%1F%F6%D44%5E%2C%B4%EA%80%EE%FA%09%BA%8A%F4%8F%16ed%A3%D0%CF!%8CV%E1%BA%1Ee6%E2Z%81%EF%7B%AE%D8%BC%B9%CD%F16%8F%E5%E7%BB%12%12%12%B2%60%23%0F%E5%0AQn%00%3E%0F%C2%E7%91%B8%8EC%D4%CFM%94%E6%90%26%1F%A3y%23P%CA%B5%86%D0z%F2%19%B6%DElii9%1Bo%09%E2dj%06%12%20%01%12p%26%60%F5%23%E7%5C%83%B9%24%40%02%3D%9A%C0%5B%17%5C%1C%B7%B5%BA%EA1%AD%BC%FC2%97%1F%1B%B9%FB%9AD-%89%92%11E%F3%AD%D8%88%F2%82%81%88FB%84%93%DE%9E%F1%BD%BDg**%5B%ED%3B%2C%7D%80%BD%E0%AB%84%C1%BE%C8f%A6W%C0k5%AF%7DY~'%01%12%20%01%3B%02%11%7F%C8%EC*2%9D%04H%A0g%13%98U%3Ap%A0ji~%14ZD%A6%E2%04F%87%BDD%5D%89%A0%85%B0%AAA%DA%AF%B1%5EL%F6%C5b%20%01%12%20%81%0E%11%A0%C0%EA%10.%16%26%01%12hO%00%9Bs%8E%85%C8%FA3%C4%C8%B1F%9E%EE9%12'%90%5C%DB%97%EFj%DFE%1C%9A%1E0%C3y%25o%07%FE%09%FBb%DD%3B%BD%ACL%CE9d%20%01%12%20%81%0E%13%E8%F2%3F~%1D%1E%11%2B%90%00%09%1C%14%02%10Z%87%A1%E1_%22%CA13%5ES%60%99%02%E6%A0t%CA%A6Q%0Bo%95%94%5C%87x%17%D6%7C%CD%C4%9A%AFN9%C4%DA%A6y%26%93%00%09%F4%00%02%14X%3D%E0%26s%88%24%F0%5D%12%C0%E6%9D%B9%F0%FE%5C%0C%11s%1D%DA%D5%DF%DE%0B%11%5B%5Da%1AQ%D7W%06%139%24%FA-%C4%BF%60%8D%D5%07%DF%25'%B6E%02%24%D0%BD%09P%60u%EF%FB%CB%D1%91%C0A%25%00%B1u%18%C4%D5e%E8%C4T%C4%A1%D2%19%11%5B%C6T%9C%BC%E1%F7%5D%08.%7D%81%984%8D%E6%A4%FD%3A%5C%17%E1%FBL%C47%20%ACdJ%90%81%04H%80%04%3A%95%00%05V%A7%E2%A41%12%20%01%2B%02%D8%97%0A%2F%1C%FA%8B!ndO%AA%93q%1D%0F%91%D3K%CA%9A%EB%9Fp%DD%AF%BC%AC%8C8%A4%B5%17j%F2%5DL%87TY%81%A4%0F%D1%84%EC*%BF%18%0B%D7%F79%98c%16%09%90%00%09%7Ck%02%14X%DF%1A!%0D%90%00%09t%94%C0%CC%A2%22%2F%A6%11%F3Q%EF%18%C4%89%88%87%20%8A%87%2B%D7%CA%96%A9%BD%8C%BC%F6%E2)%B4%8A%9C%E1%23%9B%96%AEF%5C%81%F8%0E%04%D5R%08%AA.%7B%1E%A2%D5x%99F%02%24%10%FB%04(%B0b%FF%1Er%04%24%D0m%08%E0H%9B8%0C%A6%08%B1%18%B1%00%E2(%0F%D7%2C%08%AC%94%A0SJ%F7J%C9%B4b%0B%16%A3WC%A4%ED%C6%F7%0A%E4m%C6U6'%AD%86%982%A7%04%91%C4%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%D0%F9%04%FE%1F%16(%A9%BB%0A%EC%FF%BD%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\" selected=\"true\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div>";
			}
			if(replacemethod === "newwindow"){
				flvideoreplacer.innerHTML = "<img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%02X%00%00%01%10%08%06%00%00%00l%85%0A%40%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%0A%08%08%12%A9Cv%00%00%00%20%00IDATx%5E%ED%9D%09%7CT%D5%D9%C6%CF%CC%24%99%EC%0BY%80%2C%90%106%11AvAq%C5%15q%AFkq%ABZ%97%DAZ%DB%EF%EBg%ED%AA%D6Vk%B5uC%5B%15q%A7X%ABE%85%BA%80%0B%EE%80%20%20%82%40%C2%1A%F6%84%EC%99d%E6~%CF%7B%E7%DE0%C9%DC%7Bg%A2A2%C9s~%BF%E3%9D9%CB%7B%CE%F9_3%F7%E1%3D%E7%9E%A3%14%03%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%F4h%02%AE%1E%3Dz%0E%9E%04H%E0%A0%12x%B6%B4%D4%ED%F3%F9%92%DDn%F7ptd%94%CB%E5%1A%AAiZ%11%3E%17%22%F6A%CCFL%B6%E9d%00%E5%2BQ~%17%F2%B7!n%94%88%B4%2F%90%B6%C4%E3%F1T%7C%7F%C3%86f%9B%BAL%26%01%12%20%81%03J%80%02%EB%80%E2%A5q%12%20%81P%02%B3%FA%F7O%C4%F7b%08%A0%D3!%AA%8E%0A%04%02%22%AA%FAI%19%5C%15%D2%E5%A3%86%CFa%BFM%92%D7%3E94%0D%9F%A5rh%3D%11W%9F%23.A%D6%3C%5C%3F%B8%7C%D3%A6%BD%D2%00%03%09%90%00%09%1Ch%02a%3Fb%07%BAA%DA'%01%12%E8Y%04%20%AA%C4%0Bu%1C%E2%C5%10%3A%93%20%92z%1B%04t!%25%C2%C8JP%7DSJ%A1%F6%2CD%D7R%D8%9D%8F%F6%9E%83%B8%FB%12%82KWt%0C%24%40%02%24%D0%D9%04(%B0%3A%9B(%ED%91%00%09%A8%A7%8A%8B%BD%107%A7%00%C5u%88G%23%26%09%96%10%0FT%7Bo%D3wA-%E8%1E%83%9E3%FA%B2%0E%7D%9C%83%3E%CD%BA%B4%BC%7C%CDw%D1%01%B6A%02%24%D0s%08P%60%F5%9C%7B%CD%91%92%C0%01'%00oU)%1A%B9%11%F1b%C4%5CCP%99N%A5%83!%AA%9C%C6%AC%F7%07%9D%932%1F%E3%FA%17x%B4%5Et%AA%C0%3C%12%20%01%12%88%96%00%05V%B4%A4X%8E%04H%C0%96%C0%93%FD%FA%8DA%E6%ED%10T'%23%BA%5B%15%15%3Et%E6%F4%9Fm%07%BEa%86%88%2B%F4O%EF%AEab%3B%3E%DF%85%F5a%0F%C1%AB%C5%05%F2%DF%90%2B%AB%91%00%09%B4%5D%10J%1E%24%40%02%24%D0!%02%F0X%8DD%85%FB%11e%1AP%82%EE%15%0A%99%0A4%92%BB%FAE%DCX%FA%C2%FA%A0%E4r%BBj%DC%5E%EF%1D%DF_%BD%FA%EE%AE%DEs%F6%8F%04H%A0k%12%A0%07%ABk%DE%17%F6%8A%04%BA4%01x%AC%B2!%A2%9E%40'%CF%90%8E%8A%17H.%9D%D5i%C3%B3%D4j.%F4%BB%CDgs%BA%AF%E3%1E%B3%E0%14%A1%AE%AF4%B7GSn%8FKy%3CZ%20!%C1%A5RS%AB%0A%8E%9C%F8%D3%93%EE%B9%E7%C9%CE%1A%1B%ED%90%00%09%F4%0C%02%9D%F6%83%D83pq%94%24%40%02%F0Z%FD%06%14~%2F%24%BE%89%A7*dZ%CE0%D1f%8A%CE%04%BC%15%1F%CA%11%2BP~%0F%A6%ECjpmD%D4%F09%0E%97%14%E4e%22%E6!%CA%9EY%B2%F6K_H%2F%C1F%F0%85%88%40%7C%94YA%F9%05t%7B%94%8A%8FW%01O%9Cre%A4%AB%B4%82B%955p%80%D6%AB%7F%7FWz~%BE%16%97%92%E2%F2%24'%AFm%D8%B6%ED%EC%D2%F3%CE%FB%D2l%83W%12%20%01%12p%22%40%81%E5D%87y%24%40%02%AD%04%20%ACF%E1%CB%5C%C4%02%C4%8En%B1%D0%EAaB%5D%7Da9%84%92%EC%7B%D5%88%EF%0B%10%3F%40%FC%04%DF%97a%A1%F9%9E%D6F%3B%F8%01%7D%1C%86*%E3%10'%20%1E%8BxH%3B%13%FA%A2%2B%97(%AB%B8x%A5!%AA%B4%14%95%3Dd%88%CA%1B%3E%5C%F5*-V%899%B9*!%3DCAX)%08%2B%15%E7%F5*W%5C%9C%E6%8E%8Bs%D5m%D9r_%F6%A1%87%DE%DC%C1n%B18%09%90%40%0F%24%40%81%D5%03o%3A%87L%02%1D%25%00%E1r%17%EA%FC%AF%8Dg%C8%D6%9C%08)%A9%83%10%FA%5B%B3%08%15%E6%20%BEz%D9%C6%8D%1Bl%2BwR%06%B6%8C8%15%EDOCG.T.w%96J%F0*-%D1%AB%25%E6%17%BA%F2%C7%8D%D1%0A%0E%3B%CC%95%98%9B%A3%1223U%7C%06%84UR%92.%AA%DC%F0j%B9%20%021%5D%18%F4%88%89%2Cs%BB%5D%BE%AA%AA-%1B%5Ey%E5%D4C%AF%BCre'u%91fH%80%04%BA!%01%0A%ACnxS9%24%12%E8%2C%02%10V%E2%AD%9A%8F(G%D9%E8%FB%19%E8%0E%20%87%A0%AB)CUIq%A3%E8%A7H%9E%81%E3k%9E%9F%5EV%D6%E4P%FD%80f%3D9a%D2%D8%A4%DE%B9%D3%87%9Cr%CA%E5%BD%06%96%A6%7B%B3z%A9%C4%EC%5E%1A%3CU.%11V%F0R%89%B7*(%AC0L%B79%D4%B6C%D6%02%CD%CD%AE%DD_%7CqS%9Fq%E3%FEv%40%3BL%E3%24%40%021K%C0%F1%872fG%C5%8E%93%00%09%7Ck%02%10W%A7%C2%C8%2B%88q%91D%95%D1%98%B9%C6%C9%F4XU%23%FD%EF%A8%3B%03%5B%1E%1CpOUG%07%BCs%C9%92s0%0D%F8%8B%D4%C2%C2%F1%EE%84%04Q%8E%9Ax%A8%DA%EBG%F3%BB%E1%8D%93iM%5Dh%8A%D2%DC%F7%F5%D7%F3.%1D%3Cx%1A%E6M%FD%1Dm%9F%E5I%80%04%BA7%01%0A%AC%EE%7D%7F9%3A%12%F8F%040%AD%F6%07%E8%88_%A2r4o%E5%B5Y_%05%DD%B1%1D%C7%D0%DC%8E%FA%FF%B8b%F3%E6.%BF%97%D4%AA%C7%1F%3F%3C%7F%F2%E4%DB%D2%8A%8B%A7%89%07%2Bt%CC%A6%A8%B2%80%A8%05d%DA3%10P%0D%BBvm-%9F%3B%F7%98%E1%D7%5C%B3%DE%A2%1C%93H%80%04z(%01%0A%AC%1Ez%E39l%12%B0%22%F0X~%BE%2B%3E%3E%FE%25%E4%9D%85(%E2J%8AE%FA%9D0%3DV%95(%FBk%9F%CF%F7%C8%D5%15%151%E7%D1Y%FE%C0%03%87%F6%3F%E5%94%BB%D3KKO3%C6%EExN%22%04%16%FCV~%D5%5CW%A7U%97%955o%FD%E8%E3%93F%5D%7F%DD%BBV%5C%99F%02%24%D0%F3%08%60%05'%03%09%90%00%09(9%3F0%01%E2%EAC%B08K%84%951W%E6(%AEDY%89%97%07%F1%AF(_%80E%EB%0F%C5%A2%B8%92%FB%3F%F2%C6%1BWe%0E%1A4%F5%AB%C7%1F%9F%04%AF%D4%3A%F3%FF%09%7D%80%11%82%E6%F7%C7%EF-%2B%7B%E7%C9%11%A3%CF%8FP%94%D9%24%40%02%3D%84%00%05V%0F%B9%D1%1C%26%098%11%98YT%94%0C%1D%F19%CA%1C%01%A1%14IPH%BE%A9%3B%3EE%F9!%D8Z%E1%A7Xg%D5%E0%D4F%AC%E4%0D%BB%FA%EA%8FRz%F7%1E%BCk%E9%D2%9F%FB%1B%1B%03Q%F4%5BW%A3B%C4%D5T%3F%7BVq%F1%D5Q%D4a%11%12%20%81nN%40_p%C0%40%02%24%D0s%09%88%B8%C2%9ET%CB%A0%11%06E%E3%AD%11R%A2%25p%F9)%3CV%7F%EDLrXX%3F%18%FD8%0Ck%B8Jp%1D%0A%DB%FD%11%FB%22%CA%A6%A2%89%882m%D7%82%BCZ%7C%DE%8D%B8%19%E2f%BD%96%94%FC%B5%CA%2F%5Cs%C8%A8%11%9FO%B8%E7%1E%C9%FB%D6!o%CC%98%BF%7C%F4%CB_%CE%19y%D3M%FFN%CA%CD%1D-%06%85%0F%DA%B6%F1%EA%09%13q%E7%A9%BFc%1Cq%603%E3%5Bw%82%06H%80%04b%96%80%CD%0FE%CC%8E%87%1D'%01%12%E8%00%01%99%16%14%CF%154%C30C%3CHm%DB%DF%05%94%91%FCm(%7F%2C%3CV_w%A0)%CB%A2h_%C4%D4T%D8%93uO%93%10%B1%ADz0%88%8E%91%F6%CCkH%BA%DEU%F9%AEk%1Do%92%D2%B2%B3%D4%88%0B%2FR%7D%C6%8CV%89%7D%FAT%B8%3D%9E%D7%EB%B7m%9B%7F%E1%A4I%FF~%B7%13%DE%F0%DB%B5l%D9%9D%D9%23F%DC%82%26u%00%22%B2B%D6%60%A9%7D%EB%D7%AB%95%CF%3F%AF%B6%CC%7DU%A9%C6%06s%D1%FFe%F0%EC%3De%F6%9BW%12%20%81%9EE%C0%F6%87%B4ga%E0hI%A0%E7%110%16%B4%CB%9A%AB%23%10m%17%B4%9B%C2%CB%105s%E1%99%D1%CF%1F%FC%A6%01%DE%9D!%A8%7B%0D%E2%95%B0%99%A9%8B%24%04%5Cua%12%95%5D%11zR%2F!Q%B9rs%D5%E1W%5C%A6%F2F%8CP)EEZBz%BAK%B6%5D%80%C8R~%9FO5%EC%DC%B9%A8i%EF%DEGr%0F%3F%FC%D9%A8l%DB%14*%9B%3Bwr%E1%09'%2C%F0%24%26z%AC%05%D6%0B%10Xs%95%AB%B1%11*LW%A2Rl%1A%84(T%17%03%09%90%40O%23%C05X%3D%ED%8Es%BC%24%60%100%DE%16%D4%D7%5C%19%22%C7V%DC%18%E2%EA%AEo%23%AE%20%AC.D%5C%8D%B6%BEB%17%E4%B8%19%11Wz%DBr%C5w%DB%F6%DB%DE4S%5Cy%95%A7wo5%FA%F2%CBU%EE%A8%C3Uj%FF%FE%CA%9B%91%E1%F2%40%5C%C9%0E%EC%E2%FD%C2g-%AD%A8%E8%A8%9C%91%23%9Fi%AE%AF%D7%EAw%EE%9C%F1%CE%F5%D7%E7%7F%93%FF%09J%A6M%7B%7F%C5%C3%0F%976%D7%D4%04%8F%F2%91%06%0C%8FV%D0%9E%EE%DC%D2%83(%2B%19%13%C2%2B8%18%5B%9F%5Ed%20%01%12%E8Y%04(%B0z%D6%FD%E6hI%40'%20%FB%5C%E1%A2%BF-%88%20%FF%B1%147%A2%10%8C%BC%CB!%AE%FEO%AF%DC%C1%80%B6~%02a%25%EB%A2%9EG%14%EF%95%3E%B5gD%B3%5D%CB%F6-%9B%92%D9A%1Cw%A3rr%D4%88%E9%DFW%D9%87%8FPi%85E8%3F0%5D%E9%1B%86B%5C%B5%B7%2F%E3%90%9D%DA%13ss%7Fx%CCC%0Fm%AD%DB%BE%7D%DEgw%DC1%D0%D2%BEC%E2%E8%9F%FF%7C%D3%3FG%8C(%AA%DB%B6m%B9lJj%14%DD%AF%ACB%EA%0A%BA%A0%CEr%BD%0F%91%25k%C8%18H%80%04z%10%01%0A%AC%1Et%B39T%12%10%02%B2C%3B%1E%FE%FA%26%A2NDD%94%20%88F8%13%E2j%96SY%AB%3C%B4s%09b%25l%C8B%F8d)%23%C6%AC%CAF%9F%86.%CB!%CDi%E9j%F8%85%17%AA%DC%C3G%AA%D4~%FDT%7CZZ%EB%117!%E2%AA%D5lk%BB%C15d*)%2F%EF%E4%B1%B7%DE%FAu%F5%C6%8D%FFz%E5%E4%93%3B%24~%A6o%DC%D8xmA%C1%E8%9A%F2%F2%0Ft%25%17%0Ca%2C%8D6%25%3F%09%9F%DF%8E~%8C%2CI%02%24%D0%1D%08P%60u%87%BB%C81%90%40%94%04%20x%E4lA9%FE%C6%9C%16%B4%AC%19%22%AE%A6b%0D%D1%7F%2C%0B%D9%24%C2%5B3%14%ED%7C%0E%1B%CF%40XdH1%11%1B%FB%B5%88M%C5H%C9%22%8E%DCq%CA%9F%92%AC%86%9Cy%26%16%B4%8FQ%A9EE%CA%0Bq%E51%0EfF%9B!%9A'%DC%60h'd%8C%A8%7F%F6%D4%97_%AE%DC%B1x%B1%2C%60%8F%3A%3C%A3T%60xI%C9%E4%9A%8D%1B%DF%17O%96%B4%8B%DE%05EV%3B%09i%B49%1A%5C%1E%8D%BA%01%16%24%01%12%88y%02%14X1%7F%0B9%00%12%E8%10%019%B8%D9%3C%5B0%CC%9Bd%08%2B%7DZ%10%5B7%88%E7%EA%F5%8EX%C7t%E0o%20(V%A3%CEH%D4o%7D%0B%B0%236%A4%0Ff%F9%D6%8F%BA%B8%82%BD%C4D%D5w%F2dUx%D4%24x%AE%20%AE22%14%B6%9E%D7%5CX%D0.%02N%DA%8C%26%04%F5%5E%F0%BFn%AFW%C3%96%0Cw%D6%ED%D8%B1z%F9%FD%F7%0F%8B%A6%BE%94%D9%0CA5%B9%B4%F4%D8%86%DD%BB%3FU%01%BF%88%2C%F0%0Csd%B5%0E%05%AD%5D%23%DE%C3h%ED%B3%1C%09%90%40l%13%88%EE%D7(%B6%C7%C8%DE%93%00%09%80%00%1E%EEw%E12%3C%D4%8B%D3%1E%8C%88%14%04%F9%CF%E5%1D%F1%5CAX%F5B%5C%0A%91%F1%7B%D8h%DD%2B%CA%A9%AD%90%B6uUb%88%3B%BD%7D%DD%23%84%FD%AE%F0y%07%AE_C%3D-%D7%12%BC%9F%26%0F%1B%F6%C9%A0%13%8E_%12%9F%91%F9%25vO%DF%84%85%EB%D5%86X%D2%05%96%D8%08%B1%DB%A1%8F%D8%EBj%C8%A1%D7%5C%B3j%CB%BB%EF%5E%17m%C5%15%F0d%3D0%60%C0%91%CD%B5u%EB5_%B3%EE%C6r%08%92%FB%0A%EEC%AAC%19f%91%00%09t%13%02a%FF%82%ED%26%E3%E20H%80%04B%08%E0%A1%3E%0A_%97%22%3Al%94%A9%8B%1C%A9%25o%0BF%BD%A0%1DS_'A%DC%CCE%BDxCP%89%91H%BF-%A2%85%A4Lh%D9%8D%F8%BE%04q!%E2%C7%88%3B%E0%91%AA%9C%5EVf%B9q%E8%AC%A2%A2%B8%81%17%5E%98%99%98%9D%9D%9D1h%D0%A0%F4%01%03%8EO%CE%CB%9B%E8%CD%CC%1C%13%97%9C%1C%AF7%20%AA%AB%03%C1%ACS%B9f%CD%7F~7t%E89%F7G%B9%87%D6%CEO%3E%CB%5C%FC%C8%8C%AD%BB%DE%7B%2FI%B5%B4%40%ECY%8F%DF%10%80%EF%83%EF1%1D%E8%16%8B%92%00%09%C4%20%81%0E%FD%F8%C4%E0%F8%D8e%12%20%01%10%80%C0%DA%02%AD%91%2F%02%CANt%18%E2%AAC%FB%5C%C1%EE%F50%FF%10bTb%C6h%DF%F44%89%A7j%3D%FA3G%BA%88%EBzx%CD%9A%BF%ED%0D%7B%FB%CA%2B%7B%F5%9F%3A%F5%98%DE%13%26%FC%20)'g%AA%C7%EB%D5%DB%93q%9B%D7%D06%8Cq%07%93%F0E6%10%C5%0F%A3%AB~%FB%F6%2F%17%DFq%C7%84%E3%1Ey%C4R%E0%B5%EF%E7%AC%89G%0E%D7*%B6%AD%90%89Q%E4%D9%FE%B6%1A%0C.%C1X%9Fko%83%DFI%80%04%BA%0F%01%DB%1F%81%EE3D%8E%84%04z6%01%88%A0%DF%80%C0%EF%A1%2F%EC%40%E8n%2B%3C%F8%2B%E0Y%91E%F0Q%05%D8%BD%03%05o%15%DDbT%B0m%C0%B0o%B6%23ZG%D6%82%FD%1E%ED%89%A7%EA%80%85%B9%A7%9C%92q%E4%7D%F7%FD(%A5o%DF%9F%25ddd9%09%2C%11%3EZ%20%A00%F5%A8%FCMM%AA%B9%AEN6)%DD%91%90%944%3Cs%C8%109%96'b%98U%5C%FC%7D%80%7C%DA%89%B5!%E8%9A%FD~%7F%CA%95%5B%B6%C84(%03%09%90%407%24%E0%F8%83%D8%0D%C7%CB!%91%40%8F%22%80%E9%BBl%3C%ECE%1C8y%98L%DD18%DA%E3o%B0%DE%EA%3ET%BA%C9%B0%2BLm%7FK%0C%8F%8D%DE%06%CA%CDE%7Fn%40%3BX%23%FE%DD%86%3D%ABV%FD0%AD_%BF%7B%E2SS%CD5P%D0S%01%11%7BAa%05q%15%C0%CE%EF%BE%9A%1A%D5%B8g%8Fj%A8%D8%AE%F6%AE%FBZm%FA%F8%93%EA%ED%CB%96%0D%BAz%F9%B2%9D%D1%F4%18%C2%F3%05%94%BB%C0Nd%19%02KL%CD%82%C0%BC%3C%1A%9B%2CC%02%24%10%7B%04l%7F%14co(%EC1%09%90%40%7B%02x%D8%CB%96%0Cg%D8%3D%EC%A5%BC%F1%C0%8F%FA%E0f%D3s%25Uuub%13L%D5%26%F6%11%CB%E5%ADD%08%AB%2Fl%8A%7Fg%C9%7BW%AF%BE3c%E0%C0%5B%F0%E6%A1%3E%95%17%80%C7J%BCV-%F5%F5%0AG%EA(l%22%AA%F6%AC%5C%A9%D6-%7CG%DB%B7%E6%2B%E5%F65%BB%94%CFW%E5%F6%FBK%A6o%2C%AF%8A%D4%D1%17%06%0F%F6455%89%A8m%DD%A2%A2%7D%1Da%23m%23%0E%82%C8Z%D7%3E%9F%DFI%80%04b%9F%80%ED%8Fc%EC%0F%8D%23%20%81%9EM%00Bh%24%08%2C%D3%3D4%08Vb%C8x%D0%7F%8A%87%BC%9CG%181D%B9%E6J%17%0F%A6%88%40%BB%BF%85%B0%BA-%A2%F1%EF%B0%C0%D2%BB%EE%CA%3F%E4%AA%AB%16%25df%96%04%7CM%9A%AF%BAF%D6%5C%A9%9A%B22%B5z%DE%3C%B5s%F1b%E5%C1%14%A1jl2%86%A1%7B%DF6B%24%0E%C5%A2%FB%C6H%5D%05%A7%C9(%F3%1E%A2%25w%A9%1F%D4Xj%01%D8%9F%10%C9%1E%F3I%80%04b%8F%00%05V%EC%DD3%F6%98%04%A2%22%80%87%FC%BB(x%B4%8D%93%C9%5C%0F%25%8B%DE%87D35h%BC-%F8_%94%B7%5Dse%A8%11%E9%9F%FC%B6%D4%E2%FB%98%CB7mZ%1BU%87%0FB%A1%5D_%2C%7F8)'%F7%BA%DAM%9B%B5%DD%2BW%B8%96%CD%9E%AD%FC%DB*%94%AB%A1%01%EF%0F%FA%D1%23%0C%D5p%D2%19%82%E8%23%08%A2I%D1t%15%FC%E5p%E9%8Bu%18%16%8E%3Ea%25%A2%17%97q%B0%B98%1A%9B%2CC%02%24%10%3B%04%B8%0FV%EC%DC%2B%F6%94%04%A2%26%0014%06%85E%5C%99b%A8%7D%5D%7DcL%C4%BFE%23%AEd%9F%2B%D8%92%AD%18l%C5%95%E4%19BB%C4%D5G%F8%9C%DB%95%C5%95%00%C9%1D1%F2%FA%3D%CB%97_%5C%F6%EE%3B%AE%CF%1E%FD%BB%16%D8%BCE%B9%EA%F0%D2%A0%88%2B%19E%8802%C66%11%C2%E9%BE%F60%AD%BE%A3%FCO%90.%DE.a%16v%1F%0Cq%25%E2%EB%CFV%F5%99F%02%24%10%DB%04%E8%C1%8A%ED%FB%C7%DE%93%80%25%01%08%AC%D7%F1%E0%3E%D5%10%05%ED%CB%98%8E%A6*%E4%17%40%60%C1%5D%E3%1C%8CMD%0F%17Q%60S%D2%B4)%F9s%E0%919%DF%A6%5CT%C9w%95%0E%F1%9Ez%D3%0D9I%85%85c%D2%8B%8A%0EI%EE%9B_%88%ED%16%920%AF%E6%C2%16%F3~%EC%9E%BE%BBv%F3%E6%0DU_%7D%B5%EC%EB%E7%9F_s%EE%07%1F%D4De%D8%A6%D0%DFG%8C%1C%E7mhX%84%B5V%D8%CB%CBv%C1%BE%E9%F5%931%9E%811%8A%E0t%0C%B8%0F%BF%00%B2%3F%D9a3%A0%89%BD%11%B0%87%7DK%19H%80%04%BA%0B%01%BB%1F%CB%EE2%3E%8E%83%04z%1C%01xXJ1h%99%96%13%3Dd%F97%8E%07%BBp%F9%11%1E%EA%B2%87%95c%90%E3oP%FE%F76%A6%CC%F5%5Dr%95%B6%9E%81%CD%E9%8E%06m2%9F..%C9%0C(%D7%E9Zj%EA%05%FD%A7%9E%3Aa%C8%B4%D3s3%06%0F%09%1E%87%13%17gN%B3%85%ADi%F2%E3%CD%BF%C6%DD%BB%97%E1%ED%BF%85%E5%AF%BD%F6%C4%E8%9F%FDl%A5M%13%8E%C9O%F6%2F%19%E1R%81OP%C8k%C7%0Dy%A6%C8%AA%C1%1B%88%05Wl%DE%EC%B8G%D6%CC%A2%A2x%AC%DB%927%26%F3%A4q%2B%BB%C6%BDx%01%DC.r%EC%203I%80%04b%8A%00%A7%08c%EAv%B1%B3%24%10%15%81%1B%F1%20%97%BF%ED0qexLD%A4l%F7%F9%7C%8FD%B2%26%077%1B%E2%CAr%9A%0B%F5C%BD%3A%E2%B9%EA%B0%B8%82%20%3C%14%F1%F9%80%16%D8%AE%E2%3CO%C7%E5%F4%9A%DA%EF%88%F19%F0Z)%EC%C8%AE%C9%19%84%A6%B8%B3%12(%9E%84%04%95%DC%B7%EF%C8%AC!C~%3A%EA%E6%9BW%D4n%DB%B6j%F3%5Bo%5D%F5%C2%C8%91%09%91%C6%17%9A%7F%F9%C62y%C3q%22%A2%DFt%C7Y%D4%17%A6%12%D3!%9C%9E%B6%C8o%93%04%01%26%1B%A7%FEV%EAX%F5%DD(%2C%0C%CF%06%EB%DCH%F6%98O%02%24%10%3B%04(%B0b%E7%5E%B1%A7%24%10%91%00%BCM%5E%14%BAX%04%82)JB%2B%C9C%5E%B2%E0%7D%B9%FD%EA%8A%0AY%C5%ED%18P%FCy%14%10%01%60%0A%8B%F6%E5%CDtY%FC%DD%A1iA%08%8A%22%08%AB%FF%C0%A0x%9C.%84%26L%D00%0BX%7C%F41*%B9%A8%9F%0B%1B%83*O%7C%F0%F4%1D%F1%F2X%8D%C7%ECL%A8xI%EE%D3%E7%90%C2%13N%F8%C7%99o%BF%BDi%CB%82%05W%B5%EF%B0%D3w%8Ca%19%DA%3A%D9%18%AF%60%D4%05%A4E%90%F4%B30%86%E3-%F2%DA%24aC%D1%C7%90%20%7Bh%D9%89Ta%E8%85%60%D3%17%C43%90%00%09t%0F%02%14X%DD%E3%3Er%14%24%A0%13%80%1E8%05%97%5C%3Bo%89!%18%AAq%FDG%24d%10%3F%97%A0%9C%ED%BA%2B%5D%7D%20%C0N-%DA%8B(4B%DB%83m%D9%01~%23%D2%A6I%B7uW%5B%5C%BC%CB%DB%B7%AF*%18%3B%D6%95%9C%93%2B%DE%2B%25%DE%2BYh.%E2*%D8T%A4%5E%EF%CF%F7%F6%EA%95%97%7F%DCq%FF%A8%DE%BCy%D5%E7%F7%DDW%1CmM%2C%CC_%80%F6nE%7B%821%CC%0B(v%8Cd%0D%A2%E8%A9Hv%B1%5B%BB%08%D9%7B%C4%9E%C4%F6%E5aK%1A%12%94Q%1F2%DD%DE%06%BF%93%00%09t%3D%02%14X%5D%EF%9E%B0G%24%F0m%08%5Cg%88%910%CF%8B!P%E4%01%FFwc%EA*R%3B%0FB%40%C8%83%3F%CC%96T4%C4%87(%831X(%1Fqo(%A9%03%0F%5B%1A%C4%95%2C%E6%96cvt%A1%A2%DB%81%90%0A%24%C4%AB~G%1D%A9R%F2%FB%AA%F8%F4t%85%8D%40%15%16%B4%9Be%1C%3DX%A1%031%FA%15LB%D7qL%CE!%C3%AE%BA%AAl%DB%07%1F%C8%B9%89Q%05%8C%E7N%14%7C%CD(l5~iF%C6%5E%80%F1D%B4%8B%A2%8F%C2%96%1C%8Bci%0B%E9r_%86%C0%23vXT%1Dd!%12%20%81.O%80%02%AB%CB%DF%22v%90%04%A2%23%80%07%7D6J%1E%8D%18%B6%10%5C%2C%88%1E0%AE3%22Y%84%10%92-%062!%20t!%D1%BE%BCh.%89%C8%FAm%B4%5B1%C0f%09%EAl%85%ADC%CD%BE%E8vE%BF%C5%25%A8%24%AC%B9%CA%1F3J%25%E6%E4%A88%1C%D0%2C%02K%82E%F3%ED%BBc%F7%5D%04%90%0A%B4%B4%B8%FC%8D%8D%9A%3B%3E%FE%A1%8F%FE%F8%C7%88c7%8Da%1A%F5%1C%D4w%12%8E%BA%E7%09%E5%EF%B6%EB%80%99%0E%C1V%8D%CFr%A8%B5%DE%A7%F6%C1L%83%BD%CB%DA%E7%F1%3B%09%90%40l%12%A0%C0%8A%CD%FB%C6%5E%93%80%15%81%E3%90%98%24%A2%C8%22%13%C9z%FA%A7x%D8o%B0%C8o%93%84%B2%7F%40%82%E5%3A.)(%C2%02%A1%1C%B6n%8BdK%F2%E1%99%19%85%F2%D2n*%EAJ%3F%E4%12%EC'.%01%BC%25X0i%92J%CE%CF%D7%BDWn%7C%87%F7L%17W%A6%F8%88%A6%1D)%23%E5%5B%EB%C8%F9%82M%3EU%BF%7B%97%DA%BB%E6%2Bm%F5%CB%AF%5C%3Bk%E0%60%D33%E5h%12%5E%3E%1F%DA%3F%D7%E0fUV%1F%07b%0A%C6%17%D1%8B%05%3B%BA%B83%87%1DjP%D2%10EyM%7D%BA%A4%C4%EA%FEY%B5%CF4%12%20%81.L%80%02%AB%0B%DF%1Cv%8D%04%3AH%C0%DC5%3C%DCE%12%14%02%22%3C%22zp%E0%09%BB%10%ED%A6%20Z%3E%E8aC%02f%EF%DCgF%D3%3F%F1%5CA%3C%2C%15%01%81%D8%D6%A6%EE%BD%8AW%09yy%AA%EF%A8%91*%B1W%2F%0D%FB%5D%89%F7J%DA%D0%C5%88D%F9%0C%8F%92%1EqBsX%B3za%04%E3%12%14Y(%E7onV%BE%DAj%D5%B0u%ABk%F5%AB%AF%A9%B8%EAjM%B5%F8N%C3%18%C5%9B%141%40%40%BE%8EB%8BL%FBV%15%8CqE%14%9A%F0%F4%BD%8F%FA%7B%C5%96%8D%3Da3%14%8B%E2%8B%AD%DAa%1A%09%90%40l%11%A0%C0%8A%AD%FB%C5%DE%92%80%25%01%08%86D%3C%B4'%19%FA%25L%18%99%0Ft%8F%C7%23o%05F%0A%BFE%01K%EF%15%EC%98u%E7B%7CD%3C%B8Y%D6%5C%A1%CEr%B1%87%18%D6%2FI%D20%15%D8g%F4(M%F7%5E%A5%A5)7%B6%5D%0847%BBj7mz%A3f%D3%A6%1F%AD%9C1c%F4%9F%DC%EE%24%F4%1D%BA%CB%E3r%23%BE%F7%A3%1F%15lz%E3%8D3%EAw%EE%FC%ABl%3A%0AEenY%DF%DAA%11b~%1CyS%BFc%97%DA%FA%F92U%B3%FA%2B%97jj2U%D8y%60v%7B%24%10%92%8F%FE%7F%DF%E8%BB%95p%95%7C%19W6%C6zb%14%F6f%8A%AD0%A1%19lG%B7%8F%BC%A8%84k%14m%B1%08%09%90%C0A%24%40%81u%10%E1%B3i%12%E8D%02%C5x0%F7%B6%B2g%88%22%11%01%8BpP1%14%86%7D%80%E8%18%02%3BC%AD%04%80%D4%12%01'%82%02%E1%06%7B%2B%FBsP%F6C%7C3%A7%05%DBV%11%B1%26%EB%AC23U%1Fx%AF%92%B2%B1%84L%0B%D4T%AD%5E%FD%3Fw%8C%19%E3M%2F.%FE%DF%B4~%FD%DC%C3%AF%BB%EE%A6%5B4%EDI%D8%FA%0Cq%05%E2%5BG%3F%F8%E0%5D%FDN%3A%E9%84%E4%BC%BC%8F%93rr%86%AD%9B3gbMy%F9%9B%BA%D0%92%01%8B%C7%AB%B9Yk%AA%D6%BDWj%C3%9Bo%2Bw%03%96S%05Z%F4%A1!%8A%98%F9%15D%D1%D4H%E3%80%E7i%23%CA%BF%144%BB_a%9A%F5%C4%1E%824%FB%F3H%B6P%C6%F4%9C%85%895%E9%98%D1%2F%D9%26%82%81%04H%20%C6%09P%60%C5%F8%0Dd%F7I%40%08%E0%C1%7D%BAA%C2%EA%C1%ADk%0E%84h%A6%C5%AE1%CAZ%81%15%3B%A2%AE%E6%C3%7B%25%BB%93%3B%06%88%B5%5BQ%60%B8!%40%C2%CB%8AX%C3%F4%60%E6%E0AZ%E6%80%01.%88%A1%3F%D76%F9%86g%1FvX%C3%EFV%ADz%0E%15d%23T%D9%BA%E0x%C4%C9%88%B2C%7D%3F%C4%91%88%C7!%8A%A7%E7%16%C49%83.%B8%E0%22%08%B2_%AD%9F3g%1Cvu%DF%22%02%AB%05%DE%AB%C6%9D%3B%B5%0D%8B%DEW%CD%10Y%AA%D9%87%A2z%10E%24%11N%AE%C0%D3%E8%A7L%87%3A%06%0C%5B%DA%D1%15%90UA%23%FD%24%D8%8A%B3%CA7%D3%20%D6d%A7x%9F%60%B4*%17%C4%EB%1A%8F%1D%E0e%3F3%06%12%20%81%18%26%40%81%15%C37%8F%5D'%01%93%00%D6C%1D%85%CF%A2%A2%C2%1E%DC%22%98d%C18%C2%ABQ%10%BB%D2%AE%8C!%0A%C4%FE%EF%ED%CA%98%E9%B2%89(%3E%CB%14%9Ch%B2%F0%E2%E2d%C2f%F3%81%C4D%ADh%DC%B8j%7FS%D3%F8%DCQ%A3%3E%CC-(%F8%1D%0A_%8Bx%02%E2a%A8%9B%8F%98%82(S%A0%01D%5D%9C%20%26%23%CA%5B%8E%25(7%1E%F1%1C%C4%3F%0C%BC%E0%82)%F1YY'%EE%5D%BD%FA%F1%E6%9A%1A%17%CE%2BT%9B%3F%FEXs5%E1%B8E%BD%1Fm%F0%88.%CABb%C4ui%D8%80T%8E%1E%FA%10%EDY%0C%069A%F62%D8K%F4o%0E%01m%CA%BA.%CB%20%FA%0D6z%E1~%E5%5B%16%60%22%09%90%40%CC%10%A0%C0%8A%99%5B%C5%8E%92%805%81gKK%DD%F0%C4%8C%B2%F3%AE%A0%96%08%92F%88%04%C7%B7%071%5D%26%82%26%13%E5mE%04%F2%D7%C3%CE%C7%D6%3D%D9%9F%8A%BE%C8%19%87%D2%25%3D%84%97G%12%16%B2%A7%94%14%EF%1At%DA%D4%D1%85%C7%9F%20%5B7%DC%8Cr%B25B1%A2%1CW%23%87P%CBQ3%B2Q%A7%ACl7%FB%25WI%93%7D%A5Dp%D5!%8A%08%93-*%AE%8D%8B%8B%FBI%C6%D0%A1O%D4%94%95%DF%BEq%E9R%97%A9%03%DE%5D%00%00%20%00IDAT%DA%5B%A94%BF%3FXW%F4%91%11%8DNI%FA%F4Y%FD%FA%1D%8Ak%A4%F0%00%0AX%8CE%AF%A6%A7c%0C%D1%EC%C6%3E%DF%AE!%8C%C1%1C%E31ve%98N%02%24%10%1B%04(%B0b%E3%3E%B1%97%24%60K%00g%0A%26%E3%C1%DE%2F%E4%E1%DC%A6%2C%F2%E4%A1%BD%C0%D6%80%91%01%916U%B4%90%B5%20%0Az%C7%90%17q%9A%11%D3d%22V%F4%1D%DA%ED%DA%C4%04%99%A6%12%93%AA%FB_r%F1%91I%C5%FDe%0A%F0%D7%E8%FF%08D%11R%B2%F7%94m%5D%1B%9B%22%B8%F6%A1~%16%FAx%01D%D6%AD%7D%8E%9E%FC%DA%CEM%5B%EE%81%92s%E1%CC%9D%E0%AE%F0%B2%E6K%A2%3B%18%B1b%1E%9B%9CJZ%FC%9Fl%EC%B6%26%83%8Fl%EF%E0%B4%86M%FA%7CR%24%3B%E8%E3%3Bve%84%BD%DC%03%049%13%91%81%04H%20%86%09P%60%C5%F0%CDc%D7I%40%08%60%3Ai%B8%5Cm%84%91L9%C9%13%FB%83H%B4P%FF4%A3%8C%95%B81%3D7%B3%22%D9A%FE%AF%EC%FA%A3%8B%40%89%106%E9%C3%86%9F%3E%F6%DCsG%A0%DD%3B!%5E2%90%DC%2C%02%CB%2C%F2%0D%AE%E2%A9%F3%C1%96%5Ce%DA%F0%CEs%9Fx%EC%C1%E4C%86%BE%934x%B0%2Bi%E8%10%958%24%18%93%06%0FU%89%83%8D%CFC%06kIC%07%9F%3E%F7%A6%9B%8B%9D%C6%86%7D%B1j%90%BF%00%B6%AD%F8%B4%F2%87'%F0%08'%3B%F0%00%AEq%CA7%EC%1F%E2T%86y%24%40%02%5D%9F%80%E3%82%CC%AE%DF%7D%F6%90%04H%00%04dz0%12%08Y%5C%1D)%C86%0F%22%1E%C2%8C%19%0F%FDM%C8_%EFd%04%E2B%D6E%9DmgGD%A0%AEO%E2%13%FE%7C%DA%D33e%1D%D5%1F%8C4K%D1%E2%D4%96C%9E_l%22%7F8%C4%E7%EF%A6%DE%7F%DF%D5%BB%96-%5B%11%F07%7B%B1B_%06'%3Br!%5B%D6%81%E9%83E%9Ftk7%A8%BF%DE%FB%3F%0Ev%25%EB_%88%A7%3A%95%C1%98%26!%3F%D24%AA%1Cp%AD%0B%E3%F6%C1%E01%B4%7D%3A%BF%93%00%09%C4%16%01%0A%AC%D8%BA_%EC-%09%84%11%C0%03y%A8%88%96%A0%A6%08%CB%D6%13%90%BF%CC%3A'%98%8Ai%BD%C1%F8%84%B92%DB%20%8Ad%09%DE%1E%945Q%B6%01%ED%C8%DB%8C%96o%C0%19%22M%A6%E7j%CE_%F6%F93%B2V%0Ae%FB%22%DD%D2%A6h1%E4%CB%AA%EFDx%A5D4%89%C7%5D%04Z%00%83m6%F2-%FB%22mIy%E9Ob%5E%DE%7F%93%F2%F2nO%EE%DB%E7%0F%FA%FA%2B%EB%A0%F9%AA%AB%CF%9AU%D8%EF%96%CB%B6l%92%B5%5D%96%016%C5%83%25%3C%C36M5%D3p%8D8%BD%07%3B%9F%A3%9C%AC%3B%B3%13%B3%B9%10%ABq%E0m%DB%17%CB%0E2%91%04H%A0%CB%10%E0%14a%97%B9%15%EC%08%09%7C3%02xP%CB%1B%7B%B6%CAA%ACb%7B%80%3DN%D6%F1%9C%B7%3DdX%84%83Qw%A1%93%0D%23%EF%02%E9KH%9D%D6*A1%01%9F%91%DBs%7BBB%FC%04%94%99%8A(%8B%D9%F5YC%AB%E8oiI%AA%AB%A9I%F5%C4%C5e%20%A6a%FB%F8T%C4t%14%CE%0E%F8%FD%19%88%22%A2%2C%EB%EA%BB%BEk%9A%07%D7%AB2%87%0F%FFO%9C7%B1%3E1%3BW3%A2%C254%BA2%06%0E%1A8%F4%EA%1F%14%3B%8D%11c%D8%8E%FC%ADV%C2%C8L%C3U%A6'%1D%03%FA%B4%0A%05%C2%C4%95T%0A%B1-%F7%95%81%04H%20F%09P%60%C5%E8%8Dc%B7I%20%84%40%A1%D5%03_%F2E%7C%20%C8%01%CB%8E%01%0F%FC%12%BB%02!%B6%1D%A7%BD%E0q%11%CF%D5%04%94%B7%5C%0F%86%BE%A03.%F5%BD%C5%9F.D%7BG%E3k%3A%A2%ED%9A%2B%88%A7L%18J%91%11%FC%F9%EE%BB%D5%E2%CF%3ES%10%5C%C1n%8A%E3%C7%E5%C2%CAu%D5%0B%E5%12%ECD%16%D2e%F1%FB(%C4%89%CD%F5%F5%8F%B9%13%E2%5D%EE%F88%89*%2Cb%F1%7B%C1q%C7%99%FB%89Y%E2%C0F%AD%F2fcyp%2C%E1E%8C~%F4%09%CFi%9B%02F%8ES%ADF%E9%E2Hv%98O%02%24%D0u%09P%60u%DD%7B%C3%9E%91%40%B4%04l%1F%E8%22v%10%CA%23%19B9%D9%BD%DD%A9%98(%9B%1DN%05%20.r%90%9F%8BhiH%17j%1E%CF%1Bq))%13%20%B0%246%19%5E%A60%0F%94!%AE%E2E%B0%C8%1E%5E%8B%17%2FV%0F%3F%FC%B0%9A7o%9E%AA%DE%B7Oaz1XG%3A%E4r%A5%A3%7C%9C%9D%C8B%1B%5E%E4M%AC%DB%B6m!*%E9S%A9VQDS%E6%A0A%B2%9FX%A4%F0%95%C3%18%A5%AE%07S%AE%05NF%D0%D4F%A7%7C%23%CF%D1F%14%F5Y%84%04H%E0%20%12%E0%1A%AC%83%08%9FM%93%40'%11%C0%193%8E%A1%C217%98%D9_%04%8A%95%C8%92t%84%3D%10%3A%95NvPn%8CQ_*%84%89%2C%DD%8E%A6%FE%83%BC!%F8%5C%88k%9D%95%3Dl%AF%9E%84i%C0V%C1%24ez%E30%E8%B7%17%2CP%0D%F5%F5%BA%C0%1A7~%BC%1A2t%A8j%81GKD%1A%82%BC%85h9%0D%8At%1F%FA5%3A%7B%D4%A8%97%9Akk%5B%12%D2%D2%C2~%F7%8C1%BA%B0_%96%ACE%8B%14D%609%05%0F%DA%EB%8B%02%B6%9EC%E4G%BC'%E8S%9ES%23%CC%23%01%12%E8%DA%04%E8%C1%EA%DA%F7%87%BD%23%81h%08%24%3B%15%B2%13%1E%ED%EA%F4%B5%12WR%C6H%AF%C6%F4X%ADS%3B(gn-%10%26%AE%CCz%C5%E7%7Fo%0D%FA%23%5E.%FB%DF%1E%97%2Bl%3C%F1%F1%F1*%1F%87Ao%D9%B2E%3D%FD%CC3j%CE%9C9j%D7%8E%1D%B2%81%A8%AE%E4%20%C8%5C%10f%896%FD%13%056%10%ED%164UU-j_%C6%10Wz%B2'%D1%DB%FF~%97Jh_%26%F4%3B%CAo%B4c%15R%CEQ%F4B%14Z%8A%C1v%ED%CA.%F3%0C%24%40%021J%C0%FEG.F%07%C4n%93%00%09%EC'%20%E2%01%9E'%D9%BF)R%90%ED%15l%CB%40P%D4%DBf%EE%CF%10%AF%94M%80mO%9C%1Aq%F3%CD%0D%10%17%E2m%B2%5C%DC.S%7D0%A0o%E5%60F(%3C%15%07%81%95%98%98%A8%B2q%20tFz%BA%FA%7C%E9R%F5%AB_%FFZ%AD%5B%B7N%D5%D5%D6*%3F%84%16%82L%05%86M7%22M%CE%1CL%40%99%9C%B8%E4%E40%EF%93%A9%06%B5%80_y%92%93%D2%13%92%92%9C%DE%A6%14%C1%B9%DBf%90%AD%C9h2%DD%A9%0C%F6%D4%92%B5%5C%B6%01m%C8%5B%8A%11%CFH%B45%C0%0C%12%20%81%83N%80%02%EB%A0%DF%02v%80%04%0E%1C%01%F1%B4%E0a%2F%3B%A3G%0Av%DE%1F%BD%1El8%ED%60n%DAN%92%A2%D6%0Da%DD%13%0EvN%CA%C8%C8%40%BEx%A8%EC%16%B7%B7YK%25k%A6%24x%B0%00%3D%D1%EBUIII*55Ueee%A9F%1C%E6%7C%C7%1Dw%A8%F7%DE%7F_%9F6D%10qfiW%D2%11S%E2%D3%D2%AAt%83F%10%EBz%0Bh%07%3BA(%17%DAI-(%88%24%B0%9AD%C8E%08%96%5BUD%A8%13%9A%ED2%A6%3E%3BP%85EI%80%04%BA%12%81%B0%B5%08%5D%A9s%EC%0B%09%90%40%A7%10%88%A8%06%D0%0A%B4%98%ED%CC%9Et%22*%1Bb'%BC%C7%F0*%C9%8C%20%04%12%84%89%88%17%5B%F1%60%8A%9DP%1B%92%26%02K%A6%09%13%12%12tO%96%2C%7C%97%85%EE%F5X%93%F5%E4%93O%AA%AA%CAJu%FC%F1%C7%BB%F2z%F7%F6%B6%04%02%3E%EB~%A8x%8CRwu%B5%06C(%F9%03%FB%B7%9B%F2%24%26Z%8C!%B4%8A%BD%BA%0A%11%5E%DF%FA%1F%AF%18%A3c%3F%DA%8C%83_H%80%04%BA%1C%01%0A%AC.wK%D8!%12%E8%3C%02%F2%C0%87p%8A%F8w%8Er-2-%85%96%ED%1E%EA%D1%D8%90%CD%40%C3%3B%8F%AD%AF%5C%D8%16!.W%5E2T%D0%3F%01CG%85k6%99%CB%83z%0A%B3%E1%86%5D%11U%22%B4%24%CAg%99%16%14%C1u%F1%19g%A8%11%87%1D%A6%D2RS1%C3%E8o%C1X%C2%3A!i%A8%D3%12hjJ%82Rkc_%A6%06%95~%04%22%AA%A1%9D%FA%AD%15%FA%AAy%87%20%8B%D8-%B3%0D%8F%A10%B7%DC%3C%D5%B2%92E%22%FA%2Bp%C2%01Y%94e%12%09%90%40%D7%24%10%F1G%B3kv%9B%BD%22%01%12%88%86%80%F1%C0%8F%B8%96%07%E5j%F1L%CF%B3%13%0EhK%A6%FF%1C%03%04%CC%EE%10%0F%8EQ6%A8%D94L%0F%F69%FCpU%BFcG%5CBvv%23%DA%09%1E%99%D3%CE%22J7%9B%D3%82%ADY%ED%D6U%E1pk%25%82%0B%DE*u%F2%C9'%AB%E1%C3%87%2B%2F%BCZ-~%BF%CF%1F%9CW%0BS%3FhN6%1C%AD%0BTW%0FH%C0%14%A3%04%B3%AF%C1%8D%E1%83%A2%AE%A5%BE%3E%E0k%A8k%EB%E5%0A%1Fu%9A%D4u%60%255%1C%D7%AC%3D%96%9F%2F%08%C2-%EFO%91%7C%EE%E2%EED%88y%24%D0%C5%09%84%FFS%B1%8Bw%98%DD%23%01%12%08%23%10%C9%E3%92%19V%23%3C!%D2%C2%EDT%EC%ED%E4%F8%0F2%88%8E%0Daf%83%F3%7BJ%83%A8%C9%1F%3DJ%B5TWg%A3%5C5%A2%A5-%D1%5DP%3E%BA%F7GD%8C.d%10%B1%B0J%04%94%AA%A9%A9%C1L%A3W%1D%3Ej%94%3A%E1%84%13%D4%A4%A3%8ER%89%C9%C9z%1E%DCW%F5(o%A9Z%90.%EB%A6%F6%A2%3BcB%FB(%E2J%DA0%9DE%BE%9A%9Am%B5%0D%8D%91%BCO%F9a%E3%0COh%B3%D6%AB%7D6%3CoY%C1v%DB%E7%EC%FF%0EAXm%9F%CB%1C%12%20%81%AEN%C0%F2G%AE%ABw%9A%FD%23%01%12%D8O%00%A2%A4%12%0F%EBl%2B%8F%88%F1%10%8Ff%3F%A5%CD%A8%EFt%C4K%26%F2E%A89%09%B1%F0%F3%0Ee%91%3D%BCW%BD%06%0FR)%05%F9*!)q%24l%ECD4%A7%F2%C2%A6%C1%D0%E7%1A%A8%A4%5E%E6x%E4%80f%D9%C1%BD%BE%AEN%E5%E6%E6%AA%B1c%C7%AA)S%A6%A8%DE%7D%FA%A8Z%BCA%A8%1B%08%04%1A%E1R%D2%85%A6%85p%81%C3%CB%B5%C5%D7%D8%B8%2B3%2F%AF%14%F9A%B7%9AT%F3%C3I%84o%C1I%CB%80%16h%F6%AD%C3i%CF%91%3CX%03%A5%1D%87%20M8n%CA%8A%BA%11%EF%89x%04%1D%DA%60%16%09%90%40%17'%40%0FV%17%BFA%EC%1E%09D%22%80%87%F9.%2Bq%25%F5%8Ct%87%ED%13Z%AD%EBG%B7X%88%13%3D%19Q%8E%B5q%DC%DB%09m%ADi%B5%A6%7F%08%EA%98%00%A6%EF%0A%C6%8FUI%10G%9E%A4%E4%EFC8%C8%5EX%B2%D1%A6%E5%DBz%B0%23o%02%B6%F1%DE446%AA4l%CFp%F6%D9g%AB%F3%CE%3BOe%F5%EA%A5%24%CD%10Wx%FD%CF%E5%B4G%97%ECk%F5%99%BB%AEn%90%1B%0B%E3%25%08%17%F1%5E%05p%92%0E%FE%0B%3Bh%12%3B%23%F8%9B%9BW%E8%05%9C%C3%A1%CE%D9J%A6%F6l7%19%95%BA%18_4%F7%24%E2f%A4%11%FA%C1l%12%20%81%83H%80%02%EB%20%C2g%D3%24%D0I%04%B69%D8%11%0DR%EA%90%AFg%E1%81%FF%B5%88%2B%1B%A1%A6O%BB!%7F%90%93%9DK%CB%CBe%BF-%F1b%05%BDR2%5B%87E%E8%C9%D8%204%F7%90C%947%23SK%CE%C9%CD%A9%DD%B0A%B6%8DX%8E%D8v%B5y%88q%F4%C3%87%F6d%E7x%99'Tu%F0%5E%FD%DF%FF%FD%9F%9Av%E6%99%FABt%AC%94%D7Kc%A3Q%F1%5C9%EE0%0F%5BnL%B7%BD%87%1F%BB3%0C%D7Up%9F-%D8pinD%2C%C2%87%9B%0CK%E8%D5%EEO%3E%9B%17%D2%0D%BB%8F%03%F4~Y%04%F4Y%D2%9B.%DB%B8%D1q%EF1%F4i%80%0Dk%E1%AC%DB%C6e%B3E%13L%22%01%12%88%11%02%14X1r%A3%D8M%12p%20%B0%D1%7C(%5B%94%11q%14%CD%02u%DD%FBd%3C%DB-%CC%60%EBu%B7%FBx%CB%8C%B6%89%0Ba%23%B8%0EJ%BCDxc%AF%EF%84q*1'G%C5%A5%A6%E2%2CB%B7JJK%3B%1Fe%A4%9C%08%AD6%9B%8AJ%FBfD%9E%BCq%B8%17%C7%E1%04n%FB%DD%EF%B4%FE%FD%FAi%FA%A6%A2--~%11V%B8V%8A%E7*%B4N%FB%CFb%1F6%96%D6o%D8P%99ZX8A%8C%1B%F3%88%B0%0E%17Z%00o%25b9%98%3B%E0%D1%B4%BA%26%FF%D7%B3_%FC%D0i%8C8%D0Z%5E%85%2C%858%B2%5C%EB%25%E9hb%A5%93%0D%23o%10%CAY%8A%B4%10%DB%D1%1C%08%1DES%2CB%02%24p0%08P%60%1D%0C%EAl%93%04%3A%97%C0F%98%B3%7C%E0%9B%0Fq%2CP%1F%E6%D4%24%B67%F8%5C%F2E%1F%D8%94%13S%13m%F2Z%93Q%E6%09%FD%8BX%C1%DA%2Bwv%8E*%C4%DB%83%5E%EC%C0%EE%817K%EC%A7%F5%EBwb%7DY%99%2C%02%7F%13%E5%93EgXE%08%23%11%2B%1A6%FF%DC%97%9E%95U%85%E9%BD%BDxKp7%04R%25%CC%D7%C2%98%E5n%F0%A6-%BD%1B%9A%96%84%F8Xr%AF%5E7K%3A%16%C2cA%97_%B5%F8Zd%11%98j%86%DC%F2%05%FCZ%0B%AEuU%95%0B%A6%BD%FA%1F%7D%C7R%BB%00%1BC%91g%BB)%AB%B4%811%3A%8A4%A3_%23%EDD%9A%D1v%D84%A9%5D%9F%98N%02%24%D05%09P%60u%CD%FB%C2%5E%91%40%D4%04%F0%A0%FEB%0A%8B%18i_)%E4!%3E%AE%7D%5E%E8w%1C%DD%22%9E%A0%0ADK%A1%26v%10%C6%CC%2C*%EA%E5d%E7%F2M%9B%C4%7B%F3%25%ACh%F0%5Ei%05GL%D0%A7%08%13%D2%D2%95%AC%7F%D2%CF%0C%84%C8J%EF%DB%F7%8Fh%EB9%C42%D8u%7C%D9%06%F9xIP%DF%DF*l%7C%0E%7D%91%DF6Y%E35%A7%A9%BC%3C%C7%9B%95u%04%0Ez%D6%10U%13%DEDl%AC%DD%A7%1A%EB%F6%A9%A6%BAj%E5%AB%DB%E7%F25%D4%BAv-%5D%F2%90%83%3D3%EB%3C%F9%60%D5%173%0D%FD%FD4%0A%3Br%3F%9C%C6%B3%06%2C%9D%F2%A3h%82EH%80%04%0E%26%01%C7%1F%B6%83%D91%B6M%02%24%10%1D%01%3C%D8%97HIQ%40V5%90%2C%CF%FE%09%C8%9Be%95o%A6%A1%DC%EB%F8%FC%03%D11V%A6%90%1E%8FM%3E%8FA%99%7F%3B%DAQ%EA%3E%BC9%F8%0F%0F%16%B5%F7%1F%3F%5E%25%E5%E5%E1%10%E5D%11Wz5y%A5%2F9%2F%AFh%D7%CA%95%E7y%F2%F3g%C0%E6%FF%229%0DQ%3CR%22*%CCq%C8y%7C%BA%C8%90%FE%98%02%26%E4%BB%3E%BDh%E4%85%D6%91%DF5%F1%00-i%D9%BB%E7El.%FA%E2%BE5_%E9%96est%AD9%B8%0BC%B0)%98%0D.%C6%DF%BA%F0%B2%2B_%13%DB%11%C2%89%C8%97~%D9%B1%96~.p%B2%F1tII%3C%BCs%B6%5Bg%18%E3%5C%EDd%83y%24%40%02%5D%9F%00%05V%D7%BFG%EC!%098%12%80%40%A9%80%87GT%83%DD%A2q%11%03%C7%3A%1A%09f%CE%C7%E5%076%DAA%9F%DEC%F8%01%CA8%0A%2C%A5y%9E%D2%12%12%EE%E8s%C4%84%BC%D4~E%0A%E7%FF%B9%DC%B2%7B%3A4%89)%94D%DC%E4%0C%1F~%E9%C6E%8Bv%24%0D%1A4%1B%C7%DE%9C%89q%E4%20%5D%D6L%85yn%8C%B6%A5%972%16%0D%EB%C1%A4%2F%D2!%5D%EB%88%3D%09H%97%B3%0C%7D%E0%B1lOE%C5s%1Bg%CD%9A%A9%B5%B4%24%40Ca%2Bx%2C%8E%AF%AAR%1A6*%95%80%5D%E3%E5%E2%92kBV%D6%5D%3F%AC%ADr%DC%D8%13%EB%AF%86%C0%F60%2B%3Ezg%82%9D%DC%82%05%EE%BB%F4%06l%02%C6g%AEe%0B%15%93%A1%A5e%8C%D1%BC%CDh%D3%02%93I%80%04%BA%02%01%0A%AC%AEp%17%D8%07%12%F8%16%04%BE%BFaC3%D6X%7D%8Eg%FC8%5DmX%87C%AC%93%F7%A7B%E4%FC%1B%0B%CAuO%91%8D%1D%B1%3D%F5%C9~%FD20%7De%BBV%E9%D2M%1B%7CO%9F%FB%BD_%15%8D%19%FD%0F%2F%16%B7%C7c%23P%5D%5C%C1%83%25B%C8%10%22Z%B3%CF%A7%F5%19%3B%F6%7F%BE~%F7%DD%07%E3%FB%F7%FFOzz%FA%A98o%B0%2F%F2%E3%20B%14%FA%22%BB%AF%8B%92%D2%85YP%BF%04%BB%26%9F%D1%17%F9%A2%AB%249%3EG%3ECX5655-%2B%FB%F8%E3%7F%97%FF%FA7w%B7%F8%5B%B2%F1%9E%A0Kv~%97%E0j%0A%3D%F7%1A%FA%2C8K%B7%D5%BDu%EB%8C%FD%24%AC%3F%A1%1F7H%3F%AC%F8%18c%92%8A%2FX%D7%DE%9F%8A%FA%C7C%08%EA%DDq(%FB%8EC%1E%B3H%80%04b%80%00%D7%60%C5%C0Mb%17I%20%0A%022M%E8%F4%C0V%F0%C0%9C%EAd%E7%92%F5%EBe%8AnQ%24%3B%10%13%3Fr%B2%23y%D3%FF5%E7%B1%CC%01%25_%26%A4%A7kP%3F%BA%40%92%60%5EE%C3%89%88jnn%D6z%8F%1A%F5%A3%86%ED%DB'%7D%FC%DE%7B%2FTVVn%C0Q8%01%A4%BB%11%E3%F09%01W%2FDSbccc%92q%95%CF%89%3E_%93%17y%F1%10U%1ED%CC%046%D6m%DE%BCy%FE%CB7%DE%B8%7C%D5%CF~v_%7D%7D%5D6%BCU%D8%F0%01%1E%AB%A6%26%E5%F25%C9%FC%A4%B8%B9%24%06W%9BI%870%9E%E90%E04%26%88%CA8%14%BD%CAJ%5C%19%F5%CC%A9%CC%D9Nv%0C%06g%8Ah%B4%09z%06%F2%97%DA%E43%99%04H%20F%08%D0%83%15%237%8A%DD%24%01'%02x%20%CF%83%00%B8.B%99i%C8w%DC%E7%09%9E%95G%60%EB('!%81%BC%9F%C1%CE%1F%9C%DA%92%BC%1D%9F-%99%9A9dh%99%DB%E3%11%17%94%24%B5%11%80%86%D7G%CEw%D6%D2%0A%0B'%F6%D6%B41%FF%7C%EC%B1%D9%89yyK%8E%3C%F2%C8%13%FB%F4%E9S(%9E)%A8%0D%993%D4%A7%03%8D6u%CF%95x%81%10%5D%10%5BM%EB%D6%AD%5B%BA%E0%B9g%3F%8E%7B%FB%ED%D33%5D%EE%11x%CDOK%90%05WF%AB%A6%B0%0B%E9%B3i%EBEL%E9%BD%12%92n%F9%11%F5%AFA%FBI%16v%CC%F2bo%0F%F6%02%5Bli%C0H%84%C8%95%0D%5B%87%E0%AB%DD%F4%A0%94%5C%01%0F!%8F%C9q%02%C9%3C%12%88%01%02%14X1p%93%D8E%12%88%82%C0%07F%19%AB%07%B7%99v!%CA%5C%EFd%0B%02%E1YL7%3E%23%E2%C7%AA%9C%91%9E%852%3F%840y%D4%AA%8C%996%E2%FA%EB%CA%B7%1Ev%D8%0D%7D%8E%9C%F4%90%B8dPW%EF%07%3E%EA%9E%2C%11H%10P%D8%85%C1%A30%3D%A9R%B2%B2%E2'%9Er%CA%F4%8A%8D%1B%7D%FF%9E%3D%7BqYY%D9%F2%A1%23F%E4%96%96%96%F6NNI%F1%F6%EA%D5%2BY%A6%FA%20%A8%1A%EB%1B%EA%1B*%F7VV%AE%5C%B1b%FD%CEO%3FM%C8%DE%BBwdz%5D%DD%F1IhA%D6%B1%8B%A0%936l%86%A1O%F3%A1%2F%15%E8%C3%C5Nc%08%C9%BB%03%9F%AD%D8J%111'%BC%1E%88d%0B%E5%CE%912v%7C%25%0Be%22n%F3%10%A9%1D%E6%93%00%09%1C%7C%02%96%3F%A2%07%BF%5B%EC%01%09%90%40G%09%40%F4%2C%C1%83%7B%14%EA%85%FD%5D%1B%82B%D2%C7A%189zY%60g%06%EC%FC%D0h%BF%BD-%C3%94%AA%83%1Dy%F3%2Fb%D8%B3j%D5%8C%ACa%C3%AE%D5%17%60I%E7Di%E1%A3%CC%CAa%0AP%04%93jhh%90s%05%B5%7D%FB%F6%B90M%A8_w%EE%DC%A9%1Ajj%02%D5%7B%F7nk%F0%F9%AA%B0%C0%AA%B1%A9%B22P%BBy%8B%C7%D3%D0%90%1AWW%9B%E7%DA%B7%2F%2B%016%92!%D6%121%ED%97%0C%C1%E6%85%B0J%40%8CG%C4%BC%9E%92u%10%E6%1A%2Ci%DF%18%40%0B%BAQ%00A%E9%B8%20%5D%CA%83%C7Oq%B9%D7N%AC%196E0%26O%2F%2Bk%90%EFv%01%B6%16%22%EFX%3B%5B%06%A2)%60%FB%B6%9D%0D%A6%93%00%09%C4%06%01z%B0b%E3%3E%B1%97%24%10%0D%81%F9x%40%8F%B6yx%9BBi%3A%0C9%0A%2C%D4%BF%1Dv%AE%B5%B3%23%E9%C8O%85X%B8%13B%E0%97%91%3A%96%7D%E8%A1%D7%ED%2B%2B%EB%97%5E%5C%7C%9A%88%1B%09%B0!A_%9C%8E%85%ED%BA%F6%0A%F8%F5%8DEu%CF%967%D1%AB%92%92%92T%7D%7D%BD%DBWPP%D8%B8o_a%5DE%85%DA%F4%C5%0A%D5%B2v%AD%F2%E0%90f%11O%10RZ%22%BC_%5EL%07BP%B9%DA%0B%2B%19t%A8B%94%B6%25%09aL4%E2%0ASz%B2Q%E9%DD%D2W%B3%DF%ED%C6%AB%8BF%E4%BD%1CI%5Ca%7B%86tL%87%1E%2B%C5%DBu%CB4)%5C%EAQ%C6%F1%FE%B4k%9F_I%80%04%BA(%01.r%EF%A27%86%DD%22%81%8E%12%C0%C3%F99%BB%3A%22%10%10%E5%01~%B9%5D%193%1D%C2C%CE6%94-%1BD%08%E8%02%A2%7D%10%7B%08%B7%60%F1w~%FB%3C%AB%EF%19%25%25S%AB%D6%AD%7B%11%F5Z%F5%8E%7C4%05%96%D7%EBU%C9)%C9*%23%23Ceee%B9r%B0%03%7C%9F%DE%BDU~%DF%BE%AA%2F%F6%D3%CAMKS%A9%D8%BF%CA%B3c%87%CA%C2%1C%60%16%84Y%26b%06%3CV%A9%10W%C9%B0%85%05RJ%BCW%E2%B9%92%1DF%C5ke4f%8A%20%B9%8A%E7j%04%C6%18%D56%08%10N%B3PG%FE!j%FBf%25%CA%E0%05I%F7%CF%AD%C6%1D%9A%06%E1t%99q%1F%DA%7B%05u%F1%26v%10%179%BD%A1%19%A9%0D%E6%93%00%09t%1D%02%14X%5D%E7%5E%B0'%24%F0%AD%08%E0%01%FE%25%1E%E0%EB%60%C4R%14!%5D%1E%E0%E9%F0%CA%E8%EB%80%22%84%1B%E5%81oWFW%03%22%D8%DCny%EB0%AA%905h%D0%F7v.Yr%07%D4%84%F4C%EA%EB%DE*Y%7F%A5%0B%2Cl%E7%90%9A%9A%AA233U%0E%B6w%90%D8%3B'We%A7%A7%ABL%D9%C3j%C3%06%95%857%013Q%2F%03u%D2!%B0R%11S%60C%A6%08%93%10%C5%83%25%9E-%8F%D8F%AF0%00S%5CI%1F%2B%D0%A6L%0BF%25%AE%C0%E9t%D4%F9%9E%A1%09%C3X%60%08%E6t%E3%7C%D8%DC%10%05%049%AE%C7R%B4%A2%0D%D3%FE%CC(%EC%B0%08%09%90%40%0C%10%A0%C0%8A%81%9B%C4.%92%404%04%E4h%15%849(%ABO%B5Y%04Sl%FC%C2%22%AFM%12%A6%FED%A8%BDdc'%B8H%5B%17%60%AE%92'%C7%8C%7B8%92%3D3%BF%F7%D8%B1%BF%DE%BAp%E1%E9MUUU%86%A6%90MCu%91%95%88%DD%DEM%91%85%3D%B1T%AF%AC%5E*%0BWx%A9T%C2%BE%7D%CA%0F%81%95%81q%A5%A1%3C%BCV%ADQ%84%15%A6%08%F7%AF%BBBc%F8a%D3B%D6%5D%89xy%11%ED%14G3-(%7D%85g.%17c%7FYD%A4%DD%D8%24%0FA%B4%91%B9%5E%CD%AE%A8%D8%3B%0A%99%C5%86%90%B2%12k%D2N%0D%E2%1B%B6F%98A%02%24%10S%04(%B0b%EAv%B1%B3%24%E0L%00%0F%F0Y%22%8Al%84%81%3C%D8%E5A%3E%1E%EB%A7%0Ew%B6%84%82%C1%5D%DB%F5%3A%12%DA%96%97%AF%C8JN%D62%87%0C%BEn%D3%BCy%17E%B2g%E6%17M%99%F2%DA%A2%1Bo%2C%DA%FB%E5%97Oc%A5%3Bv%01%D5%7F%86t%8F%969e(b%2B%15S%86%C9%F1%10%5E%CD%3EU%89%B5Wi%0D%8D*%1Dm%A6C%8C%A5%89%E7%0A%11%0B%DBuq%A5O%0B%22%A2G%BA%1D%DD%60%B0%CB%5B%F1%F1%2C%08%C6%EFa%8DT%F0%8C%9C(%3A%0A%1Br%9E%A0%E1%04%B3%AD%20z%E9A%88%B6M%B6%25%8C%0C%94%FBmH%9F%DA%147%FA)%9D~%0B%FD%AC%8Cd%8B%F9%24%40%02%B1A%80%02%2B6%EE%13%7BI%02Q%11%C0%C3~%0D%0A~%2C%9E%15%5C%C3%BC%2F%A2%08%0CC%B7E2%08%8F%98x%99~)%B6B%EA%05%AB%89yo%A2%8A%EB%DD%DB5%FC%9C%B3%B4%94%92%92%E7%D6%CE%99%EDx%A0th%7B'%3E%FBl%1D%16%BF_%BA%E2%91G%86%EF%5B%B7%EEU%1Cg%A3%F7K%84%9C%DEElB%EA%C7t%A0%AF%AARU%AD%DF%A0v-%5B%AE%5C%FA%19%82aC2%AB%99%D3u%A1%C2%EAF%F1ZA%B4D%DC%E7*%B4o%10%9F%AF%E2%BBx%9BB%93C%3FK7%25%EC%C3%B4lDo%20%BCW%C3Py%0A%EC%B5%8A%BFPc!%ED%FC%C5%AEA%A6%93%00%09%C4%1E%01%0A%AC%D8%BBg%EC1%098%12%C0%83%DF%7CP%5B*%04y%D0%C3%C04%08%89C%1D%0D!%13%82%ED%8F%B8%C8I%C9m%95M%3C%8E%F7%C3%F4%DD%88%0B%CEW%19%03%06%B8%92rs%B4~'%9E%BCh%D5%E3%8F%8F%88d34%FF%F0%1F%FFx%15%D6fM%5Bz%D7%5D%25%7BW%AD%BA%A7~%FB%F6%F5p%BF%E9%E7%046%D7%D4j%F5%DB*%D4%FAw%DFU%9E%DAZ%1C%05%ED77%2Cm5a%08%1Ds%9C%01%8C%ED-%C4%B3%20%ACJ%20%AC%1E%84%D7%CAq%87%F6%F6%7D%05%93g%916%D5%60%D4%3E%3B%F4%3B%8A%B8%AE%BAb%F3%E6z%A7B%92%87%BE%08C%09a%F7%C3%E8%BF%B0%5D%87%FE%9A%7B%99%19%C5y!%01%12%88e%02a%7F%F0%B1%3C%18%F6%9D%04H%20H%00B%A1%02%9Fz%1B%DE%91%B0%BFsC%2F%BD%8E%87%FA%D4H%CC%B0%D8%7B%18%CA%AFj%15%1D%EE8%97%1Fo%F5%0D%3E%F7%1CUr%C2q*%7D%40%A9%F2fe*w%5C%BC%E6%C7%AE%EA%EB_%7Cq%E2!%97_%BE%2C%92%5D%AB%FC%A7%FB%F7%8F%1Br%E5%95%C5%85S%A6%9C%EEN%88%3Fj%D7%AAU%83%17%DF%FF%60%7Fwee%3A%F6q%08%AD%22g%10%CA%DB%8E%B2Vl%05%FA'%3B%D9%7F%88%F1%D8%9E%91h%D5%5Eh%9A%88%2B%D8%B9%18%82%C8%14%93a%DC%A4%BC%B0C%5B%2FA%7C%9E%1B%85M%99%8A%FD%DC%60giO%8E%0CB%FE%D5%E8%FBc%91%EC1%9F%04H%20v%08X%FE%C1%C7N%F7%D9S%12%20%01%2B%02%98%96%BA%09%0F%ED%FB%0C%81eUD%8E%A8%91%ED%05%26A(%7CdU%204%0D%E2C%8E%E1y%D8%E5%81%88JMq%95N%3B%5D%95%9E4%05%E2j%A0%C2%16%EB%CA%83%B7%00e-%95%1C%7B%A357%FB7%CD%9F%7Fr%E9%D9g%2F%88d7%9A%FC%A7%A6LMPe%1B%3C%81%E6%3A%D9%7DAV%96%8B%A7%CA%8F%BE7%A3%EF%1D%F2P%D9%B5gL%0B%EA%9E%2BC%40Y%FE6%EA%99%10v%D8%24%B5%F4%CA-%5Bp%B8%A1s%80%DDwas2%AA%E1%D2%D6%A4aK%0CT%81%5B.%BCa%9D2%16%E7%1E1%97%04H%E0%BB%22%60%F9%23%F2%5D5%CEvH%80%04%0E%0C%01x%9D%E2%F1%00%DF%03%EB%A9%D2B%D8%D3%1Di%C6%03%5E%A6%A6%06G%D3%8B'%07%0E~EKJ%3Cc%00%C4%D5%80)'%A8%F4%D2R%95%D8%2B%5By%B0%20%5D%C4%95%08%08%89bW%C3%E2u%2Cb%BF5w%E4%C8%3B%A3%B1%7D%B0%CA%C8%DB%82%E8%B3%2Ch%975WN%9E%2B%3DO%84%12.%87%83%D9%F2H%7D%C6%3D8%1B%E5_%92jV%FC%0D%7Br%F9%05%EC%DD%1D%C9%1E%F3I%80%04b%8B%00%D7%60%C5%D6%FDboI%20*%02%F0%EC%C8%8Ap9%3FO%9E%ED%96%FF%902%D2%07A%08%C8%E1%CD%11%C3%9A%CA%AAs%06%9D%7F%DE%97%A5S%C4s%05q%95%9D%AD%99%9E%2B%A9l6%A37%88%03%9EsF%8C%F8C%CD%E6%CD%AF%FEF%A9%84%88%C6%0FB%01%D9%E7%0A%3D%95%A9%D4%FE%B8%3A%89%2B%7DZ%D0%10W%17G%23%AE%20%DC%E2a%F7%09D%CB%85%ED%86%3Di%B3%06%9E%B8%7B%0F%C2%F0%D9%24%09%90%C0%01%26%40%81u%80%01%D3%3C%09%1C%2C%02%E2%15%C1%83%BCJ%1CJV%7D0%D2%25%EF.Le%F5%B3*%13%9A%F6%C7%3D%3B%FD%99%B9y%13R%FB%F5%DB%01q%A5%3C%09%5E%AC%BB%8A%D3%05%04D%82%F9%F6%5E%1B3)%85%85S%7FU%5B%BB%AF%E2%A3%8FN%8Bd%FF%BB%CA%97%E3o0%DE%7Fb%FCs%D1wl%97%A5%0BP3%86u%C3%E0%24%F9%B7%80%E9%F3a%05%2C%12%60r%06%EAaO%D4V%DB%EDK%09w%99%8F%FC5%16%E2%B7%B4%CF%E4w%12%20%81%D8'%40%81%15%FB%F7%90%23%20%01%5B%02x%BE%CBA%C5%B6%1E%2Cy%FE%E3!%2F%BF%03%FF%B65%12%921%FC%DAkk7%FD%F7%BF%C3%03%3E_5%C4%95%BE%A1iPC%EC%F7%60IqCX%E8sjq%C9%C9%DE%3EG%1C%F1Z%DD%8E%1D%EF%7Ft%CB-%FD%A3i%E7%40%95%81%B0%FA)%BAT%0D%FB%B6%3B%B4%87%B6m%8A%2B%5C%EF%85%B8%FAS4%FDB%1B%C7%A0%DC%0FL.%16u%CC)%C3%1D%D8%0A%E3o%16%F9L%22%01%12%E8%06%04%2C%7Fx%BB%C1%B88%04%12%20%01%83%00%1E%F8%B27%D6%20%E3%81%1F%FE7%2F%D3_R%D6%E5%FE%E3e%E5e%11%0Fo%96%A2%2Bg%CC%C8%2B%BD%E0%825%DE%AC%AC%CCp%83%D6%E8E%AC%88%F0%AA%DB%B6%ED%A5U%8F%3Ez%CB%84%DBn%5Bk%5D%B2sS1%5D%87%D3s%5C%D7%C0%AAL%99f%19%1Ct%0F%92CK%86%B6%D2%BDL%F7B%08E5%8D%8A%B6%D2a%7F%3Bb%A2a%DB%B2%0D%D8%94%EC%D3%20%DA%E69%F4%81Y%24%40%021L%C0%F2%8F%3F%86%C7%C3%AE%93%00%09%B4%23%20%1B%5Db%0Ao%95.pZE%C5%FEO%98%DF%C3fM%1E%9C-%E3QMiiG_%B3%E4%B3%F7%A3%81%F8%D1%AD%B7f%8E%F8%F1%8F%97%25%E5%E5%F5%97%1F%12S%409%D55%CAH%11W%ED%B6m%1F%EEY%BE%FC%81e%0F%DC%FF%DAY%F3%E6%CB11%9D%1A0%158%04%ED%DD%00%B1s%15%AEI%D2E%11x%D1%F4S%CA%06q%E9%D3%82Qy%AE%A4%F3%10%B3%9F%A0%89q%A8k%F9b%81%941%DA%7F%0B%EB%E4N%EA%D4%01%D3%18%09%90%40%97%22%40%81%D5%A5n%07%3BC%02%07%86%C0%93%25%03%EEuk%DAOq%16%8D%CC%DF%89%D2%10%8F%95%D2p%EC%8C%2B9Iyss%B5%CC%81%A5%AA%EF%B0a%FE%CC%A2%A2%D2%FE%A7%9F%BE)%9A%9E%FCs%EC%D8%C4S%5E%7CqAZ%FF%FE%13E8H%1D%111%11%EA%EA%5BD%A0%8C%B8%CE%5C%D8%AD%BD%A9j%ED%DA%05%8D%7B%F7%FE%EB%CD%87%FF%BE%20%A9%C1%B7%7D%FA%C2%F9%0D%11l%84eCP%E5%A0%0BC%91q%1E%E2%89%88%C3%A4%2BQ%0A%AAV%7B%C68%A4%7F%B2%A0%3D%AA5WR%19B%F6q%B4w%A5%DD%F0%8D~HQWKKK*%B6y%A8km%94%1FH%80%04%BA%1D%81H%3F%84%DDn%C0%1C%10%09%F4T%02%2F%1Cy%D4fOZZ%81'%25E%C5e%A4%BB%D2%F3%F2TJn%AEJ%EF%DDGa'v%D9%2CT%8B%C3%06%A2X%BC%BEg%DE%A9%A7%16%5D%B4vmc%B4%ACv-%5Bv_%AF%E1%C3o%C2v%0D%B6%5B%12%88-C%83%05%AF%D0c%01%1C%7F%D3%B8g%8F%DA%B7v%AD%B6%E4%A9g%5CU%1F%7F%ACTc%FDV%14(G%F1%AF%24%A2%CEF%88%96%DD%F8%2C%FBN%89%88%93%FD%B0%D2%10%F3%11%07%22%CA%8E%F4%03%10K%11%CD%A9%B9%8Ex%ABP-8K%8A%B6%E47Q%CE%2F%9C%1A%CD%DB%82RQ%02%C4%9D%AC%ED%BA%D7N%5C%99%E5%8C%F1_%02%DB%CF%99i%BC%92%00%09tO%02%14X%DD%F3%BErT%24%10F%A0%EC%9F%FF%1C%AE%25zW%C4%A7%A5iq%D8%BB%CA%ED%F5%BAd%0F%2B%89%F1%89I%F2%5D%C5%E1%CD%40%17%0EXn%DC%BD%7B%F9%B5%85%85%A3qn%8C%EC%98%1EU%D8%F0%CA%2B%D3%0A%8E%3B%EE%19%D8O7%95T%A87%AB%8D%B8%82%C5%40K%8Bj%AE%AEV%D5%E5ej%FD%1Bo%AB%AF%E7%CCQ%AE%7DU%9AK%F3c%1AO%17%3C%FA%EF%93)Z%CC%FA%86WJO7%D3P%ACU%D8!%CDQ%E4Y%0DF%EA%04%9Br%BD%04%EF%D2%C5%D1l%22j%DA%C1%B4%A0x%CC%E6%A0%3F%BA%99%D01%87%B6%25y%88%AFc%3DW%C4%DD%F3%AD%FA%C84%12%20%81%D8%22%40%81m%A7%1E%C4%00%00%0C%8BIDAT%15%5B%F7%8B%BD%25%81oE%60%CB%C2%85%3F%C9%1A6%EC%AF%AE8%0F%96%5D%C5%C96%0B%FA%26%A1%CA%E3%C6R%AC%E0%F4!d%8D%E6r%7B%5C5%E5%E5%1F%8C%2C)%99%5Cnxw%A2i%F8%E5%93ON%3D%E6%81%07%9E%CE%184%E8%2CQ%13%226Du%18W%DD%84.4%FC~%D5%D2%D8%A0%EA%B6lQ%BB%3F_%A6%3Ey%F4Q%EC%8F%BE%5D%A9%16_4%CDtJ%19C%0C%E9%C2%0A%9F%F7%A1%8FWa%5D%D4%8B%1D1%0Eq%25bI%0E%87%B6%15u2~c%DCU%5E%AF7%F7%A2%AF%BF%E6%8E%ED%1D%81%CC%B2%24%10%A3%04(%B0b%F4%C6%B1%DB%24%F0M%09%EC%5D%BB%F6%F5%F4%92%92S%B1%03TP%3A%19K%A6%C4%23d%84%D6%B5T%D5%E5%E5%EF%9FRRr%2C%CE%D2%89%DA%93%256%D6%BF%FC%F2%F1%05%C7%1C%F3%9473%B3%A0%8D%C0%92iA%9C%BD%E7%F7%F9T%C3%CE%1D%AA%EA%CB%2F%D5%E2%A7%9EV%F5%CB%BE%C0%04%A0%2C%BBju%5C%7D%D3%E1ES%CF%14Uf%D7%1ED%9F~%11%CD%C1%CD%A1%C6E%5C%C1%C0%AB%C6%D9%85v%BF%A5%A6%BE%12%117%1E%DE%AB%CF%A2%E9%20%CB%90%00%09%C4%3E%01%BB%1F%85%D8%1F%19G%40%02%24%60I%00%AF%AEy%5E%A9%AC%DC%98%90%9E%9Eo%88%AA%D6%DF%01Sd%B5%AA%02%24%607%F6O%7F%D3%AF%DF%91%7F%85%7F%C9%D2%A0C%E2%EE%95%2B%AFO%EF%DF%FF%EE%B8%D4%D4%14%ACl%17u%E5%F2cj%B0i%EF%5EU%BD%FEk%B5%E6%D5%D7%D4%A6%D7%E6)w%1D%D6%7Bk%D0p%11%D7%C7%3B4%169%CBTo%BA%B0B%F1%F9%18%DE%0F%E1%B5%8AjA%7F%A8%F9v%D3%82%E2%A0%B3m%1DmI%DEUXw%F5%B8m!f%90%00%09t%3B%02%DCh%B4%DB%DDR%0E%88%04%9C%09%BC%A1%94%FF%AB'%9E8%C6%DF%D8(%C7%E9%E8k%99%CCh%D64%15%83(%91%B4%A2%A2%F1w%EE%DA%F5%D5%82%2B%AE%C8t%B6%1C%9E%9B3%7C%F8%C3%09ii%A9%FB%D6%AD%BB%A1%A9%B2r%AF%16%F0%CB%BA%2B%AD~%EB%16%B5u%E9%E7%DA%C6%B7%DEV%EE%06%AC%A5%17%11%E2%20R%C2-GN1E%22J%9ASt%FA%C6%A8%F0V%BD%8C%F1%95B%F0%9C%FAM%C4%95%2Ch%87%CD9%86%5D%3Bqe%B6)%1D%9DIq%15%F9~%B1%04%09t7%02%F6%FF%EC%EAn%23%E5xH%80%04%DA%10X%F7%E2%8B%C7%14O%9B%F6%8E%3B%3E%DEq%FD%90(%08%11%2B-%0D%0D%0D%EB%FF%F5%AF%09%87%5Cz%E9%CAo%8A%B2%FC%8D7NL%CA%CA%FC%F9%8E%E5%CBOZ6%F3I%A5%ED%D8%A9T%B3%EF%5B-Po%DF%17SX%19%FD6%B3%E5%E0%EB%070%9Dw7%8E%A6%E9%F0%16%10%A6%91%90%AD%18%9C%E62%5B%05%1D%EA-%80%B8%3A%A1%7D%1F%F9%9D%04H%A0%FB%13%A0%C0%EA%FE%F7%98%23%24%01%5B%02%1B%E7%CF%3F%BFp%CA%94%D9%91%B6W%10%03%22%5CpD%8Ek%F7%B2e%D3q%F4%CD3%B6F%A3%C8%C8V*%EE%DEC%87_%A2jk%2F%86%E5%D6%0D7%C5%93f%B4%D5%FA%F6%60%14%E6%F4%BE%85%0A*%B1%83%A4-%A8%FB%02%3E%CF%86%A7jq4v%EC%CA%18%3B%B4%BF%89%FC%F1%86m%3BQ%DA%AA%EFPv%99%DF%EF%1F%8B7%12%B9%A8%DD%0E%2C%D3I%A0%1B%13%A0%C0%EA%C67%97C%23%81h%08lY%B0%E0%EA%FC%A3%8F%FE%3B%5E%23%B4%13%0D%BA%99P%CF%106%06%9D%3Dm%C8%90K%16a%BA1%9A6%22%95%C1%B4%DB%11%B0%3F%09%E5%26B%C0%8C%C7%E7%3E%F8%2C%FB%5DIt%0A%E2-%92%B5aM%A8%B3%12u%3FD%FC%14%9F%C5s%B4%CB%A9b%B4y%C6%D9%82%F3%60W%F6%D8r%FA%CD%0C%15Wk%F1e%04%16%B5%CB%DE%5D%0C%24%40%02%3D%90%80%D3%8FE%0F%C4%C1!%93%40%CF%24%B0y%E1%C2%EB%0A%26O~8%92%C82%E9%E8%AA%A6%B6%B6%AA%FC%D5W%CF%18%7C%D1EQ%1D%AD%D3Q%B2%106%05%105%7DQ%2F%1BbE%CE%F8%F3b%FD%14f%F9%DC%B2v%AC%1E%B1%0A%E9%3Bp%DD%0A1%D5%E9G%ED%C0k%15%8F6g%C0%BE%1C%DC%AC%8B'%5C%ED~3C%A7%05E%5C%8D%82%B8%92%3E2%90%00%09%F4P%02v%3F%16%3D%14%07%87M%02%3D%97%C0%A67%DF%BC%B4%E0%D8cg%B9%3C%1E%5D%2C8%88%09%1D%92(%0E)S%F9%D5W%CF%AD%9A1%E3'%93%EF%BF_v%5B%EF%16%01%1E%B5%B31%90'0%C4LCS9%AD%B92y%C8u%19%EA%1CA%CFU%B7%F8%DF%80%83%20%81oE%80%02%EB%5B%E1ce%12%E8%5E%04%CA%E6%CE%3D%BD%F0%C4%13_%F1%24%24%88vr%FC%7D%D0%5D%3A%12P%AE%A5%AE%BEq%CF%CA%15%BF%9Bw%D6Y%F7%5E%B9%7D%BB%FEvb%2C%06x%CD%0EG%BF%FF%86x4%A2%E3%94%A91%3E%5Dx%19(%16%60%CD%D5I%5Cs%15%8Bw%9E%7D%26%81%CE'%E0%F8%03%DA%F9%CD%D1%22%09%90%40W'%F0%E5%CC%99%A3%07%9D%7F%FE%FB%9E%A4%A4%24%3B%91%25%82B%F4%97l%1A*2L%0B%04%DDY%0D%15%15%3Bj7o%FA%ED%8C%89%93%1E%BB%AD%93%D6g%7D%17%BC0%1D8%0CS%8F%7F%C4(%CE%C0%B8t%EDh%E8K%DB%DF%C8V%81%19%5C%97%25%5B1%5C%F9%5D%F4%95m%90%00%09%C4%06%01%DB%1F%8F%D8%E8%3E%7BI%02%24p%20%08%CC%BB%E0%82%CC%C9%F7%DD%F7vJ%DF%BE%A3C%85%84%88%0E%C3%5B%A37%8B%CDCE%5C%E1%5CA%9F%E6olra%AF%2B%ADa%C7%0EW%D5%86%F5%3B%97%CE%9E%7D%8F%BF%C9%F7%E8%A5o%BCQ%7D%20%FA%D8%196!%AC%8E%C2%98~%0B%5BS%C4%9E!%AE%ECte%9B%26%0D.%F2%1B%CAMD%3B%E3f%D0%06%09t3%02%14X%DD%EC%86r8%24%D0%99%04v%7F%F1%C5%A3%D9%87%1DvM%88%98%08%9E%25%08a%25A%F3%B7(%08%2B%D5%5CS%A3%EA%B7W%A8%86%ED%3B%B4u%EF%BD%E7%DA%B2%E8%03%CD%B5w%8FK5%F9Z%A0%C0%E6%A0%FE%0C%ACK%3A%20%8B%E1%3B%3A%DE%A7KJ%D2%E1y%BB%0C%F5nF%2C%96%FA%22%AC%E4%12%C9%96p%10%F5%25%22%13%B1%12%E5O%E6%F17%91%A81%9F%04z%26%81%88%3F(%3D%13%0BGM%02%24%60%12(%9F%3F%FFT%BCa%F8%8A%3B11%0E%AA%C2%25G%DE%04ZZ%5C%D8%13K5%D7%D6%AA%C6%DD%BBU%E3%8E%EDj%DB%17%2B%D4%FA7%DFT%CD%DB%B6)WC%83%86%03%9DMw%97%F9%3B%B3%176gB%98%CC%81(%F9%E4%BB%24%8CE%EB%E9h%F7%1C%B4)%C2%EAX%C3%13%D7*%96%E4%7B%94A%D7X%88%AF%E3%E0%E63xps%94%D4X%8C%04z%20%81%A8%7FUz%20%1B%0E%99%04H%C0%20%F0%CF%89%13SO%99%3D%FB%B5%C4%5E%BD%8En%86x%C2%16%0D%98%0E%DC%AB%9Av%EEV%7B%D6%AFW%1B%DE~%5BU%AF%5D%AB%DCM8%F6%A6%19k%DCC%8E%BE%11o%8F)h%60%CE%FC%CD%F1!%EDu%7C%9F%8F%FCw%B0~iMg%C2%86%97*%1E%5E%AA%E3a%FBx%B4s%26l%0F%09%B1o.%5E%8F%CAk%85z%E6BvS%90%5D%82%FE%3E%D7%99%FD%A5-%12%20%81%EEG%80%02%AB%FB%DDS%8E%88%04%0E%18%81-%EF%2C%BC%D8%9D%900%B3i%E7%CE%84%8AU%AB%B5%8A%C5%8B%5D%D5%EB%D7)O%93O)%1F%F6%D44%5E%2C%B4%EA%80%EE%FA%09%BA%8A%F4%8F%16ed%A3%D0%CF!%8CV%E1%BA%1Ee6%E2Z%81%EF%7B%AE%D8%BC%B9%CD%F16%8F%E5%E7%BB%12%12%12%B2%60%23%0F%E5%0AQn%00%3E%0F%C2%E7%91%B8%8EC%D4%CFM%94%E6%90%26%1F%A3y%23P%CA%B5%86%D0z%F2%19%B6%DElii9%1Bo%09%E2dj%06%12%20%01%12p%26%60%F5%23%E7%5C%83%B9%24%40%02%3D%9A%C0%5B%17%5C%1C%B7%B5%BA%EA1%AD%BC%FC2%97%1F%1B%B9%FB%9AD-%89%92%11E%F3%AD%D8%88%F2%82%81%88FB%84%93%DE%9E%F1%BD%BDg**%5B%ED%3B%2C%7D%80%BD%E0%AB%84%C1%BE%C8f%A6W%C0k5%AF%7DY~'%01%12%20%01%3B%02%11%7F%C8%EC*2%9D%04H%A0g%13%98U%3Ap%A0ji~%14ZD%A6%E2%04F%87%BDD%5D%89%A0%85%B0%AAA%DA%AF%B1%5EL%F6%C5b%20%01%12%20%81%0E%11%A0%C0%EA%10.%16%26%01%12hO%00%9Bs%8E%85%C8%FA3%C4%C8%B1F%9E%EE9%12'%90%5C%DB%97%EFj%DFE%1C%9A%1E0%C3y%25o%07%FE%09%FBb%DD%3B%BD%ACL%CE9d%20%01%12%20%81%0E%13%E8%F2%3F~%1D%1E%11%2B%90%00%09%1C%14%02%10Z%87%A1%E1_%22%CA13%5ES%60%99%02%E6%A0t%CA%A6Q%0Bo%95%94%5C%87x%17%D6%7C%CD%C4%9A%AFN9%C4%DA%A6y%26%93%00%09%F4%00%02%14X%3D%E0%26s%88%24%F0%5D%12%C0%E6%9D%B9%F0%FE%5C%0C%11s%1D%DA%D5%DF%DE%0B%11%5B%5Da%1AQ%D7W%06%139%24%FA-%C4%BF%60%8D%D5%07%DF%25'%B6E%02%24%D0%BD%09P%60u%EF%FB%CB%D1%91%C0A%25%00%B1u%18%C4%D5e%E8%C4T%C4%A1%D2%19%11%5B%C6T%9C%BC%E1%F7%5D%08.%7D%81%984%8D%E6%A4%FD%3A%5C%17%E1%FBL%C47%20%ACdJ%90%81%04H%80%04%3A%95%00%05V%A7%E2%A41%12%20%01%2B%02%D8%97%0A%2F%1C%FA%8B!ndO%AA%93q%1D%0F%91%D3K%CA%9A%EB%9Fp%DD%AF%BC%AC%8C8%A4%B5%17j%F2%5DL%87TY%81%A4%0F%D1%84%EC*%BF%18%0B%D7%F79%98c%16%09%90%00%09%7Ck%02%14X%DF%1A!%0D%90%00%09t%94%C0%CC%A2%22%2F%A6%11%F3Q%EF%18%C4%89%88%87%20%8A%87%2B%D7%CA%96%A9%BD%8C%BC%F6%E2)%B4%8A%9C%E1%23%9B%96%AEF%5C%81%F8%0E%04%D5R%08%AA.%7B%1E%A2%D5x%99F%02%24%10%FB%04(%B0b%FF%1Er%04%24%D0m%08%E0H%9B8%0C%A6%08%B1%18%B1%00%E2(%0F%D7%2C%08%AC%94%A0SJ%F7J%C9%B4b%0B%16%A3WC%A4%ED%C6%F7%0A%E4m%C6U6'%AD%86%982%A7%04%91%C4%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%D0%F9%04%FE%1F%16(%A9%BB%0A%EC%FF%BD%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\" selected=\"true\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\">"+standalonestring+"</option></select></div>";
			}
			if(replacemethod === "standalone"){
				flvideoreplacer.innerHTML = "<img id=\"flvplaceholder\" src=\"data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%02X%00%00%01%10%08%06%00%00%00l%85%0A%40%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%03%0A%08%08%12%A9Cv%00%00%00%20%00IDATx%5E%ED%9D%09%7CT%D5%D9%C6%CF%CC%24%99%EC%0BY%80%2C%90%106%11AvAq%C5%15q%AFkq%ABZ%97%DAZ%DB%EF%EBg%ED%AA%D6Vk%B5uC%5B%15q%A7X%ABE%85%BA%80%0B%EE%80%20%20%82%40%C2%1A%F6%84%EC%99d%E6~%CF%7B%E7%DE0%C9%DC%7Bg%A2A2%C9s~%BF%E3%9D9%CB%7B%CE%F9_3%F7%E1%3D%E7%9E%A3%14%03%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%90%00%09%F4h%02%AE%1E%3Dz%0E%9E%04H%E0%A0%12x%B6%B4%D4%ED%F3%F9%92%DDn%F7ptd%94%CB%E5%1A%AAiZ%11%3E%17%22%F6A%CCFL%B6%E9d%00%E5%2BQ~%17%F2%B7!n%94%88%B4%2F%90%B6%C4%E3%F1T%7C%7F%C3%86f%9B%BAL%26%01%12%20%81%03J%80%02%EB%80%E2%A5q%12%20%81P%02%B3%FA%F7O%C4%F7b%08%A0%D3!%AA%8E%0A%04%02%22%AA%FAI%19%5C%15%D2%E5%A3%86%CFa%BFM%92%D7%3E94%0D%9F%A5rh%3D%11W%9F%23.A%D6%3C%5C%3F%B8%7C%D3%A6%BD%D2%00%03%09%90%00%09%1Ch%02a%3Fb%07%BAA%DA'%01%12%E8Y%04%20%AA%C4%0Bu%1C%E2%C5%10%3A%93%20%92z%1B%04t!%25%C2%C8JP%7DSJ%A1%F6%2CD%D7R%D8%9D%8F%F6%9E%83%B8%FB%12%82KWt%0C%24%40%02%24%D0%D9%04(%B0%3A%9B(%ED%91%00%09%A8%A7%8A%8B%BD%107%A7%00%C5u%88G%23%26%09%96%10%0FT%7Bo%D3wA-%E8%1E%83%9E3%FA%B2%0E%7D%9C%83%3E%CD%BA%B4%BC%7C%CDw%D1%01%B6A%02%24%D0s%08P%60%F5%9C%7B%CD%91%92%C0%01'%00oU)%1A%B9%11%F1b%C4%5CCP%99N%A5%83!%AA%9C%C6%AC%F7%07%9D%932%1F%E3%FA%17x%B4%5Et%AA%C0%3C%12%20%01%12%88%96%00%05V%B4%A4X%8E%04H%C0%96%C0%93%FD%FA%8DA%E6%ED%10T'%23%BA%5B%15%15%3Et%E6%F4%9Fm%07%BEa%86%88%2B%F4O%EF%AEab%3B%3E%DF%85%F5a%0F%C1%AB%C5%05%F2%DF%90%2B%AB%91%00%09%B4%5D%10J%1E%24%40%02%24%D0!%02%F0X%8DD%85%FB%11e%1AP%82%EE%15%0A%99%0A4%92%BB%FAE%DCX%FA%C2%FA%A0%E4r%BBj%DC%5E%EF%1D%DF_%BD%FA%EE%AE%DEs%F6%8F%04H%A0k%12%A0%07%ABk%DE%17%F6%8A%04%BA4%01x%AC%B2!%A2%9E%40'%CF%90%8E%8A%17H.%9D%D5i%C3%B3%D4j.%F4%BB%CDgs%BA%AF%E3%1E%B3%E0%14%A1%AE%AF4%B7GSn%8FKy%3CZ%20!%C1%A5RS%AB%0A%8E%9C%F8%D3%93%EE%B9%E7%C9%CE%1A%1B%ED%90%00%09%F4%0C%02%9D%F6%83%D83pq%94%24%40%02%F0Z%FD%06%14~%2F%24%BE%89%A7*dZ%CE0%D1f%8A%CE%04%BC%15%1F%CA%11%2BP~%0F%A6%ECjpmD%D4%F09%0E%97%14%E4e%22%E6!%CA%9EY%B2%F6K_H%2F%C1F%F0%85%88%40%7C%94YA%F9%05t%7B%94%8A%8FW%01O%9Cre%A4%AB%B4%82B%955p%80%D6%AB%7F%7FWz~%BE%16%97%92%E2%F2%24'%AFm%D8%B6%ED%EC%D2%F3%CE%FB%D2l%83W%12%20%01%12p%22%40%81%E5D%87y%24%40%02%AD%04%20%ACF%E1%CB%5C%C4%02%C4%8En%B1%D0%EAaB%5D%7Da9%84%92%EC%7B%D5%88%EF%0B%10%3F%40%FC%04%DF%97a%A1%F9%9E%D6F%3B%F8%01%7D%1C%86*%E3%10'%20%1E%8BxH%3B%13%FA%A2%2B%97(%AB%B8x%A5!%AA%B4%14%95%3Dd%88%CA%1B%3E%5C%F5*-V%899%B9*!%3DCAX)%08%2B%15%E7%F5*W%5C%9C%E6%8E%8Bs%D5m%D9r_%F6%A1%87%DE%DC%C1n%B18%09%90%40%0F%24%40%81%D5%03o%3A%87L%02%1D%25%00%E1r%17%EA%FC%AF%8Dg%C8%D6%9C%08)%A9%83%10%FA%5B%B3%08%15%E6%20%BEz%D9%C6%8D%1Bl%2BwR%06%B6%8C8%15%EDOCG.T.w%96J%F0*-%D1%AB%25%E6%17%BA%F2%C7%8D%D1%0A%0E%3B%CC%95%98%9B%A3%1223U%7C%06%84UR%92.%AA%DC%F0j%B9%20%021%5D%18%F4%88%89%2Cs%BB%5D%BE%AA%AA-%1B%5Ey%E5%D4C%AF%BCre'u%91fH%80%04%BA!%01%0A%ACnxS9%24%12%E8%2C%02%10V%E2%AD%9A%8F(G%D9%E8%FB%19%E8%0E%20%87%A0%AB)CUIq%A3%E8%A7H%9E%81%E3k%9E%9F%5EV%D6%E4P%FD%80f%3D9a%D2%D8%A4%DE%B9%D3%87%9Cr%CA%E5%BD%06%96%A6%7B%B3z%A9%C4%EC%5E%1A%3CU.%11V%F0R%89%B7*(%AC0L%B79%D4%B6C%D6%02%CD%CD%AE%DD_%7CqS%9Fq%E3%FEv%40%3BL%E3%24%40%021K%C0%F1%872fG%C5%8E%93%00%09%7Ck%02%10W%A7%C2%C8%2B%88q%91D%95%D1%98%B9%C6%C9%F4XU%23%FD%EF%A8%3B%03%5B%1E%1CpOUG%07%BCs%C9%92s0%0D%F8%8B%D4%C2%C2%F1%EE%84%04Q%8E%9Ax%A8%DA%EBG%F3%BB%E1%8D%93iM%5Dh%8A%D2%DC%F7%F5%D7%F3.%1D%3Cx%1A%E6M%FD%1Dm%9F%E5I%80%04%BA7%01%0A%AC%EE%7D%7F9%3A%12%F8F%040%AD%F6%07%E8%88_%A2r4o%E5%B5Y_%05%DD%B1%1D%C7%D0%DC%8E%FA%FF%B8b%F3%E6.%BF%97%D4%AA%C7%1F%3F%3C%7F%F2%E4%DB%D2%8A%8B%A7%89%07%2Bt%CC%A6%A8%B2%80%A8%05d%DA3%10P%0D%BBvm-%9F%3B%F7%98%E1%D7%5C%B3%DE%A2%1C%93H%80%04z(%01%0A%AC%1Ez%E39l%12%B0%22%F0X~%BE%2B%3E%3E%FE%25%E4%9D%85(%E2J%8AE%FA%9D0%3DV%95(%FBk%9F%CF%F7%C8%D5%15%151%E7%D1Y%FE%C0%03%87%F6%3F%E5%94%BB%D3KKO3%C6%EExN%22%04%16%FCV~%D5%5CW%A7U%97%955o%FD%E8%E3%93F%5D%7F%DD%BBV%5C%99F%02%24%D0%F3%08%60%05'%03%09%90%00%09(9%3F0%01%E2%EAC%B08K%84%951W%E6(%AEDY%89%97%07%F1%AF(_%80E%EB%0F%C5%A2%B8%92%FB%3F%F2%C6%1BWe%0E%1A4%F5%AB%C7%1F%9F%04%AF%D4%3A%F3%FF%09%7D%80%11%82%E6%F7%C7%EF-%2B%7B%E7%C9%11%A3%CF%8FP%94%D9%24%40%02%3D%84%00%05V%0F%B9%D1%1C%26%098%11%98YT%94%0C%1D%F19%CA%1C%01%A1%14IPH%BE%A9%3B%3EE%F9!%D8Z%E1%A7Xg%D5%E0%D4F%AC%E4%0D%BB%FA%EA%8FRz%F7%1E%BCk%E9%D2%9F%FB%1B%1B%03Q%F4%5BW%A3B%C4%D5T%3F%7BVq%F1%D5Q%D4a%11%12%20%81nN%40_p%C0%40%02%24%D0s%09%88%B8%C2%9ET%CB%A0%11%06E%E3%AD%11R%A2%25p%F9)%3CV%7F%EDLrXX%3F%18%FD8%0Ck%B8Jp%1D%0A%DB%FD%11%FB%22%CA%A6%A2%89%882m%D7%82%BCZ%7C%DE%8D%B8%19%E2f%BD%96%94%FC%B5%CA%2F%5Cs%C8%A8%11%9FO%B8%E7%1E%C9%FB%D6!o%CC%98%BF%7C%F4%CB_%CE%19y%D3M%FFN%CA%CD%1D-%06%85%0F%DA%B6%F1%EA%09%13q%E7%A9%BFc%1Cq%603%E3%5Bw%82%06H%80%04b%96%80%CD%0FE%CC%8E%87%1D'%01%12%E8%00%01%99%16%14%CF%154%C30C%3CHm%DB%DF%05%94%91%FCm(%7F%2C%3CV_w%A0)%CB%A2h_%C4%D4T%D8%93uO%93%10%B1%ADz0%88%8E%91%F6%CCkH%BA%DEU%F9%AEk%1Do%92%D2%B2%B3%D4%88%0B%2FR%7D%C6%8CV%89%7D%FAT%B8%3D%9E%D7%EB%B7m%9B%7F%E1%A4I%FF~%B7%13%DE%F0%DB%B5l%D9%9D%D9%23F%DC%82%26u%00%22%B2B%D6%60%A9%7D%EB%D7%AB%95%CF%3F%AF%B6%CC%7DU%A9%C6%06s%D1%FFe%F0%EC%3De%F6%9BW%12%20%81%9EE%C0%F6%87%B4ga%E0hI%A0%E7%110%16%B4%CB%9A%AB%23%10m%17%B4%9B%C2%CB%105s%E1%99%D1%CF%1F%FC%A6%01%DE%9D!%A8%7B%0D%E2%95%B0%99%A9%8B%24%04%5Cua%12%95%5D%11zR%2F!Q%B9rs%D5%E1W%5C%A6%F2F%8CP)EEZBz%BAK%B6%5D%80%C8R~%9FO5%EC%DC%B9%A8i%EF%DEGr%0F%3F%FC%D9%A8l%DB%14*%9B%3Bwr%E1%09'%2C%F0%24%26z%AC%05%D6%0B%10Xs%95%AB%B1%11*LW%A2Rl%1A%84(T%17%03%09%90%40O%23%C05X%3D%ED%8Es%BC%24%60%100%DE%16%D4%D7%5C%19%22%C7V%DC%18%E2%EA%AEo%23%AE%20%AC.D%5C%8D%B6%BEB%17%E4%B8%19%11Wz%DBr%C5w%DB%F6%DB%DE4S%5Cy%95%A7wo5%FA%F2%CBU%EE%A8%C3Uj%FF%FE%CA%9B%91%E1%F2%40%5C%C9%0E%EC%E2%FD%C2g-%AD%A8%E8%A8%9C%91%23%9Fi%AE%AF%D7%EAw%EE%9C%F1%CE%F5%D7%E7%7F%93%FF%09J%A6M%7B%7F%C5%C3%0F%976%D7%D4%04%8F%F2%91%06%0C%8FV%D0%9E%EE%DC%D2%83(%2B%19%13%C2%2B8%18%5B%9F%5Ed%20%01%12%E8Y%04(%B0z%D6%FD%E6hI%40'%20%FB%5C%E1%A2%BF-%88%20%FF%B1%147%A2%10%8C%BC%CB!%AE%FEO%AF%DC%C1%80%B6~%02a%25%EB%A2%9EG%14%EF%95%3E%B5gD%B3%5D%CB%F6-%9B%92%D9A%1Cw%A3rr%D4%88%E9%DFW%D9%87%8FPi%85E8%3F0%5D%E9%1B%86B%5C%B5%B7%2F%E3%90%9D%DA%13ss%7Fx%CCC%0Fm%AD%DB%BE%7D%DEgw%DC1%D0%D2%BEC%E2%E8%9F%FF%7C%D3%3FG%8C(%AA%DB%B6m%B9lJj%14%DD%AF%ACB%EA%0A%BA%A0%CEr%BD%0F%91%25k%C8%18H%80%04z%10%01%0A%AC%1Et%B39T%12%10%02%B2C%3B%1E%FE%FA%26%A2NDD%94%20%88F8%13%E2j%96SY%AB%3C%B4s%09b%25l%C8B%F8d)%23%C6%AC%CAF%9F%86.%CB!%CDi%E9j%F8%85%17%AA%DC%C3G%AA%D4~%FDT%7CZZ%EB%117!%E2%AA%D5lk%BB%C15d*)%2F%EF%E4%B1%B7%DE%FAu%F5%C6%8D%FFz%E5%E4%93%3B%24~%A6o%DC%D8xmA%C1%E8%9A%F2%F2%0Ft%25%17%0Ca%2C%8D6%25%3F%09%9F%DF%8E~%8C%2CI%02%24%D0%1D%08P%60u%87%BB%C81%90%40%94%04%20x%E4lA9%FE%C6%9C%16%B4%AC%19%22%AE%A6b%0D%D1%7F%2C%0B%D9%24%C2%5B3%14%ED%7C%0E%1B%CF%40XdH1%11%1B%FB%B5%88M%C5H%C9%22%8E%DCq%CA%9F%92%AC%86%9Cy%26%16%B4%8FQ%A9EE%CA%0Bq%E51%0EfF%9B!%9A'%DC%60h'd%8C%A8%7F%F6%D4%97_%AE%DC%B1x%B1%2C%60%8F%3A%3C%A3T%60xI%C9%E4%9A%8D%1B%DF%17O%96%B4%8B%DE%05EV%3B%09i%B49%1A%5C%1E%8D%BA%01%16%24%01%12%88y%02%14X1%7F%0B9%00%12%E8%10%019%B8%D9%3C%5B0%CC%9Bd%08%2B%7DZ%10%5B7%88%E7%EA%F5%8EX%C7t%E0o%20(V%A3%CEH%D4o%7D%0B%B0%236%A4%0Ff%F9%D6%8F%BA%B8%82%BD%C4D%D5w%F2dUx%D4%24x%AE%20%AE22%14%B6%9E%D7%5CX%D0.%02N%DA%8C%26%04%F5%5E%F0%BFn%AFW%C3%96%0Cw%D6%ED%D8%B1z%F9%FD%F7%0F%8B%A6%BE%94%D9%0CA5%B9%B4%F4%D8%86%DD%BB%3FU%01%BF%88%2C%F0%0Csd%B5%0E%05%AD%5D%23%DE%C3h%ED%B3%1C%09%90%40l%13%88%EE%D7(%B6%C7%C8%DE%93%00%09%80%00%1E%EEw%E12%3C%D4%8B%D3%1E%8C%88%14%04%F9%CF%E5%1D%F1%5CAX%F5B%5C%0A%91%F1%7B%D8h%DD%2B%CA%A9%AD%90%B6uUb%88%3B%BD%7D%DD%23%84%FD%AE%F0y%07%AE_C%3D-%D7%12%BC%9F%26%0F%1B%F6%C9%A0%13%8E_%12%9F%91%F9%25vO%DF%84%85%EB%D5%86X%D2%05%96%D8%08%B1%DB%A1%8F%D8%EBj%C8%A1%D7%5C%B3j%CB%BB%EF%5E%17m%C5%15%F0d%3D0%60%C0%91%CD%B5u%EB5_%B3%EE%C6r%08%92%FB%0A%EEC%AAC%19f%91%00%09t%13%02a%FF%82%ED%26%E3%E20H%80%04B%08%E0%A1%3E%0A_%97%22%3Al%94%A9%8B%1C%A9%25o%0BF%BD%A0%1DS_'A%DC%CCE%BDxCP%89%91H%BF-%A2%85%A4Lh%D9%8D%F8%BE%04q!%E2%C7%88%3B%E0%91%AA%9C%5EVf%B9q%E8%AC%A2%A2%B8%81%17%5E%98%99%98%9D%9D%9D1h%D0%A0%F4%01%03%8EO%CE%CB%9B%E8%CD%CC%1C%13%97%9C%1C%AF7%20%AA%AB%03%C1%ACS%B9f%CD%7F~7t%E89%F7G%B9%87%D6%CEO%3E%CB%5C%FC%C8%8C%AD%BB%DE%7B%2FI%B5%B4%40%ECY%8F%DF%10%80%EF%83%EF1%1D%E8%16%8B%92%00%09%C4%20%81%0E%FD%F8%C4%E0%F8%D8e%12%20%01%10%80%C0%DA%02%AD%91%2F%02%CANt%18%E2%AAC%FB%5C%C1%EE%F50%FF%10bTb%C6h%DF%F44%89%A7j%3D%FA3G%BA%88%EBzx%CD%9A%BF%ED%0D%7B%FB%CA%2B%7B%F5%9F%3A%F5%98%DE%13%26%FC%20)'g%AA%C7%EB%D5%DB%93q%9B%D7%D06%8Cq%07%93%F0E6%10%C5%0F%A3%AB~%FB%F6%2F%17%DFq%C7%84%E3%1Ey%C4R%E0%B5%EF%E7%AC%89G%0E%D7*%B6%AD%90%89Q%E4%D9%FE%B6%1A%0C.%C1X%9Fko%83%DFI%80%04%BA%0F%01%DB%1F%81%EE3D%8E%84%04z6%01%88%A0%DF%80%C0%EF%A1%2F%EC%40%E8n%2B%3C%F8%2B%E0Y%91E%F0Q%05%D8%BD%03%05o%15%DDbT%B0m%C0%B0o%B6%23ZG%D6%82%FD%1E%ED%89%A7%EA%80%85%B9%A7%9C%92q%E4%7D%F7%FD(%A5o%DF%9F%25ddd9%09%2C%11%3EZ%20%A00%F5%A8%FCMM%AA%B9%AEN6)%DD%91%90%944%3Cs%C8%109%96'b%98U%5C%FC%7D%80%7C%DA%89%B5!%E8%9A%FD~%7F%CA%95%5B%B6%C84(%03%09%90%407%24%E0%F8%83%D8%0D%C7%CB!%91%40%8F%22%80%E9%BBl%3C%ECE%1C8y%98L%DD18%DA%E3o%B0%DE%EA%3ET%BA%C9%B0%2BLm%7FK%0C%8F%8D%DE%06%CA%CDE%7Fn%40%3BX%23%FE%DD%86%3D%ABV%FD0%AD_%BF%7B%E2SS%CD5P%D0S%01%11%7BAa%05q%15%C0%CE%EF%BE%9A%1A%D5%B8g%8Fj%A8%D8%AE%F6%AE%FBZm%FA%F8%93%EA%ED%CB%96%0D%BAz%F9%B2%9D%D1%F4%18%C2%F3%05%94%BB%C0Nd%19%02KL%CD%82%C0%BC%3C%1A%9B%2CC%02%24%10%7B%04l%7F%14co(%EC1%09%90%40%7B%02x%D8%CB%96%0Cg%D8%3D%EC%A5%BC%F1%C0%8F%FA%E0f%D3s%25Uuub%13L%D5%26%F6%11%CB%E5%ADD%08%AB%2Fl%8A%7Fg%C9%7BW%AF%BE3c%E0%C0%5B%F0%E6%A1%3E%95%17%80%C7J%BCV-%F5%F5%0AG%EA(l%22%AA%F6%AC%5C%A9%D6-%7CG%DB%B7%E6%2B%E5%F65%BB%94%CFW%E5%F6%FBK%A6o%2C%AF%8A%D4%D1%17%06%0F%F6455%89%A8m%DD%A2%A2%7D%1Da%23m%23%0E%82%C8Z%D7%3E%9F%DFI%80%04b%9F%80%ED%8Fc%EC%0F%8D%23%20%81%9EM%00Bh%24%08%2C%D3%3D4%08Vb%C8x%D0%7F%8A%87%BC%9CG%181D%B9%E6J%17%0F%A6%88%40%BB%BF%85%B0%BA-%A2%F1%EF%B0%C0%D2%BB%EE%CA%3F%E4%AA%AB%16%25df%96%04%7CM%9A%AF%BAF%D6%5C%A9%9A%B22%B5z%DE%3C%B5s%F1b%E5%C1%14%A1jl2%86%A1%7B%DF6B%24%0E%C5%A2%FB%C6H%5D%05%A7%C9(%F3%1E%A2%25w%A9%1F%D4Xj%01%D8%9F%10%C9%1E%F3I%80%04b%8F%00%05V%EC%DD3%F6%98%04%A2%22%80%87%FC%BB(x%B4%8D%93%C9%5C%0F%25%8B%DE%87D35h%BC-%F8_%94%B7%5Dse%A8%11%E9%9F%FC%B6%D4%E2%FB%98%CB7mZ%1BU%87%0FB%A1%5D_%2C%7F8)'%F7%BA%DAM%9B%B5%DD%2BW%B8%96%CD%9E%AD%FC%DB*%94%AB%A1%01%EF%0F%FA%D1%23%0C%D5p%D2%19%82%E8%23%08%A2I%D1t%15%FC%E5p%E9%8Bu%18%16%8E%3Ea%25%A2%17%97q%B0%B98%1A%9B%2CC%02%24%10%3B%04%B8%0FV%EC%DC%2B%F6%94%04%A2%26%0014%06%85E%5C%99b%A8%7D%5D%7DcL%C4%BFE%23%AEd%9F%2B%D8%92%AD%18l%C5%95%E4%19BB%C4%D5G%F8%9C%DB%95%C5%95%00%C9%1D1%F2%FA%3D%CB%97_%5C%F6%EE%3B%AE%CF%1E%FD%BB%16%D8%BCE%B9%EA%F0%D2%A0%88%2B%19E%8802%C66%11%C2%E9%BE%F60%AD%BE%A3%FCO%90.%DE.a%16v%1F%0Cq%25%E2%EB%CFV%F5%99F%02%24%10%DB%04%E8%C1%8A%ED%FB%C7%DE%93%80%25%01%08%AC%D7%F1%E0%3E%D5%10%05%ED%CB%98%8E%A6*%E4%17%40%60%C1%5D%E3%1C%8CMD%0F%17Q%60S%D2%B4)%F9s%E0%919%DF%A6%5CT%C9w%95%0E%F1%9Ez%D3%0D9I%85%85c%D2%8B%8A%0EI%EE%9B_%88%ED%16%920%AF%E6%C2%16%F3~%EC%9E%BE%BBv%F3%E6%0DU_%7D%B5%EC%EB%E7%9F_s%EE%07%1F%D4De%D8%A6%D0%DFG%8C%1C%E7mhX%84%B5V%D8%CB%CBv%C1%BE%E9%F5%931%9E%811%8A%E0t%0C%B8%0F%BF%00%B2%3F%D9a3%A0%89%BD%11%B0%87%7DK%19H%80%04%BA%0B%01%BB%1F%CB%EE2%3E%8E%83%04z%1C%01xXJ1h%99%96%13%3Dd%F97%8E%07%BBp%F9%11%1E%EA%B2%87%95c%90%E3oP%FE%F76%A6%CC%F5%5Dr%95%B6%9E%81%CD%E9%8E%06m2%9F..%C9%0C(%D7%E9Zj%EA%05%FD%A7%9E%3Aa%C8%B4%D3s3%06%0F%09%1E%87%13%17gN%B3%85%ADi%F2%E3%CD%BF%C6%DD%BB%97%E1%ED%BF%85%E5%AF%BD%F6%C4%E8%9F%FDl%A5M%13%8E%C9O%F6%2F%19%E1R%81OP%C8k%C7%0Dy%A6%C8%AA%C1%1B%88%05Wl%DE%EC%B8G%D6%CC%A2%A2x%AC%DB%927%26%F3%A4q%2B%BB%C6%BDx%01%DC.r%EC%203I%80%04b%8A%00%A7%08c%EAv%B1%B3%24%10%15%81%1B%F1%20%97%BF%ED0qexLD%A4l%F7%F9%7C%8FD%B2%26%077%1B%E2%CAr%9A%0B%F5C%BD%3A%E2%B9%EA%B0%B8%82%20%3C%14%F1%F9%80%16%D8%AE%E2%3CO%C7%E5%F4%9A%DA%EF%88%F19%F0Z)%EC%C8%AE%C9%19%84%A6%B8%B3%12(%9E%84%04%95%DC%B7%EF%C8%AC!C~%3A%EA%E6%9BW%D4n%DB%B6j%F3%5Bo%5D%F5%C2%C8%91%09%91%C6%17%9A%7F%F9%C62y%C3q%22%A2%DFt%C7Y%D4%17%A6%12%D3!%9C%9E%B6%C8o%93%04%01%26%1B%A7%FEV%EAX%F5%DD(%2C%0C%CF%06%EB%DCH%F6%98O%02%24%10%3B%04(%B0b%E7%5E%B1%A7%24%10%91%00%BCM%5E%14%BAX%04%82)JB%2B%C9C%5E%B2%E0%7D%B9%FD%EA%8A%0AY%C5%ED%18P%FCy%14%10%01%60%0A%8B%F6%E5%CDtY%FC%DD%A1iA%08%8A%22%08%AB%FF%C0%A0x%9C.%84%26L%D00%0BX%7C%F41*%B9%A8%9F%0B%1B%83*O%7C%F0%F4%1D%F1%F2X%8D%C7%ECL%A8xI%EE%D3%E7%90%C2%13N%F8%C7%99o%BF%BDi%CB%82%05W%B5%EF%B0%D3w%8Ca%19%DA%3A%D9%18%AF%60%D4%05%A4E%90%F4%B30%86%E3-%F2%DA%24aC%D1%C7%90%20%7Bh%D9%89Ta%E8%85%60%D3%17%C43%90%00%09t%0F%02%14X%DD%E3%3Er%14%24%A0%13%80%1E8%05%97%5C%3Bo%89!%18%AAq%FDG%24d%10%3F%97%A0%9C%ED%BA%2B%5D%7D%20%C0N-%DA%8B(4B%DB%83m%D9%01~%23%D2%A6I%B7uW%5B%5C%BC%CB%DB%B7%AF*%18%3B%D6%95%9C%93%2B%DE%2B%25%DE%2BYh.%E2*%D8T%A4%5E%EF%CF%F7%F6%EA%95%97%7F%DCq%FF%A8%DE%BCy%D5%E7%F7%DDW%1CmM%2C%CC_%80%F6nE%7B%821%CC%0B(v%8Cd%0D%A2%E8%A9Hv%B1%5B%BB%08%D9%7B%C4%9E%C4%F6%E5aK%1A%12%94Q%1F2%DD%DE%06%BF%93%00%09t%3D%02%14X%5D%EF%9E%B0G%24%F0m%08%5Cg%88%910%CF%8B!P%E4%01%FFwc%EA*R%3B%0FB%40%C8%83%3F%CC%96T4%C4%87(%831X(%1Fqo(%A9%03%0F%5B%1A%C4%95%2C%E6%96cvt%A1%A2%DB%81%90%0A%24%C4%AB~G%1D%A9R%F2%FB%AA%F8%F4t%85%8D%40%15%16%B4%9Be%1C%3DX%A1%031%FA%15LB%D7qL%CE!%C3%AE%BA%AAl%DB%07%1F%C8%B9%89Q%05%8C%E7N%14%7C%CD(l5~iF%C6%5E%80%F1D%B4%8B%A2%8F%C2%96%1C%8Bci%0B%E9r_%86%C0%23vXT%1Dd!%12%20%81.O%80%02%AB%CB%DF%22v%90%04%A2%23%80%07%7D6J%1E%8D%18%B6%10%5C%2C%88%1E0%AE3%22Y%84%10%92-%062!%20t!%D1%BE%BCh.%89%C8%FAm%B4%5B1%C0f%09%EAl%85%ADC%CD%BE%E8vE%BF%C5%25%A8%24%AC%B9%CA%1F3J%25%E6%E4%A88%1C%D0%2C%02K%82E%F3%ED%BBc%F7%5D%04%90%0A%B4%B4%B8%FC%8D%8D%9A%3B%3E%FE%A1%8F%FE%F8%C7%88c7%8Da%1A%F5%1C%D4w%12%8E%BA%E7%09%E5%EF%B6%EB%80%99%0E%C1V%8D%CFr%A8%B5%DE%A7%F6%C1L%83%BD%CB%DA%E7%F1%3B%09%90%40l%12%A0%C0%8A%CD%FB%C6%5E%93%80%15%81%E3%90%98%24%A2%C8%22%13%C9z%FA%A7x%D8o%B0%C8o%93%84%B2%7F%40%82%E5%3A.)(%C2%02%A1%1C%B6n%8BdK%F2%E1%99%19%85%F2%D2n*%EAJ%3F%E4%12%EC'.%01%BC%25X0i%92J%CE%CF%D7%BDWn%7C%87%F7L%17W%A6%F8%88%A6%1D)%23%E5%5B%EB%C8%F9%82M%3EU%BF%7B%97%DA%BB%E6%2Bm%F5%CB%AF%5C%3Bk%E0%60%D33%E5h%12%5E%3E%1F%DA%3F%D7%E0fUV%1F%07b%0A%C6%17%D1%8B%05%3B%BA%B83%87%1DjP%D2%10EyM%7D%BA%A4%C4%EA%FEY%B5%CF4%12%20%81.L%80%02%AB%0B%DF%1Cv%8D%04%3AH%C0%DC5%3C%DCE%12%14%02%22%3C%22zp%E0%09%BB%10%ED%A6%20Z%3E%E8aC%02f%EF%DCgF%D3%3F%F1%5CA%3C%2C%15%01%81%D8%D6%A6%EE%BD%8AW%09yy%AA%EF%A8%91*%B1W%2F%0D%FB%5D%89%F7J%DA%D0%C5%88D%F9%0C%8F%92%1EqBsX%B3za%04%E3%12%14Y(%E7onV%BE%DAj%D5%B0u%ABk%F5%AB%AF%A9%B8%EAjM%B5%F8N%C3%18%C5%9B%141%40%40%BE%8EB%8BL%FBV%15%8CqE%14%9A%F0%F4%BD%8F%FA%7B%C5%96%8D%3Da3%14%8B%E2%8B%AD%DAa%1A%09%90%40l%11%A0%C0%8A%AD%FB%C5%DE%92%80%25%01%08%86D%3C%B4'%19%FA%25L%18%99%0Ft%8F%C7%23o%05F%0A%BFE%01K%EF%15%EC%98u%E7B%7CD%3C%B8Y%D6%5C%A1%CEr%B1%87%18%D6%2FI%D20%15%D8g%F4(M%F7%5E%A5%A5)7%B6%5D%0847%BBj7mz%A3f%D3%A6%1F%AD%9C1c%F4%9F%DC%EE%24%F4%1D%BA%CB%E3r%23%BE%F7%A3%1F%15lz%E3%8D3%EAw%EE%FC%ABl%3A%0AEenY%DF%DAA%11b~%1CyS%BFc%97%DA%FA%F92U%B3%FA%2B%97jj2U%D8y%60v%7B%24%10%92%8F%FE%7F%DF%E8%BB%95p%95%7C%19W6%C6zb%14%F6f%8A%AD0%A1%19lG%B7%8F%BC%A8%84k%14m%B1%08%09%90%C0A%24%40%81u%10%E1%B3i%12%E8D%02%C5x0%F7%B6%B2g%88%22%11%01%8BpP1%14%86%7D%80%E8%18%02%3BC%AD%04%80%D4%12%01'%82%02%E1%06%7B%2B%FBsP%F6C%7C3%A7%05%DBV%11%B1%26%EB%AC23U%1Fx%AF%92%B2%B1%84L%0B%D4T%AD%5E%FD%3Fw%8C%19%E3M%2F.%FE%DF%B4~%FD%DC%C3%AF%BB%EE%A6%5B4%EDI%D8%FA%0Cq%05%E2%5BG%3F%F8%E0%5D%FDN%3A%E9%84%E4%BC%BC%8F%93rr%86%AD%9B3gbMy%F9%9B%BA%D0%92%01%8B%C7%AB%B9Yk%AA%D6%BDWj%C3%9Bo%2Bw%03%96S%05Z%F4%A1!%8A%98%F9%15D%D1%D4H%E3%80%E7i%23%CA%BF%144%BB_a%9A%F5%C4%1E%824%FB%F3H%B6P%C6%F4%9C%85%895%E9%98%D1%2F%D9%26%82%81%04H%20%C6%09P%60%C5%F8%0Dd%F7I%40%08%E0%C1%7D%BAA%C2%EA%C1%ADk%0E%84h%A6%C5%AE1%CAZ%81%15%3B%A2%AE%E6%C3%7B%25%BB%93%3B%06%88%B5%5BQ%60%B8!%40%C2%CB%8AX%C3%F4%60%E6%E0AZ%E6%80%01.%88%A1%3F%D76%F9%86g%1FvX%C3%EFV%ADz%0E%15d%23T%D9%BA%E0x%C4%C9%88%B2C%7D%3F%C4%91%88%C7!%8A%A7%E7%16%C49%83.%B8%E0%22%08%B2_%AD%9F3g%1Cvu%DF%22%02%AB%05%DE%AB%C6%9D%3B%B5%0D%8B%DEW%CD%10Y%AA%D9%87%A2z%10E%24%11N%AE%C0%D3%E8%A7L%87%3A%06%0C%5B%DA%D1%15%90UA%23%FD%24%D8%8A%B3%CA7%D3%20%D6d%A7x%9F%60%B4*%17%C4%EB%1A%8F%1D%E0e%3F3%06%12%20%81%18%26%40%81%15%C37%8F%5D'%01%93%00%D6C%1D%85%CF%A2%A2%C2%1E%DC%22%98d%C18%C2%ABQ%10%BB%D2%AE%8C!%0A%C4%FE%EF%ED%CA%98%E9%B2%89(%3E%CB%14%9Ch%B2%F0%E2%E2d%C2f%F3%81%C4D%ADh%DC%B8j%7FS%D3%F8%DCQ%A3%3E%CC-(%F8%1D%0A_%8Bx%02%E2a%A8%9B%8F%98%82(S%A0%01D%5D%9C%20%26%23%CA%5B%8E%25(7%1E%F1%1C%C4%3F%0C%BC%E0%82)%F1YY'%EE%5D%BD%FA%F1%E6%9A%1A%17%CE%2BT%9B%3F%FEXs5%E1%B8E%BD%1Fm%F0%88.%CABb%C4ui%D8%80T%8E%1E%FA%10%EDY%0C%069A%F62%D8K%F4o%0E%01m%CA%BA.%CB%20%FA%0D6z%E1~%E5%5B%16%60%22%09%90%40%CC%10%A0%C0%8A%99%5B%C5%8E%92%805%81gKK%DD%F0%C4%8C%B2%F3%AE%A0%96%08%92F%88%04%C7%B7%071%5D%26%82%26%13%E5mE%04%F2%D7%C3%CE%C7%D6%3D%D9%9F%8A%BE%C8%19%87%D2%25%3D%84%97G%12%16%B2%A7%94%14%EF%1At%DA%D4%D1%85%C7%9F%20%5B7%DC%8Cr%B25B1%A2%1CW%23%87P%CBQ3%B2Q%A7%ACl7%FB%25WI%93%7D%A5Dp%D5!%8A%08%93-*%AE%8D%8B%8B%FBI%C6%D0%A1O%D4%94%95%DF%BEq%E9R%97%A9%03%DE%5D%00%00%20%00IDAT%DA%5B%A94%BF%3FXW%F4%91%11%8DNI%FA%F4Y%FD%FA%1D%8Ak%A4%F0%00%0AX%8CE%AF%A6%A7c%0C%D1%EC%C6%3E%DF%AE!%8C%C1%1C%E31ve%98N%02%24%10%1B%04(%B0b%E3%3E%B1%97%24%60K%00g%0A%26%E3%C1%DE%2F%E4%E1%DC%A6%2C%F2%E4%A1%BD%C0%D6%80%91%01%916U%B4%90%B5%20%0Az%C7%90%17q%9A%11%D3d%22V%F4%1D%DA%ED%DA%C4%04%99%A6%12%93%AA%FB_r%F1%91I%C5%FDe%0A%F0%D7%E8%FF%08D%11R%B2%F7%94m%5D%1B%9B%22%B8%F6%A1~%16%FAx%01D%D6%AD%7D%8E%9E%FC%DA%CEM%5B%EE%81%92s%E1%CC%9D%E0%AE%F0%B2%E6K%A2%3B%18%B1b%1E%9B%9CJZ%FC%9Fl%EC%B6%26%83%8Fl%EF%E0%B4%86M%FA%7CR%24%3B%E8%E3%3Bve%84%BD%DC%03%049%13%91%81%04H%20%86%09P%60%C5%F0%CDc%D7I%40%08%60%3Ai%B8%5Cm%84%91L9%C9%13%FB%83H%B4P%FF4%A3%8C%95%B81%3D7%B3%22%D9A%FE%AF%EC%FA%A3%8B%40%89%106%E9%C3%86%9F%3E%F6%DCsG%A0%DD%3B!%5E2%90%DC%2C%02%CB%2C%F2%0D%AE%E2%A9%F3%C1%96%5Ce%DA%F0%CEs%9Fx%EC%C1%E4C%86%BE%934x%B0%2Bi%E8%10%958%24%18%93%06%0FU%89%83%8D%CFC%06kIC%07%9F%3E%F7%A6%9B%8B%9D%C6%86%7D%B1j%90%BF%00%B6%AD%F8%B4%F2%87'%F0%08'%3B%F0%00%AEq%CA7%EC%1F%E2T%86y%24%40%02%5D%9F%80%E3%82%CC%AE%DF%7D%F6%90%04H%00%04dz0%12%08Y%5C%1D)%C86%0F%22%1E%C2%8C%19%0F%FDM%C8_%EFd%04%E2B%D6E%9DmgGD%A0%AEO%E2%13%FE%7C%DA%D33e%1D%D5%1F%8C4K%D1%E2%D4%96C%9E_l%22%7F8%C4%E7%EF%A6%DE%7F%DF%D5%BB%96-%5B%11%F07%7B%B1B_%06'%3Br!%5B%D6%81%E9%83E%9Ftk7%A8%BF%DE%FB%3F%0Ev%25%EB_%88%A7%3A%95%C1%98%26!%3F%D24%AA%1Cp%AD%0B%E3%F6%C1%E01%B4%7D%3A%BF%93%00%09%C4%16%01%0A%AC%D8%BA_%EC-%09%84%11%C0%03y%A8%88%96%A0%A6%08%CB%D6%13%90%BF%CC%3A'%98%8Ai%BD%C1%F8%84%B92%DB%20%8Ad%09%DE%1E%945Q%B6%01%ED%C8%DB%8C%96o%C0%19%22M%A6%E7j%CE_%F6%F93%B2V%0Ae%FB%22%DD%D2%A6h1%E4%CB%AA%EFDx%A5D4%89%C7%5D%04Z%00%83m6%F2-%FB%22mIy%E9Ob%5E%DE%7F%93%F2%F2nO%EE%DB%E7%0F%FA%FA%2B%EB%A0%F9%AA%AB%CF%9AU%D8%EF%96%CB%B6l%92%B5%5D%96%016%C5%83%25%3C%C36M5%D3p%8D8%BD%07%3B%9F%A3%9C%AC%3B%B3%13%B3%B9%10%ABq%E0m%DB%17%CB%0E2%91%04H%A0%CB%10%E0%14a%97%B9%15%EC%08%09%7C3%02xP%CB%1B%7B%B6%CAA%ACb%7B%80%3DN%D6%F1%9C%B7%3DdX%84%83Qw%A1%93%0D%23%EF%02%E9KH%9D%D6*A1%01%9F%91%DBs%7BBB%FC%04%94%99%8A(%8B%D9%F5YC%AB%E8oiI%AA%AB%A9I%F5%C4%C5e%20%A6a%FB%F8T%C4t%14%CE%0E%F8%FD%19%88%22%A2%2C%EB%EA%BB%BEk%9A%07%D7%AB2%87%0F%FFO%9C7%B1%3E1%3BW3%A2%C254%BA2%06%0E%1A8%F4%EA%1F%14%3B%8D%11c%D8%8E%FC%ADV%C2%C8L%C3U%A6'%1D%03%FA%B4%0A%05%C2%C4%95T%0A%B1-%F7%95%81%04H%20F%09P%60%C5%E8%8Dc%B7I%20%84%40%A1%D5%03_%F2E%7C%20%C8%01%CB%8E%01%0F%FC%12%BB%02!%B6%1D%A7%BD%E0q%11%CF%D5%04%94%B7%5C%0F%86%BE%A03.%F5%BD%C5%9F.D%7BG%E3k%3A%A2%ED%9A%2B%88%A7L%18J%91%11%FC%F9%EE%BB%D5%E2%CF%3ES%10%5C%C1n%8A%E3%C7%E5%C2%CAu%D5%0B%E5%12%ECD%16%D2e%F1%FB(%C4%89%CD%F5%F5%8F%B9%13%E2%5D%EE%F88%89*%2Cb%F1%7B%C1q%C7%99%FB%89Y%E2%C0F%AD%F2fcyp%2C%E1E%8C~%F4%09%CFi%9B%02F%8ES%ADF%E9%E2Hv%98O%02%24%D0u%09P%60u%DD%7B%C3%9E%91%40%B4%04l%1F%E8%22v%10%CA%23%19B9%D9%BD%DD%A9%98(%9B%1DN%05%20.r%90%9F%8BhiH%17j%1E%CF%1Bq))%13%20%B0%246%19%5E%A60%0F%94!%AE%E2E%B0%C8%1E%5E%8B%17%2FV%0F%3F%FC%B0%9A7o%9E%AA%DE%B7Oaz1XG%3A%E4r%A5%A3%7C%9C%9D%C8B%1B%5E%E4M%AC%DB%B6m!*%E9S%A9VQDS%E6%A0A%B2%9FX%A4%F0%95%C3%18%A5%AE%07S%AE%05NF%D0%D4F%A7%7C%23%CF%D1F%14%F5Y%84%04H%E0%20%12%E0%1A%AC%83%08%9FM%93%40'%11%C0%193%8E%A1%C217%98%D9_%04%8A%95%C8%92t%84%3D%10%3A%95NvPn%8CQ_*%84%89%2C%DD%8E%A6%FE%83%BC!%F8%5C%88k%9D%95%3Dl%AF%9E%84i%C0V%C1%24ez%E30%E8%B7%17%2CP%0D%F5%F5%BA%C0%1A7~%BC%1A2t%A8j%81GKD%1A%82%BC%85h9%0D%8At%1F%FA5%3A%7B%D4%A8%97%9Akk%5B%12%D2%D2%C2~%F7%8C1%BA%B0_%96%ACE%8B%14D%609%05%0F%DA%EB%8B%02%B6%9EC%E4G%BC'%E8S%9ES%23%CC%23%01%12%E8%DA%04%E8%C1%EA%DA%F7%87%BD%23%81h%08%24%3B%15%B2%13%1E%ED%EA%F4%B5%12WR%C6H%AF%C6%F4X%ADS%3B(gn-%10%26%AE%CCz%C5%E7%7Fo%0D%FA%23%5E.%FB%DF%1E%97%2Bl%3C%F1%F1%F1*%1F%87Ao%D9%B2E%3D%FD%CC3j%CE%9C9j%D7%8E%1D%B2%81%A8%AE%E4%20%C8%5C%10f%896%FD%13%056%10%ED%164UU-j_%C6%10Wz%B2'%D1%DB%FF~%97Jh_%26%F4%3B%CAo%B4c%15R%CEQ%F4B%14Z%8A%C1v%ED%CA.%F3%0C%24%40%021J%C0%FEG.F%07%C4n%93%00%09%EC'%20%E2%01%9E'%D9%BF)R%90%ED%15l%CB%40P%D4%DBf%EE%CF%10%AF%94M%80mO%9C%1Aq%F3%CD%0D%10%17%E2m%B2%5C%DC.S%7D0%A0o%E5%60F(%3C%15%07%81%95%98%98%A8%B2q%20tFz%BA%FA%7C%E9R%F5%AB_%FFZ%AD%5B%B7N%D5%D5%D6*%3F%84%16%82L%05%86M7%22M%CE%1CL%40%99%9C%B8%E4%E40%EF%93%A9%06%B5%80_y%92%93%D2%13%92%92%9C%DE%A6%14%C1%B9%DBf%90%AD%C9h2%DD%A9%0C%F6%D4%92%B5%5C%B6%01m%C8%5B%8A%11%CFH%B45%C0%0C%12%20%81%83N%80%02%EB%A0%DF%02v%80%04%0E%1C%01%F1%B4%E0a%2F%3B%A3G%0Av%DE%1F%BD%1El8%ED%60n%DAN%92%A2%D6%0Da%DD%13%0EvN%CA%C8%C8%40%BEx%A8%EC%16%B7%B7YK%25k%A6%24x%B0%00%3D%D1%EBUIII*55Ueee%A9F%1C%E6%7C%C7%1Dw%A8%F7%DE%7F_%9F6D%10qfiW%D2%11S%E2%D3%D2%AAt%83F%10%EBz%0Bh%07%3BA(%17%DAI-(%88%24%B0%9AD%C8E%08%96%5BUD%A8%13%9A%ED2%A6%3E%3BP%85EI%80%04%BA%12%81%B0%B5%08%5D%A9s%EC%0B%09%90%40%A7%10%88%A8%06%D0%0A%B4%98%ED%CC%9Et%22*%1Bb'%BC%C7%F0*%C9%8C%20%04%12%84%89%88%17%5B%F1%60%8A%9DP%1B%92%26%02K%A6%09%13%12%12tO%96%2C%7C%97%85%EE%F5X%93%F5%E4%93O%AA%AA%CAJu%FC%F1%C7%BB%F2z%F7%F6%B6%04%02%3E%EB~%A8x%8CRwu%B5%06C(%F9%03%FB%B7%9B%F2%24%26Z%8C!%B4%8A%BD%BA%0A%11%5E%DF%FA%1F%AF%18%A3c%3F%DA%8C%83_H%80%04%BA%1C%01%0A%AC.wK%D8!%12%E8%3C%02%F2%C0%87p%8A%F8w%8Er-2-%85%96%ED%1E%EA%D1%D8%90%CD%40%C3%3B%8F%AD%AF%5C%D8%16!.W%5E2T%D0%3F%01CG%85k6%99%CB%83z%0A%B3%E1%86%5D%11U%22%B4%24%CAg%99%16%14%C1u%F1%19g%A8%11%87%1D%A6%D2RS1%C3%E8o%C1X%C2%3A!i%A8%D3%12hjJ%82Rkc_%A6%06%95~%04%22%AA%A1%9D%FA%AD%15%FA%AAy%87%20%8B%D8-%B3%0D%8F%A10%B7%DC%3C%D5%B2%92E%22%FA%2Bp%C2%01Y%94e%12%09%90%40%D7%24%10%F1G%B3kv%9B%BD%22%01%12%88%86%80%F1%C0%8F%B8%96%07%E5j%F1L%CF%B3%13%0EhK%A6%FF%1C%03%04%CC%EE%10%0F%8EQ6%A8%D94L%0F%F69%FCpU%BFcG%5CBvv%23%DA%09%1E%99%D3%CE%22J7%9B%D3%82%ADY%ED%D6U%E1pk%25%82%0B%DE*u%F2%C9'%AB%E1%C3%87%2B%2F%BCZ-~%BF%CF%1F%9CW%0BS%3FhN6%1C%AD%0BTW%0FH%C0%14%A3%04%B3%AF%C1%8D%E1%83%A2%AE%A5%BE%3E%E0k%A8k%EB%E5%0A%1Fu%9A%D4u%60%255%1C%D7%AC%3D%96%9F%2F%08%C2-%EFO%91%7C%EE%E2%EED%88y%24%D0%C5%09%84%FFS%B1%8Bw%98%DD%23%01%12%08%23%10%C9%E3%92%19V%23%3C!%D2%C2%EDT%EC%ED%E4%F8%0F2%88%8E%0Daf%83%F3%7BJ%83%A8%C9%1F%3DJ%B5TWg%A3%5C5%A2%A5-%D1%5DP%3E%BA%F7GD%8C.d%10%B1%B0J%04%94%AA%A9%A9%C1L%A3W%1D%3Ej%94%3A%E1%84%13%D4%A4%A3%8ER%89%C9%C9z%1E%DCW%F5(o%A9Z%90.%EB%A6%F6%A2%3BcB%FB(%E2J%DA0%9DE%BE%9A%9Am%B5%0D%8D%91%BCO%F9a%E3%0COh%B3%D6%AB%7D6%3CoY%C1v%DB%E7%EC%FF%0EAXm%9F%CB%1C%12%20%81%AEN%C0%F2G%AE%ABw%9A%FD%23%01%12%D8O%00%A2%A4%12%0F%EBl%2B%8F%88%F1%10%8Ff%3F%A5%CD%A8%EFt%C4K%26%F2E%A89%09%B1%F0%F3%0Ee%91%3D%BCW%BD%06%0FR)%05%F9*!)q%24l%ECD4%A7%F2%C2%A6%C1%D0%E7%1A%A8%A4%5E%E6x%E4%80f%D9%C1%BD%BE%AEN%E5%E6%E6%AA%B1c%C7%AA)S%A6%A8%DE%7D%FA%A8Z%BCA%A8%1B%08%04%1A%E1R%D2%85%A6%85p%81%C3%CB%B5%C5%D7%D8%B8%2B3%2F%AF%14%F9A%B7%9AT%F3%C3I%84o%C1I%CB%80%16h%F6%AD%C3i%CF%91%3CX%03%A5%1D%87%20M8n%CA%8A%BA%11%EF%89x%04%1D%DA%60%16%09%90%40%17'%40%0FV%17%BFA%EC%1E%09D%22%80%87%F9.%2Bq%25%F5%8Ct%87%ED%13Z%AD%EBG%B7X%88%13%3D%19Q%8E%B5q%DC%DB%09m%ADi%B5%A6%7F%08%EA%98%00%A6%EF%0A%C6%8FUI%10G%9E%A4%E4%EFC8%C8%5EX%B2%D1%A6%E5%DBz%B0%23o%02%B6%F1%DE446%AA4l%CFp%F6%D9g%AB%F3%CE%3BOe%F5%EA%A5%24%CD%10Wx%FD%CF%E5%B4G%97%ECk%F5%99%BB%AEn%90%1B%0B%E3%25%08%17%F1%5E%05p%92%0E%FE%0B%3Bh%12%3B%23%F8%9B%9BW%E8%05%9C%C3%A1%CE%D9J%A6%F6l7%19%95%BA%18_4%F7%24%E2f%A4%11%FA%C1l%12%20%81%83H%80%02%EB%20%C2g%D3%24%D0I%04%B69%D8%11%0DR%EA%90%AFg%E1%81%FF%B5%88%2B%1B%A1%A6O%BB!%7F%90%93%9DK%CB%CBe%BF-%F1b%05%BDR2%5B%87E%E8%C9%D8%204%F7%90C%947%23SK%CE%C9%CD%A9%DD%B0A%B6%8DX%8E%D8v%B5y%88q%F4%C3%87%F6d%E7x%99'Tu%F0%5E%FD%DF%FF%FD%9F%9Av%E6%99%FABt%AC%94%D7Kc%A3Q%F1%5C9%EE0%0F%5BnL%B7%BD%87%1F%BB3%0C%D7Up%9F-%D8pinD%2C%C2%87%9B%0CK%E8%D5%EEO%3E%9B%17%D2%0D%BB%8F%03%F4~Y%04%F4Y%D2%9B.%DB%B8%D1q%EF1%F4i%80%0Dk%E1%AC%DB%C6e%B3E%13L%22%01%12%88%11%02%14X1r%A3%D8M%12p%20%B0%D1%7C(%5B%94%11q%14%CD%02u%DD%FBd%3C%DB-%CC%60%EBu%B7%FBx%CB%8C%B6%89%0Ba%23%B8%0EJ%BCDxc%AF%EF%84q*1'G%C5%A5%A6%E2%2CB%B7JJK%3B%1Fe%A4%9C%08%AD6%9B%8AJ%FBfD%9E%BCq%B8%17%C7%E1%04n%FB%DD%EF%B4%FE%FD%FAi%FA%A6%A2--~%11V%B8V%8A%E7*%B4N%FB%CFb%1F6%96%D6o%D8P%99ZX8A%8C%1B%F3%88%B0%0E%17Z%00o%25b9%98%3B%E0%D1%B4%BA%26%FF%D7%B3_%FC%D0i%8C8%D0Z%5E%85%2C%858%B2%5C%EB%25%E9hb%A5%93%0D%23o%10%CAY%8A%B4%10%DB%D1%1C%08%1DES%2CB%02%24p0%08P%60%1D%0C%EAl%93%04%3A%97%C0F%98%B3%7C%E0%9B%0Fq%2CP%1F%E6%D4%24%B67%F8%5C%F2E%1F%D8%94%13S%13m%F2Z%93Q%E6%09%FD%8BX%C1%DA%2Bwv%8E*%C4%DB%83%5E%EC%C0%EE%817K%EC%A7%F5%EBwb%7DY%99%2C%02%7F%13%E5%93EgXE%08%23%11%2B%1A6%FF%DC%97%9E%95U%85%E9%BD%BDxKp7%04R%25%CC%D7%C2%98%E5n%F0%A6-%BD%1B%9A%96%84%F8Xr%AF%5E7K%3A%16%C2cA%97_%B5%F8Zd%11%98j%86%DC%F2%05%FCZ%0B%AEuU%95%0B%A6%BD%FA%1F%7D%C7R%BB%00%1BC%91g%BB)%AB%B4%811%3A%8A4%A3_%23%EDD%9A%D1v%D84%A9%5D%9F%98N%02%24%D05%09P%60u%CD%FB%C2%5E%91%40%D4%04%F0%A0%FEB%0A%8B%18i_)%E4!%3E%AE%7D%5E%E8w%1C%DD%22%9E%A0%0ADK%A1%26v%10%C6%CC%2C*%EA%E5d%E7%F2M%9B%C4%7B%F3%25%ACh%F0%5Ei%05GL%D0%A7%08%13%D2%D2%95%AC%7F%D2%CF%0C%84%C8J%EF%DB%F7%8Fh%EB9%C42%D8u%7C%D9%06%F9xIP%DF%DF*l%7C%0E%7D%91%DF6Y%E35%A7%A9%BC%3C%C7%9B%95u%04%0Ez%D6%10U%13%DEDl%AC%DD%A7%1A%EB%F6%A9%A6%BAj%E5%AB%DB%E7%F25%D4%BAv-%5D%F2%90%83%3D3%EB%3C%F9%60%D5%173%0D%FD%FD4%0A%3Br%3F%9C%C6%B3%06%2C%9D%F2%A3h%82EH%80%04%0E%26%01%C7%1F%B6%83%D91%B6M%02%24%10%1D%01%3C%D8%97HIQ%40V5%90%2C%CF%FE%09%C8%9Be%95o%A6%A1%DC%EB%F8%FC%03%D11V%A6%90%1E%8FM%3E%8FA%99%7F%3B%DAQ%EA%3E%BC9%F8%0F%0F%16%B5%F7%1F%3F%5E%25%E5%E5%E1%10%E5D%11Wz5y%A5%2F9%2F%AFh%D7%CA%95%E7y%F2%F3g%C0%E6%FF%229%0DQ%3CR%22*%CCq%C8y%7C%BA%C8%90%FE%98%02%26%E4%BB%3E%BDh%E4%85%D6%91%DF5%F1%00-i%D9%BB%E7El.%FA%E2%BE5_%E9%96est%AD9%B8%0BC%B0)%98%0D.%C6%DF%BA%F0%B2%2B_%13%DB%11%C2%89%C8%97~%D9%B1%96~.p%B2%F1tII%3C%BCs%B6%5Bg%18%E3%5C%EDd%83y%24%40%02%5D%9F%00%05V%D7%BFG%EC!%098%12%80%40%A9%80%87GT%83%DD%A2q%11%03%C7%3A%1A%09f%CE%C7%E5%076%DAA%9F%DEC%F8%01%CA8%0A%2C%A5y%9E%D2%12%12%EE%E8s%C4%84%BC%D4~E%0A%E7%FF%B9%DC%B2%7B%3A4%89)%94D%DC%E4%0C%1F~%E9%C6E%8Bv%24%0D%1A4%1B%C7%DE%9C%89q%E4%20%5D%D6L%85yn%8C%B6%A5%972%16%0D%EB%C1%A4%2F%D2!%5D%EB%88%3D%09H%97%B3%0C%7D%E0%B1lOE%C5s%1Bg%CD%9A%A9%B5%B4%24%40Ca%2Bx%2C%8E%AF%AAR%1A6*%95%80%5D%E3%E5%E2%92kBV%D6%5D%3F%AC%ADr%DC%D8%13%EB%AF%86%C0%F60%2B%3Ezg%82%9D%DC%82%05%EE%BB%F4%06l%02%C6g%AEe%0B%15%93%A1%A5e%8C%D1%BC%CDh%D3%02%93I%80%04%BA%02%01%0A%AC%AEp%17%D8%07%12%F8%16%04%BE%BFaC3%D6X%7D%8Eg%FC8%5DmX%87C%AC%93%F7%A7B%E4%FC%1B%0B%CAuO%91%8D%1D%B1%3D%F5%C9~%FD20%7De%BBV%E9%D2M%1B%7CO%9F%FB%BD_%15%8D%19%FD%0F%2F%16%B7%C7c%23P%5D%5C%C1%83%25B%C8%10%22Z%B3%CF%A7%F5%19%3B%F6%7F%BE~%F7%DD%07%E3%FB%F7%FFOzz%FA%A98o%B0%2F%F2%E3%20B%14%FA%22%BB%AF%8B%92%D2%85YP%BF%04%BB%26%9F%D1%17%F9%A2%AB%249%3EG%3ECX5655-%2B%FB%F8%E3%7F%97%FF%FA7w%B7%F8%5B%B2%F1%9E%A0Kv~%97%E0j%0A%3D%F7%1A%FA%2C8K%B7%D5%BDu%EB%8C%FD%24%AC%3F%A1%1F7H%3F%AC%F8%18c%92%8A%2FX%D7%DE%9F%8A%FA%C7C%08%EA%DDq(%FB%8EC%1E%B3H%80%04b%80%00%D7%60%C5%C0Mb%17I%20%0A%022M%E8%F4%C0V%F0%C0%9C%EAd%E7%92%F5%EBe%8AnQ%24%3B%10%13%3Fr%B2%23y%D3%FF5%E7%B1%CC%01%25_%26%A4%A7kP%3F%BA%40%92%60%5EE%C3%89%88jnn%D6z%8F%1A%F5%A3%86%ED%DB'%7D%FC%DE%7B%2FTVVn%C0Q8%01%A4%BB%11%E3%F09%01W%2FDSbccc%92q%95%CF%89%3E_%93%17y%F1%10U%1ED%CC%046%D6m%DE%BCy%FE%CB7%DE%B8%7C%D5%CF~v_%7D%7D%5D6%BCU%D8%F0%01%1E%AB%A6%26%E5%F25%C9%FC%A4%B8%B9%24%06W%9BI%870%9E%E90%E04%26%88%CA8%14%BD%CAJ%5C%19%F5%CC%A9%CC%D9Nv%0C%06g%8Ah%B4%09z%06%F2%97%DA%E43%99%04H%20F%08%D0%83%15%237%8A%DD%24%01'%02x%20%CF%83%00%B8.B%99i%C8w%DC%E7%09%9E%95G%60%EB('!%81%BC%9F%C1%CE%1F%9C%DA%92%BC%1D%9F-%99%9A9dh%99%DB%E3%11%17%94%24%B5%11%80%86%D7G%CEw%D6%D2%0A%0B'%F6%D6%B41%FF%7C%EC%B1%D9%89yyK%8E%3C%F2%C8%13%FB%F4%E9S(%9E)%A8%0D%993%D4%A7%03%8D6u%CF%95x%81%10%5D%10%5BM%EB%D6%AD%5B%BA%E0%B9g%3F%8E%7B%FB%ED%D33%5D%EE%11x%CDOK%90%05WF%AB%A6%B0%0B%E9%B3i%EBEL%E9%BD%12%92n%F9%11%F5%AFA%FBI%16v%CC%F2bo%0F%F6%02%5Bli%C0H%84%C8%95%0D%5B%87%E0%AB%DD%F4%A0%94%5C%01%0F!%8F%C9q%02%C9%3C%12%88%01%02%14X1p%93%D8E%12%88%82%C0%07F%19%AB%07%B7%99v!%CA%5C%EFd%0B%02%E1YL7%3E%23%E2%C7%AA%9C%91%9E%852%3F%840y%D4%AA%8C%996%E2%FA%EB%CA%B7%1Ev%D8%0D%7D%8E%9C%F4%90%B8dPW%EF%07%3E%EA%9E%2C%11H%10P%D8%85%C1%A30%3D%A9R%B2%B2%E2'%9Er%CA%F4%8A%8D%1B%7D%FF%9E%3D%7BqYY%D9%F2%A1%23F%E4%96%96%96%F6NNI%F1%F6%EA%D5%2BY%A6%FA%20%A8%1A%EB%1B%EA%1B*%F7VV%AE%5C%B1b%FD%CEO%3FM%C8%DE%BBwdz%5D%DD%F1IhA%D6%B1%8B%A0%936l%86%A1O%F3%A1%2F%15%E8%C3%C5Nc%08%C9%BB%03%9F%AD%D8J%111'%BC%1E%88d%0B%E5%CE%912v%7C%25%0Be%22n%F3%10%A9%1D%E6%93%00%09%1C%7C%02%96%3F%A2%07%BF%5B%EC%01%09%90%40G%09%40%F4%2C%C1%83%7B%14%EA%85%FD%5D%1B%82B%D2%C7A%189zY%60g%06%EC%FC%D0h%BF%BD-%C3%94%AA%83%1Dy%F3%2Fb%D8%B3j%D5%8C%ACa%C3%AE%D5%17%60I%E7Di%E1%A3%CC%CAa%0AP%04%93jhh%90s%05%B5%7D%FB%F6%B90M%A8_w%EE%DC%A9%1Ajj%02%D5%7B%F7nk%F0%F9%AA%B0%C0%AA%B1%A9%B22P%BBy%8B%C7%D3%D0%90%1AWW%9B%E7%DA%B7%2F%2B%016%92!%D6%121%ED%97%0C%C1%E6%85%B0J%40%8CG%C4%BC%9E%92u%10%E6%1A%2Ci%DF%18%40%0B%BAQ%00A%E9%B8%20%5D%CA%83%C7Oq%B9%D7N%AC%196E0%26O%2F%2Bk%90%EFv%01%B6%16%22%EFX%3B%5B%06%A2)%60%FB%B6%9D%0D%A6%93%00%09%C4%06%01z%B0b%E3%3E%B1%97%24%10%0D%81%F9x%40%8F%B6yx%9BBi%3A%0C9%0A%2C%D4%BF%1Dv%AE%B5%B3%23%E9%C8O%85X%B8%13B%E0%97%91%3A%96%7D%E8%A1%D7%ED%2B%2B%EB%97%5E%5C%7C%9A%88%1B%09%B0!A_%9C%8E%85%ED%BA%F6%0A%F8%F5%8DEu%CF%967%D1%AB%92%92%92T%7D%7D%BD%DBWPP%D8%B8o_a%5DE%85%DA%F4%C5%0A%D5%B2v%AD%F2%E0%90f%11O%10RZ%22%BC_%5EL%07BP%B9%DA%0B%2B%19t%A8B%94%B6%25%09aL4%E2%0ASz%B2Q%E9%DD%D2W%B3%DF%ED%C6%AB%8BF%E4%BD%1CI%5Ca%7B%86tL%87%1E%2B%C5%DBu%CB4)%5C%EAQ%C6%F1%FE%B4k%9F_I%80%04%BA(%01.r%EF%A27%86%DD%22%81%8E%12%C0%C3%F99%BB%3A%22%10%10%E5%01~%B9%5D%193%1D%C2C%CE6%94-%1BD%08%E8%02%A2%7D%10%7B%08%B7%60%F1w~%FB%3C%AB%EF%19%25%25S%AB%D6%AD%7B%11%F5Z%F5%8E%7C4%05%96%D7%EBU%C9)%C9*%23%23Ceee%B9r%B0%03%7C%9F%DE%BDU~%DF%BE%AA%2F%F6%D3%CAMKS%A9%D8%BF%CA%B3c%87%CA%C2%1C%60%16%84Y%26b%06%3CV%A9%10W%C9%B0%85%05RJ%BCW%E2%B9%92%1DF%C5ke4f%8A%20%B9%8A%E7j%04%C6%18%D56%08%10N%B3PG%FE!j%FBf%25%CA%E0%05I%F7%CF%AD%C6%1D%9A%06%E1t%99q%1F%DA%7B%05u%F1%26v%10%179%BD%A1%19%A9%0D%E6%93%00%09t%1D%02%14X%5D%E7%5E%B0'%24%F0%AD%08%E0%01%FE%25%1E%E0%EB%60%C4R%14!%5D%1E%E0%E9%F0%CA%E8%EB%80%22%84%1B%E5%81oWFW%03%22%D8%DCny%EB0%AA%905h%D0%F7v.Yr%07%D4%84%F4C%EA%EB%DE*Y%7F%A5%0B%2Cl%E7%90%9A%9A%AA233U%0E%B6w%90%D8%3B'We%A7%A7%ABL%D9%C3j%C3%06%95%857%013Q%2F%03u%D2!%B0R%11S%60C%A6%08%93%10%C5%83%25%9E-%8F%D8F%AF0%00S%5CI%1F%2B%D0%A6L%0BF%25%AE%C0%E9t%D4%F9%9E%A1%09%C3X%60%08%E6t%E3%7C%D8%DC%10%05%049%AE%C7R%B4%A2%0D%D3%FE%CC(%EC%B0%08%09%90%40%0C%10%A0%C0%8A%81%9B%C4.%92%404%04%E4h%15%849(%ABO%B5Y%04Sl%FC%C2%22%AFM%12%A6%FED%A8%BDdc'%B8H%5B%17%60%AE%92'%C7%8C%7B8%92%3D3%BF%F7%D8%B1%BF%DE%BAp%E1%E9MUUU%86%A6%90MCu%91%95%88%DD%DEM%91%85%3D%B1T%AF%AC%5E*%0BWx%A9T%C2%BE%7D%CA%0F%81%95%81q%A5%A1%3C%BCV%ADQ%84%15%A6%08%F7%AF%BBBc%F8a%D3B%D6%5D%89xy%11%ED%14G3-(%7D%85g.%17c%7FYD%A4%DD%D8%24%0FA%B4%91%B9%5E%CD%AE%A8%D8%3B%0A%99%C5%86%90%B2%12k%D2N%0D%E2%1B%B6F%98A%02%24%10S%04(%B0b%EAv%B1%B3%24%E0L%00%0F%F0Y%22%8Al%84%81%3C%D8%E5A%3E%1E%EB%A7%0Ew%B6%84%82%C1%5D%DB%F5%3A%12%DA%96%97%AF%C8JN%D62%87%0C%BEn%D3%BCy%17E%B2g%E6%17M%99%F2%DA%A2%1Bo%2C%DA%FB%E5%97Oc%A5%3Bv%01%D5%7F%86t%8F%969e(b%2B%15S%86%C9%F1%10%5E%CD%3EU%89%B5Wi%0D%8D*%1Dm%A6C%8C%A5%89%E7%0A%11%0B%DBuq%A5O%0B%22%A2G%BA%1D%DD%60%B0%CB%5B%F1%F1%2C%08%C6%EFa%8DT%F0%8C%9C(%3A%0A%1Br%9E%A0%E1%04%B3%AD%20z%E9A%88%B6M%B6%25%8C%0C%94%FBmH%9F%DA%147%FA)%9D~%0B%FD%AC%8Cd%8B%F9%24%40%02%B1A%80%02%2B6%EE%13%7BI%02Q%11%C0%C3~%0D%0A~%2C%9E%15%5C%C3%BC%2F%A2%08%0CC%B7E2%08%8F%98x%99~)%B6B%EA%05%AB%89yo%A2%8A%EB%DD%DB5%FC%9C%B3%B4%94%92%92%E7%D6%CE%99%EDx%A0th%7B'%3E%FBl%1D%16%BF_%BA%E2%91G%86%EF%5B%B7%EEU%1Cg%A3%F7K%84%9C%DEElB%EA%C7t%A0%AF%AARU%AD%DF%A0v-%5B%AE%5C%FA%19%82aC2%AB%99%D3u%A1%C2%EAF%F1ZA%B4D%DC%E7*%B4o%10%9F%AF%E2%BBx%9BB%93C%3FK7%25%EC%C3%B4lDo%20%BCW%C3Py%0A%EC%B5%8A%BFPc!%ED%FC%C5%AEA%A6%93%00%09%C4%1E%01%0A%AC%D8%BBg%EC1%098%12%C0%83%DF%7CP%5B*%04y%D0%C3%C04%08%89C%1D%0D!%13%82%ED%8F%B8%C8I%C9m%95M%3C%8E%F7%C3%F4%DD%88%0B%CEW%19%03%06%B8%92rs%B4~'%9E%BCh%D5%E3%8F%8F%88d34%FF%F0%1F%FFx%15%D6fM%5Bz%D7%5D%25%7BW%AD%BA%A7~%FB%F6%F5p%BF%E9%E7%046%D7%D4j%F5%DB*%D4%FAw%DFU%9E%DAZ%1C%05%ED77%2Cm5a%08%1Ds%9C%01%8C%ED-%C4%B3%20%ACJ%20%AC%1E%84%D7%CAq%87%F6%F6%7D%05%93g%916%D5%60%D4%3E%3B%F4%3B%8A%B8%AE%BAb%F3%E6z%A7B%92%87%BE%08C%09a%F7%C3%E8%BF%B0%5D%87%FE%9A%7B%99%19%C5y!%01%12%88e%02a%7F%F0%B1%3C%18%F6%9D%04H%20H%00B%A1%02%9Fz%1B%DE%91%B0%BFsC%2F%BD%8E%87%FA%D4H%CC%B0%D8%7B%18%CA%AFj%15%1D%EE8%97%1Fo%F5%0D%3E%F7%1CUr%C2q*%7D%40%A9%F2fe*w%5C%BC%E6%C7%AE%EA%EB_%7Cq%E2!%97_%BE%2C%92%5D%AB%FC%A7%FB%F7%8F%1Br%E5%95%C5%85S%A6%9C%EEN%88%3Fj%D7%AAU%83%17%DF%FF%60%7Fwee%3A%F6q%08%AD%22g%10%CA%DB%8E%B2Vl%05%FA'%3B%D9%7F%88%F1%D8%9E%91h%D5%5Eh%9A%88%2B%D8%B9%18%82%C8%14%93a%DC%A4%BC%B0C%5B%2FA%7C%9E%1B%85M%99%8A%FD%DC%60giO%8E%0CB%FE%D5%E8%FBc%91%EC1%9F%04H%20v%08X%FE%C1%C7N%F7%D9S%12%20%01%2B%02%98%96%BA%09%0F%ED%FB%0C%81eUD%8E%A8%91%ED%05%26A(%7CdU%204%0D%E2C%8E%E1y%D8%E5%81%88JMq%95N%3B%5D%95%9E4%05%E2j%A0%C2%16%EB%CA%83%B7%00e-%95%1C%7B%A357%FB7%CD%9F%7Fr%E9%D9g%2F%88d7%9A%FC%A7%A6LMPe%1B%3C%81%E6%3A%D9%7DAV%96%8B%A7%CA%8F%BE7%A3%EF%1D%F2P%D9%B5gL%0B%EA%9E%2BC%40Y%FE6%EA%99%10v%D8%24%B5%F4%CA-%5Bp%B8%A1s%80%DDwas2%AA%E1%D2%D6%A4aK%0CT%81%5B.%BCa%9D2%16%E7%1E1%97%04H%E0%BB%22%60%F9%23%F2%5D5%CEvH%80%04%0E%0C%01x%9D%E2%F1%00%DF%03%EB%A9%D2B%D8%D3%1Di%C6%03%5E%A6%A6%06G%D3%8B'%07%0E~EKJ%3Cc%00%C4%D5%80)'%A8%F4%D2R%95%D8%2B%5By%B0%20%5D%C4%95%08%08%89bW%C3%E2u%2Cb%BF5w%E4%C8%3B%A3%B1%7D%B0%CA%C8%DB%82%E8%B3%2Ch%975WN%9E%2B%3DO%84%12.%87%83%D9%F2H%7D%C6%3D8%1B%E5_%92jV%FC%0D%7Br%F9%05%EC%DD%1D%C9%1E%F3I%80%04b%8B%00%D7%60%C5%D6%FDboI%20*%02%F0%EC%C8%8Ap9%3FO%9E%ED%96%FF%902%D2%07A%08%C8%E1%CD%11%C3%9A%CA%AAs%06%9D%7F%DE%97%A5S%C4s%05q%95%9D%AD%99%9E%2B%A9l6%A37%88%03%9EsF%8C%F8C%CD%E6%CD%AF%FEF%A9%84%88%C6%0FB%01%D9%E7%0A%3D%95%A9%D4%FE%B8%3A%89%2B%7DZ%D0%10W%17G%23%AE%20%DC%E2a%F7%09D%CB%85%ED%86%3Di%B3%06%9E%B8%7B%0F%C2%F0%D9%24%09%90%C0%01%26%40%81u%80%01%D3%3C%09%1C%2C%02%E2%15%C1%83%BCJ%1CJV%7D0%D2%25%EF.Le%F5%B3*%13%9A%F6%C7%3D%3B%FD%99%B9y%13R%FB%F5%DB%01q%A5%3C%09%5E%AC%BB%8A%D3%05%04D%82%F9%F6%5E%1B3)%85%85S%7FU%5B%BB%AF%E2%A3%8FN%8Bd%FF%BB%CA%97%E3o0%DE%7Fb%FCs%D1wl%97%A5%0BP3%86u%C3%E0%24%F9%B7%80%E9%F3a%05%2C%12%60r%06%EAaO%D4V%DB%EDK%09w%99%8F%FC5%16%E2%B7%B4%CF%E4w%12%20%81%D8'%40%81%15%FB%F7%90%23%20%01%5B%02x%BE%CBA%C5%B6%1E%2Cy%FE%E3!%2F%BF%03%FF%B65%12%921%FC%DAkk7%FD%F7%BF%C3%03%3E_5%C4%95%BE%A1iPC%EC%F7%60IqCX%E8sjq%C9%C9%DE%3EG%1C%F1Z%DD%8E%1D%EF%7Ft%CB-%FD%A3i%E7%40%95%81%B0%FA)%BAT%0D%FB%B6%3B%B4%87%B6m%8A%2B%5C%EF%85%B8%FAS4%FDB%1B%C7%A0%DC%0FL.%16u%CC)%C3%1D%D8%0A%E3o%16%F9L%22%01%12%E8%06%04%2C%7Fx%BB%C1%B88%04%12%20%01%83%00%1E%F8%B27%D6%20%E3%81%1F%FE7%2F%D3_R%D6%E5%FE%E3e%E5e%11%0Fo%96%A2%2Bg%CC%C8%2B%BD%E0%825%DE%AC%AC%CCp%83%D6%E8E%AC%88%F0%AA%DB%B6%ED%A5U%8F%3Ez%CB%84%DBn%5Bk%5D%B2sS1%5D%87%D3s%5C%D7%C0%AAL%99f%19%1Ct%0F%92CK%86%B6%D2%BDL%F7B%08E5%8D%8A%B6%D2a%7F%3Bb%A2a%DB%B2%0D%D8%94%EC%D3%20%DA%E69%F4%81Y%24%40%021L%C0%F2%8F%3F%86%C7%C3%AE%93%00%09%B4%23%20%1B%5Db%0Ao%95.pZE%C5%FEO%98%DF%C3fM%1E%9C-%E3QMiiG_%B3%E4%B3%F7%A3%81%F8%D1%AD%B7f%8E%F8%F1%8F%97%25%E5%E5%F5%97%1F%12S%409%D55%CAH%11W%ED%B6m%1F%EEY%BE%FC%81e%0F%DC%FF%DAY%F3%E6%CB11%9D%1A0%158%04%ED%DD%00%B1s%15%AEI%D2E%11x%D1%F4S%CA%06q%E9%D3%82Qy%AE%A4%F3%10%B3%9F%A0%89q%A8k%F9b%81%941%DA%7F%0B%EB%E4N%EA%D4%01%D3%18%09%90%40%97%22%40%81%D5%A5n%07%3BC%02%07%86%C0%93%25%03%EEuk%DAOq%16%8D%CC%DF%89%D2%10%8F%95%D2p%EC%8C%2B9Iyss%B5%CC%81%A5%AA%EF%B0a%FE%CC%A2%A2%D2%FE%A7%9F%BE)%9A%9E%FCs%EC%D8%C4S%5E%7CqAZ%FF%FE%13E8H%1D%111%11%EA%EA%5BD%A0%8C%B8%CE%5C%D8%AD%BD%A9j%ED%DA%05%8D%7B%F7%FE%EB%CD%87%FF%BE%20%A9%C1%B7%7D%FA%C2%F9%0D%11l%84eCP%E5%A0%0BC%91q%1E%E2%89%88%C3%A4%2BQ%0A%AAV%7B%C68%A4%7F%B2%A0%3D%AA5WR%19B%F6q%B4w%A5%DD%F0%8D~HQWKKK*%B6y%A8km%94%1FH%80%04%BA%1D%81H%3F%84%DDn%C0%1C%10%09%F4T%02%2F%1Cy%D4fOZZ%81'%25E%C5e%A4%BB%D2%F3%F2TJn%AEJ%EF%DDGa'v%D9%2CT%8B%C3%06%A2X%BC%BEg%DE%A9%A7%16%5D%B4vmc%B4%ACv-%5Bv_%AF%E1%C3o%C2v%0D%B6%5B%12%88-C%83%05%AF%D0c%01%1C%7F%D3%B8g%8F%DA%B7v%AD%B6%E4%A9g%5CU%1F%7F%ACTc%FDV%14(G%F1%AF%24%A2%CEF%88%96%DD%F8%2C%FBN%89%88%93%FD%B0%D2%10%F3%11%07%22%CA%8E%F4%03%10K%11%CD%A9%B9%8Ex%ABP-8K%8A%B6%E47Q%CE%2F%9C%1A%CD%DB%82RQ%02%C4%9D%AC%ED%BA%D7N%5C%99%E5%8C%F1_%02%DB%CF%99i%BC%92%00%09tO%02%14X%DD%F3%BErT%24%10F%A0%EC%9F%FF%1C%AE%25zW%C4%A7%A5iq%D8%BB%CA%ED%F5%BAd%0F%2B%89%F1%89I%F2%5D%C5%E1%CD%40%17%0EXn%DC%BD%7B%F9%B5%85%85%A3qn%8C%EC%98%1EU%D8%F0%CA%2B%D3%0A%8E%3B%EE%19%D8O7%95T%A87%AB%8D%B8%82%C5%40K%8Bj%AE%AEV%D5%E5ej%FD%1Bo%AB%AF%E7%CCQ%AE%7DU%9AK%F3c%1AO%17%3C%FA%EF%93)Z%CC%FA%86WJO7%D3P%ACU%D8!%CDQ%E4Y%0DF%EA%04%9Br%BD%04%EF%D2%C5%D1l%22j%DA%C1%B4%A0x%CC%E6%A0%3F%BA%99%D01%87%B6%25y%88%AFc%3DW%C4%DD%F3%AD%FA%C84%12%20%81%D8%22%40%81m%A7%1E%C4%00%00%0C%8BIDAT%15%5B%F7%8B%BD%25%81oE%60%CB%C2%85%3F%C9%1A6%EC%AF%AE8%0F%96%5D%C5%C96%0B%FA%26%A1%CA%E3%C6R%AC%E0%F4!d%8D%E6r%7B%5C5%E5%E5%1F%8C%2C)%99%5Cnxw%A2i%F8%E5%93ON%3D%E6%81%07%9E%CE%184%E8%2CQ%13%226Du%18W%DD%84.4%FC~%D5%D2%D8%A0%EA%B6lQ%BB%3F_%A6%3Ey%F4Q%EC%8F%BE%5D%A9%16_4%CDtJ%19C%0C%E9%C2%0A%9F%F7%A1%8FWa%5D%D4%8B%1D1%0Eq%25bI%0E%87%B6%15u2~c%DCU%5E%AF7%F7%A2%AF%BF%E6%8E%ED%1D%81%CC%B2%24%10%A3%04(%B0b%F4%C6%B1%DB%24%F0M%09%EC%5D%BB%F6%F5%F4%92%92S%B1%03TP%3A%19K%A6%C4%23d%84%D6%B5T%D5%E5%E5%EF%9FRRr%2C%CE%D2%89%DA%93%256%D6%BF%FC%F2%F1%05%C7%1C%F3%9473%B3%A0%8D%C0%92iA%9C%BD%E7%F7%F9T%C3%CE%1D%AA%EA%CB%2F%D5%E2%A7%9EV%F5%CB%BE%C0%04%A0%2C%BBju%5C%7D%D3%E1ES%CF%14Uf%D7%1ED%9F~%11%CD%C1%CD%A1%C6E%5C%C1%C0%AB%C6%D9%85v%BF%A5%A6%BE%12%117%1E%DE%AB%CF%A2%E9%20%CB%90%00%09%C4%3E%01%BB%1F%85%D8%1F%19G%40%02%24%60I%00%AF%AEy%5E%A9%AC%DC%98%90%9E%9Eo%88%AA%D6%DF%01Sd%B5%AA%02%24%607%F6O%7F%D3%AF%DF%91%7F%85%7F%C9%D2%A0C%E2%EE%95%2B%AFO%EF%DF%FF%EE%B8%D4%D4%14%ACl%17u%E5%F2cj%B0i%EF%5EU%BD%FEk%B5%E6%D5%D7%D4%A6%D7%E6)w%1D%D6%7Bk%D0p%11%D7%C7%3B4%169%CBTo%BA%B0B%F1%F9%18%DE%0F%E1%B5%8AjA%7F%A8%F9v%D3%82%E2%A0%B3m%1DmI%DEUXw%F5%B8m!f%90%00%09t%3B%02%DCh%B4%DB%DDR%0E%88%04%9C%09%BC%A1%94%FF%AB'%9E8%C6%DF%D8(%C7%E9%E8k%99%CCh%D64%15%83(%91%B4%A2%A2%F1w%EE%DA%F5%D5%82%2B%AE%C8t%B6%1C%9E%9B3%7C%F8%C3%09ii%A9%FB%D6%AD%BB%A1%A9%B2r%AF%16%F0%CB%BA%2B%AD~%EB%16%B5u%E9%E7%DA%C6%B7%DEV%EE%06%AC%A5%17%11%E2%20R%C2-GN1E%22J%9ASt%FA%C6%A8%F0V%BD%8C%F1%95B%F0%9C%FAM%C4%95%2Ch%87%CD9%86%5D%3Bqe%B6)%1D%9DIq%15%F9~%B1%04%09t7%02%F6%FF%EC%EAn%23%E5xH%80%04%DA%10X%F7%E2%8B%C7%14O%9B%F6%8E%3B%3E%DEq%FD%90(%08%11%2B-%0D%0D%0D%EB%FF%F5%AF%09%87%5Cz%E9%CAo%8A%B2%FC%8D7NL%CA%CA%FC%F9%8E%E5%CBOZ6%F3I%A5%ED%D8%A9T%B3%EF%5B-Po%DF%17SX%19%FD6%B3%E5%E0%EB%070%9Dw7%8E%A6%E9%F0%16%10%A6%91%90%AD%18%9C%E62%5B%05%1D%EA-%80%B8%3A%A1%7D%1F%F9%9D%04H%A0%FB%13%A0%C0%EA%FE%F7%98%23%24%01%5B%02%1B%E7%CF%3F%BFp%CA%94%D9%91%B6W%10%03%22%5CpD%8Ek%F7%B2e%D3q%F4%CD3%B6F%A3%C8%C8V*%EE%DEC%87_%A2jk%2F%86%E5%D6%0D7%C5%93f%B4%D5%FA%F6%60%14%E6%F4%BE%85%0A*%B1%83%A4-%A8%FB%02%3E%CF%86%A7jq4v%EC%CA%18%3B%B4%BF%89%FC%F1%86m%3BQ%DA%AA%EFPv%99%DF%EF%1F%8B7%12%B9%A8%DD%0E%2C%D3I%A0%1B%13%A0%C0%EA%C67%97C%23%81h%08lY%B0%E0%EA%FC%A3%8F%FE%3B%5E%23%B4%13%0D%BA%99P%CF%106%06%9D%3Dm%C8%90K%16a%BA1%9A6%22%95%C1%B4%DB%11%B0%3F%09%E5%26B%C0%8C%C7%E7%3E%F8%2C%FB%5DIt%0A%E2-%92%B5aM%A8%B3%12u%3FD%FC%14%9F%C5s%B4%CB%A9b%B4y%C6%D9%82%F3%60W%F6%D8r%FA%CD%0C%15Wk%F1e%04%16%B5%CB%DE%5D%0C%24%40%02%3D%90%80%D3%8FE%0F%C4%C1!%93%40%CF%24%B0y%E1%C2%EB%0A%26O~8%92%C82%E9%E8%AA%A6%B6%B6%AA%FC%D5W%CF%18%7C%D1EQ%1D%AD%D3Q%B2%106%05%105%7DQ%2F%1BbE%CE%F8%F3b%FD%14f%F9%DC%B2v%AC%1E%B1%0A%E9%3Bp%DD%0A1%D5%E9G%ED%C0k%15%8F6g%C0%BE%1C%DC%AC%8B'%5C%ED~3C%A7%05E%5C%8D%82%B8%92%3E2%90%00%09%F4P%02v%3F%16%3D%14%07%87M%02%3D%97%C0%A67%DF%BC%B4%E0%D8cg%B9%3C%1E%5D%2C8%88%09%1D%92(%0E)S%F9%D5W%CF%AD%9A1%E3'%93%EF%BF_v%5B%EF%16%01%1E%B5%B31%90'0%C4LCS9%AD%B92y%C8u%19%EA%1CA%CFU%B7%F8%DF%80%83%20%81oE%80%02%EB%5B%E1ce%12%E8%5E%04%CA%E6%CE%3D%BD%F0%C4%13_%F1%24%24%88vr%FC%7D%D0%5D%3A%12P%AE%A5%AE%BEq%CF%CA%15%BF%9Bw%D6Y%F7%5E%B9%7D%BB%FEvb%2C%06x%CD%0EG%BF%FF%86x4%A2%E3%94%A91%3E%5Dx%19(%16%60%CD%D5I%5Cs%15%8Bw%9E%7D%26%81%CE'%E0%F8%03%DA%F9%CD%D1%22%09%90%40W'%F0%E5%CC%99%A3%07%9D%7F%FE%FB%9E%A4%A4%24%3B%91%25%82B%F4%97l%1A*2L%0B%04%DDY%0D%15%15%3Bj7o%FA%ED%8C%89%93%1E%BB%AD%93%D6g%7D%17%BC0%1D8%0CS%8F%7F%C4(%CE%C0%B8t%EDh%E8K%DB%DF%C8V%81%19%5C%97%25%5B1%5C%F9%5D%F4%95m%90%00%09%C4%06%01%DB%1F%8F%D8%E8%3E%7BI%02%24p%20%08%CC%BB%E0%82%CC%C9%F7%DD%F7vJ%DF%BE%A3C%85%84%88%0E%C3%5B%A37%8B%CDCE%5C%E1%5CA%9F%E6olra%AF%2B%ADa%C7%0EW%D5%86%F5%3B%97%CE%9E%7D%8F%BF%C9%F7%E8%A5o%BCQ%7D%20%FA%D8%196!%AC%8E%C2%98~%0B%5BS%C4%9E!%AE%ECte%9B%26%0D.%F2%1B%CAMD%3B%E3f%D0%06%09t3%02%14X%DD%EC%86r8%24%D0%99%04v%7F%F1%C5%A3%D9%87%1DvM%88%98%08%9E%25%08a%25A%F3%B7(%08%2B%D5%5CS%A3%EA%B7W%A8%86%ED%3B%B4u%EF%BD%E7%DA%B2%E8%03%CD%B5w%8FK5%F9Z%A0%C0%E6%A0%FE%0C%ACK%3A%20%8B%E1%3B%3A%DE%A7KJ%D2%E1y%BB%0C%F5nF%2C%96%FA%22%AC%E4%12%C9%96p%10%F5%25%22%13%B1%12%E5O%E6%F17%91%A81%9F%04z%26%81%88%3F(%3D%13%0BGM%02%24%60%12(%9F%3F%FFT%BCa%F8%8A%3B11%0E%AA%C2%25G%DE%04ZZ%5C%D8%13K5%D7%D6%AA%C6%DD%BBU%E3%8E%EDj%DB%17%2B%D4%FA7%DFT%CD%DB%B6)WC%83%86%03%9DMw%97%F9%3B%B3%176gB%98%CC%81(%F9%E4%BB%24%8CE%EB%E9h%F7%1C%B4)%C2%EAX%C3%13%D7*%96%E4%7B%94A%D7X%88%AF%E3%E0%E63xps%94%D4X%8C%04z%20%81%A8%7FUz%20%1B%0E%99%04H%C0%20%F0%CF%89%13SO%99%3D%FB%B5%C4%5E%BD%8En%86x%C2%16%0D%98%0E%DC%AB%9Av%EEV%7B%D6%AFW%1B%DE~%5BU%AF%5D%AB%DCM8%F6%A6%19k%DCC%8E%BE%11o%8F)h%60%CE%FC%CD%F1!%EDu%7C%9F%8F%FCw%B0~iMg%C2%86%97*%1E%5E%AA%E3a%FBx%B4s%26l%0F%09%B1o.%5E%8F%CAk%85z%E6BvS%90%5D%82%FE%3E%D7%99%FD%A5-%12%20%81%EEG%80%02%AB%FB%DDS%8E%88%04%0E%18%81-%EF%2C%BC%D8%9D%900%B3i%E7%CE%84%8AU%AB%B5%8A%C5%8B%5D%D5%EB%D7)O%93O)%1F%F6%D44%5E%2C%B4%EA%80%EE%FA%09%BA%8A%F4%8F%16ed%A3%D0%CF!%8CV%E1%BA%1Ee6%E2Z%81%EF%7B%AE%D8%BC%B9%CD%F16%8F%E5%E7%BB%12%12%12%B2%60%23%0F%E5%0AQn%00%3E%0F%C2%E7%91%B8%8EC%D4%CFM%94%E6%90%26%1F%A3y%23P%CA%B5%86%D0z%F2%19%B6%DElii9%1Bo%09%E2dj%06%12%20%01%12p%26%60%F5%23%E7%5C%83%B9%24%40%02%3D%9A%C0%5B%17%5C%1C%B7%B5%BA%EA1%AD%BC%FC2%97%1F%1B%B9%FB%9AD-%89%92%11E%F3%AD%D8%88%F2%82%81%88FB%84%93%DE%9E%F1%BD%BDg**%5B%ED%3B%2C%7D%80%BD%E0%AB%84%C1%BE%C8f%A6W%C0k5%AF%7DY~'%01%12%20%01%3B%02%11%7F%C8%EC*2%9D%04H%A0g%13%98U%3Ap%A0ji~%14ZD%A6%E2%04F%87%BDD%5D%89%A0%85%B0%AAA%DA%AF%B1%5EL%F6%C5b%20%01%12%20%81%0E%11%A0%C0%EA%10.%16%26%01%12hO%00%9Bs%8E%85%C8%FA3%C4%C8%B1F%9E%EE9%12'%90%5C%DB%97%EFj%DFE%1C%9A%1E0%C3y%25o%07%FE%09%FBb%DD%3B%BD%ACL%CE9d%20%01%12%20%81%0E%13%E8%F2%3F~%1D%1E%11%2B%90%00%09%1C%14%02%10Z%87%A1%E1_%22%CA13%5ES%60%99%02%E6%A0t%CA%A6Q%0Bo%95%94%5C%87x%17%D6%7C%CD%C4%9A%AFN9%C4%DA%A6y%26%93%00%09%F4%00%02%14X%3D%E0%26s%88%24%F0%5D%12%C0%E6%9D%B9%F0%FE%5C%0C%11s%1D%DA%D5%DF%DE%0B%11%5B%5Da%1AQ%D7W%06%139%24%FA-%C4%BF%60%8D%D5%07%DF%25'%B6E%02%24%D0%BD%09P%60u%EF%FB%CB%D1%91%C0A%25%00%B1u%18%C4%D5e%E8%C4T%C4%A1%D2%19%11%5B%C6T%9C%BC%E1%F7%5D%08.%7D%81%984%8D%E6%A4%FD%3A%5C%17%E1%FBL%C47%20%ACdJ%90%81%04H%80%04%3A%95%00%05V%A7%E2%A41%12%20%01%2B%02%D8%97%0A%2F%1C%FA%8B!ndO%AA%93q%1D%0F%91%D3K%CA%9A%EB%9Fp%DD%AF%BC%AC%8C8%A4%B5%17j%F2%5DL%87TY%81%A4%0F%D1%84%EC*%BF%18%0B%D7%F79%98c%16%09%90%00%09%7Ck%02%14X%DF%1A!%0D%90%00%09t%94%C0%CC%A2%22%2F%A6%11%F3Q%EF%18%C4%89%88%87%20%8A%87%2B%D7%CA%96%A9%BD%8C%BC%F6%E2)%B4%8A%9C%E1%23%9B%96%AEF%5C%81%F8%0E%04%D5R%08%AA.%7B%1E%A2%D5x%99F%02%24%10%FB%04(%B0b%FF%1Er%04%24%D0m%08%E0H%9B8%0C%A6%08%B1%18%B1%00%E2(%0F%D7%2C%08%AC%94%A0SJ%F7J%C9%B4b%0B%16%A3WC%A4%ED%C6%F7%0A%E4m%C6U6'%AD%86%982%A7%04%91%C4%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%40%02%24%D0%F9%04%FE%1F%16(%A9%BB%0A%EC%FF%BD%00%00%00%00IEND%AEB%60%82\" onclick=\"javascript:sendToFLV();\"/><div style=\"position:relative; top:0;\"><select id=\"methodselector\"><option id=\"embedded\" value=\"embedded\">"+embeddedstring+"</option><option id=\"newtab\" value=\"newtab\">"+newtabstring+"</option><option id=\"newwindow\" value=\"newwindow\">"+newwindowstring+"</option><option id=\"standalone\" value=\"standalone\" selected=\"true\">"+standalonestring+"</option></select></div>";
			}
			//replace video object
			if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
				childdivs = videoplayer.getElementsByTagName("div");
				videodiv = childdivs[2];
				videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

			}else{
				videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
			}
		},

		placeHolderReplace: function(evt) {

			//declare variables
			var aEvent = content.document;
			var aBranch = evt.target.getAttribute("branch");
			var aMethod = evt.target.getAttribute("method");

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			this.prefs.setCharPref("promptmethod",aMethod);

			//replace placeholder
			flvideoreplacerListener.videoReplace(aEvent,aBranch);
		},

		videoReplace: function(aEvent,aBranch) {

			if(aEvent == content.document){
				//get original target document and url
				var doc = content.document; 
				var sourceurl = content.document.location.href;
			}else{
				//get original target document and url
				var doc = aEvent.originalTarget;
				var sourceurl = doc.location.href;
			}
			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.video.");

			//get video json from prefs
			var videodata = this.prefs.getCharPref(aBranch);

			//parse json
			jsonObjectLocal = JSON.parse(videodata);
			//declare video variables
			var sitename = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitename);
			var sitestring = flvideoreplacerListener.sanitizeString(jsonObjectLocal.sitestring);
			var videowidth = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videowidth);
			var videoheight = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoheight);
			var videoelement = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videoelement);
			var videourl = jsonObjectLocal.videourl;
			var newmimetype = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videomime);
			var fmt = flvideoreplacerListener.sanitizeString(jsonObjectLocal.videofmt);

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var replacemethod = this.prefs.getCharPref("promptmethod");
			var autoplay = this.prefs.getBoolPref("autoplay");
			var alertsinfo = this.prefs.getBoolPref("alertsinfo");
			var alertserror = this.prefs.getBoolPref("alertserror");
			var mimetype = this.prefs.getCharPref("mimetype");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var original = strbundle.getString("original");
			var standard = strbundle.getString("standard");
			var message, messagetitle, prompts, alertsService;

			//**********************check incompatible extensions************************************

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.");

			var enableditems, whitelist, replacevideo = true;

			//check enabled extensions
			try{
				enableditems = this.prefs.getCharPref("enabledAddons");
			}catch(e){
				enableditems = this.prefs.getCharPref("enabledItems");
			}finally{

				if (enableditems.match(/\{3d7eb24f-2740-49df-8937-200b1cc08f8a\}/)) {//flashblock

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("flashblock.");

					try{
						whitelist = this.prefs.getCharPref("whitelist");
					}catch(e){
						whitelist = "";
					}

					if(!whitelist.match(sitestring)){

						//don't try to replace
						replacevideo = false;

						if(alertserror === true){

							//get text from strbundle
							message = strbundle.getFormattedString("flashblock", [ sitename ]);
							messagetitle = strbundle.getString("flvideoreplaceralert");

							if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
								//alert user
								prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
								.getService(Components.interfaces.nsIPromptService);
								prompts.alert(window, messagetitle, message);
							}else{
								//alert user
								alertsService = Components.classes["@mozilla.org/alerts-service;1"]
								.getService(Components.interfaces.nsIAlertsService);
								alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
										messagetitle, message,
										false, "", null);
							}
						}
					}
				}
				/*
if (enableditems.match(/\{73a6fe31-595d-460b-a920-fcc0f8843232\}/)) {//NoScript

//access preferences interface
this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
.getService(Components.interfaces.nsIPrefService)
.getBranch("noscript.");

var forbidflash = this.prefs.getBoolPref("forbidFlash");
var forbidplugins = this.prefs.getBoolPref("forbidPlugins");
var nstemp = this.prefs.getCharPref("temp");
}
				 */

				if (enableditems.match(/\{84b24861-62f6-364b-eba5-2e5e2061d7e6\}/)) {//mediaplayerconnectivity

					//access preferences interface
					this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.mediaplayerconnectivity.");

					try{
						whitelist = this.prefs.getCharPref("whiteList");
					}catch(e){
						whitelist = "";
					}

					if(!whitelist.match(sitestring)){

						//don't try to replace
						replacevideo = false;

						if(alertserror === true){

							//get text from strbundle
							message = strbundle.getFormattedString("mpc", [ sitename ]);
							messagetitle = strbundle.getString("flvideoreplaceralert");

							if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
								//alert user
								prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
								.getService(Components.interfaces.nsIPromptService);
								prompts.alert(window, messagetitle, message);
							}else{
								//alert user
								alertsService = Components.classes["@mozilla.org/alerts-service;1"]
								.getService(Components.interfaces.nsIAlertsService);
								alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
										messagetitle, message,
										false, "", null);
							}
						}
					}
				}
			}

			if(replacevideo === true){

				//declare variables
				var params, videoplayer, flvideoreplacer, childdivs, videodiv;

				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.");

				if(replacemethod === "embedded"){

					//get plugin compatibility
					var pluginmp4 = this.prefs.getBoolPref("pluginmp4");
					var pluginflv = this.prefs.getBoolPref("pluginflv");
					var pluginqt = this.prefs.getBoolPref("pluginqt");
					var pluginwmp = this.prefs.getBoolPref("pluginwmp");
					var pluginwmv = this.prefs.getBoolPref("pluginwmv");
					var pluginmov = this.prefs.getBoolPref("pluginmov");
					var pluginm4v = this.prefs.getBoolPref("pluginm4v");

					if(newmimetype === "video/x-quicktime"){

						if(pluginmov === true){

							//declare element to be replaced
							videoplayer = doc.getElementById(videoelement);

							//create the object element
							flvideoreplacer = doc.createElement('object');
							flvideoreplacer.setAttribute("width", videowidth);
							flvideoreplacer.setAttribute("height", videoheight);
							flvideoreplacer.setAttribute("classid", "clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B");
							flvideoreplacer.setAttribute("codebase", "http://www.apple.com/qtactivex/qtplugin.cab");  
							flvideoreplacer.setAttribute("type", "video/x-quicktime");
							//append innerHTML code
							flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/x-quicktime\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
							if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
								childdivs = videoplayer.getElementsByTagName("div");
								videodiv = childdivs[2];
								//replace video
								videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

							}else{
								//replace video
								videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
							}
						}else{
							newmimetype = "video/mp4";
						}
					}
					if(newmimetype === "application/x-ms-wmv"){

						if(pluginwmv === true){

							//declare element to be replaced
							videoplayer = doc.getElementById(videoelement);

							//create the object element
							flvideoreplacer = doc.createElement('object');
							flvideoreplacer.setAttribute("width", videowidth);
							flvideoreplacer.setAttribute("height", videoheight);
							flvideoreplacer.setAttribute("type", "application/x-ms-wmv");
							//append innerHTML code
							flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"application/x-ms-wmv\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
							if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
								childdivs = videoplayer.getElementsByTagName("div");
								videodiv = childdivs[2];
								//replace video
								videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

							}else{
								//replace video
								videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
							}
						}else{
							newmimetype = "video/mp4";
						}
					}
					if(newmimetype === "video/x-m4v"){

						if(pluginm4v === true){

							//declare element to be replaced
							videoplayer = doc.getElementById(videoelement);

							//create the object element
							flvideoreplacer = doc.createElement('object');
							flvideoreplacer.setAttribute("width", videowidth);
							flvideoreplacer.setAttribute("height", videoheight);
							flvideoreplacer.setAttribute("type", "video/x-m4v");
							//append innerHTML code
							flvideoreplacer.innerHTML = "<param name=\"src\" value=\""+videourl+"\"></param><param name=\"autoplay\" value=\""+autoplay+"\"><param name=\"controller\" value=\"true\"><param name=\"loop\" value=\"false\"><param name=\"scale\" value=\"aspect\"><embed src=\""+videourl+"\" width=\""+videowidth+"\" height=\""+videoheight+"\" scale=\"aspect\" type=\"video/x-m4v\" autoplay=\""+autoplay+"\" controller=\"true\" loop=\"false\" </embed>";
							if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
								childdivs = videoplayer.getElementsByTagName("div");
								videodiv = childdivs[2];
								//replace video
								videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

							}else{
								//replace video
								videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
							}
						}else{
							newmimetype = "video/mp4";
						}
					}
					if(newmimetype === "application/x-flv"){

						//declare element to be replaced
						videoplayer = doc.getElementById(videoelement);

						if(pluginflv === true){

							//create the object element
							flvideoreplacer = doc.createElement('object');
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
						videoplayer = doc.getElementById(videoelement);

						if(pluginmp4 === true){

							//create the object element
							flvideoreplacer = doc.createElement('object');
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
						videoplayer = doc.getElementById(videoelement);

						if(pluginqt === true){
							//create the object element
							flvideoreplacer = doc.createElement('object');
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
						videoplayer = doc.getElementById(videoelement);

						if(pluginwmp === true){

							//create the object element
							flvideoreplacer = doc.createElement('object');
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
							flvideoreplacer = doc.createElement('object');
							flvideoreplacer.setAttribute("width", videowidth);
							flvideoreplacer.setAttribute("height", videoheight);
							flvideoreplacer.setAttribute("type", "application/x-shockwave-flash");
							flvideoreplacer.setAttribute("data", "http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf");
							//append innerHTML code
							flvideoreplacer.innerHTML = "<param name=\"movie\" value=\"http://releases.flowplayer.org/swf/flowplayer-3.2.7.swf\"></param><param name=\"allowfullscreen\" value=\"true\"></param><param name=\"flashvars\" value='config={\"playlist\":[\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\", {\"url\": \""+videourl+"\",\"autoPlay\":"+autoplay+",\"autoBuffering\":true}]}'></param><img src=\"http://www.webgapps.org/flowplayer/flashvideoreplacer.png\" width=\""+videowidth+"\" height=\""+videowidth+"\" alt=\"FlashVideoReplacer\" title=\"No video playback capabilities.\" />";
							if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
								childdivs = videoplayer.getElementsByTagName("div");
								videodiv = childdivs[2];
								//replace video
								videodiv.parentNode.replaceChild(flvideoreplacer, videodiv);

							}else{
								//replace video
								videoplayer.parentNode.replaceChild(flvideoreplacer, videoplayer);
							}
							 */
						}
					}
				}

				if(replacemethod === "newtab"){

					//open media in new tab
					var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIWebNavigation)
					.QueryInterface(Components.interfaces.nsIDocShellTreeItem)
					.rootTreeItem
					.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
					.getInterface(Components.interfaces.nsIDOMWindow);

					mainWindow.gBrowser.selectedTab = mainWindow.gBrowser.addTab(videourl);

					//content.window.location.href = videourl;
				}

				if(replacemethod === "newwindow"){

					//set videourl pref
					this.prefs.setCharPref("videourl",videourl);
					//launch player
					if(osString.match(/Windows/)){
						window.open(videourl, 'flvideoreplacer-player', 'content,centerscreen,alwaysRaised,resizable=yes,width=600em,height=400em').focus();
					}else{
						window.openDialog('chrome://flvideoreplacer/content/player.xul', 'flvideoreplacer-player', 'chrome,centerscreen,alwaysRaised,resizable=yes,width=600em,height=400em').focus();
					}
				}

				if(replacemethod === "standalone"){

					//set videourl pref
					this.prefs.setCharPref("videourl",videourl);
					//declare variables
					var player, process;

					if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){

						//load url bar change listener for getting url redirection 
						flvideoreplacerURLBar.init();

						var newTab = gBrowser.addTab(videourl);
						newTab.label = "FlashVideoReplacer";
						newTab.id = "FlashVideoReplacerVimeo"; 
						gBrowser.selectedTab = newTab;

					}else{

						//get player path
						var playerpath = this.prefs.getCharPref("playerpath");

						if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){

							try{
								if(playerpath !== "" && !playerpath.match(/\*\*\*/)){

									//initiate player
									player = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
									player.initWithPath(playerpath);
									if (player.exists()) {//match if player exists and launch it
										process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
										process.init(player);
										var arguments = [""+videourl+""];
										process.run(false, arguments, arguments.length);
									}
								}else{
									fmt = "98";
								}
							}catch (e){
								fmt = "98";
							}

						}else{
							try{
								if(playerpath !== "" && !playerpath.match(/\*\*\*/)){

									//initiate player
									player = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
									player.initWithPath(playerpath);
									if (player.exists()) {//match if player exists and launch it
										process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
										process.init(player);
										var arguments = [""+videourl+""];
										process.run(false, arguments, arguments.length);
									}
								}else{
									fmt = "98";
								}
							}catch (e){
								fmt = "98";
							}
						}
					}
				}
				if(alertsinfo === true){
					//video info alert
					if (fmt === "5") {
						message = strbundle.getFormattedString("videores", [ "240p flv ("+mimetype+")" ]);
					}
					if (fmt === "18") {
						message = strbundle.getFormattedString("videores", [ "360p mp4 ("+mimetype+")" ]);
					}
					if (fmt === "34") {
						message = strbundle.getFormattedString("videores", [ "360p flv ("+mimetype+")" ]);
					}
					if (fmt === "35") {
						message = strbundle.getFormattedString("videores", [ "480p flv ("+mimetype+")" ]);
					}
					if (fmt === "22") {
						message = strbundle.getFormattedString("videores", [ "720p mp4 ("+mimetype+")" ]);
					}
					if (fmt === "37") {
						message = strbundle.getFormattedString("videores", [ "1080p mp4 ("+mimetype+")" ]);
					}
					if (fmt === "38") {
						message = strbundle.getFormattedString("videores", [ original+" ("+mimetype+")" ]);
					}
					if (fmt === "97") {

						if(videourl.match(/\.mp4/)){
							message = strbundle.getFormattedString("videores", [ standard+" mp4 ("+mimetype+")" ]);
						}else if(videourl.match(/\.flv/)){
							message = strbundle.getFormattedString("videores", [ standard+" flv ("+mimetype+")" ]);
						}else if(videourl.match(/\.mov/)){
							message = strbundle.getFormattedString("videores", [ standard+" mov ("+mimetype+")" ]);
						}else if(videourl.match(/\.m4v/)){
							message = strbundle.getFormattedString("videores", [ standard+" m4v ("+mimetype+")" ]);
						}else if(videourl.match(/\.wmv/)){
							message = strbundle.getFormattedString("videores", [ standard+" wmv ("+mimetype+")" ]);
						}else{
							message = strbundle.getFormattedString("videores", [ standard+" ("+mimetype+")" ]);
						}
					}
					//trigger alerts
					if (fmt !== "98" && fmt !== "99") {//standard resolution message

						if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){
							messagetitle = strbundle.getString("flvideoreplacermessage");
							//alert user
							alertsService = Components.classes["@mozilla.org/alerts-service;1"]
							.getService(Components.interfaces.nsIAlertsService);
							alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
									messagetitle, message,
									false, "", null);
						}
					}
				}
				if(alertserror === true){

					if (fmt === "98"){//no available player message
						message = strbundle.getFormattedString("nostandalone", [ mimetype ]);
						messagetitle = strbundle.getString("flvideoreplacermessage");

						if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
							//alert user
							prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
							prompts.alert(window, messagetitle, message);
						}else{
							//alert user
							alertsService = Components.classes["@mozilla.org/alerts-service;1"]
							.getService(Components.interfaces.nsIAlertsService);
							alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
									messagetitle, message,
									false, "", null);
						}
					}
					if (fmt === "99"){//no available plugin message

						message = strbundle.getFormattedString("noreplace", [ mimetype ]);
						messagetitle = strbundle.getString("flvideoreplacermessage");

						if(osString.match(/OSX/) || osString.match(/Macintosh/) || osString.match(/OS X/)){
							//alert user
							prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
							.getService(Components.interfaces.nsIPromptService);
							prompts.alert(window, messagetitle, message);
						}else{
							//alert user
							alertsService = Components.classes["@mozilla.org/alerts-service;1"]
							.getService(Components.interfaces.nsIAlertsService);
							alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
									messagetitle, message,
									false, "", null);
						}
					}
				}
			}
		},

		webmReplace: function(aEvent) {

			//get original target document and url
			var doc = aEvent.originalTarget;
			var sourceurl = doc.location.href;

			//get osString
			var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
			.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu; 

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get alerts prefs
			var alertsinfo = this.prefs.getBoolPref("alertsinfo");

			if(sourceurl.match(/youtube.*watch.*v\=/)){

				//fetch video ID from url
				var videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");
				//declare webm url
				var webmurl = "http://www.youtube.com/watch?v="+videoid+"&html5=True";
				//load webm page
				doc.location.href = webmurl;

				if(alertsinfo === true){

					//get localization
					var strbundle = document.getElementById("flvideoreplacerstrings");
					var message = strbundle.getFormattedString("videores", [ "HTML5 WebM" ]);
					var messagetitle = strbundle.getString("flvideoreplacermessage");

					if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){
						//alert user
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}
				}
			}
		},

		menuClickDetect: function (event) {

			switch(event.button) {
			case 0:
				//Left click
				break;
			case 1:
				//Middle click

				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.");

				//get prefs
				var enabled = this.prefs.getBoolPref("enabled");

				if(enabled === true){
					this.prefs.setBoolPref("enabled", false);
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbarinactive");
				}else{
					this.prefs.setBoolPref("enabled", true);
					document.getElementById("flvideoreplacer-toolbar-button").setAttribute('class',"toolbarbutton-1 chromeclass-toolbar-additional toolbaractive");
				}
				break;
			case 2:
				//Right click
				break;
			}
		},

		showHideMenus: function () {//show and hide context menus

			//get source url and domain
			var sourceurl = content.window.location.href;
			var hostdomain = content.window.location.host;

			//check private mode
			var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
			.getService(Components.interfaces.nsIPrivateBrowsingService);
			var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get embedded option
			var replaceembedded;
			var replaceyt = this.prefs.getBoolPref("youtube");
			var replacevimeo = this.prefs.getBoolPref("vimeo");
			var enabled = this.prefs.getBoolPref("enabled");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");
			var original = strbundle.getString("original");
			var standard = strbundle.getString("standard");
			var detectionadd = strbundle.getString("detectionadd");
			var detectionremove = strbundle.getString("detectionremove");

			//hide menus
			document.getElementById("flvideoreplacer-embedded").hidden = true;
			document.getElementById("flvideoreplacer-embedded-detection").hidden = true;
			document.getElementById("flvideoreplacer-embedded-separator").hidden = true;
			document.getElementById("flvideoreplacer-copy").hidden = true;
			document.getElementById("flvideoreplacer-download").hidden = true;


			if(enabled === true){
				//declare variables
				var detection = false, pagecontent,videoid, aSite, vidfilename, downloadurl=null, downloadurl5=null, downloadurl18=null, downloadurl34=null, downloadurl35=null, downloadurl22=null, downloadurl37=null, downloadurl38=null;

				if((replaceyt === true || replacevimeo === true) 
						&& sourceurl.match(/http/) 
						&& (!sourceurl.match(/youtube/)
								&& !sourceurl.match(/vimeo/)
								&& !sourceurl.match(/metacafe/)
								&& !sourceurl.match(/blip/)
								&& !sourceurl.match(/ustream/)
								&& !sourceurl.match(/youporn/)
								&& !sourceurl.match(/pornhub/)
								&& !sourceurl.match(/redtube/)
						))
				{

					//unhide menus
					document.getElementById("flvideoreplacer-embedded-detection").hidden = false;
					document.getElementById("flvideoreplacer-embedded-separator").hidden = false;

					//remove old menupopup elements
					var detectionmenupopup = document.getElementById("flvideoreplacer-embedded-detection-select");
					var detectionmenupopupvbox = document.getElementById("flvideoreplacer-embedded-detection-select-vbox");
					try{
						detectionmenupopup.removeChild(detectionmenupopup.firstChild);
					}catch(e){
						//do nothing
					}
					//append new vbox
					var detectionnewvbox = document.createElement("vbox");
					detectionnewvbox.setAttribute("id","flvideoreplacer-embedded-detection-select-vbox");
					detectionmenupopup.appendChild(detectionnewvbox);
					var detectionmenuitem;

					try{

						if (!inPrivateBrowsingMode){
							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.detect.");
						}else{
							//access preferences interface
							this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
							.getService(Components.interfaces.nsIPrefService)
							.getBranch("extensions.flvideoreplacer.detectprivate.");
						}

						var detection = this.prefs.getBoolPref(hostdomain);

					}catch(e){
						detection = false;
						replaceembedded = false;
					}finally{
						if(detection === true){
							replaceembedded = true;
						}else{
							replaceembedded = false;
						}
					}

					if(detection === true){
						//append new menuitem
						detectionmenuitem = document.createElement("menuitem");
						detectionmenuitem.setAttribute("label",detectionremove);
						detectionmenuitem.setAttribute('action','remove');
						detectionmenuitem.setAttribute('host',hostdomain);
						detectionmenuitem.setAttribute('oncommand',"flvideoreplacerListener.detectionManager(this.getAttribute('action'),this.getAttribute('host'));");
						detectionnewvbox.appendChild(detectionmenuitem);
					}else{
						//append new menuitem
						detectionmenuitem = document.createElement("menuitem");
						detectionmenuitem.setAttribute("label",detectionadd);
						detectionmenuitem.setAttribute('action','add');
						detectionmenuitem.setAttribute('host',hostdomain);
						detectionmenuitem.setAttribute('oncommand',"flvideoreplacerListener.detectionManager(this.getAttribute('action'),this.getAttribute('host'));");
						detectionnewvbox.appendChild(detectionmenuitem);
					}

					if(replaceembedded === true){

						//remove old menupopup elements
						var embeddedmenupopup = document.getElementById("flvideoreplacer-embedded-select");
						var embeddedmenupopupvbox = document.getElementById("flvideoreplacer-embedded-select-vbox");
						try{
							embeddedmenupopup.removeChild(embeddedmenupopup.firstChild);
						}catch(e){
							//do nothing
						}
						//append new vbox
						var embeddednewvbox = document.createElement("vbox");
						embeddednewvbox.setAttribute("id","flvideoreplacer-embedded-select-vbox");
						embeddedmenupopup.appendChild(embeddednewvbox);
						var embeddedmenuitem;

						try{
							var pagecontent = content.window.document.getElementsByTagName("body").item(0).innerHTML;
							var newline = pagecontent.split("\n");
							var newembedid;

							for(var i=0; i< newline.length; i++){

								//match patterns
								var matchyoutoubeembed = /.*iframe.*class="youtube-player".*src="http:\/\/www.youtube.com\/embed\//.test(newline[i]);
								var matchyoutoubeembedold = /object.*param.*name="movie".*value="http:\/\/www.youtube.com\/v\//.test(newline[i]);
								var matchvimeoembed = /iframe src="http:\/\/player.vimeo.com\/video\//.test(newline[i]);
								var matchvimeoembedold = /object.*param.*name="movie".*value="http:\/\/vimeo.com\/moogaloop.swf\?clip_id=/.test(newline[i]);

								if (matchyoutoubeembedold === true) {

									newembedid = newline[i].replace(/.*http:\/\/www.youtube.com\/v\//,"").replace(/\?.*/,"").replace(/\&.*/,"");
									newlink = "http://www.youtube.com/watch?v="+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;

								}

								if (matchyoutoubeembed === true) {

									newembedid = newline[i].replace(/.*http:\/\/www.youtube.com\/embed\//,"").replace(/".*/,"");
									newlink = "http://www.youtube.com/watch?v="+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;

								}

								if (matchvimeoembed === true) {

									newembedid = newline[i].replace(/.*http:\/\/player.vimeo.com\/video\//,"").replace(/\?.*/,"").replace(/\&.*/,"");
									newlink = "http://vimeo.com/"+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;
								}

								if (matchvimeoembedold === true) {

									newembedid = newline[i].replace(/.*http:\/\/vimeo.com\/moogaloop.swf\?clip_id=/,"").replace(/\?.*/,"").replace(/\&.*/,"");
									newlink = "http://vimeo.com/"+newembedid;

									//append new menuitem
									embeddedmenuitem = document.createElement("menuitem");
									embeddedmenuitem.setAttribute("label",newlink);
									embeddedmenuitem.setAttribute('oncommand',"flvideoreplacerListener.openLink(this.getAttribute('label'));");
									embeddednewvbox.appendChild(embeddedmenuitem);
									document.getElementById("flvideoreplacer-embedded").hidden = false;
								}
							}
						}catch(e){
							//do nothing
						}

					}else{
						//do nothing
					}

				}else{
					//do nothing
				}

				if((sourceurl.match(/youtube.*watch.*v\=/) && !sourceurl.match("html5=True")) 
						|| sourceurl.match(/vimeo\.com\/\d{1,8}/)
						|| sourceurl.match(/metacafe\.com\/watch\//)
						|| sourceurl.match(/blip\.tv\/file\/.*/)
						|| sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)
						|| sourceurl.match(/youporn\.com\/watch\//)
						|| sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)
						|| sourceurl.match(/redtube\.com\/\d{1,8}/)
				){//match supported sites

					try{
						//access preferences interface
						this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
						.getService(Components.interfaces.nsIPrefService)
						.getBranch("extensions.flvideoreplacer.downloadersource.");

						if(sourceurl.match(/youtube.*watch.*v\=/)){
							//fetch video ID from url
							aSite = "youtube";
							videoid = sourceurl.replace(/.*v\=/, "").replace(/\&.*/,"");
							try{
								downloadurl5 = this.prefs.getCharPref(aSite+"."+videoid+".5");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl18 = this.prefs.getCharPref(aSite+"."+videoid+".18");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl34 = this.prefs.getCharPref(aSite+"."+videoid+".34");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl35 = this.prefs.getCharPref(aSite+"."+videoid+".35");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl22 = this.prefs.getCharPref(aSite+"."+videoid+".22");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl37 = this.prefs.getCharPref(aSite+"."+videoid+".37");
							}catch(e){
								//do nothing
							}
							try{
								downloadurl38 = this.prefs.getCharPref(aSite+"."+videoid+".38");
							}catch(e){
								//do nothing
							}
						}
						if(sourceurl.match(/vimeo\.com\/\d{1,8}/)){
							aSite = "vimeo";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*\//g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/metacafe\.com\/watch\//)){
							aSite = "metacafe";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*watch\//, "").replace(/\/.*/,"");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/blip\.tv\/file\/.*/)){
							aSite = "bliptv";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*file\//, "").replace(/\//, "").replace(/\?.*/, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/ustream\.tv\/recorded\/\d{1,8}/)){
							aSite = "ustream";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*recorded\//, "").replace(/\/.*/g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/youporn\.com\/watch\//)){
							aSite = "youporn";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*watch\//g, "").replace(/\/.*/,"");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/pornhub\.com\/view_video.php\?viewkey=/)){
							aSite = "pornhub";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*viewkey=/g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}
						if(sourceurl.match(/redtube\.com\/\d{1,8}/)){
							aSite = "redtube";
							//fetch video ID from url
							videoid = sourceurl.replace(/.*redtube\.com\//g, "");
							downloadurl = this.prefs.getCharPref(aSite+"."+videoid);
						}

						vidfilename = aSite+"-"+videoid;

					}catch(e){
						document.getElementById("flvideoreplacer-copy").hidden = true;
						document.getElementById("flvideoreplacer-download").hidden = true;
						document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
					}finally{

						//remove old menupopup elements
						var copymenupopup = document.getElementById("flvideoreplacer-copy-select");
						var copymenupopupvbox = document.getElementById("flvideoreplacer-copy-select-vbox");
						try{
							copymenupopup.removeChild(copymenupopup.firstChild);
						}catch(e){
							//do nothing
						}
						var dlmenupopup = document.getElementById("flvideoreplacer-download-select");
						var dlmenupopupvbox = document.getElementById("flvideoreplacer-download-select-vbox");
						try{
							dlmenupopup.removeChild(dlmenupopup.firstChild);
						}catch(e){
							//do nothing
						}
						//append new vbox
						var copynewvbox = document.createElement("vbox");
						copynewvbox.setAttribute("id","flvideoreplacer-copy-select-vbox");
						copymenupopup.appendChild(copynewvbox);
						var dlnewvbox = document.createElement("vbox");
						dlnewvbox.setAttribute("id","flvideoreplacer-download-select-vbox");
						dlmenupopup.appendChild(dlnewvbox);

						var copymenuitem, dlmenuitem;

						if(downloadurl !== null){

							if(downloadurl.match(/\.mp4/)){
								newvidfilename = vidfilename+".mp4";
							}else if(downloadurl.match(/\.flv/)){
								newvidfilename = vidfilename+".flv";
							}else if(downloadurl.match(/\.mov/)){
								newvidfilename = vidfilename+".mov";
							}else if(downloadurl.match(/\.m4v/)){
								newvidfilename = vidfilename+".m4v";
							}else if(downloadurl.match(/\.wmv/)){
								newvidfilename = vidfilename+".wmv";
							}else{
								if(aSite === "youporn" || aSite === "pornhub" || aSite === "redtube"){
									newvidfilename = vidfilename+".flv";
								}else{			    
									newvidfilename = vidfilename+".mp4";
								}
							}

							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label",newvidfilename);
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'0');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label",newvidfilename);	
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('label'),this.getAttribute('videoid'),'0');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl5 !== null){
							newvidfilename = vidfilename+"-240p.flv";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","240p [flv]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'5');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","240p [flv]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'5');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl18 !== null){
							newvidfilename = vidfilename+"-360p.mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","360p [mp4]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'18');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","360p [mp4]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'18');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl34 !== null){
							newvidfilename = vidfilename+"-360p.flv";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","360p [flv]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'34');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","360p [flv]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'34');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl35 !== null){
							newvidfilename = vidfilename+"-480p.flv";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","480p [flv]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'35');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","480p [flv]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'35');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl22 !== null){
							newvidfilename = vidfilename+"-720p.mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","720p [mp4]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'22');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","720p [mp4]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'22');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl37 !== null){
							newvidfilename = vidfilename+"-1080p.mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label","1080p [mp4]");
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'37');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label","1080p [mp4]");
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'37');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						if(downloadurl38 !== null){
							newvidfilename = vidfilename+"-"+original+".mp4";
							//append new copy menuitem
							copymenuitem = document.createElement("menuitem");
							copymenuitem.setAttribute("label",original);
							copymenuitem.setAttribute('site',aSite);
							copymenuitem.setAttribute('videoid',videoid);
							copymenuitem.setAttribute('oncommand',"flvideoreplacerListener.flvrcopyToClipboard(this.getAttribute('site'),this.getAttribute('videoid'),'38');");
							copynewvbox.appendChild(copymenuitem);
							//append new download menuitem
							dlmenuitem = document.createElement("menuitem");
							dlmenuitem.setAttribute("label",original);
							dlmenuitem.setAttribute('site',aSite);
							dlmenuitem.setAttribute('filename',newvidfilename);
							dlmenuitem.setAttribute('videoid',videoid);
							dlmenuitem.setAttribute('oncommand',"flvideoreplacerListener.vidDownloader(this.getAttribute('site'),this.getAttribute('filename'),this.getAttribute('videoid'),'38');");
							dlnewvbox.appendChild(dlmenuitem);
						}
						document.getElementById("flvideoreplacer-copy").hidden = false;
						document.getElementById("flvideoreplacer-download").hidden = false;
						document.getElementById("flvideoreplacer-prefs-separator").hidden = false;
					}
				}else{
					document.getElementById("flvideoreplacer-copy").hidden = true;
					document.getElementById("flvideoreplacer-download").hidden = true;
					document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
				}
			}else{
				//hide menus
				document.getElementById("flvideoreplacer-embedded").hidden = true;
				document.getElementById("flvideoreplacer-embedded-detection").hidden = true;
				document.getElementById("flvideoreplacer-embedded-separator").hidden = true;
				document.getElementById("flvideoreplacer-copy").hidden = true;
				document.getElementById("flvideoreplacer-download").hidden = true;
				document.getElementById("flvideoreplacer-prefs-separator").hidden = true;
			}
		},

		vidDownloader: function (aSite,aFile,aID,aFMT) {

			var filepath,file,sourceurl;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.downloadersource.");

			//get video path from prefs
			if(aFMT === "0"){
				sourceurl = this.prefs.getCharPref(aSite+"."+aID);
			}else{
				sourceurl = this.prefs.getCharPref(aSite+"."+aID+"."+aFMT);
			}

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			//get prefs
			var dir = this.prefs.getCharPref("downdir");
			var silentdownload = this.prefs.getBoolPref("silentdownload");

			//get localization
			var strbundle = document.getElementById("flvideoreplacerstrings");

			if(dir !== null){

				file = Components.classes["@mozilla.org/file/local;1"]
				.createInstance(Components.interfaces.nsILocalFile);
				file.initWithPath(dir);
				file.append(aFile);

				//download manager
				var dm = Components.classes["@mozilla.org/download-manager;1"].createInstance(Components.interfaces.nsIDownloadManager);

				//Create URI from which we want to download file
				var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				var uri1 = ios.newURI(sourceurl, null, null);
				var uri2 = ios.newFileURI(file);

				//Download observer
				var nsIWBP = Components.interfaces.nsIWebBrowserPersist;
				var pers = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"].createInstance(nsIWBP);
				pers.persistFlags = nsIWBP.PERSIST_FLAGS_REPLACE_EXISTING_FILES |
				nsIWBP.PERSIST_FLAGS_BYPASS_CACHE |
				nsIWBP.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

				//Start download
				var dl = dm.addDownload(dm.DOWNLOAD_TYPE_DOWNLOAD, uri1, uri2,
						"", null, Math.round(Date.now() * 1000),
						null, pers);
				pers.progressListener = dl.QueryInterface(Components.interfaces.nsIWebProgressListener);
				pers.saveURI(dl.source, null, null, null, null, dl.targetFile);

				if(silentdownload === false){
					//Show download manager
					var dm_ui = Components.classes["@mozilla.org/download-manager-ui;1"].createInstance(Components.interfaces.nsIDownloadManagerUI);
					dm_ui.show(window, dl.id, Components.interfaces.nsIDownloadManagerUI.REASON_NEW_DOWNLOAD);
				}else{
					//get osString
					var osString = Components.classes["@mozilla.org/network/protocol;1?name=http"]
					.getService(Components.interfaces.nsIHttpProtocolHandler).oscpu;

					if(!osString.match(/OSX/) && !osString.match(/Macintosh/) && !osString.match(/OS X/)){

						//get localization strings
						var message = strbundle.getFormattedString("videodownload", [ aFile ]);
						var messagetitle = strbundle.getString("flvideoreplacermessage");

						//alert user
						var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
						.getService(Components.interfaces.nsIAlertsService);
						alertsService.showAlertNotification("chrome://flvideoreplacer/skin/icon48.png",
								messagetitle, message,
								false, "", null);
					}					
				}
			}
		},

		flvrcopyToClipboard: function (aSite,aID,aFMT) {

			var sourceurl;

			//access preferences interface
			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.downloadersource.");

			//get video path from prefs

			try{
				sourceurl = this.prefs.getCharPref(aSite+"."+aID+"."+aFMT);
			}catch(e){
				//do nothing
			}finally{
				flvideoreplacerListener.docopyToClipboard(sourceurl);
			}

			try{
				sourceurl = this.prefs.getCharPref(aSite+"."+aID);
			}catch(e){
				//do nothing
			}finally{
				flvideoreplacerListener.docopyToClipboard(sourceurl);
			}
		},

		docopyToClipboard: function (aText) {

			const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
			gClipboardHelper.copyString(aText);
		},

		detectionManager: function (aAction,aDomain) {

			//check private mode
			var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]  
			.getService(Components.interfaces.nsIPrivateBrowsingService);
			var inPrivateBrowsingMode = pbs.privateBrowsingEnabled;  

			if (!inPrivateBrowsingMode){
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.detect.");
			}else{
				//access preferences interface
				this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService)
				.getBranch("extensions.flvideoreplacer.detectprivate.");
			}

			if(aAction === "add"){
				this.prefs.setBoolPref(aDomain,true);
				//content.window.location.reload();
			}
			if(aAction === "remove"){
				this.prefs.setBoolPref(aDomain,false);
				this.prefs.deleteBranch(aDomain);
			}
		},

		openLink: function (aLink) {//show and hide context menus
			gBrowser.addTab(aLink);
		},

		sanitizeString: function (aString) {
			return aString.replace(/[&"<>]/g, function (m) {
				return "&" + ({ "&": "amp", '"':  "quot", "<": "lt", ">": "gt" })[m] + ";";
			});
		},

		cleanupPrefs: function () {

			this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.flvideoreplacer.");

			this.prefs.deleteBranch("video");
			this.prefs.deleteBranch("downloadersource");
			this.prefs.deleteBranch("detectprivate");
			this.prefs.setCharlPref("videourl","");
		}
};
window.addEventListener("load", function() { flvideoreplacerListener.init(); }, false);
window.addEventListener("unload", function() { flvideoreplacerListener.cleanupPrefs(); }, false);
document.addEventListener("FLVReplaceEvent", function(e) { flvideoreplacerListener.placeHolderReplace(e); }, false, true);