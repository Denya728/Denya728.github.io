(function(){
  const previousShow=window.show;

  window.show=function(view){
    if(view==='subscription'){
      if(typeof setActive==='function') setActive('subscription');
      if(views && typeof views.subscription==='function'){
        views.subscription();
        return;
      }
    }
    return previousShow.apply(this,arguments);
  };

  const btn=document.querySelector('.nav button[data-view="subscription"]');
  if(btn) btn.onclick=()=>window.show('subscription');
})();
