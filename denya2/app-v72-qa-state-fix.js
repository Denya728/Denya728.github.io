(function(){
  const baseRun=window.DENYA_QA&&window.DENYA_QA.run;
  if(typeof baseRun!=='function')return;

  function escSafe(v){return typeof esc==='function'?esc(String(v??'')):String(v??'')}
  function fixedRun(){
    const results=baseRun();
    const row=results.find(r=>r.name==='Estado principal cargado');
    if(row){
      row.ok=typeof state==='object'&&state!==null;
      row.detail=row.ok?'Estado local disponible':'Estado local no disponible';
    }
    return results;
  }

  window.DENYA_QA.run=fixedRun;
  window.runDiagnosticsV71=function(){
    const r=fixedRun();
    state.qaRuns=Array.isArray(state.qaRuns)?state.qaRuns:[];
    state.qaRuns.unshift({at:new Date().toISOString(),type:'diagnostic',passed:r.filter(x=>x.ok).length,total:r.length});
    state.qaRuns=state.qaRuns.slice(0,20);
    if(typeof save==='function')save();
    const target=document.getElementById('v71qaresults');
    if(!target)return;
    const passed=r.filter(x=>x.ok).length;
    target.innerHTML=`<div class="v71-qa-summary"><b>Diagnóstico: ${passed}/${r.length} correctas</b><span class="badge ${passed===r.length?'ok':'off'}">${passed===r.length?'LISTO':'REVISAR'}</span></div>${r.map(x=>`<div class="v71-check ${x.ok?'pass':'fail'}"><span>${x.ok?'✓':'✕'} ${escSafe(x.name)}</span><small>${escSafe(x.detail||'')}</small></div>`).join('')}`;
  };
})();