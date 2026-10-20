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
      if(active){clear(true);onStatus('Restarting microphone for a new question…');}
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
      session.onnomatch=function(){if(active!==session)return;clear(false);onStatus('No speech matched. Tap Talk to retry or type your question.');};
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
  // Pilot 5 calls this function from its inline equipment-map code.
  // Persist pins on the same IndexedDB photo record without replacing its blob.
  root.persistPins=async function(){
    if(!activePhoto)throw Error('Select a photo first.');
    const id=activePhoto.id;
    const original=await transaction('readonly',store=>store.get(id));
    if(!original)throw Error('Photo was removed.');
    const saved={...original,pins:SCCEquipmentPins.list(pins)};
    await transaction('readwrite',store=>store.put(saved));
    if(activePhoto&&activePhoto.id===id)activePhoto=saved;
  };
  root.createSpeechSession=createSpeechSession;
})(typeof window!=='undefined'?window:globalThis);
