/* DENYA SWEETLAB v126 — runtime editorial cleanup */
(function(){
  if(document.getElementById('sweetlab-v126')) return;
  const s=document.createElement('style'); s.id='sweetlab-v126';
  s.textContent=`
#content::before,#content::after,.page-head::before,.page-head::after,.v51-summary::before,.v51-summary::after,.v52-top::before,.v52-top::after,.v52-kpis::before,.v52-kpis::after,.inventory-kpis::before,.inventory-kpis::after,.inventory-toolbar::before,.inventory-toolbar::after,#denya114::before,#denya114::after,#denya114 .panel::before,#denya114 .panel::after{content:none!important;display:none!important;background:none!important}
#content .v52-top,#content .v52-kpis,#content .v52-history,#content .table-wrap{position:relative;z-index:1}
#content .v52-kpi,#content .card.kpi{background:#fbf8f3!important;border:1px solid #ddd4ca!important;box-shadow:none!important;border-radius:8px!important}
#content .v52-kpi strong,#content .card.kpi strong{font-family:Cormorant Garamond,Georgia,serif!important;color:#201c19!important}
#denya114{max-width:1180px!important;margin:0 auto!important;padding:8px 4px 40px!important;color:#201c19!important;font-family:Inter,ui-sans-serif,system-ui,sans-serif!important}
#denya114 .phead{margin-bottom:18px!important} #denya114 .ey{color:#947b5f!important}
#denya114 h1{font-family:Cormorant Garamond,Georgia,serif!important;font-size:36px!important;font-weight:600!important;letter-spacing:-.02em!important}
#denya114 .sub{color:#756b63!important}
#denya114 .tabs{background:#eee8df!important;border:1px solid #d9d0c7!important;border-radius:7px!important;box-shadow:none!important;padding:4px!important}
#denya114 .tabs button{border-radius:5px!important;color:#6f665f!important;box-shadow:none!important}
#denya114 .tabs button.on{background:#201c19!important;color:#fff!important;box-shadow:none!important}
#denya114 .panel{border:1px solid #ddd4ca!important;border-radius:8px!important;background:#fbf8f3!important;box-shadow:none!important}
#denya114 .title{padding:20px 24px!important;border-bottom:1px solid #e2dad2!important}
#denya114 .title h2{font-family:Cormorant Garamond,Georgia,serif!important;font-size:25px!important;font-weight:600!important;color:#201c19!important}
#denya114 .pbody{padding:22px 24px!important}
#denya114 .card{border:1px solid #ddd4ca!important;border-radius:8px!important;background:#fffdf9!important;box-shadow:none!important}
#denya114 .hero{background:#201c19!important;color:#fff!important;border:0!important;border-radius:8px!important;box-shadow:none!important}
#denya114 .hero h3{font-family:Cormorant Garamond,Georgia,serif!important;font-size:29px!important;font-weight:600!important}
#denya114 .hero .ey{color:#c6aa83!important} #denya114 .hero .sub,#denya114 .hero p{color:#d8d0c9!important}
#denya114 .brand .logo{background:#fff!important;color:#201c19!important;border-radius:50%!important;box-shadow:none!important}
#denya114 .status{border-radius:5px!important;background:#fff!important;color:#201c19!important;border:0!important}
#denya114 .fields input,#denya114 .fields textarea,#denya114 .fields select,#denya114 .companybar select{border:1px solid #d8d0c7!important;border-radius:5px!important;background:#fff!important;box-shadow:none!important}
#denya114 .actions{border-top:1px solid #e5ddd5!important}
#denya114 button.primary{background:#201c19!important;border-color:#201c19!important;border-radius:5px!important}
#denya114 button.secondary{background:#fff!important;color:#201c19!important;border:1px solid #cfc5bb!important;border-radius:5px!important}
#denya114 .plan,#denya114 .template,#denya114 .helpitem{border:1px solid #ddd4ca!important;border-radius:7px!important;background:#fffdf9!important;box-shadow:none!important}
#denya114 .plan.current{border:2px solid #201c19!important}
#denya114 .price{font-family:Cormorant Garamond,Georgia,serif!important;font-size:30px!important}
  `;
  document.head.appendChild(s);
})();