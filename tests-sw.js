// Run: node tests-sw.js
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
(async()=>{
  const handlers={},deleted=[];
  const caches={keys:async()=>['other-app-v1','ps-split-v2','ps-split-v3','ps-split-v4'],delete:async k=>{deleted.push(k)}};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'),{
    self:{addEventListener:(t,f)=>handlers[t]=f,clients:{claim:async()=>{}}},caches
  });
  let done;handlers.activate({waitUntil:p=>done=p});await done;
  assert.deepEqual(deleted,['ps-split-v2','ps-split-v3']);
  console.log('PASS removes only obsolete ps-split caches; preserves current and other apps');
})().catch(e=>{console.error(e);process.exitCode=1});
