//declare observer
const FlashVideoReplacerObserver =
{
    observe: function(subject, topic, prefName)
    {
	//check if preferences changed
	if (topic == "nsPref:changed" && (prefName == "extensions.flvideoreplacer.mimetype" 
		|| prefName == "extensions.flvideoreplacer.youtube" 
		|| prefName == "extensions.flvideoreplacer.youtubequality" 
		|| prefName == "extensions.flvideoreplacer.vimeo" 
		|| prefName == "extensions.flvideoreplacer.bliptv"))
	{

	    //declare page url ****doesn't work if tab is loaded in the backround***
	    //var sourceurl = gURLBar.value;
	    var sourceurl =  content.window.location.href;

	    if((prefName == "extensions.flvideoreplacer.youtube" || prefName == "extensions.flvideoreplacer.youtubequality" || prefName == "extensions.flvideoreplacer.mimetype") 
		    && sourceurl.match("youtube.com") 
		    && sourceurl.match("watch") 
		    && sourceurl.match("v="))
	    {
		content.window.location.reload();
	    }

	    if((prefName == "extensions.flvideoreplacer.vimeo" || prefName == "extensions.flvideoreplacer.mimetype") && window.content.location.href.match(/vimeo.com\/\d{1,8}/)){
		content.window.location.reload();
	    }

	    if((prefName == "extensions.flvideoreplacer.bliptv" || prefName == "extensions.flvideoreplacer.mimetype") && window.content.location.href.match(/blip\.tv\/file\/.*/)){
		content.window.location.reload();
	    }
	}
    }
};

var flvideoreplacerObserver = {//observer registering functions

    registerObserver: function(aEvent) {//register and unregister observers

	//declare observer type
	var FlashVideoReplacerPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranchInternal);

	if (aEvent == "register"){//register observers
	    FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.mimetype", FlashVideoReplacerObserver, false);
	    FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.youtube", FlashVideoReplacerObserver, false);
	    FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.youtubequality", FlashVideoReplacerObserver, false);
	    FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.vimeo", FlashVideoReplacerObserver, false);
	    FlashVideoReplacerPrefService.addObserver("extensions.flvideoreplacer.bliptv", FlashVideoReplacerObserver, false);
	}

	if (aEvent == "unregister"){//unregister observers
	     FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.mimetype", FlashVideoReplacerObserver);
	     FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.youtube", FlashVideoReplacerObserver);
	     FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.youtubequality", FlashVideoReplacerObserver);
	     FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.vimeo", FlashVideoReplacerObserver);
	     FlashVideoReplacerPrefService.removeObserver("extensions.flvideoreplacer.bliptv", FlashVideoReplacerObserver);
	}
    }
};
window.addEventListener("load",function(){ flvideoreplacerObserver.registerObserver('register'); },false);//launch observer register
window.addEventListener("unload",function(){ flvideoreplacerObserver.registerObserver('unregister'); },false);//launch observer unregister