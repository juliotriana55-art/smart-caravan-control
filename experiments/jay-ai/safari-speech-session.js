/* Safari-compatible, client-side speech recognition session. No network or API credentials. */
(function(root){
  'use strict';
  function createSpeechSession(onText,onStatus,getLanguage){
    let active=null, timeout=null;
    function clear(abort){
      if(timeout!==null){clearTimeout(timeout);timeout=null;}
      const previous=active;active=null;
      if(abort&&previous){try{previous.abort();}catch(_){}}
    }
    function stop(){clear(true);onStatus('Stopped. Tap Talk to try again.');}
    function start(){
      if(active){stop();return false;}
      const Recognition=root.SpeechRecognition||root.webkitSpeechRecognition;
      if(!Recognition){onStatus('Speech recognition unavailable; use the keyboard.');return false;}
      const session=new Recognition();
      session.lang=getLanguage();session.continuous=false;session.interimResults=false;
      active=session;
      session.onresult=function(event){
        if(active!==session)return;
        const item=event.results&&event.results[0]&&event.results[0][0];
        if(!item||!item.transcript)return;
        clear(false);
        try{session.stop();}catch(_){}
        onText(String(item.transcript));
        onStatus('Question captured. Tap Talk for the next question.');
      };
      session.onerror=function(event){
        if(active!==session)return;
        clear(false);
        onStatus('Microphone error: '+String(event.error||'unknown')+'. Use the keyboard or retry.');
      };
      session.onend=function(){
        if(active!==session)return;
        clear(false);
        onStatus('Listening ended. Tap Talk to try again.');
      };
      timeout=setTimeout(function(){
        if(active!==session)return;
        clear(true);
        onStatus('Microphone timed out. Tap Talk to retry.');
      },18000);
      try{session.start();onStatus('Listening…');return true;}
      catch(_){clear(true);onStatus('Could not start microphone. Check Safari permissions.');return false;}
    }
    return {start:start,stop:stop,isListening:function(){return !!active;}};
  }
  root.createSpeechSession=createSpeechSession;
})(typeof window!=='undefined'?window:globalThis);
