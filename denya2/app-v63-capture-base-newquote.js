// DENYA v63 - capture the original quotation editor before legacy wrappers modify it.
(function(){
  if(typeof window.newQuote==='function' && !window.__denyaBaseNewQuote){
    window.__denyaBaseNewQuote=window.newQuote;
  }
})();
