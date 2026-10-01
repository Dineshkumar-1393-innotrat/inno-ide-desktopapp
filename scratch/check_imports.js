async function test() {
  const r = await fetch('http://localhost:5173/src/components/Simulation.jsx');
  console.log('Simulation.jsx status:', r.status);
  const text = await r.text();
  const regex = /from\s+["']([^"']+)["']/g;
  let match;
  const imports = [];
  while ((match = regex.exec(text)) !== null) {
    imports.push(match[1]);
  }
  console.log('Total imports:', imports.length);
  let failed = 0;
  for (const imp of imports) {
    const url = imp.startsWith('http') ? imp : 'http://localhost:5173' + (imp.startsWith('/') ? '' : '/') + imp;
    try {
      const res = await fetch(url);
      if (res.status !== 200) {
        console.error('FAILED IMPORT:', imp, 'STATUS:', res.status);
        failed++;
      }
    } catch (e) {
      console.error('ERROR IMPORT:', imp, e.message);
      failed++;
    }
  }
  console.log('Check finished. Failed:', failed);
}
test();
