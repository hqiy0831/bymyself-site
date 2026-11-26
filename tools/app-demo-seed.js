// Runs inside the app page (Vite dev server, browser mock). Fictional demo data only.
async () => {
  const C = await import('/src/api/contract.ts');
  const M = window.__BM_MOCK__;
  M.reset();
  const DAY = 86400000;
  const now = Date.now();
  const tz = -new Date().getTimezoneOffset();
  const pm = (...p) => JSON.stringify({ type: 'doc', content: p.map((t) => ({ type: 'paragraph', content: [{ type: 'text', text: t }] })) });
  const key = (d) => C.localDateKey(d);
  const at = (daysAgo, h = 12, m = 0) => { const d = new Date(now - daysAgo * DAY); d.setHours(h, m, 0, 0); return d.getTime(); };
  const ago = (min) => now - min * 60000;

  // Landscape "photos" drawn on a canvas (no real images)
  const photo = async (kind) => {
    const c = document.createElement('canvas'); c.width = 1200; c.height = 900; const g = c.getContext('2d');
    const sky = (a, b) => { const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, 1200, 900); };
    if (kind === 'sunset') { sky('#f6b98a', '#c96f7a'); g.fillStyle = '#ffe2a8'; g.beginPath(); g.arc(760, 520, 90, 0, 7); g.fill(); g.fillStyle = '#5b4a6b'; g.fillRect(0, 560, 1200, 340); g.fillStyle = 'rgba(255,226,168,.35)'; for (let i = 0; i < 9; i++) g.fillRect(700 - i * 6, 590 + i * 30, 120 + i * 12, 6); g.fillStyle = '#3d3350'; g.beginPath(); g.moveTo(0, 560); g.lineTo(260, 470); g.lineTo(520, 560); g.fill(); }
    if (kind === 'sea') { sky('#bfe0f5', '#e9f4fb'); g.fillStyle = '#4f8fc0'; g.fillRect(0, 430, 1200, 470); g.fillStyle = '#e8dcc4'; g.beginPath(); g.moveTo(0, 760); g.quadraticCurveTo(600, 640, 1200, 780); g.lineTo(1200, 900); g.lineTo(0, 900); g.fill(); g.fillStyle = 'rgba(255,255,255,.6)'; for (let i = 0; i < 14; i++) g.fillRect(80 * i + 20, 470 + (i % 4) * 40, 60, 4); }
    if (kind === 'park') { sky('#d8ecd2', '#f3efe0'); g.fillStyle = '#7fb36b'; g.fillRect(0, 560, 1200, 340); for (let i = 0; i < 6; i++) { g.fillStyle = ['#c9a227', '#d9b23a', '#b8901f'][i % 3]; g.beginPath(); g.arc(120 + i * 200, 470 - (i % 2) * 40, 110, 0, 7); g.fill(); g.fillStyle = '#6b4f3a'; g.fillRect(110 + i * 200, 520 - (i % 2) * 40, 20, 80); } g.fillStyle = '#e8dcc0'; g.beginPath(); g.moveTo(520, 900); g.quadraticCurveTo(640, 700, 760, 560); g.lineTo(800, 560); g.quadraticCurveTo(720, 720, 700, 900); g.fill(); }
    if (kind === 'city') { sky('#283654', '#e6a37a'); for (let i = 0; i < 14; i++) { const h = 200 + ((i * 97) % 320); g.fillStyle = i % 2 ? '#1d2438' : '#252e47'; g.fillRect(i * 88, 900 - h - 120, 80, h + 120); g.fillStyle = '#ffd98a'; for (let w = 0; w < 10; w++) if ((i + w) % 3) g.fillRect(i * 88 + 12 + (w % 3) * 22, 900 - h - 90 + Math.floor(w / 3) * 50, 10, 16); } }
    if (kind === 'cafe') { sky('#efe2cf', '#d8c2a2'); g.fillStyle = '#8a5a3c'; g.fillRect(0, 620, 1200, 280); g.fillStyle = '#fff'; g.beginPath(); g.ellipse(600, 600, 190, 60, 0, 0, 7); g.fill(); g.fillStyle = '#f4f0ea'; g.fillRect(470, 470, 260, 140); g.fillStyle = '#6b3f26'; g.beginPath(); g.ellipse(600, 475, 128, 26, 0, 0, 7); g.fill(); g.strokeStyle = '#f4f0ea'; g.lineWidth = 22; g.beginPath(); g.arc(745, 535, 45, -1.4, 1.4); g.stroke(); }
    if (kind === 'grad') { sky('#c9d8f0', '#f1e6d8'); g.fillStyle = '#2b3a5c'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(300 + i * 150, 600, 55, 0, 7); g.fill(); g.fillRect(250 + i * 150, 640, 100, 260); } g.fillStyle = '#1f2a44'; for (let i = 0; i < 5; i++) { g.fillRect(262 + i * 150, 530, 76, 14); g.fillRect(292 + i * 150, 500, 16, 30); } }
    const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
    return new Uint8Array(await blob.arrayBuffer());
  };
  const attach = async (entryId, kind, caption) => C.addAttachment({ entryId, source: { type: 'bytes', bytes: await photo(kind), fileName: kind + '.jpg' }, caption, clientRequestId: crypto.randomUUID() });

  await C.setSetting('onboardingDone', true);

  // ---------- Past ----------
  const sea = await C.createEntry({ kind: 'memory', title: '第一次看海', body: '那年夏天爸爸开了很久的车，到的时候已经是傍晚。海风很咸，我光着脚一直走到天黑，鞋子里全是沙。', occurredAt: Date.UTC(2009, 6, 15), occurredPrecision: 'month', meta: { place: '青岛', people: ['爸爸', '妈妈'] }, tags: ['旅行', '家人'], starred: true });
  await attach(sea.id, 'sea', '青岛的海');
  await C.createEntry({ kind: 'experience', title: '大学四年', body: '学了计算机，熬过很多个通宵，也认识了到现在还常联系的朋友。', occurredAt: Date.UTC(2012, 8, 1), endedAt: Date.UTC(2016, 5, 30), occurredPrecision: 'month', meta: { place: '武汉', people: ['室友们'] }, tags: ['成长'] });
  const grad = await C.createEntry({ kind: 'memory', title: '毕业典礼', body: '和室友在操场上拍了最后一张合照，大家都说以后每年要聚一次。', occurredAt: Date.UTC(2016, 5, 18), occurredPrecision: 'day', meta: { place: '学校操场', people: ['室友们'] }, tags: ['成长', '朋友'] });
  await attach(grad.id, 'grad', '最后一张合照');
  await C.createEntry({ kind: 'decision', title: '离开第一家公司', body: '在一个很稳定的地方待了三年，却越来越不知道自己在做什么。', occurredAt: Date.UTC(2019, 2, 10), occurredPrecision: 'day', meta: { options: ['留下来，等升职', '离开，去做产品'], expectation: '可能要辛苦一两年。', outcome: '回头看是对的。那一年很辛苦，但第一次觉得工作是自己的。' }, tags: ['工作'] });
  await C.createEntry({ kind: 'experience', title: '学会做饭', body: '从煮糊一锅粥开始，到现在能做一桌菜请朋友来吃。', occurredAt: Date.UTC(2021, 3, 1), occurredPrecision: 'month', tags: ['生活'] });
  const home = await C.createEntry({ kind: 'memory', title: '搬进新家的第一个晚上', body: '箱子还没拆完，就坐在地板上吃了一碗泡面。窗外能看到江，觉得这里以后会是家。', occurredAt: at(83, 21), occurredPrecision: 'day', meta: { place: '上海', people: [] }, tags: ['生活'], starred: true });
  await attach(home.id, 'city', '窗外的夜景');

  // ---------- Present ----------
  const tj = await C.getOrCreateJournal({ localDate: key(now), tzOffsetMinutes: tz });
  await C.updateEntry(tj.id, tj.revision, { title: '江边的风', body: pm('下午去江边走了很久，风很大。', '想起去年这个时候也在犹豫要不要换工作，现在回头看，那时的担心大多没有发生。', '晚上给妈妈打了电话，她说家里的柿子熟了，让我过年回去吃。'), bodyFormat: 'prosemirror', meta: { weather: '晴' }, tags: ['散步', '家人'] });
  await C.createEntry({ kind: 'mood', mood: 4, parentId: tj.id, occurredAt: ago(35), meta: { emotions: ['calm', 'hopeful'] } });
  await C.createEntry({ kind: 'mood', mood: 3, occurredAt: ago(6 * 60), meta: { emotions: ['focused'] } });
  const moods = [[1, 3, ['tired']], [2, 4, ['happy']], [3, 2, ['anxious']], [4, 3, ['calm']], [5, 5, ['grateful', 'happy']], [6, 4, ['inspired']]];
  for (const [d, m, e] of moods) await C.createEntry({ kind: 'mood', mood: m, occurredAt: at(d, 20), meta: { emotions: e } });
  for (const [d, t, body] of [[1, '有点累', '加班到很晚，回家路上买了个烤红薯，还是热的。'], [2, '周末', '和朋友去看了展，又去吃了很久没吃的火锅。'], [5, '收到一封信', '大学室友寄来了明信片，上面画着我们宿舍楼。']]) {
    const j = await C.getOrCreateJournal({ localDate: key(at(d)), tzOffsetMinutes: tz });
    await C.updateEntry(j.id, j.revision, { title: t, body: pm(body), bodyFormat: 'prosemirror' });
  }
  const m1 = await C.createEntry({ kind: 'moment', title: '江边的晚霞', body: '五点多的时候，整片天都变成了橘色。', occurredAt: ago(3 * 60), meta: { place: '滨江步道' } });
  await attach(m1.id, 'sunset', '');
  const m2 = await C.createEntry({ kind: 'moment', title: '楼下新开的咖啡店', body: '老板会在拉花上画一只猫。', occurredAt: at(2, 10, 30), meta: { place: '楼下' } });
  await attach(m2.id, 'cafe', '');
  const m3 = await C.createEntry({ kind: 'moment', title: '公园里的银杏', occurredAt: at(4, 15) });
  await attach(m3.id, 'park', '');
  await C.createEntry({ kind: 'thought', title: '慢一点也没关系', body: '不是每件事都要马上有结果。', occurredAt: ago(12) });
  await C.createEntry({ kind: 'thought', title: '关于专注', body: '一次只做一件事，比同时做三件事走得更远。', occurredAt: at(3, 9) });

  // ---------- Future ----------
  const dream = await C.createEntry({ kind: 'dream', title: '环游世界', body: '在 40 岁之前去过 30 个国家，在每个地方给自己写一张明信片。', occurredAt: Date.UTC(2035, 0, 1), occurredPrecision: 'year', meta: { why: '想亲眼看看世界有多大。' }, starred: true });
  let g1 = await C.createEntry({ kind: 'goal', title: '明年去 3 个新国家', parentId: dream.id, occurredAt: Date.UTC(2027, 11, 31), occurredPrecision: 'day' });
  for (const s of ['办好护照', '定下第一站：冰岛', '攒够旅费', '学几句当地的话']) g1 = await C.addPlanStep({ goalId: g1.id, title: s });
  await C.updatePlanStep(g1.steps[0].id, { doneAt: at(20) });
  await C.updatePlanStep(g1.steps[1].id, { doneAt: at(9) });
  let g2 = await C.createEntry({ kind: 'goal', title: '一年内跑完半程马拉松', occurredAt: Date.UTC(2027, 3, 20), occurredPrecision: 'day', meta: { why: '想证明自己能坚持一件事。' } });
  for (const s of ['每周跑三次', '跑完第一个 10 公里', '报名比赛', '连续跑 15 公里', '比赛日']) g2 = await C.addPlanStep({ goalId: g2.id, title: s });
  for (const [i, d] of [[0, 60], [1, 31], [2, 12]]) await C.updatePlanStep(g2.steps[i].id, { doneAt: at(d) });
  await C.createEntry({ kind: 'goal', title: '读完 24 本书', occurredAt: Date.UTC(2026, 11, 31), occurredPrecision: 'day' });

  // An already-opened letter with a reply (written "a year ago")
  M.setNow(at(400));
  const old = await C.createEntry({ kind: 'letter', title: '写给一年后的自己', body: '希望你已经不再害怕改变。如果还在犹豫，就去江边走一走吧。', status: 'sealed', unlockAt: C.startOfLocalDay(key(at(30))) });
  M.setNow(null);
  await C.openLetter(old.id);
  await C.createEntry({ kind: 'reflection', parentId: old.id, title: '读一年前的信', body: '读到的时候笑了，我真的常去江边走。谢谢你那时候没有放弃。' });
  await C.createEntry({ kind: 'letter', title: '写给 30 岁的我', body: '（封存中）', status: 'sealed', unlockAt: C.startOfLocalDay('2030-01-01') });
  await C.createEntry({ kind: 'letter', title: '给五年后的家', body: '（封存中）', status: 'sealed', unlockAt: C.startOfLocalDay('2031-09-03') });
  return 'seeded';
}
