/* DENYA v141 — profile must never own the initial route */
(function(){
  function goHome(){
    try{
      if(location.hash){
        history.replaceState(null,'',location.pathname+location.search);
      }
      if(typeof window.show==='function') window.show('home');
    }catch(e){ console.error('DENYA v141 boot route',e); }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){setTimeout(goHome,50)});
  else setTimeout(goHome,50);
})();
