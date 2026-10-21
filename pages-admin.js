/* pages-admin.js — หน้าของเจ้าหน้าที่ HR
 *  ภาพรวม · บุคลากรใหม่ (นำเข้า/เชิญ/ตรวจ) · ทะเบียน · รายคน · รอบทำสัญญา/เอกสาร · สิทธิ์ · รายงานส่งงานเงินเดือน
 *  ทบทวนไม่ทำเวชฯ · ข้อมูลสุขภาพ · ย้ายข้อมูลเดิม · ตั้งค่า */
function posLabel(g) { return ((K().POS_GROUPS || {})[g] || {}).label || '—'; }
function peopleCache(force) {
  if (S.people && !force && Date.now() - S.peopleAt < 20000) return Promise.resolve(S.people);
  return api('listPersons').then(function (d) { S.people = d; S.peopleAt = Date.now(); return d; });
}
function invalidatePeople() { S.people = null; }
function filterChips(counts, cur, labels) {
  return '<div class="chips">' + Object.keys(labels).map(function (k) { return '<button class="chip' + (cur === k ? ' on' : '') + '" data-chip="' + k + '">' + esc(labels[k]) + ' <b>' + (counts[k] || 0) + '</b></button>'; }).join('') + '</div>';
}

/* ═════════ ภาพรวม ═════════ */
var AUDIT_TH = { changePassword: 'เปลี่ยนรหัสผ่าน', closeMonth: 'ปิดเดือนรายงาน', decideEdit: 'พิจารณาคำขอแก้ไขข้อมูล', deleteDoc: 'ลบเอกสาร', deleteEvent: 'ลบรายการสิทธิ์',
  healthExport: 'ส่งออกข้อมูลสุขภาพ', housekeeping: 'ล้างข้อมูลตามกำหนด PDPA', importInvites: 'นำเข้ารายชื่อบุคลากรใหม่', importLegacy: 'นำเข้าข้อมูลเดิมจาก Note', issueDocs: 'ออกเอกสารสัญญา',
  printDocs: 'พิมพ์เอกสาร', reopenMonth: 'เปิดเดือนรายงานอีกครั้ง', resetPassword: 'รีเซ็ตรหัสผ่านผู้ใช้', savePersonHR: 'แก้ไขข้อมูลบุคลากร', savePtsRates: 'แก้ไขอัตรา พ.ต.ส.',
  saveRound: 'บันทึกรอบทำสัญญา', saveSettings: 'แก้ไขการตั้งค่า', saveSigner: 'แก้ไขผู้ลงนาม', saveUser: 'แก้ไขผู้ใช้', sendInvites: 'ส่งลิงก์เชิญทางอีเมล', signDocs: 'บันทึกการลงนามสัญญา',
  submitForm: 'บุคลากรใหม่ส่งข้อมูล', verifyPerson: 'ตรวจข้อมูลบุคลากรใหม่', saveEvent: 'บันทึกเหตุการณ์สิทธิ์', bulkSuspend: 'ระงับหลายคน' };
var AUDIT_IC = { importLegacy: ['upload', 'violet'], issueDocs: ['file', 'info'], printDocs: ['printer', 'info'], signDocs: ['pen', 'ok'], sendInvites: ['mail', 'brand'], importInvites: ['inbox', 'brand'],
  verifyPerson: ['check', 'ok'], submitForm: ['paper', 'brand'], closeMonth: ['lock', 'gold'], saveSettings: ['gear', ''], healthExport: ['heart', 'bad'], deleteDoc: ['trash', 'bad'], deleteEvent: ['trash', 'bad'] };
var RIGHT_CLR = { NP: '#d72638', PTS: '#2459c9', TOPUP: '#0e7c86', TEACH: '#6d3fd6', SHORT: '#b7791f', OTHER: '#8f8185' };
var KIND_CLR = [['START', '#17a673', 'เริ่มรับ / ยกเลิกระงับ'], ['CHANGE', '#6d3fd6', 'ปรับอัตรา / เปลี่ยนกลุ่ม'], ['SUSPEND', '#e8a33d', 'ระงับ'], ['CANCEL', '#e5484d', 'ยกเลิก']];
function agoTh(s) {
  var t = Date.parse(String(s).slice(0, 19).replace(' ', 'T') + '+07:00'); if (isNaN(t)) return dtTh(s);
  var m = Math.round((Date.now() - t) / 60000);
  return m < 1 ? 'เมื่อสักครู่' : m < 60 ? m + ' นาทีที่แล้ว' : m < 1440 ? Math.round(m / 60) + ' ชั่วโมงที่แล้ว' : m < 10080 ? Math.round(m / 1440) + ' วันที่แล้ว' : dtTh(s);
}
/* กราฟแท่งซ้อน 12 เดือน (SVG วาดเอง ไม่ใช้ไลบรารี) */
function trendChart(T) {
  var W = 640, H = 230, L = 34, B = 26, top = 12, cw = (W - L - 6) / T.length, bw = Math.min(30, cw * .58);
  var tot = T.map(function (m) { return KIND_CLR.reduce(function (a, k) { return a + (m.c[k[0]] || 0); }, 0); });
  var mx = Math.max(4, Math.max.apply(null, tot)), step = Math.pow(10, Math.floor(Math.log10(mx))), nice = Math.ceil(mx / step) * step;
  if (nice / step <= 2) step = step / 2; var y = function (v) { return H - B - (v / nice) * (H - B - top); };
  var g = '';
  for (var v = 0; v <= nice + 1e-9; v += step) g += '<line class="gridl" x1="' + L + '" x2="' + W + '" y1="' + y(v) + '" y2="' + y(v) + '"/><text x="' + (L - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + Math.round(v) + '</text>';
  T.forEach(function (m, i) {
    var x = L + i * cw + (cw - bw) / 2, acc = 0, bars = '';
    KIND_CLR.forEach(function (k) { var n = m.c[k[0]] || 0; if (!n) return; var y1 = y(acc + n), h = y(acc) - y1; bars += '<rect class="bar" x="' + x + '" y="' + y1 + '" width="' + bw + '" height="' + Math.max(1, h - 1.5) + '" rx="4" fill="' + k[1] + '"/>'; acc += n; });
    var lab = TH_MS[+m.ym.slice(5, 7) - 1], tipw = 64, tx = Math.min(Math.max(x + bw / 2 - tipw / 2, L), W - tipw);
    g += '<g class="col"><rect x="' + (L + i * cw) + '" y="' + top + '" width="' + cw + '" height="' + (H - B - top) + '" fill="transparent"/>' + bars +
      '<text x="' + (x + bw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + lab + '</text>' +
      '<g class="tip"><rect x="' + tx + '" y="' + (y(acc) - 30) + '" width="' + tipw + '" height="22" rx="7"/><text x="' + (tx + tipw / 2) + '" y="' + (y(acc) - 15) + '" text-anchor="middle">' + tot[i] + ' รายการ</text></g></g>';
  });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="จำนวนเหตุการณ์สิทธิ์รายเดือน">' + g + '</svg>' +
    '<div class="legend">' + KIND_CLR.map(function (k) { return '<span><i style="background:' + k[1] + '"></i>' + k[2] + '</span>'; }).join('') + '</div>';
}
function donut(parts, center, sub) {
  var tot = parts.reduce(function (a, p) { return a + p.v; }, 0), R = 58, C = 2 * Math.PI * R, off = 0, segs = '';
  parts.forEach(function (p) { if (!p.v) return; var len = C * p.v / tot; segs += '<circle cx="75" cy="75" r="' + R + '" fill="none" stroke="' + p.c + '" stroke-width="18" stroke-dasharray="' + Math.max(0, len - 2) + ' ' + (C - len + 2) + '" stroke-dashoffset="' + (-off) + '" transform="rotate(-90 75 75)"><title>' + esc(p.l) + ' ' + p.v + '</title></circle>'; off += len; });
  if (!tot) segs = '<circle cx="75" cy="75" r="' + R + '" fill="none" stroke="var(--line)" stroke-width="18"/>';
  return '<div class="donut-wrap"><svg class="chart" viewBox="0 0 150 150" style="max-width:150px">' + segs + '<text class="donut-c" x="75" y="78" text-anchor="middle">' + money(tot) + '</text><text x="75" y="98" text-anchor="middle">' + esc(sub || '') + '</text></svg>' +
    '<div class="dl">' + parts.map(function (p) { return '<div class="r"><i style="background:' + p.c + '"></i><span>' + esc(p.l) + '</span><b>' + money(p.v) + '</b></div>'; }).join('') + '</div></div>';
}
PAGES.dash = function (v) {
  setTop('ภาพรวม', 'สถานะงานทะเบียนสัญญา ณ ' + dThL(todayIso()), [can('invite') ? mkBtn(ico('plus', 'sm') + 'เพิ่มบุคลากรใหม่', 'pri', function () { location.hash = '#/intake'; setTimeout(function () { var b = $$('#pgActs .btn').filter(function (x) { return /เพิ่มทีละคน/.test(x.textContent); })[0]; if (b) b.click(); }, 400); }) : null]);
  api('getDashboard').then(function (d) {
    S.dash = d; refreshBadges();
    var b = d.byStatus || {}, waitVerify = b.SUBMITTED || 0, filling = (b.INVITED || 0) + (b.DRAFT || 0) + (b.RETURNED || 0);
    var pend = waitVerify + d.docs.flagged + d.edits + d.licenseSoon;
    var k = function (val, lab, sub, go, icon, cls, attn) {
      return '<div class="kpi' + (attn && val ? ' attn' : '') + '"' + (go ? ' data-go="' + go + '"' : '') + '><div class="kh"><span class="l">' + lab + '</span><span class="tile ' + cls + '">' + ico(icon, 'sm') + '</span></div><span class="v">' + money(val) + '</span><span class="s">' + (sub || '&nbsp;') + '</span>' + (go ? ico('arrow', 'sm go') : '') + '</div>'; };
    var R = K().RIGHT_TYPES || {}, br = d.byRight || {};
    var parts = Object.keys(RIGHT_CLR).filter(function (r) { return br[r]; }).map(function (r) { return { l: (R[r] || {}).short || r, v: br[r], c: RIGHT_CLR[r] }; });
    var pipe = [['INVITED', 'ส่งลิงก์แล้ว', 'info'], ['DRAFT', 'กำลังกรอก', 'warn'], ['RETURNED', 'ส่งกลับแก้', 'bad'], ['SUBMITTED', 'รอตรวจ', 'brand'], ['VERIFIED', 'ตรวจแล้ว', 'ok']];
    var pmax = Math.max.apply(null, pipe.map(function (x) { return b[x[0]] || 0; }).concat([1]));
    var byPos = d.byPos || {}, posMax = Math.max.apply(null, Object.keys(byPos).map(function (x) { return byPos[x]; }).concat([1]));
    v.innerHTML =
      '<div class="hero"><div><h2>' + greet() + ' คุณ' + esc(firstNameOf(S.me.name)) + '</h2><p>' + (pend ? 'มีงานรอดำเนินการ ' + money(pend) + ' รายการ · รายงานเดือน ' + ymTh(d.reportYm) + ' ส่งงานเงินเดือนภายในวันที่ 5' : 'ไม่มีงานค้าง · รายงานเดือน ' + ymTh(d.reportYm) + ' ส่งงานเงินเดือนภายในวันที่ 5') + '</p></div>' +
      '<div class="hstats"><div class="hs"><b>' + money(d.total) + '</b><span>คนในทะเบียน</span></div><div class="hs"><b>' + money(d.np.active) + '</b><span>รับไม่ทำเวชฯ อยู่</span></div><div class="hs"><b>' + money(d.pts.active) + '</b><span>รับ พ.ต.ส. อยู่</span></div></div></div>' +
      '<div class="kpis">' +
      k(waitVerify, 'รอตรวจข้อมูลบุคลากรใหม่', 'ส่งข้อมูลมาแล้ว', '#/intake/SUBMITTED', 'inbox', 'brand', true) +
      k(filling, 'กำลังกรอกข้อมูล', 'ส่งลิงก์แล้ว ' + (b.INVITED || 0) + ' · ส่งกลับแก้ ' + (b.RETURNED || 0), '#/intake', 'edit', 'info') +
      k(d.docs.flagged, 'เอกสารที่เจ้าตัวแจ้งแก้', 'รอเจ้าตัวตรวจ ' + d.docs.waitStaff + ' ฉบับ', '#/rounds', 'alert', 'bad', true) +
      k(d.edits, 'คำขอแก้ไขข้อมูล', 'จากบุคลากรปัจจุบัน', '#/people/edit', 'user', 'warn', true) +
      k(d.monthEvents, 'รายการเข้ารายงานเดือนนี้', ymTh(d.reportYm) + ' · ส่งภายในวันที่ 5', '#/report', 'month', 'teal') +
      k(d.licenseSoon, 'ใบอนุญาตใกล้หมดอายุ', 'ภายใน 90 วัน', '#/people/license', 'clock', 'gold', true) +
      (d.migrateReview ? k(d.migrateReview, 'ข้อมูลเดิมรอตรวจ', 'ย้ายจาก Note', '#/migrate', 'upload', 'violet', true) : '') + '</div>' +
      '<div class="dgrid"><div class="col">' +
        '<div class="card"><div class="hd"><h3><span class="tile brand">' + ico('trend', 'sm') + '</span>ความเคลื่อนไหวสิทธิ์ค่าตอบแทน 12 เดือน</h3><span class="muted">นับตามวันที่มีผล</span></div><div class="bd">' + trendChart(d.trend || []) + '</div></div>' +
        '<div class="card"><div class="hd"><h3><span class="tile info">' + ico('file', 'sm') + '</span>รอบทำสัญญาที่เปิดอยู่</h3>' + (can('docs') ? '<a class="btn sm" href="#/rounds">ดูทั้งหมด' + ico('chevr', 'sm') + '</a>' : '') + '</div><div class="bd flush">' +
          (d.rounds.length ? d.rounds.map(function (r) { var pc = r.members ? Math.round(r.verified / r.members * 100) : 0; return '<a class="round-row" href="#/round/' + r.roundId + '"><div><b>' + esc(r.name) + '</b><small>' + ico('clock', 'sm') + ' นัดลงนาม ' + (dThL(r.signDate) || '—') + ' · สมาชิก ' + r.members + ' คน</small></div><div><small>ตรวจแล้ว ' + r.verified + '/' + r.members + ' · ส่งข้อมูล ' + r.submitted + '</small><div class="meter"><i style="width:' + pc + '%"></i></div></div></a>'; }).join('') : emptyState('file', 'ยังไม่มีรอบทำสัญญา', 'สร้างรอบเพื่อออกเอกสารให้บุคลากรใหม่ทั้งกลุ่มพร้อมกัน')) + '</div></div>' +
        '<div class="card"><div class="hd"><h3><span class="tile gold">' + ico('spark', 'sm') + '</span>ทางลัด</h3><span class="muted">กด <kbd>Ctrl</kbd> <kbd>K</kbd> เพื่อค้นหาทุกอย่าง</span></div><div class="bd"><div class="quick">' +
          [['inbox', 'brand', 'นำเข้ารายชื่อบุคลากรใหม่', '#/intake', can('invite')], ['file', 'info', 'ออกเอกสารรอบทำสัญญา', '#/rounds', can('docs')], ['coins', 'teal', 'บันทึกเหตุการณ์สิทธิ์', '#/rights', can('rights.edit') || can('rights.view')],
           ['month', 'gold', 'รายงานส่งงานเงินเดือน', '#/report', can('report')], ['clip', 'violet', 'ทบทวนไม่ทำเวชฯ ประจำปี', '#/review', can('report')], ['heart', 'bad', 'ส่งออกข้อมูลสุขภาพ', '#/health', can('health')]]
            .filter(function (x) { return x[4]; }).map(function (x) { return '<a href="' + x[3] + '"><span class="tile ' + x[1] + '">' + ico(x[0], 'sm') + '</span>' + x[2] + '</a>'; }).join('') + '</div></div></div>' +
      '</div><div class="col">' +
        '<div class="card"><div class="hd"><h3><span class="tile teal">' + ico('coins', 'sm') + '</span>ผู้รับสิทธิ์ ณ ปัจจุบัน</h3></div><div class="bd">' + donut(parts, '', 'สิทธิ์ที่รับอยู่') + '</div></div>' +
        '<div class="card"><div class="hd"><h3><span class="tile brand">' + ico('inbox', 'sm') + '</span>สถานะบุคลากรใหม่</h3><a class="btn sm ghost" href="#/intake">เปิด' + ico('chevr', 'sm') + '</a></div><div class="bd" style="gap:10px">' +
          pipe.map(function (x) { var n = b[x[0]] || 0; return '<a href="#/intake/' + x[0] + '" style="text-decoration:none;color:inherit;display:grid;gap:4px"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span><span class="tag ' + x[2] + '">' + x[1] + '</span></span><b>' + n + '</b></div><div class="meter"><i style="width:' + Math.round(n / pmax * 100) + '%"></i></div></a>'; }).join('') + '</div></div>' +
        '<div class="card"><div class="hd"><h3><span class="tile violet">' + ico('users', 'sm') + '</span>บุคลากรที่ปฏิบัติงานตามสายงาน</h3></div><div class="bd" style="gap:10px">' +
          (Object.keys(byPos).length ? Object.keys(byPos).sort(function (a, c) { return byPos[c] - byPos[a]; }).map(function (g) { return '<div style="display:grid;gap:4px"><div style="display:flex;justify-content:space-between;font-size:13.5px"><span>' + esc(posLabel(g)) + '</span><b>' + byPos[g] + '</b></div><div class="meter"><i style="width:' + Math.round(byPos[g] / posMax * 100) + '%;background:linear-gradient(90deg,#8b5cf6,#6d3fd6)"></i></div></div>'; }).join('') : '<span class="muted">ยังไม่มีข้อมูล</span>') + '</div></div>' +
        '<div class="card"><div class="hd"><h3><span class="tile">' + ico('activity', 'sm') + '</span>กิจกรรมล่าสุด</h3>' + (can('admin') ? '<a class="btn sm ghost" href="#/settings/audit">ทั้งหมด' + ico('chevr', 'sm') + '</a>' : '') + '</div><div class="bd" style="padding-top:6px;padding-bottom:8px"><div class="feed">' +
          ((d.recent || []).length ? d.recent.map(function (a) { var ic = AUDIT_IC[a.action] || ['activity', '']; return '<div class="fi"><span class="tile ' + ic[1] + '">' + ico(ic[0], 'sm') + '</span><div><b>' + esc(AUDIT_TH[a.action] || a.action) + '</b><small>' + esc(a.whoName || a.who) + ' · ' + agoTh(a.at) + '</small></div></div>'; }).join('') : '<span class="muted">ยังไม่มีกิจกรรม</span>') + '</div></div></div>' +
      '</div></div>';
    v.onclick = function (ev) { var t = ev.target.closest('[data-go],[data-href]'); if (t) location.hash = t.dataset.go || t.dataset.href; };
  }, fail(v));
};

/* ═════════ บุคลากรใหม่ ═════════ */
var INTAKE_ST = { ALL: 'ทั้งหมด', INVITED: 'ส่งลิงก์แล้ว', DRAFT: 'กำลังกรอก', RETURNED: 'ส่งกลับแก้', SUBMITTED: 'รอตรวจ', VERIFIED: 'ตรวจแล้ว' };
PAGES.intake = function (v, args) {
  var chip = args[0] || 'ALL';
  setTop('บุคลากรใหม่', 'นำเข้ารายชื่อผู้ผ่านการสอบ ส่งลิงก์เชิญ และตรวจข้อมูลที่ส่งมา', [
    can('invite') ? mkBtn(ico('download', 'sm') + 'แม่แบบ Excel', '', downloadInviteTemplate) : null,
    can('invite') ? mkBtn(ico('upload', 'sm') + 'นำเข้ารายชื่อ', '', function () { importInvitesDlg(v); }) : null,
    can('invite') ? mkBtn(ico('plus', 'sm') + 'เพิ่มทีละคน', 'pri', function () { addInviteDlg(v); }) : null].filter(Boolean));
  peopleCache(true).then(function (d) {
    var rows = d.rows.filter(function (r) { return r.source === 'INVITE' && r.status !== 'ACTIVE' && r.status !== 'LEFT'; });
    var cnt = { ALL: rows.length }; rows.forEach(function (r) { cnt[r.status] = (cnt[r.status] || 0) + 1; });
    var sel = {};
    var draw = function () {
      var q = ($('#iq') && $('#iq').value || '').trim(), rd = $('#iround') ? $('#iround').value : '';
      var list = rows.filter(function (r) { return (chip === 'ALL' || r.status === chip) && (!rd || r.roundId === rd) && (!q || (r.name + r.position + r.email + r.empCode).indexOf(q) >= 0); });
      $('#ibody').innerHTML = list.length ? list.map(function (r) {
        return '<tr class="click" data-pid="' + r.pid + '"><td><input type="checkbox" data-sel="' + r.pid + '"' + (sel[r.pid] ? ' checked' : '') + ' aria-label="เลือก"></td><td><b>' + esc(r.name) + '</b><div class="sub">' + esc(r.email || '') + '</div></td><td>' + esc(r.position || '') + '<div class="sub">' + esc(posLabel(r.posGroup)) + ' · ' + esc(r.dept || '') + '</div></td>' +
          '<td>' + (dTh(r.startDate) || '—') + '</td><td>' + esc(roundName(d.rounds, r.roundId)) + '</td><td>' + statusTag(r.status) + '</td><td class="sub">' + dtTh(r.updatedAt) + '</td></tr>';
      }).join('') : '<tr><td colspan="7" class="empty">ไม่มีรายชื่อ</td></tr>';
      $('#iCount').textContent = list.length + ' คน';
    };
    v.innerHTML = '<div class="toolbar">' + filterChips(cnt, chip, INTAKE_ST) + '</div>' +
      '<div class="card"><div class="hd"><div class="toolbar grow"><input id="iq" placeholder="ค้นหาชื่อ ตำแหน่ง อีเมล"><select id="iround"><option value="">ทุกรอบ</option>' + d.rounds.map(function (r) { return '<option value="' + r.roundId + '">' + esc(r.name) + '</option>'; }).join('') + '</select><span class="muted" id="iCount"></span></div>' +
      (can('invite') ? '<button class="btn sm" id="bSend">' + ico('mail', 'sm') + 'ส่งลิงก์เชิญทางอีเมล (ที่เลือก)</button>' : '') + '</div><div class="bd flush"><div class="tw"><table class="t"><thead><tr><th style="width:36px"><input type="checkbox" id="selAll" aria-label="เลือกทั้งหมด"></th><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>เริ่มงาน</th><th>รอบทำสัญญา</th><th>สถานะ</th><th>อัปเดต</th></tr></thead><tbody id="ibody"></tbody></table></div></div></div>';
    draw();
    $('#iq').oninput = draw; $('#iround').onchange = draw;
    $('#selAll').onchange = function () { $$('[data-sel]').forEach(function (c) { c.checked = $('#selAll').checked; sel[c.dataset.sel] = c.checked; }); };
    v.onclick = function (ev) {
      var c = ev.target.closest('[data-chip]'); if (c) { location.hash = '#/intake/' + c.dataset.chip; return; }
      if (ev.target.dataset.sel) { sel[ev.target.dataset.sel] = ev.target.checked; return; }
      var tr = ev.target.closest('tr[data-pid]'); if (tr) location.hash = '#/person/' + tr.dataset.pid;
    };
    var bs = $('#bSend'); if (bs) bs.onclick = function () {
      var pids = Object.keys(sel).filter(function (k) { return sel[k]; });
      if (!pids.length) { toast('เลือกรายชื่อที่จะส่งลิงก์ก่อน', 'warn'); return; }
      confirmDlg('ส่งลิงก์เชิญ ' + pids.length + ' คน?', 'ระบบจะส่งอีเมลจากบัญชีฝ่ายทรัพยากรบุคคลถึงแต่ละคน ลิงก์มีอายุตามที่ตั้งค่าไว้ (ส่งซ้ำได้ ลิงก์เดิมยังใช้ได้)', 'ส่งอีเมล').then(function (ok) {
        if (ok) run(bs, api('sendInvites', { pids: pids })).then(function (r) { toast('ส่งอีเมลแล้ว ' + r.sent + ' คน' + (r.fails ? ' · ไม่สำเร็จ ' + r.fails : '') + (r.quota != null ? ' · โควตาเหลือวันนี้ ' + r.quota : ''), r.fails ? 'warn' : 'ok'); invalidatePeople(); PAGES.intake(v, [chip]); });
      });
    };
  }, fail(v));
};
function roundName(rounds, id) { var r = (rounds || []).filter(function (x) { return x.roundId === id; })[0]; return r ? r.name : '—'; }
var INVITE_HEAD = [['nationalId', 'เลขบัตรประชาชน'], ['title', 'คำนำหน้า'], ['firstName', 'ชื่อ'], ['lastName', 'นามสกุล'], ['dob', 'วันเกิด (วว/ดด/ปปปป)'], ['email', 'อีเมล'], ['phone', 'เบอร์มือถือ'],
  ['position', 'ตำแหน่ง'], ['dept', 'ฝ่าย'], ['unit', 'หน่วยงาน/สาขา'], ['startDate', 'วันที่เริ่มงาน (วว/ดด/ปปปป)'], ['roundName', 'ชื่อรอบทำสัญญา'], ['note', 'หมายเหตุ']];
function downloadInviteTemplate() {
  saveXlsx([{ name: 'รายชื่อ', aoa: [INVITE_HEAD.map(function (h) { return h[1]; }), ['1103700000000', 'นางสาว', 'ตัวอย่าง', 'ทดลอง', '15/06/2544', 'example@gmail.com', '0812345678', 'นายแพทย์ (ใช้ทุน)', 'ฝ่ายอายุรกรรม', 'สาขาอายุรศาสตร์', '01/06/2570', 'รอบแพทย์ใช้ทุน มิ.ย. 2570', 'ลบแถวตัวอย่างนี้ก่อนนำเข้า']],
    cols: [16, 9, 14, 16, 14, 26, 13, 26, 24, 22, 16, 28, 24] },
  { name: 'วิธีกรอก', aoa: [['คอลัมน์', 'คำอธิบาย'], ['เลขบัตรประชาชน', '13 หลัก ใช้ยืนยันตัวตนตอนเปิดลิงก์ (จัดรูปแบบเซลล์เป็นข้อความ)'], ['วันเกิด', 'วว/ดด/ปปปป พ.ศ. หรือ ค.ศ. ก็ได้ ใช้ยืนยันตัวตน'], ['อีเมล', 'ระบบส่งลิงก์เชิญไปที่อีเมลนี้'],
    ['ตำแหน่ง', 'ระบบใช้จัดกลุ่มเอกสาร: แพทย์/ทันตแพทย์/เภสัชกร = สัญญาจ้างประเภท 4 + ไม่ทำเวชฯ + พ.ต.ส. · พยาบาล/จนท.ประจำ = สัญญาจ้าง จนท.ประจำ + ใบเปิดสิทธิ + PVD + พ.ต.ส.'],
    ['ชื่อรอบทำสัญญา', 'ถ้าชื่อตรงกับรอบที่มีอยู่จะรวมเข้ารอบนั้น ถ้าไม่มีจะสร้างรอบใหม่'], ['นำเข้าซ้ำ', 'คนที่ยังไม่ส่งข้อมูลจะถูกปรับปรุงข้อมูล คนที่ส่งแล้วจะข้ามไป']], cols: [22, 90] }], 'แม่แบบนำเข้ารายชื่อบุคลากรใหม่.xlsx');
}
function importInvitesDlg(v) {
  modal({ title: 'นำเข้ารายชื่อบุคลากรใหม่จาก Excel', icon: 'upload', size: 'wide', html: '<div class="grid"><div class="note">' + ico('info') + '<span>ใช้ไฟล์ตามแม่แบบ (กดปุ่ม "แม่แบบ Excel") · ระบบอ่านชีทแรก แถวแรกเป็นหัวคอลัมน์</span></div>' +
    '<input type="file" id="impF" accept=".xlsx,.xls,.csv"><div id="impPrev"></div><label class="chk"><input type="checkbox" id="impSend" checked><span>ส่งลิงก์เชิญทางอีเมลทันทีหลังนำเข้า</span></label></div>',
    onOpen: function (dlg) {
      $('#impF', dlg).onchange = function () {
        var f = this.files[0]; if (!f) return;
        readXlsx(f).then(function (wb) {
          var aoa = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false, defval: '' });
          var head = aoa[0].map(function (h) { return String(h).trim(); });
          var idx = INVITE_HEAD.map(function (h) { return head.findIndex(function (x) { return x.indexOf(h[1].split(' ')[0]) === 0; }); });
          var rows = aoa.slice(1).filter(function (r) { return r.some(String); }).map(function (r) { var o = {}; INVITE_HEAD.forEach(function (h, i) { o[h[0]] = idx[i] >= 0 ? String(r[idx[i]]).trim() : ''; }); return o; });
          dlg._rows = rows;
          $('#impPrev', dlg).innerHTML = '<div class="tw" style="max-height:280px"><table class="t"><thead><tr><th>#</th><th>ชื่อ</th><th>ตำแหน่ง</th><th>อีเมล</th><th>เริ่มงาน</th><th>รอบ</th></tr></thead><tbody>' +
            rows.map(function (r, i) { return '<tr><td>' + (i + 2) + '</td><td>' + esc(r.title + r.firstName + ' ' + r.lastName) + '</td><td>' + esc(r.position) + '</td><td>' + esc(r.email) + '</td><td>' + esc(r.startDate) + '</td><td>' + esc(r.roundName) + '</td></tr>'; }).join('') + '</tbody></table></div><div class="muted">พบ ' + rows.length + ' รายชื่อ</div>';
        }, function (e) { toast(e.message, 'bad'); });
      };
    },
    actions: [{ label: 'ยกเลิก' }, { label: 'นำเข้า', cls: 'pri', fn: function (dlg) {
      if (!dlg._rows || !dlg._rows.length) { toast('เลือกไฟล์ก่อน', 'warn'); return false; }
      var send = $('#impSend', dlg).checked;
      return api('importInvites', { rows: dlg._rows }).then(function (r) {
        var msg = 'สร้างใหม่ ' + r.created + ' · ปรับปรุง ' + r.updated + (r.skipped.length ? ' · ข้าม ' + r.skipped.length : '');
        var after = send && r.pids.length ? api('sendInvites', { pids: r.pids }).then(function (s) { msg += ' · ส่งอีเมล ' + s.sent; }) : Promise.resolve();
        return after.then(function () {
          invalidatePeople();
          if (r.skipped.length) modal({ title: 'นำเข้าแล้ว — มีรายชื่อที่ข้าม', icon: 'alert', iconCls: 'warn', html: '<p style="margin:0">' + esc(msg) + '</p><div class="tw"><table class="t"><thead><tr><th>แถว</th><th>ชื่อ</th><th>เหตุผล</th></tr></thead><tbody>' + r.skipped.map(function (s) { return '<tr><td>' + s.line + '</td><td>' + esc(s.name) + '</td><td>' + esc(s.reason) + '</td></tr>'; }).join('') + '</tbody></table></div>', actions: [{ label: 'ตกลง', cls: 'pri' }] });
          else toast(msg, 'ok');
          PAGES.intake(v, []);
        });
      });
    } }] });
}
function addInviteDlg(v) {
  var f = function (k, l, t, w) { return '<label class="fld' + (w ? ' span2' : '') + '"><span>' + l + '</span><input id="ai_' + k + '" type="' + (t || 'text') + '"></label>'; };
  modal({ title: 'เพิ่มบุคลากรใหม่ทีละคน', icon: 'plus', size: 'wide', html: '<div class="grid g4">' + f('nationalId', 'เลขบัตรประชาชน') + '<label class="fld"><span>คำนำหน้า</span><select id="ai_title"><option>นาย</option><option>นาง</option><option>นางสาว</option></select></label>' + f('firstName', 'ชื่อ') + f('lastName', 'นามสกุล') +
    f('dob', 'วันเกิด', 'date') + f('email', 'อีเมล', 'email') + f('phone', 'เบอร์มือถือ', 'tel') + f('startDate', 'วันที่เริ่มงาน', 'date') + f('position', 'ตำแหน่ง', 'text', 1) + f('dept', 'ฝ่าย') + f('unit', 'หน่วยงาน/สาขา') +
    '<label class="fld span2"><span>รอบทำสัญญา</span><input id="ai_roundName" list="roundList" placeholder="เลือกหรือพิมพ์ชื่อรอบใหม่"><datalist id="roundList">' + (S.boot.rounds || []).map(function (r) { return '<option value="' + esc(r.name) + '">'; }).join('') + '</datalist></label>' +
    '<label class="chk span2" style="align-self:end"><input type="checkbox" id="ai_send" checked><span>ส่งลิงก์เชิญทางอีเมลทันที</span></label></div>',
    actions: [{ label: 'ยกเลิก' }, { label: 'บันทึก', cls: 'pri', fn: function () {
      var row = {}; INVITE_HEAD.forEach(function (h) { var el = $('#ai_' + h[0]); if (el) row[h[0]] = el.value; });
      return api('addInvite', { row: row }).then(function (r) {
        if (r.skipped.length) throw new Error(r.skipped[0].reason);
        return ($('#ai_send').checked ? api('sendInvites', { pids: r.pids }) : Promise.resolve()).then(function () { toast('เพิ่มแล้ว', 'ok'); invalidatePeople(); PAGES.intake(v, []); });
      });
    } }] });
}

/* ═════════ ทะเบียนบุคลากร ═════════ */
var PEOPLE_CHIP = { ALL: 'ทั้งหมด', ACTIVE: 'ปฏิบัติงาน', NP: 'รับไม่ทำเวชฯ', PTS: 'รับ พ.ต.ส.', SUSP: 'ระงับอยู่', edit: 'มีคำขอแก้ไข', license: 'ใบอนุญาตใกล้หมดอายุ', LEFT: 'พ้นสภาพ' };
PAGES.people = function (v, args) {
  var chip = args[0] || 'ACTIVE';
  setTop('ทะเบียนบุคลากร', 'บุคลากรทุกคนในระบบ ทั้งคนใหม่และคนเดิม พร้อมสถานะสิทธิ์ค่าตอบแทน', [mkBtn(ico('download', 'sm') + 'ส่งออก Excel', '', function () { exportPeople(); })]);
  peopleCache(true).then(function (d) {
    var soon = new Date(Date.now() + 90 * 864e5).toISOString().slice(0, 10);
    var test = {
      ALL: function () { return true; }, ACTIVE: function (r) { return r.status === 'ACTIVE'; }, LEFT: function (r) { return r.status === 'LEFT'; },
      NP: function (r) { return r.np && /ACTIVE|SUSPENDED|UPCOMING/.test(r.np.status); }, PTS: function (r) { return r.pts && /ACTIVE|SUSPENDED|UPCOMING/.test(r.pts.status); },
      SUSP: function (r) { return (r.np && r.np.status === 'SUSPENDED') || (r.pts && r.pts.status === 'SUSPENDED'); }, edit: function (r) { return r.pendingEdits > 0; },
      license: function (r) { return r.status === 'ACTIVE' && r.licenseExpire && r.licenseExpire <= soon; }
    };
    var cnt = {}; Object.keys(test).forEach(function (k) { cnt[k] = d.rows.filter(test[k]).length; });
    var draw = function () {
      var q = ($('#pq').value || '').trim(), g = $('#pg').value;
      var list = d.rows.filter(function (r) { return test[chip](r) && (!g || r.posGroup === g) && (!q || (r.name + ' ' + r.empCode + ' ' + r.position + ' ' + r.dept).indexOf(q) >= 0); });
      S.peopleView = list;
      $('#pbody').innerHTML = list.slice(0, 600).map(function (r) {
        return '<tr class="click" data-pid="' + r.pid + '"><td class="mono">' + esc(r.empCode || '—') + '</td><td><b>' + esc(r.name) + '</b>' + (r.pendingEdits ? ' <span class="tag warn">ขอแก้ไข</span>' : '') + '</td><td>' + esc(r.position || '') + '<div class="sub">' + esc(r.dept || '') + '</div></td><td>' + statusTag(r.status) + '</td><td>' + rightTag(r.np, true) + '</td><td>' + rightTag(r.pts, true) + '</td><td>' + (r.others || []).map(function (o) { return '<span class="tag">' + esc(o.label) + '</span>'; }).join(' ') + '</td></tr>';
      }).join('') || '<tr><td colspan="7" class="empty">ไม่พบรายชื่อ</td></tr>';
      $('#pCount').textContent = list.length + ' คน' + (list.length > 600 ? ' (แสดง 600 แรก ใช้ช่องค้นหาเพื่อกรอง)' : '');
    };
    v.innerHTML = filterChips(cnt, chip, PEOPLE_CHIP) + '<div class="card"><div class="hd"><div class="toolbar grow"><input id="pq" placeholder="ค้นหารหัส ชื่อ ตำแหน่ง ฝ่าย"><select id="pg"><option value="">ทุกกลุ่มตำแหน่ง</option>' +
      Object.keys(K().POS_GROUPS).map(function (g) { return '<option value="' + g + '">' + esc(posLabel(g)) + '</option>'; }).join('') + '</select><span class="muted" id="pCount"></span></div></div><div class="bd flush"><div class="tw"><table class="t"><thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง / ฝ่าย</th><th>สถานะ</th><th>ไม่ทำเวชฯ</th><th>พ.ต.ส.</th><th>อื่น ๆ</th></tr></thead><tbody id="pbody"></tbody></table></div></div></div>';
    draw(); $('#pq').oninput = draw; $('#pg').onchange = draw;
    v.onclick = function (ev) { var c = ev.target.closest('[data-chip]'); if (c) { location.hash = '#/people/' + c.dataset.chip; return; } var tr = ev.target.closest('tr[data-pid]'); if (tr) location.hash = '#/person/' + tr.dataset.pid; };
  }, fail(v));
};
function exportPeople() {
  var L = S.peopleView || [], st = function (x) { return x && x.status !== 'NONE' ? (RS_TAG[x.status] || [0, x.status])[1] : ''; };
  saveXlsx([{ name: 'ทะเบียน', aoa: [['รหัส', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'กลุ่ม', 'ฝ่าย', 'หน่วยงาน', 'วันเริ่มงาน', 'สถานะ', 'ไม่ทำเวชฯ', 'อัตรา', 'พ.ต.ส.', 'รหัส พ.ต.ส.', 'อัตรา พ.ต.ส.']].concat(L.map(function (r) {
    return [r.empCode, r.name, r.position, posLabel(r.posGroup), r.dept, r.unit, dThL(r.startDate), (K().PERSON_STATUS || {})[r.status] || r.status, st(r.np), r.np ? Number(r.np.amount || 0) : '', st(r.pts), r.pts ? r.pts.code : '', r.pts ? Number(r.pts.amount || 0) : ''];
  })), cols: [10, 30, 28, 12, 28, 20, 14, 14, 12, 10, 12, 10, 10] }], 'ทะเบียนบุคลากร_' + todayIso() + '.xlsx');
}

/* ═════════ รายคน ═════════ */
PAGES.person = function (v, args) {
  var pid = args[0], tab = args[1] || 'emp';
  api('getPerson', { pid: pid }).then(function (p) {
    S.person = p;
    var acts = [];
    if (p.status === 'SUBMITTED' && can('verify')) {
      acts.push(mkBtn(ico('alert', 'sm') + 'ส่งกลับให้แก้', 'bad', function () { returnDlg(p, v); }));
      acts.push(mkBtn(ico('tick', 'sm') + 'ตรวจแล้ว ถูกต้อง', 'ok', function (b) { run(b, api('verifyPerson', { pid: p.pid, decision: 'approve' }), 'บันทึกว่าตรวจแล้ว').then(function () { invalidatePeople(); PAGES.person(v, [pid, tab]); }); }));
    }
    if (p.invite && can('invite') && /INVITED|DRAFT|RETURNED/.test(p.status)) acts.push(mkBtn(ico('link', 'sm') + 'ลิงก์เชิญ', '', function () { inviteDlg(p, v); }));
    setTop(p.name || '—', [esc(p.empCode || 'ยังไม่มีรหัส'), esc(p.position || ''), statusTag(p.status)].filter(String).join(' · '), acts);
    var T = [['emp', 'ข้อมูลการจ้าง'], ['form', 'ข้อมูลที่กรอก'], ['files', 'เอกสารแนบ (' + p.files.length + ')'], ['rights', 'สิทธิ์ค่าตอบแทน'], ['docs', 'เอกสารสัญญา (' + p.docs.length + ')'], ['edits', 'คำขอแก้ไข' + (p.editReqs.filter(function (e) { return e.status === 'PENDING'; }).length ? ' •' : '')]];
    if (p.health !== undefined) T.splice(3, 0, ['health', 'สุขภาพ']);
    v.innerHTML = '<div><a class="btn ghost sm" href="#/' + (p.source === 'INVITE' && !/ACTIVE|LEFT/.test(p.status) ? 'intake' : 'people') + '">' + ico('back', 'sm') + 'กลับ</a></div>' +
      (p.returnNote && p.status === 'RETURNED' ? '<div class="note bad">' + ico('alert') + '<span>ส่งกลับให้แก้: ' + esc(p.returnNote) + '</span></div>' : '') +
      '<div class="card"><div class="tabs">' + T.map(function (t) { return '<button data-tab="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div><div class="bd" id="ptab"></div></div>';
    $$('.tabs button', v).forEach(function (b) { b.onclick = function () { history.replaceState(null, '', '#/person/' + pid + '/' + b.dataset.tab); PAGES.person(v, [pid, b.dataset.tab]); }; });
    var box = $('#ptab');
    ({ emp: personEmp, form: personForm, files: personFiles, health: personHealth, rights: personRights, docs: personDocs, edits: personEdits }[tab] || personEmp)(box, p, v);
  }, fail(v));
};
var HR_FORM = [['empCode', 'รหัสเจ้าหน้าที่'], ['title', 'คำนำหน้า'], ['firstName', 'ชื่อ'], ['lastName', 'นามสกุล'], ['position', 'ตำแหน่ง'], ['posGroup', 'กลุ่มตำแหน่ง (กำหนดชุดเอกสาร)', 'pg'], ['dept', 'ฝ่าย'], ['unit', 'หน่วยงาน/สาขา'],
  ['startDate', 'วันที่เริ่มงาน', 'date'], ['empType', 'ประเภทบุคลากร', 'et'], ['level', 'ระดับ'], ['posNo', 'เลขที่ตำแหน่ง'], ['orderNo', 'เลขที่คำสั่งบรรจุ/จ้าง'], ['salary', 'เงินเดือน/ค่าจ้าง (บาท)'],
  ['licenseNo', 'เลขที่ใบอนุญาต'], ['licenseDate', 'วันออกใบอนุญาต', 'date'], ['licenseExpire', 'วันหมดอายุใบอนุญาต', 'date'], ['email', 'อีเมล'], ['phone', 'เบอร์มือถือ'], ['dob', 'วันเกิด', 'date'], ['status', 'สถานะ', 'st'], ['roundId', 'รอบทำสัญญา', 'rd']];
function personEmp(box, p, v) {
  var ro = !can('people.edit');
  box.innerHTML = '<div class="grid g4">' + HR_FORM.map(function (f) {
    var val = p[f[0]] || '', inp;
    if (f[2] === 'pg') inp = '<select data-k="posGroup">' + Object.keys(K().POS_GROUPS).map(function (g) { return '<option value="' + g + '"' + (val === g ? ' selected' : '') + '>' + esc(posLabel(g)) + '</option>'; }).join('') + '</select>';
    else if (f[2] === 'st') inp = '<select data-k="status">' + Object.keys(K().PERSON_STATUS).map(function (s) { return '<option value="' + s + '"' + (val === s ? ' selected' : '') + '>' + esc(K().PERSON_STATUS[s]) + '</option>'; }).join('') + '</select>';
    else if (f[2] === 'rd') inp = '<select data-k="roundId"><option value="">—</option>' + (S.boot.rounds || []).map(function (r) { return '<option value="' + r.roundId + '"' + (val === r.roundId ? ' selected' : '') + '>' + esc(r.name) + '</option>'; }).join('') + '</select>';
    else if (f[2] === 'et') inp = '<input data-k="empType" list="etList" value="' + esc(val) + '"><datalist id="etList"><option value="เจ้าหน้าที่ประจำ"><option value="สัญญาจ้าง ประเภทที่ 4"><option value="สัญญาจ้าง ประเภทที่ 3"><option value="เจ้าหน้าที่ชั่วคราว"></datalist>';
    else inp = '<input data-k="' + f[0] + '" type="' + (f[2] || 'text') + '" value="' + esc(val) + '">';
    return '<label class="fld"><span>' + f[1] + '</span>' + inp + '</label>';
  }).join('') + '<label class="fld span4"><span>บันทึกของ HR</span><textarea data-k="hrNote">' + esc(p.hrNote || '') + '</textarea></label></div>' +
    '<dl class="kv"><dt>เลขบัตรประชาชน</dt><dd>' + esc(p.nationalIdMasked || '—') + ' <button class="btn ghost sm" id="showId">แก้ไข</button></dd><dt>ที่มา</dt><dd>' + esc(p.source === 'NOTE' ? 'นำเข้าจาก Note (ระบบเดิม)' : p.source === 'INVITE' ? 'ลิงก์เชิญบุคลากรใหม่' : p.source || '—') + '</dd>' +
    '<dt>ความยินยอม PDPA</dt><dd>' + (p.consents.length ? p.consents.map(function (c) { return (c.kind === 'GENERAL' ? 'ทั่วไป' : 'อ่อนไหว') + ': ' + (c.accepted === 'TRUE' ? 'ยินยอม' : 'ไม่ยินยอม') + ' (ฉบับ ' + esc(c.version) + ', ' + dtTh(c.at) + ')'; }).join('<br>') : '—') + '</dd>' +
    '<dt>ปรับปรุงล่าสุด</dt><dd>' + dtTh(p.updatedAt) + ' โดย ' + esc(p.updatedBy || '—') + '</dd></dl>' +
    (ro ? '' : '<div><button class="btn pri" id="saveEmp">บันทึกข้อมูลการจ้าง</button></div>');
  if (ro) $$('input,select,textarea', box).forEach(function (x) { x.disabled = true; });
  var sid = $('#showId', box); if (sid) sid.onclick = function () {
    if (ro) return;
    modal({ title: 'แก้ไขเลขบัตรประชาชน', html: '<label class="fld"><span>เลขบัตรประชาชน 13 หลัก</span><input id="nid" inputmode="numeric" maxlength="13"></label>', actions: [{ label: 'ยกเลิก' }, { label: 'บันทึก', cls: 'pri', fn: function () { return api('savePersonHR', { pid: p.pid, fields: { nationalId: $('#nid').value } }).then(function () { toast('บันทึกแล้ว', 'ok'); PAGES.person(v, [p.pid, 'emp']); }); } }] });
  };
  var b = $('#saveEmp', box); if (b) b.onclick = function () {
    var f = {}; $$('[data-k]', box).forEach(function (x) { f[x.dataset.k] = x.value; });
    run(b, api('savePersonHR', { pid: p.pid, fields: f }), 'บันทึกแล้ว').then(function () { invalidatePeople(); PAGES.person(v, [p.pid, 'emp']); });
  };
}
function personForm(box, p) {
  var m = p.form || {};
  if (!Object.keys(m).length) { box.innerHTML = '<div class="muted">ยังไม่มีข้อมูลที่บุคลากรกรอก</div>'; return; }
  box.innerHTML = FORM_SPEC.filter(function (s) { return !s.sens; }).map(function (s) { return '<div class="subcard"><h4>' + esc(s.title) + '</h4><dl class="kv">' + specView(s, m) + '</dl></div>'; }).join('');
}
function personHealth(box, p) {
  if (!p.health) { box.innerHTML = '<div class="muted">ไม่มีข้อมูลสุขภาพ (ไม่ได้ให้ความยินยอมข้อมูลอ่อนไหว หรือยังไม่ได้กรอก)</div>'; return; }
  box.innerHTML = '<dl class="kv">' + specView(FORM_SPEC.filter(function (s) { return s.id === 'health'; })[0], { health: p.health, general: (p.form || {}).general || {} }) + '</dl>';
}
function personFiles(box, p) {
  var FK = K().FILE_KINDS;
  box.innerHTML = p.files.length ? '<table class="t"><tbody>' + p.files.map(function (f) { return '<tr><td><b>' + esc((FK[f.kind] || {}).label || f.kind) + '</b><div class="sub">' + esc(f.name) + ' · ' + Math.round(f.size / 1024) + ' KB · ' + dtTh(f.at) + '</div></td><td><button class="btn sm" data-view="' + f.fid + '">' + ico('eye', 'sm') + 'เปิดดู</button></td></tr>'; }).join('') + '</tbody></table>' : '<div class="muted">ยังไม่มีเอกสารแนบ</div>';
  box.onclick = function (ev) { var b = ev.target.closest('[data-view]'); if (b) viewFile(b.dataset.view); };
}
function personRights(box, p, v) {
  box.innerHTML = rightsCards(p.state || {}) + (can('rights.edit') ? '<div class="toolbar"><button class="btn pri sm" id="addEv">' + ico('plus', 'sm') + 'บันทึกเหตุการณ์</button><span class="muted">เริ่มรับ · ระงับรายเดือน · ยกเลิกการระงับ · ปรับอัตรา/เปลี่ยนกลุ่ม · ยกเลิกสิทธิ์</span></div>' : '') + timelineHtml(p.events, true);
  var a = $('#addEv', box); if (a) a.onclick = function () { eventDlg({ pid: p.pid, name: p.name }, null, function () { PAGES.person(v, [p.pid, 'rights']); }); };
  box.onclick = function (ev) { var b = ev.target.closest('[data-ev]'); if (b) eventDlg({ pid: p.pid, name: p.name }, p.events.filter(function (e) { return e.eid === b.dataset.ev; })[0], function () { PAGES.person(v, [p.pid, 'rights']); }); };
}
function personDocs(box, p, v) {
  box.innerHTML = p.docs.length ? '<table class="t"><thead><tr><th>เอกสาร</th><th>เลขอ้างอิง</th><th>รอบ</th><th>สถานะ</th><th></th></tr></thead><tbody>' + p.docs.map(function (d) {
    return '<tr><td><b>' + esc(d.kindLabel) + '</b>' + (d.flagNote ? '<div class="sub" style="color:var(--bad)">แจ้งแก้: ' + esc(d.flagNote) + '</div>' : '') + '</td><td class="mono">' + esc(d.refNo || '—') + '</td><td>' + esc((d.snapshot.round || {}).name || '—') + '</td><td>' + docTag(d.status) + '</td><td><button class="btn sm" data-doc="' + d.docId + '">' + ico('eye', 'sm') + 'ดูตัวอย่าง</button></td></tr>';
  }).join('') + '</tbody></table>' : '<div class="muted">ยังไม่มีเอกสาร ออกเอกสารได้จากหน้า "รอบทำสัญญา"</div>';
  box.onclick = function (ev) { var b = ev.target.closest('[data-doc]'); if (b) previewDocs(p.docs.filter(function (d) { return d.docId === b.dataset.doc; })); };
}
function personEdits(box, p, v) {
  var E = K().EDITABLE_BY_STAFF || {};
  box.innerHTML = p.editReqs.length ? '<table class="t"><thead><tr><th>วันที่</th><th>ขอแก้ไข</th><th>ข้อมูลใหม่</th><th>สถานะ</th><th></th></tr></thead><tbody>' + p.editReqs.slice().reverse().map(function (e) {
    return '<tr><td>' + dtTh(e.createdAt) + '</td><td>' + Object.keys(e.changes).map(function (k) { return esc(E[k] || k); }).join(', ') + '<div class="sub">' + esc(e.reason || '') + '</div></td><td>' + Object.keys(e.changes).map(function (k) { var x = e.changes[k]; return esc(typeof x === 'object' ? JSON.stringify(x) : x); }).join('<br>') + '</td>' +
      '<td>' + (e.status === 'PENDING' ? '<span class="tag warn">รอพิจารณา</span>' : e.status === 'APPROVED' ? '<span class="tag ok">อนุมัติ</span>' : '<span class="tag bad">ไม่อนุมัติ</span>') + '</td>' +
      '<td>' + (e.status === 'PENDING' && can('people.edit') ? '<button class="btn sm ok" data-ok="' + e.id + '">อนุมัติ</button> <button class="btn sm bad" data-no="' + e.id + '">ไม่อนุมัติ</button>' : esc(e.decisionNote || '')) + '</td></tr>';
  }).join('') + '</tbody></table><div class="note">' + ico('info') + '<span>อนุมัติแล้ว ระบบปรับข้อมูลที่ตรงกับช่องในทะเบียนให้อัตโนมัติ (เบอร์ อีเมล สถานภาพ ที่อยู่ คู่สมรส บัญชี ใบอนุญาต) ข้อมูลแบบข้อความอิสระกรุณาตรวจและแก้ในแท็บ "ข้อมูลการจ้าง" ด้วย</span></div>' : '<div class="muted">ไม่มีคำขอแก้ไข</div>';
  box.onclick = function (ev) {
    var ok = ev.target.closest('[data-ok]'), no = ev.target.closest('[data-no]');
    if (ok) run(ok, api('decideEdit', { id: ok.dataset.ok, approve: true }), 'อนุมัติแล้ว').then(function () { PAGES.person(v, [p.pid, 'edits']); });
    if (no) modal({ title: 'ไม่อนุมัติคำขอแก้ไข', html: '<label class="fld"><span>เหตุผล (แจ้งให้เจ้าตัวทราบ)</span><textarea id="dn"></textarea></label>', actions: [{ label: 'ยกเลิก' }, { label: 'ยืนยัน', cls: 'pri', fn: function () { return api('decideEdit', { id: no.dataset.no, approve: false, note: $('#dn').value }).then(function () { PAGES.person(v, [p.pid, 'edits']); }); } }] });
  };
}
function returnDlg(p, v) {
  modal({ title: 'ส่งกลับให้ ' + p.name + ' แก้ไข', icon: 'alert', iconCls: 'warn', html: '<label class="fld"><span>สิ่งที่ต้องแก้ไข (ระบบส่งอีเมลแจ้งพร้อมลิงก์)</span><textarea id="rn" placeholder="เช่น สำเนาทะเบียนบ้านไม่ชัด กรุณาแนบใหม่"></textarea></label>',
    actions: [{ label: 'ยกเลิก' }, { label: 'ส่งกลับ', cls: 'pri', fn: function () { return api('verifyPerson', { pid: p.pid, decision: 'return', note: $('#rn').value }).then(function () { toast('ส่งกลับแล้ว', 'ok'); invalidatePeople(); PAGES.person(v, [p.pid]); }); } }] });
}
function inviteDlg(p, v) {
  var i = p.invite;
  modal({ title: 'ลิงก์เชิญของ ' + p.name, icon: 'link', html: '<label class="fld"><span>ลิงก์ (ส่งทาง LINE ได้)</span><input readonly value="' + esc(i.link) + '" id="invLink"></label><dl class="kv"><dt>หมดอายุ</dt><dd>' + dThL(i.expires) + '</dd><dt>ส่งอีเมลล่าสุด</dt><dd>' + (dtTh(i.sentAt) || 'ยังไม่ส่ง') + ' (' + (i.sentCount || 0) + ' ครั้ง)</dd><dt>เปิดใช้ครั้งแรก</dt><dd>' + (dtTh(i.usedAt) || 'ยังไม่เปิด') + '</dd></dl>',
    actions: [{ label: 'คัดลอกลิงก์', fn: function () { var x = $('#invLink'); x.select(); try { navigator.clipboard.writeText(x.value).then(function () { toast('คัดลอกแล้ว', 'ok'); }, function () { document.execCommand('copy'); }); } catch (e) { document.execCommand('copy'); } return false; } },
      { label: ico('mail', 'sm') + 'ส่งอีเมลอีกครั้ง', cls: 'pri', fn: function () { return api('sendInvites', { pids: [p.pid] }).then(function (r) { toast(r.sent ? 'ส่งอีเมลแล้ว' : 'ส่งไม่สำเร็จ', r.sent ? 'ok' : 'bad'); }); } }] });
}

/* ═════════ บันทึกเหตุการณ์สิทธิ์ ═════════ */
function eventDlg(who, ev, done) {
  var R = K().RIGHT_TYPES, E = K().EVENT_KINDS, e = ev || { right: 'NP', kind: 'START', effDate: '', reportYm: S.boot.reportYm };
  var rates = S.boot.ptsRates || [];
  modal({ title: (ev ? 'แก้ไขเหตุการณ์' : 'บันทึกเหตุการณ์สิทธิ์') + (who.name ? ' · ' + who.name : ''), icon: 'coins', size: 'wide',
    html: '<div class="grid g4">' + (who.pid ? '' : '<label class="fld span4"><span>บุคลากร</span><input id="evWho" list="pplList" placeholder="พิมพ์รหัสหรือชื่อ"><datalist id="pplList"></datalist></label>') +
      '<label class="fld"><span>สิทธิ์</span><select id="evR">' + Object.keys(R).map(function (k) { return '<option value="' + k + '"' + (e.right === k ? ' selected' : '') + '>' + esc(R[k].label) + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld"><span>เหตุการณ์</span><select id="evK">' + Object.keys(E).map(function (k) { return '<option value="' + k + '"' + (e.kind === k ? ' selected' : '') + '>' + esc(E[k]) + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld"><span>วันที่มีผล</span><input type="date" id="evD" value="' + esc(e.effDate) + '"></label>' +
      '<label class="fld" id="evEndW"><span>ถึงวันที่</span><input type="date" id="evE" value="' + esc(e.endDate || '') + '"></label>' +
      '<label class="fld" id="evCodeW"><span>รหัส พ.ต.ส.</span><select id="evC"><option value="">—</option>' + rates.map(function (r) { return '<option value="' + esc(r.code) + '"' + (e.code === r.code ? ' selected' : '') + '>' + esc(r.code + ' · กลุ่ม ' + r.grp + ' · ' + money(r.rate) + ' · ' + r.desc) + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld"><span>จำนวนเงิน (บาท/เดือน)</span><input id="evA" inputmode="numeric" value="' + esc(e.amount || '') + '"></label>' +
      '<label class="fld"><span>เดือนรายงานส่งงานเงินเดือน</span><input type="month" id="evY" value="' + esc(e.reportYm || S.boot.reportYm) + '"></label>' +
      '<label class="fld"><span>อ้างอิงเอกสาร</span><input id="evRef" value="' + esc(e.ref || '') + '" placeholder="เช่น ทบ.3244/2569"></label>' +
      '<label class="fld span2"><span>เหตุผล</span><input id="evRs" value="' + esc(e.reason || '') + '" placeholder="จำเป็นสำหรับระงับและยกเลิก"></label>' +
      '<label class="fld span2"><span>หมายเหตุ</span><input id="evN" value="' + esc(e.note || '') + '"></label></div>' +
      '<div class="note" id="evHint">' + ico('info') + '<span></span></div>',
    onOpen: function (dlg) {
      if (!who.pid) peopleCache().then(function (d) { $('#pplList', dlg).innerHTML = d.rows.map(function (r) { return '<option value="' + esc((r.empCode || r.pid) + ' · ' + r.name) + '">'; }).join(''); });
      var sync = function () {
        var k = $('#evK', dlg).value, r = $('#evR', dlg).value;
        $('#evEndW', dlg).classList.toggle('hidden', k !== 'SUSPEND');
        $('#evCodeW', dlg).classList.toggle('hidden', r !== 'PTS' || !/START|CHANGE/.test(k));
        var hint = { START: 'เริ่มรับเงิน ระบบจะใส่ในรายงานชีท 12 (หรือ 13 สำหรับ พ.ต.ส.) ของเดือนรายงานที่เลือก', SUSPEND: 'ระงับเฉพาะช่วงที่ระบุ (เช่น ทั้งเดือน) แล้วเปิดจ่ายต่อเอง เข้ารายงานชีท 21', UNSUSPEND: 'ยกเลิกการระงับก่อนกำหนด เข้ารายงานชีท 22', CANCEL: 'สิ้นสุดสิทธิ์ ถ้าจะรับใหม่ต้องทำสัญญาใหม่ เข้ารายงานชีท 12 (เดิม → 0)', CHANGE: 'ปรับอัตราหรือเปลี่ยนกลุ่ม ระบบเก็บค่าเดิมให้อัตโนมัติ', DEDUCT: 'หักเงินรายวัน (เช่น ลาเกินเพดาน) ระบุจำนวนวันในหมายเหตุ', NOTE: 'บันทึกทั่วไป ไม่เข้ารายงาน' }[k];
        $('#evHint span', dlg).textContent = hint || '';
      };
      $('#evK', dlg).onchange = sync; $('#evR', dlg).onchange = sync; sync();
      $('#evC', dlg).onchange = function () { var r = rates.filter(function (x) { return x.code === $('#evC', dlg).value; })[0]; if (r) $('#evA', dlg).value = r.rate; };
    },
    actions: (ev && !ev.locked ? [{ label: ico('trash', 'sm') + 'ลบ', cls: 'bad', fn: function () { return confirmDlg('ลบรายการนี้?', 'ลบแล้วจะหายจากรายงานเดือน ' + ymTh(ev.reportYm), 'ลบ', 'bad').then(function (ok) { if (!ok) return false; return api('deleteEvent', { eid: ev.eid }).then(function () { toast('ลบแล้ว', 'ok'); done(); }); }); } }] : []).concat([{ label: 'ยกเลิก' }, { label: 'บันทึก', cls: 'pri', fn: function () {
      var pid = who.pid, empCode = '';
      if (!pid) { var w = $('#evWho').value.split(' · ')[0].trim(); if (/^P/.test(w)) pid = w; else empCode = w; if (!w) { toast('เลือกบุคลากรก่อน', 'warn'); return false; } }
      return api('saveEvent', { event: { eid: ev ? ev.eid : '', pid: pid, empCode: empCode, right: $('#evR').value, kind: $('#evK').value, effDate: $('#evD').value, endDate: $('#evE').value, code: $('#evC').value,
        amount: $('#evA').value, reportYm: $('#evY').value, ref: $('#evRef').value, reason: $('#evRs').value, note: $('#evN').value } }).then(function () { toast('บันทึกแล้ว', 'ok'); invalidatePeople(); done(); });
    } }]) });
}

/* ═════════ สิทธิ์ค่าตอบแทน (บันทึกรายการ/ระงับหลายคน) ═════════ */
PAGES.rights = function (v) {
  setTop('สิทธิ์ค่าตอบแทน', 'บันทึกเหตุการณ์ และระงับรายเดือนหลายคนพร้อมกัน', can('rights.edit') ? [
    mkBtn(ico('alert', 'sm') + 'ระงับหลายคน', '', function () { bulkSuspendDlg(v); }), mkBtn(ico('plus', 'sm') + 'บันทึกเหตุการณ์', 'pri', function () { eventDlg({}, null, function () { PAGES.rights(v); }); })] : []);
  peopleCache(true).then(function (d) {
    var np = d.rows.filter(function (r) { return r.np && /ACTIVE|SUSPENDED|UPCOMING/.test(r.np.status); }), pts = d.rows.filter(function (r) { return r.pts && /ACTIVE|SUSPENDED|UPCOMING/.test(r.pts.status); });
    var byLine = {}; pts.forEach(function (r) { var l = (S.boot.ptsRates.filter(function (x) { return x.code === r.pts.code; })[0] || {}).line || 'อื่น ๆ'; byLine[l] = (byLine[l] || 0) + 1; });
    v.innerHTML = '<div class="kpis"><div class="kpi"><span class="l">รับเงินไม่ทำเวชฯ</span><span class="v">' + np.length + '</span><span class="s">ระงับอยู่ ' + np.filter(function (r) { return r.np.status === 'SUSPENDED'; }).length + ' · รอเริ่ม ' + np.filter(function (r) { return r.np.status === 'UPCOMING'; }).length + '</span></div>' +
      Object.keys(byLine).map(function (l) { return '<div class="kpi"><span class="l">พ.ต.ส. ' + esc((K().PTS_LINE_LABEL || {})[l] || l) + '</span><span class="v">' + byLine[l] + '</span></div>'; }).join('') + '</div>' +
      '<div class="card"><div class="hd"><h3>ผู้รับเงินไม่ทำเวชฯ</h3><span class="muted">คลิกชื่อเพื่อดูประวัติและบันทึกเหตุการณ์</span></div><div class="bd flush"><div class="tw" style="max-height:60vh"><table class="t"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>ฝ่าย</th><th>สถานะ</th><th class="num">อัตรา</th><th>ตั้งแต่</th></tr></thead><tbody>' +
      np.map(function (r) { return '<tr class="click" data-pid="' + r.pid + '"><td class="mono">' + esc(r.empCode) + '</td><td>' + esc(r.name) + '</td><td>' + esc(r.dept) + '</td><td>' + rightTag(r.np) + '</td><td class="num">' + money(r.np.amount) + '</td><td>' + dTh(r.np.since) + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';
    v.onclick = function (ev) { var tr = ev.target.closest('tr[data-pid]'); if (tr) location.hash = '#/person/' + tr.dataset.pid + '/rights'; };
  }, fail(v));
};
function bulkSuspendDlg(v) {
  var ym = S.boot.reportYm, y = ym.slice(0, 4), m = ym.slice(5, 7), last = new Date(+y, +m, 0).getDate();
  peopleCache().then(function (d) {
    var cand = d.rows.filter(function (r) { return (r.np && r.np.status === 'ACTIVE') || (r.pts && r.pts.status === 'ACTIVE'); });
    modal({ title: 'ระงับรายเดือนหลายคน', icon: 'alert', iconCls: 'warn', size: 'wide', html: '<div class="grid g4"><label class="fld"><span>สิทธิ์</span><select id="bsR"><option value="NP">ไม่ทำเวชฯ</option><option value="PTS">พ.ต.ส.</option></select></label>' +
      '<label class="fld"><span>ระงับตั้งแต่</span><input type="date" id="bsF" value="' + ym + '-01"></label><label class="fld"><span>ถึง</span><input type="date" id="bsT" value="' + ym + '-' + last + '"></label><label class="fld"><span>เดือนรายงาน</span><input type="month" id="bsY" value="' + ym + '"></label>' +
      '<label class="fld span4"><span>สาเหตุ</span><input id="bsW" value="ปฏิบัติงานไม่ครบ 15 วันทำการ"></label></div><input id="bsQ" placeholder="ค้นหาชื่อ"><div class="tw" style="max-height:340px"><table class="t"><tbody id="bsList"></tbody></table></div>',
      onOpen: function (dlg) {
        var draw = function () { var r = $('#bsR', dlg).value, q = $('#bsQ', dlg).value.trim(); $('#bsList', dlg).innerHTML = cand.filter(function (x) { var s = r === 'NP' ? x.np : x.pts; return s && s.status === 'ACTIVE' && (!q || x.name.indexOf(q) >= 0 || x.empCode.indexOf(q) >= 0); }).map(function (x) { return '<tr><td style="width:36px"><input type="checkbox" data-pid="' + x.pid + '"></td><td>' + esc(x.empCode) + '</td><td>' + esc(x.name) + '</td><td>' + esc(x.dept) + '</td></tr>'; }).join('') || '<tr><td class="empty">ไม่มีผู้รับสิทธิ์</td></tr>'; };
        $('#bsR', dlg).onchange = draw; $('#bsQ', dlg).oninput = draw; draw();
      },
      actions: [{ label: 'ยกเลิก' }, { label: 'ระงับที่เลือก', cls: 'pri', fn: function (dlg) {
        var items = $$('#bsList input:checked', dlg).map(function (c) { return { pid: c.dataset.pid, right: $('#bsR').value, kind: 'SUSPEND', effDate: $('#bsF').value, endDate: $('#bsT').value, reportYm: $('#bsY').value, reason: $('#bsW').value }; });
        if (!items.length) { toast('เลือกรายชื่อก่อน', 'warn'); return false; }
        return api('bulkSuspend', { items: items }).then(function (r) { toast('ระงับแล้ว ' + r.saved + ' คน', 'ok'); invalidatePeople(); PAGES.rights(v); });
      } }] });
  });
}

/* ═════════ รอบทำสัญญา ═════════ */
PAGES.rounds = function (v) {
  setTop('รอบทำสัญญา / เอกสาร', 'จัดรอบนัดลงนาม ออกเอกสารทั้งรอบ ให้เจ้าตัวตรวจ แล้วพิมพ์', [mkBtn(ico('plus', 'sm') + 'สร้างรอบใหม่', 'pri', function () { roundDlg(null, function (r) { location.hash = '#/round/' + r.roundId; }); })]);
  peopleCache(true).then(function (d) {
    S.boot.rounds = d.rounds;
    var cnt = {}; d.rows.forEach(function (r) { if (r.roundId) { var c = cnt[r.roundId] = cnt[r.roundId] || { n: 0, docs: 0, ok: 0, flag: 0 }; c.n++; c.docs += r.docs.total; c.ok += r.docs.confirmed; c.flag += r.docs.flagged; } });
    v.innerHTML = '<div class="card"><div class="bd flush"><div class="tw"><table class="t"><thead><tr><th>รอบ</th><th>วันนัดลงนาม</th><th>พยาน</th><th class="num">สมาชิก</th><th class="num">เอกสาร</th><th class="num">ยืนยันแล้ว</th><th class="num">แจ้งแก้</th><th>สถานะ</th></tr></thead><tbody>' +
      (d.rounds.length ? d.rounds.slice().reverse().map(function (r) { var c = cnt[r.roundId] || {}; return '<tr class="click" data-r="' + r.roundId + '"><td><b>' + esc(r.name) + '</b></td><td>' + (dThL(r.signDate) || '—') + '</td><td class="sub">' + esc([r.witness1, r.witness2].filter(String).join(', ') || 'เว้นว่าง') + '</td><td class="num">' + (c.n || 0) + '</td><td class="num">' + (c.docs || 0) + '</td><td class="num">' + (c.ok || 0) + '</td><td class="num">' + (c.flag ? '<span class="tag bad">' + c.flag + '</span>' : 0) + '</td><td>' + (r.status === 'DONE' ? '<span class="tag">ปิดรอบ</span>' : '<span class="tag ok">เปิด</span>') + '</td></tr>'; }).join('') : '<tr><td colspan="8" class="empty">ยังไม่มีรอบ กด "สร้างรอบใหม่"</td></tr>') + '</tbody></table></div></div></div>';
    v.onclick = function (ev) { var tr = ev.target.closest('tr[data-r]'); if (tr) location.hash = '#/round/' + tr.dataset.r; };
  }, fail(v));
};
function roundDlg(r, done) {
  r = r || { place: 'โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา' };
  modal({ title: r.roundId ? 'ตั้งค่ารอบ' : 'สร้างรอบทำสัญญา', icon: 'file', html: '<div class="grid g2"><label class="fld span2"><span>ชื่อรอบ</span><input id="rdN" value="' + esc(r.name || '') + '" placeholder="เช่น รอบแพทย์ใช้ทุน มิ.ย. 2570"></label>' +
    '<label class="fld"><span>วันนัดลงนาม (วันที่ในสัญญา)</span><input type="date" id="rdD" value="' + esc(r.signDate || '') + '"></label><label class="fld"><span>สถานะ</span><select id="rdS"><option value="OPEN">เปิด</option><option value="DONE"' + (r.status === 'DONE' ? ' selected' : '') + '>ปิดรอบ</option></select></label>' +
    '<label class="fld span2"><span>สถานที่ทำสัญญา (เขียนที่)</span><input id="rdP" value="' + esc(r.place || '') + '"></label>' +
    '<label class="fld"><span>พยานคนที่ 1</span><input id="rdW1" value="' + esc(r.witness1 || '') + '" placeholder="เว้นว่างได้ (เขียนมือ)"></label><label class="fld"><span>พยานคนที่ 2</span><input id="rdW2" value="' + esc(r.witness2 || '') + '" placeholder="เว้นว่างได้ (เขียนมือ)"></label>' +
    '<div class="note span2">' + ico('info') + '<span>เปลี่ยนวันที่หรือพยานแล้ว ให้กด "ออกเอกสารใหม่" เพื่อปรับเอกสารที่ออกไปแล้ว (เลขอ้างอิงคงเดิม)</span></div></div>',
    actions: [{ label: 'ยกเลิก' }, { label: 'บันทึก', cls: 'pri', fn: function () {
      return api('saveRound', { round: { roundId: r.roundId, name: $('#rdN').value, signDate: $('#rdD').value, place: $('#rdP').value, witness1: $('#rdW1').value, witness2: $('#rdW2').value, status: $('#rdS').value } }).then(function (x) { toast('บันทึกแล้ว', 'ok'); invalidatePeople(); done(x); });
    } }] });
}
PAGES.round = function (v, args) {
  var rid = args[0];
  api('getRound', { roundId: rid }).then(function (d) {
    var r = d.round, kinds = Object.keys(d.docKinds);
    setTop(r.name, (dThL(r.signDate) ? 'นัดลงนาม ' + dThL(r.signDate) : 'ยังไม่กำหนดวันนัด') + ' · พยาน: ' + esc([r.witness1, r.witness2].filter(String).join(', ') || 'เว้นว่าง'), [
      mkBtn(ico('gear', 'sm') + 'ตั้งค่ารอบ', '', function () { roundDlg(r, function () { PAGES.round(v, [rid]); }); }),
      mkBtn(ico('users', 'sm') + 'เพิ่มสมาชิก', '', function () { addMembersDlg(r, d, v); }),
      mkBtn(ico('file', 'sm') + 'ออกเอกสาร / ออกใหม่', 'pri', function (b) { confirmDlg('ออกเอกสารทั้งรอบ?', 'ออกเอกสารตามกลุ่มตำแหน่งให้ทุกคนที่ตรวจข้อมูลแล้ว · คนที่มีเอกสารอยู่แล้วจะได้ชุดข้อมูลใหม่ (เลขอ้างอิงเดิม) และสถานะกลับเป็น "รอเจ้าตัวตรวจ" · เอกสารที่ลงนามแล้วไม่เปลี่ยน', 'ออกเอกสาร').then(function (ok) { if (ok) run(b, api('issueDocs', { roundId: rid })).then(function (x) { toast('ออกใหม่ ' + x.issued + ' · ปรับปรุง ' + x.refreshed + (x.skipped.length ? ' · ข้าม ' + x.skipped.length + ' คน (ยังไม่ผ่านตรวจ)' : ''), x.skipped.length ? 'warn' : 'ok', 7000); PAGES.round(v, [rid]); }); }); })]);
    var all = []; d.members.forEach(function (m) { m.docs.forEach(function (x) { x._name = m.name; all.push(x); }); });
    var c = { ISSUED: 0, CONFIRMED: 0, FLAGGED: 0, PRINTED: 0, SIGNED: 0 }; all.forEach(function (x) { c[x.status] = (c[x.status] || 0) + 1; });
    v.innerHTML = '<div><a class="btn ghost sm" href="#/rounds">' + ico('back', 'sm') + 'รอบทั้งหมด</a></div>' +
      '<div class="kpis"><div class="kpi"><span class="l">สมาชิก</span><span class="v">' + d.members.length + '</span><span class="s">ตรวจข้อมูลแล้ว ' + d.members.filter(function (m) { return /VERIFIED|ACTIVE/.test(m.status); }).length + '</span></div>' +
      '<div class="kpi"><span class="l">รอเจ้าตัวตรวจ</span><span class="v">' + c.ISSUED + '</span></div><div class="kpi"><span class="l">ยืนยันแล้ว พร้อมพิมพ์</span><span class="v">' + c.CONFIRMED + '</span></div>' +
      '<div class="kpi' + (c.FLAGGED ? ' attn' : '') + '"><span class="l">แจ้งแก้</span><span class="v">' + c.FLAGGED + '</span></div><div class="kpi"><span class="l">พิมพ์แล้ว / ลงนามแล้ว</span><span class="v">' + c.PRINTED + ' / ' + c.SIGNED + '</span></div></div>' +
      '<div class="card"><div class="hd"><div class="toolbar"><button class="btn sm" id="bPrev">' + ico('eye', 'sm') + 'ดูตัวอย่างที่เลือก</button><button class="btn sm pri" id="bPrint">' + ico('printer', 'sm') + 'พิมพ์ที่เลือก</button><button class="btn sm" id="bSign">' + ico('pen', 'sm') + 'บันทึกลงนามแล้ว</button></div>' +
      '<div class="toolbar"><button class="btn ghost sm" data-pick="CONFIRMED">เลือกที่ยืนยันแล้ว</button><button class="btn ghost sm" data-pick="ALL">เลือกทั้งหมด</button><button class="btn ghost sm" data-pick="NONE">ล้าง</button></div></div>' +
      '<div class="bd flush"><div class="tw"><table class="t"><thead><tr><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>สถานะข้อมูล</th>' + kinds.map(function (k) { return '<th>' + esc(d.docKinds[k].label) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      (d.members.length ? d.members.map(function (m) {
        return '<tr><td><a href="#/person/' + m.pid + '"><b>' + esc(m.name) + '</b></a><div class="sub">' + esc(m.empCode || 'ยังไม่มีรหัส') + '</div></td><td>' + esc(m.position) + '<div class="sub">' + esc(posLabel(m.posGroup)) + '</div></td><td>' + statusTag(m.status) + '</td>' +
          kinds.map(function (k) {
            var x = m.docs.filter(function (q) { return q.kind === k; })[0];
            if (!x) return '<td>' + (m.need.indexOf(k) >= 0 ? '<span class="muted">ยังไม่ออก</span>' : '<span class="muted">—</span>') + '</td>';
            var o = x.snapshot.opts || {};
            var info = k === 'PTS_FORM' ? (o.code ? esc(o.code) + ' · ' + money(o.rate) : '<span style="color:var(--bad)">ยังไม่กำหนดกลุ่ม</span>') : money(o.amount) + ' · ' + dTh(o.effDate);
            return '<td><label class="chk"><input type="checkbox" data-doc="' + x.docId + '" data-st="' + x.status + '"><span>' + docTag(x.status) + '<div class="sub">' + info + '</div>' + (x.flagNote ? '<div class="sub" style="color:var(--bad)">' + esc(x.flagNote) + '</div>' : '') + '</span></label>' +
              '<div class="toolbar" style="margin-top:4px"><button class="btn ghost sm" data-opt="' + x.docId + '">ตั้งค่า</button><button class="btn ghost sm" data-one="' + x.docId + '">ดู</button></div></td>';
          }).join('') + '</tr>';
      }).join('') : '<tr><td colspan="' + (3 + kinds.length) + '" class="empty">ยังไม่มีสมาชิก กด "เพิ่มสมาชิก" หรือกำหนดรอบตอนนำเข้ารายชื่อ</td></tr>') + '</tbody></table></div></div></div>' +
      '<div class="note">' + ico('info') + '<span>ขั้นตอน: ออกเอกสาร → เจ้าตัวเข้ามาตรวจ (ยืนยัน/แจ้งแก้) → แก้ข้อมูลแล้วออกใหม่ → พิมพ์ฉบับที่ยืนยันแล้ว → หลังลงนามกด "บันทึกลงนามแล้ว" ระบบเปิดสิทธิ์ไม่ทำเวชฯ / พ.ต.ส. ในทะเบียนให้</span></div>';
    var docsById = {}; all.forEach(function (x) { docsById[x.docId] = x; });
    var selected = function () { return $$('input[data-doc]:checked', v).map(function (c) { return c.dataset.doc; }); };
    v.onclick = function (ev) {
      var t = ev.target.closest('button'); if (!t) return;
      if (t.dataset.pick) { $$('input[data-doc]', v).forEach(function (cb) { cb.checked = t.dataset.pick === 'ALL' || (t.dataset.pick === 'CONFIRMED' && cb.dataset.st === 'CONFIRMED'); }); return; }
      if (t.dataset.one) { api('getMyDoc', { docId: t.dataset.one }).then(function (x) { previewDocs([x]); }, function (e) { toast(e.message, 'bad'); }); return; }
      if (t.dataset.opt) { docOptsDlg(docsById[t.dataset.opt], d, function () { PAGES.round(v, [rid]); }); return; }
      if (t.id === 'bPrev' || t.id === 'bPrint') {
        var ids = selected(); if (!ids.length) { toast('เลือกเอกสารก่อน (ติ๊กช่องหน้าเอกสาร)', 'warn'); return; }
        var notOk = ids.filter(function (i) { return !/CONFIRMED|PRINTED|SIGNED/.test(docsById[i].status); }).length;
        var go = function () { run(t, api('printDocs', { docIds: ids, preview: t.id === 'bPrev' })).then(function (r) {
          if (t.id === 'bPrev') previewDocs(r.docs, 'print', r.printedAt);
          else { DOCS.print(DOCS.render(r.docs, { mode: 'print', printedAt: r.printedAt })); setTimeout(function () { PAGES.round(v, [rid]); }, 1800); }
        }); };
        if (t.id === 'bPrint' && notOk) confirmDlg('มีเอกสารที่เจ้าตัวยังไม่ยืนยัน ' + notOk + ' ฉบับ', 'พิมพ์ต่อหรือไม่? (แนะนำให้พิมพ์เฉพาะที่ยืนยันแล้ว)', 'พิมพ์ทั้งหมด').then(function (ok) { if (ok) go(); }); else go();
        return;
      }
      if (t.id === 'bSign') { signDlg(selected().map(function (i) { return docsById[i]; }), function () { PAGES.round(v, [rid]); }); }
    };
  }, fail(v));
};
function previewDocs(docs, mode, printedAt) {
  modal({ title: 'ตัวอย่างเอกสาร ' + docs.length + ' ฉบับ', size: 'xl', noFocus: true, html: '<div class="docview"><div class="scale">' + DOCS.render(docs, { mode: mode || 'preview', printedAt: printedAt || new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 19) }) + '</div></div>',
    onOpen: function (dlg) { setTimeout(function () { fitPreview(dlg); }, 30); }, actions: [{ label: 'ปิด' }] });
}
function docOptsDlg(doc, d, done) {
  var o = doc.snapshot.opts || {}, pts = doc.kind === 'PTS_FORM', line = o.line;
  var rates = (d.ptsRates || []).filter(function (r) { return r.line === line; });
  modal({ title: 'ตั้งค่าเอกสาร · ' + doc.kindLabel + ' · ' + doc._name, icon: 'gear', size: 'wide', html: '<div class="grid g2">' +
    (pts ? '<label class="fld"><span>สายงาน</span><select id="doLine">' + Object.keys(K().PTS_LINE_LABEL).map(function (l) { return '<option value="' + l + '"' + (l === line ? ' selected' : '') + '>' + esc(K().PTS_LINE_LABEL[l]) + '</option>'; }).join('') + '</select></label>' +
      '<label class="fld"><span>กรณี</span><select id="doMode"><option value="NEW">ขอครั้งแรก (บรรจุใหม่/โอนย้าย)</option><option value="CHANGE"' + (o.mode === 'CHANGE' ? ' selected' : '') + '>เปลี่ยนกลุ่ม</option></select></label>' +
      '<label class="fld span2"><span>กลุ่ม/รหัส ที่ HR กำหนด</span><select id="doCode"></select></label>' +
      '<label class="fld" id="doOldW"><span>รหัสเดิม (กรณีเปลี่ยนกลุ่ม)</span><select id="doOld"></select></label>' +
      '<label class="fld"><span>ระบุสาขา (ถ้ามี)</span><input id="doSpec" value="' + esc(o.specialty || '') + '"></label>'
      : '<label class="fld"><span>จำนวนเงิน (บาท/เดือน)</span><input id="doAmt" inputmode="numeric" value="' + esc(o.amount || '') + '"></label>' +
      (doc.kind === 'NP_REQ' ? '<label class="fld span2"><span>ผลงานที่ประจักษ์ (ข้อความในแบบคำขอ ถ้ามี)</span><input id="doWork" value="' + esc(o.workNote || '') + '"></label>' : '')) +
    '<label class="fld"><span>วันที่มีผล / ขอรับตั้งแต่</span><input type="date" id="doEff" value="' + esc(o.effDate || '') + '"></label></div>',
    onOpen: function (dlg) {
      if (!pts) return;
      var fill = function () {
        var l = $('#doLine', dlg).value, rs = (d.ptsRates || []).filter(function (r) { return r.line === l; });
        var opt = function (sel) { return '<option value="">—</option>' + rs.map(function (r) { return '<option value="' + esc(r.code) + '"' + (sel === r.code ? ' selected' : '') + '>' + esc(r.code + ' · กลุ่ม ' + r.grp + ' · ' + money(r.rate) + ' บาท · ' + r.desc) + '</option>'; }).join(''); };
        $('#doCode', dlg).innerHTML = opt(o.code); $('#doOld', dlg).innerHTML = opt(o.oldCode);
        $('#doOldW', dlg).classList.toggle('hidden', $('#doMode', dlg).value !== 'CHANGE');
      };
      $('#doLine', dlg).onchange = fill; $('#doMode', dlg).onchange = fill; fill();
    },
    actions: [{ label: ico('trash', 'sm') + 'ลบเอกสาร', cls: 'bad', fn: function () { return confirmDlg('ลบเอกสารนี้?', 'เลขอ้างอิง ' + esc(doc.refNo || '') + ' จะไม่ถูกใช้ซ้ำ', 'ลบ', 'bad').then(function (ok) { if (!ok) return false; return api('deleteDoc', { docId: doc.docId }).then(done); }); } },
      { label: 'ยกเลิก' }, { label: 'บันทึกและออกใหม่', cls: 'pri', fn: function () {
        var opts = pts ? { code: $('#doCode').value, mode: $('#doMode').value, oldCode: $('#doOld').value, specialty: $('#doSpec').value, effDate: $('#doEff').value } : { amount: $('#doAmt').value, effDate: $('#doEff').value, workNote: $('#doWork') ? $('#doWork').value : '' };
        if (pts && !opts.code) { toast('กรุณาเลือกรหัส พ.ต.ส.', 'warn'); return false; }
        return api('setDocOpts', { docId: doc.docId, opts: opts }).then(function () { toast('บันทึกแล้ว เอกสารกลับไปรอเจ้าตัวตรวจ', 'ok'); done(); });
      } }] });
}
function addMembersDlg(r, d, v) {
  peopleCache(true).then(function (pd) {
    var cand = pd.rows.filter(function (x) { return x.roundId !== r.roundId && x.status !== 'LEFT'; });
    modal({ title: 'เพิ่มสมาชิกเข้ารอบ ' + r.name, icon: 'users', size: 'wide', html: '<input id="amQ" placeholder="ค้นหาชื่อ รหัส ตำแหน่ง"><div class="tw" style="max-height:380px"><table class="t"><tbody id="amL"></tbody></table></div><div class="muted">บุคลากรปัจจุบัน (เช่น ขอ พ.ต.ส. เปลี่ยนกลุ่ม หรือทำสัญญาไม่ทำเวชฯ ใหม่) เพิ่มเข้ารอบได้เช่นกัน</div>',
      onOpen: function (dlg) { var draw = function () { var q = $('#amQ', dlg).value.trim(); $('#amL', dlg).innerHTML = cand.filter(function (x) { return !q || (x.name + x.empCode + x.position).indexOf(q) >= 0; }).slice(0, 200).map(function (x) { return '<tr><td style="width:36px"><input type="checkbox" data-pid="' + x.pid + '"></td><td>' + esc(x.empCode || '—') + '</td><td>' + esc(x.name) + '</td><td>' + esc(x.position) + '</td><td>' + statusTag(x.status) + '</td></tr>'; }).join(''); }; $('#amQ', dlg).oninput = draw; draw(); },
      actions: [{ label: 'ยกเลิก' }, { label: 'เพิ่มที่เลือก', cls: 'pri', fn: function (dlg) { var pids = $$('#amL input:checked', dlg).map(function (c) { return c.dataset.pid; }); if (!pids.length) { toast('เลือกรายชื่อก่อน', 'warn'); return false; } return api('saveRound', { round: r, members: pids }).then(function () { invalidatePeople(); toast('เพิ่มแล้ว ' + pids.length + ' คน', 'ok'); PAGES.round(v, [r.roundId]); }); } }] });
  });
}
function signDlg(docs, done) {
  docs = docs.filter(function (x) { return x && x.status !== 'SIGNED'; });
  if (!docs.length) { toast('เลือกเอกสารที่ยังไม่ได้บันทึกลงนาม', 'warn'); return; }
  modal({ title: 'บันทึกว่าลงนามแล้ว ' + docs.length + ' ฉบับ', icon: 'pen', size: 'wide', html: '<div class="note">' + ico('info') + '<span>ระบบจะเปิดสิทธิ์ในทะเบียนให้: สัญญาไม่ทำเวชฯ → เริ่มรับเงินไม่ทำเวชฯ · แบบ พ.ต.ส. → เริ่ม/เปลี่ยนกลุ่ม พ.ต.ส. และเปลี่ยนสถานะคนใหม่เป็น "ปฏิบัติงาน"</span></div>' +
    '<label class="fld"><span>เดือนรายงานส่งงานเงินเดือน</span><input type="month" id="sgY" value="' + S.boot.reportYm + '"></label><div class="tw"><table class="t"><thead><tr><th>ชื่อ</th><th>เอกสาร</th><th>วันที่มีผล</th><th>เปิดสิทธิ์</th></tr></thead><tbody>' +
    docs.map(function (x) { var o = x.snapshot.opts || {}, ev = x.kind === 'NP_CONTRACT' || (x.kind === 'PTS_FORM' && o.code); return '<tr><td>' + esc(x._name || '') + '</td><td>' + esc(x.kindLabel) + ' <span class="mono sub">' + esc(x.refNo || '') + '</span></td><td>' + (ev ? '<input type="date" data-eff="' + x.docId + '" value="' + esc(o.effDate || '') + '">' : '—') + '</td><td>' + (ev ? '<input type="checkbox" data-ev="' + x.docId + '" checked aria-label="เปิดสิทธิ์">' : '<span class="muted">ไม่มี</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>',
    actions: [{ label: 'ยกเลิก' }, { label: 'บันทึกลงนามแล้ว', cls: 'pri', fn: function (dlg) {
      var items = docs.map(function (x) { var e = $('[data-eff="' + x.docId + '"]', dlg), c = $('[data-ev="' + x.docId + '"]', dlg); return { docId: x.docId, effDate: e ? e.value : '', createEvent: c ? c.checked : false, reportYm: $('#sgY', dlg).value }; });
      return api('signDocs', { items: items }).then(function (r) { toast('บันทึกลงนาม ' + r.signed + ' ฉบับ · เปิดสิทธิ์ ' + r.events + ' รายการ' + (r.errors.length ? ' · ผิดพลาด ' + r.errors.length : ''), r.errors.length ? 'warn' : 'ok', 7000); invalidatePeople(); done(); });
    } }] });
}

/* ═════════ รายงานส่งงานเงินเดือน ═════════ */
PAGES.report = function (v, args) {
  var ym = args[0] || S.boot.reportYm;
  api('getMonthlyReport', { ym: ym }).then(function (d) {
    setTop('รายงานส่งงานเงินเดือน · ' + ymTh(d.ym), d.closed ? 'ปิดเดือนแล้ว ' + dtTh(d.closed.at) + ' โดย ' + esc(d.closed.by) : 'ส่งงานเงินเดือนภายในวันที่ 5 · ปิดเดือนแล้วจะแก้รายการเดือนนี้ไม่ได้', [
      mkBtn(ico('download', 'sm') + 'ส่งออก Excel', 'pri', function () { exportReport(d); }),
      d.closed ? (can('admin') ? mkBtn(ico('lock', 'sm') + 'เปิดเดือนอีกครั้ง', '', function (b) { run(b, api('closeMonth', { ym: d.ym, reopen: true }), 'เปิดเดือนแล้ว').then(function () { PAGES.report(v, [d.ym]); }); }) : null)
        : mkBtn(ico('lock', 'sm') + 'ปิดเดือน', '', function (b) { confirmDlg('ปิดเดือน ' + ymTh(d.ym) + '?', 'หลังปิดเดือน รายการที่อยู่ในรายงานเดือนนี้จะแก้ไขหรือลบไม่ได้ (ผู้ดูแลระบบเปิดใหม่ได้)', 'ปิดเดือน').then(function (ok) { if (ok) run(b, api('closeMonth', { ym: d.ym }), 'ปิดเดือนแล้ว').then(function () { PAGES.report(v, [d.ym]); }); }); })].filter(Boolean));
    var tbl = function (title, sub, head, rows, fn) {
      return '<div class="card"><div class="hd"><h3>' + title + '</h3><span class="muted">' + sub + ' · ' + rows.length + ' รายการ</span></div><div class="bd flush"><div class="tw"><table class="t"><thead><tr>' + head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
        (rows.length ? rows.map(function (r, i) { return '<tr class="click" data-eid="' + r.eid + '">' + fn(r, i).map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>'; }).join('') : '<tr><td colspan="' + head.length + '" class="empty">ไม่มีรายการ</td></tr>') + '</tbody></table></div></div></div>';
    };
    v.innerHTML = '<div class="toolbar"><label class="fld" style="min-width:200px"><span>เดือนรายงาน</span><input type="month" id="rYm" value="' + d.ym + '"></label></div>' +
      tbl('12. ค่าตอบแทน Fixed Rate ที่เปลี่ยนแปลง', 'รวมขอรับ/ยกเลิกไม่ทำเวชฯ และเงินอื่น', ['ลำดับ', 'ชื่อ – สกุล', 'รหัส', 'ตำแหน่ง', 'ฝ่าย', 'ค่าตอบแทน', 'เดิม', 'ที่ปรับ', 'วันที่มีผล', 'หมายเหตุ'], d.s12, function (r, i) {
        return [i + 1, esc(r.name), esc(r.empCode), esc(r.position), esc(r.dept), esc(r.label), money(r.oldAmount || 0), money(r.amount), dTh(r.effDate), esc([r.ref && 'เอกสาร ' + r.ref, r.reason].filter(Boolean).join(' · '))];
      }) +
      tbl('13. ค่าตอบแทน พ.ต.ส.', 'บรรจุใหม่/โอนย้าย และเปลี่ยนกลุ่ม', ['ลำดับ', 'สายงาน', 'รหัส', 'ชื่อ', 'ตำแหน่ง', 'วันที่มีผล', 'ใบอนุญาต', 'กรณี', 'เดิม', 'ใหม่'], d.s13, function (r, i) {
        return [i + 1, esc((d.lineLabel[r.line] || '').replace('สายงาน', '')), esc(r.empCode), esc(r.name), esc(r.position), dTh(r.effDate), esc(r.licenseNo || ''), r.isNew ? 'บรรจุใหม่' : 'เปลี่ยนกลุ่ม', r.isNew ? '—' : esc((r.oldGrp ? 'ก.' + r.oldGrp + ' ' : '') + (r.oldCode || '') + ' ' + money(r.oldAmount)), esc('ก.' + r.grp + ' ' + r.code + ' ' + money(r.amount))];
      }) +
      tbl('21. ระงับค่าตอบแทน', 'ระงับรายเดือน', ['ลำดับ', 'รหัส', 'ชื่อ', 'ตำแหน่ง', 'ค่าตอบแทน', 'ตั้งแต่', 'ถึง', 'สาเหตุ'], d.s21, function (r, i) { return [i + 1, esc(r.empCode), esc(r.name), esc(r.position), esc(r.rightLabel), dTh(r.effDate), dTh(r.endDate), esc(r.reason)]; }) +
      tbl('22. ยกเลิกการระงับ', 'เปิดจ่ายต่อ', ['ลำดับ', 'รหัส', 'ชื่อ', 'ตำแหน่ง', 'ค่าตอบแทน', 'มีผลตั้งแต่', 'หมายเหตุ'], d.s22, function (r, i) { return [i + 1, esc(r.empCode), esc(r.name), esc(r.position), esc(r.rightLabel), dTh(r.effDate), esc(r.reason || r.note)]; }) +
      (d.other.length ? tbl('รายการอื่นที่ไม่เข้าชีทมาตรฐาน', 'ตรวจด้วยตนเอง', ['ลำดับ', 'ชื่อ', 'สิทธิ์', 'เหตุการณ์', 'วันที่', 'หมายเหตุ'], d.other, function (r, i) { return [i + 1, esc(r.name), esc(r.rightLabel), esc(r.kind), dTh(r.effDate), esc(r.note)]; }) : '');
    $('#rYm').onchange = function () { location.hash = '#/report/' + this.value; };
    v.onclick = function (ev) { var tr = ev.target.closest('tr[data-eid]'); if (!tr) return; var all = d.s12.concat(d.s13, d.s21, d.s22, d.other), r = all.filter(function (x) { return x.eid === tr.dataset.eid; })[0]; if (r) { var p = (S.people && S.people.rows || []).filter(function (x) { return x.empCode === r.empCode; })[0]; if (p) location.hash = '#/person/' + p.pid + '/rights'; } };
  }, fail(v));
};
function dThN(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? (+m[3]) + ' ' + TH_MS[+m[2] - 1] + ' ' + (+m[1] + 543) : ''; }
function monthsBetween(a, b) { if (!a || !b) return ''; var n = (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7)) + 1; return n + ' เดือน'; }
function exportReport(d) {
  var t = 'ประจำเดือน ' + ymTh(d.ym);
  var s12 = [['12. สรุปรายการค่าตอบแทน Fixed Rate ที่มีการเปลี่ยนแปลง'], [t], [], ['ลำดับ', 'ชื่อ – สกุล', 'รหัสประจำตัว', 'ตำแหน่ง', 'หน่วยงาน', 'ฝ่าย / ศูนย์', 'ระดับ', 'คำสั่ง', 'ค่าตอบแทน', 'เดิม', 'ที่ปรับ', 'วันที่มีผล', 'หมายเหตุ']]
    .concat(d.s12.length ? d.s12.map(function (r, i) { return [i + 1, r.name, r.empCode, r.position, r.unit, r.dept, r.level, '', r.label, Number(r.oldAmount || 0) || '-', Number(r.amount || 0), dThN(r.effDate), [r.ref && 'เอกสาร ' + r.ref, r.reason].filter(Boolean).join(' ')]; }) : [['ไม่มี']]);
  var s13 = [['13. ค่าตอบแทน พ.ต.ส. สายงานพยาบาล แพทย์ ทันตแพทย์ เภสัชกร และสหสาขาวิชาชีพ'], [t], ['ลำดับ', 'รหัสประจำตัว', 'ชื่อ - นามสกุล', 'ตำแหน่ง', 'หน่วยงาน', 'ฝ่าย / ศูนย์', 'วันบรรจุ', 'วันที่มีผล', 'ใบอนุญาตประกอบโรคศิลปะ/ วิชาชีพ', '', 'บรรจุใหม่/โอนย้าย', '', '', 'เปลี่ยนกลุ่ม', '', '', '', '', '', 'หมายเหตุ'],
    ['', '', '', '', '', '', '', '', '', '', '', '', '', 'เดิม', '', '', 'ใหม่', '', '', ''], ['', '', '', '', '', '', '', '', 'เลขที่', 'วันที่', 'กลุ่มที่', 'รหัสฯ', 'ค่าตอบแทน', 'กลุ่มที่', 'รหัสฯ', 'ค่าตอบแทน', 'กลุ่มที่', 'รหัสฯ', 'ค่าตอบแทน', '']];
  var lastLine = null, n = 0;
  d.s13.forEach(function (r) {
    if (r.line !== lastLine) { s13.push([d.lineLabel[r.line] || '']); lastLine = r.line; }
    n++;
    var base = [n, r.empCode, r.name, r.position, r.unit, r.dept, dThN(r.startDate), dThN(r.effDate), r.licenseNo || '', dThN(r.licenseDate)];
    s13.push(base.concat(r.isNew ? [r.grp, r.code, Number(r.amount), '', '', '', '', '', ''] : ['', '', '', r.oldGrp, r.oldCode, Number(r.oldAmount || 0), r.grp, r.code, Number(r.amount)], [[r.note, r.ref].filter(Boolean).join(' ')]));
  });
  if (!d.s13.length) s13.push(['ไม่มี']);
  var s21 = [['21. ระงับค่าตอบแทน Fixed Rate'], [t], ['ลำดับ', 'รหัสประจำตัว', 'ชื่อ - นามสกุล', 'ตำแหน่ง', 'ฝ่าย', 'ระดับ', 'ค่าตอบแทน', 'ระงับตั้งแต่', '', 'รวมระยะเวลาที่ระงับ', 'สาเหตุ']]
    .concat(d.s21.length ? d.s21.map(function (r, i) { return [i + 1, r.empCode, r.name, r.position, r.dept, r.level, r.rightLabel, dThN(r.effDate), dThN(r.endDate), monthsBetween(r.effDate, r.endDate), r.reason]; }) : [['ไม่มี']]);
  var s22 = [['22. สรุปการ ยกเลิก ระงับค่าตอบแทน Fixed Rate'], [t], ['ลำดับ', 'รหัสประจำตัว', 'ชื่อ - นามสกุล', 'ตำแหน่ง', 'ฝ่าย', 'ระดับ', 'ค่าตอบแทน', 'มีผลตั้งแต่', 'ยกเลิก การระงับในระบบ HRMi']]
    .concat(d.s22.length ? d.s22.map(function (r, i) { return [i + 1, r.empCode, r.name, r.position, r.dept, r.level, r.rightLabel, dThN(r.effDate), 'ยกเลิก ระงับเดือน ' + ymTh(r.effDate.slice(0, 7))]; }) : [['ไม่มี']]);
  var M = function (r1, c1, r2, c2) { return { s: { r: r1, c: c1 }, e: { r: r2, c: c2 } }; };
  saveXlsx([
    { name: '12.สรุปการปรับค่าตอบ', aoa: s12, cols: [6, 28, 11, 22, 16, 22, 7, 10, 34, 9, 9, 13, 26] },
    { name: '13.พ.ต.ส.', aoa: s13, cols: [6, 11, 28, 24, 18, 22, 12, 12, 13, 12, 7, 8, 10, 7, 8, 10, 7, 8, 10, 26], merges: [M(2, 8, 2, 9), M(2, 10, 3, 12), M(2, 13, 2, 18), M(3, 13, 3, 15), M(3, 16, 3, 18)] },
    { name: '21.ระงับค่าตอบแทน', aoa: s21, cols: [6, 11, 28, 24, 18, 8, 26, 12, 12, 12, 30], merges: [M(2, 7, 2, 8)] },
    { name: '22.ยกเลิกค่าตอบแทน', aoa: s22, cols: [6, 11, 28, 24, 18, 8, 26, 12, 24] }
  ], 'ค่าตอบแทน เดือน' + ymTh(d.ym) + ' (จากระบบทะเบียนสัญญา).xlsx');
}

/* ═════════ ทบทวนไม่ทำเวชฯ ประจำปี (บันทึกข้อความแยกฝ่าย) ═════════ */
PAGES.review = function (v) {
  setTop('ทบทวนรายชื่อไม่ทำเวชฯ ประจำปี', 'ออกบันทึกข้อความถึงหัวหน้าฝ่าย พร้อมรายชื่อแพทย์ของฝ่ายนั้น (หัวหน้าฝ่ายตอบกลับเป็นกระดาษ)');
  peopleCache(true).then(function (d) {
    var np = d.rows.filter(function (r) { return r.np && /ACTIVE|SUSPENDED/.test(r.np.status); });
    var byDept = {}; np.forEach(function (r) { (byDept[r.dept || '(ไม่ระบุฝ่าย)'] = byDept[r.dept || '(ไม่ระบุฝ่าย)'] || []).push(r); });
    var fy = (+todayIso().slice(0, 4) + 543 + (+todayIso().slice(5, 7) >= 10 ? 1 : 0));
    v.innerHTML = '<div class="card"><div class="bd"><div class="grid g4"><label class="fld"><span>ครั้งที่</span><input id="rvN" value="1"></label><label class="fld"><span>ปีงบประมาณ</span><input id="rvY" value="' + fy + '"></label>' +
      '<label class="fld"><span>วันที่บันทึก</span><input type="date" id="rvD" value="' + todayIso() + '"></label><label class="fld"><span>ข้อมูลการจ่ายเดือน</span><input id="rvM" value="' + ymTh(todayIso().slice(0, 7)) + '"></label>' +
      '<label class="fld span2"><span>ผู้ลงนาม (หัวหน้าฝ่ายทรัพยากรบุคคล)</span><input id="rvS" value="แพทย์หญิงมนัสพร อติกานต์กุล"></label><label class="fld span2"><span>บรรทัดตำแหน่ง</span><input id="rvS2" value="รักษาการในตำแหน่ง หัวหน้าฝ่ายทรัพยากรบุคคล"></label></div>' +
      '<div class="toolbar"><button class="btn pri" id="rvPrint">' + ico('printer', 'sm') + 'พิมพ์บันทึกทุกฝ่าย</button><button class="btn" id="rvX">' + ico('download', 'sm') + 'ส่งออกรายชื่อ Excel</button><span class="muted">' + np.length + ' คน · ' + Object.keys(byDept).length + ' ฝ่าย</span></div></div></div>' +
      '<div class="card"><div class="bd flush"><table class="t"><thead><tr><th>ฝ่าย</th><th class="num">จำนวนแพทย์</th></tr></thead><tbody>' + Object.keys(byDept).sort().map(function (k) { return '<tr><td>' + esc(k) + '</td><td class="num">' + byDept[k].length + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    $('#rvPrint').onclick = function () { DOCS.print(reviewMemos(byDept, np.length)); };
    $('#rvX').onclick = function () { saveXlsx([{ name: 'รายชื่อ', aoa: [['ฝ่าย', 'รหัส', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'อัตรา', 'สถานะ', 'ผลทบทวน (คงสิทธิ์/ยกเลิก)']].concat(np.map(function (r) { return [r.dept, r.empCode, r.name, r.position, Number(r.np.amount), (RS_TAG[r.np.status] || [])[1], '']; })), cols: [30, 10, 30, 26, 10, 10, 26] }], 'ทบทวนไม่ทำเวชฯ ครั้งที่ ' + $('#rvN').value + '.' + $('#rvY').value + '.xlsx'); };
  }, fail(v));
};
function reviewMemos(byDept, total) {
  var n = $('#rvN').value, y = $('#rvY').value, dt = $('#rvD').value, m = $('#rvM').value, sgn = $('#rvS').value, s2 = $('#rvS2').value;
  var e = esc, out = '';
  Object.keys(byDept).sort().forEach(function (dep) {
    var L = byDept[dep], head = dep.replace(/^ฝ่าย/, '');
    out += '<section class="page"><div style="display:flex;justify-content:space-between;align-items:end"><b style="font-size:13pt">โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา</b><b style="font-size:13pt">สภากาชาดไทย</b></div><h1 style="font-size:24pt;margin:2mm 0">บันทึกข้อความ</h1>' +
      '<div class="row"><b>ส่วนงาน</b> ' + '<span class="f" style="text-align:left">งานบริหารเงินเดือนฯ ฝ่ายทรัพยากรบุคคล โทร 038-320-200 ต่อ 23412</span></div>' +
      '<div class="row"><b>ที่</b> <span class="f" style="text-align:left">สด.ทบ. &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/' + (+y - 1) + '</span><b>วันที่</b> <span class="f">' + e(DOCS.dTh(dt)) + '</span></div>' +
      '<div class="row"><b>เรื่อง</b> <span style="flex:1;border-bottom:1px solid #000">ขอทบทวนรายชื่อแพทย์ที่ทำสัญญารับเงินเพิ่มพิเศษไม่ทำเวชปฏิบัติส่วนตัว ครั้งที่ ' + e(n) + ' ประจำปีงบประมาณ ' + e(y) + '</span></div>' +
      '<p class="mt"><b>เรียน</b> หัวหน้าฝ่าย' + e(head) + '</p><p><b>สิ่งที่ส่งมาด้วย</b> 1. รายชื่อแพทย์ที่รับเงินเพิ่มพิเศษไม่ทำเวชปฏิบัติส่วนตัว<br><span style="padding-left:2.55cm">2. หลักเกณฑ์และแนวทางการจ่ายเงินเพิ่มพิเศษไม่ทำเวชปฏิบัติส่วนตัว</span></p>' +
      '<p class="ind mt">ปัจจุบันมีแพทย์ ทำสัญญาการรับเงินเพิ่มพิเศษไม่ทำเวชปฏิบัติส่วนตัวกับโรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา จำนวน ' + L.length + ' ราย (ข้อมูลการจ่ายเดือน' + e(m) + ') เพื่อเป็นแรงจูงใจให้แพทย์ ที่มิได้ทำเวชปฏิบัติส่วนตัว และหรือปฏิบัติงานในโรงพยาบาลเอกชนนอกเวลา ซึ่งได้อุทิศตนให้กับงานในโรงพยาบาลอย่างเต็มที่โดยไม่ต้องกังวลต่อระดับรายได้ มีโอกาสในการทบทวนความรู้ ตลอดจนการติดตามความก้าวหน้าต่าง ๆ ทางวิชาการ สามารถผลิตผลงานทางวิชาการ และพัฒนาการให้บริการเป็นไปอย่างมีคุณภาพ</p>' +
      '<p class="ind">ตามหลักเกณฑ์และแนวทางการจ่ายเงินเพิ่มพิเศษสำหรับแพทย์ ที่ไม่ทำเวชปฏิบัติส่วนตัว และหรือปฏิบัติงานในโรงพยาบาลเอกชน ระบุไว้ว่า “เพื่อให้จ่ายเงินดังกล่าวแก่แพทย์ สัตวแพทย์ ทันตแพทย์ และเภสัชกรเป็นไปอย่างมีประสิทธิภาพ ให้มีการพิจารณาทบทวนการอนุมัติบุคคลอย่างน้อยทุก 1 ปี”</p>' +
      '<p class="ind">ทั้งนี้ เพื่อให้การจ่ายเงินเป็นไปอย่างมีประสิทธิภาพ ฝ่ายทรัพยากรบุคคลขอให้ท่านดำเนินการพิจารณาทบทวนรายชื่อแพทย์ที่ได้ทำสัญญารับเงินเพิ่มพิเศษไม่ทำเวชปฏิบัติส่วนตัว ตามรายชื่อที่แนบ และแจ้งผลกลับมายังฝ่ายทรัพยากรบุคคล</p>' +
      '<p class="ind">จึงเรียนมาเพื่อพิจารณาดำเนินการ</p><div class="sig" style="margin-top:22mm"><div class="sg"><div>(' + e(sgn) + ')</div>' + e(s2).split(' หัวหน้า').map(function (x, i) { return '<div>' + (i ? 'หัวหน้า' : '') + x + '</div>'; }).join('') + '</div></div></section>' +
      '<section class="page"><h1>รายชื่อแพทย์ที่รับเงินเพิ่มพิเศษไม่ทำเวชปฏิบัติส่วนตัว</h1><p class="c" style="text-align:center">ฝ่าย' + e(head) + ' · ทบทวนครั้งที่ ' + e(n) + ' ปีงบประมาณ ' + e(y) + '</p>' +
      '<table class="ft" style="margin-top:6mm;font-size:12pt"><thead><tr><th>ลำดับ</th><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>คงสิทธิ์</th><th>ยกเลิก</th><th>หมายเหตุ</th></tr></thead><tbody>' +
      L.map(function (r, i) { return '<tr><td class="c">' + (i + 1) + '</td><td class="c">' + e(r.empCode) + '</td><td>' + e(r.name) + '</td><td>' + e(r.position) + '</td><td class="c"><span class="box"></span></td><td class="c"><span class="box"></span></td><td style="width:4cm"></td></tr>'; }).join('') +
      '</tbody></table><div class="sig" style="margin-top:16mm"><div class="sg"><div>ลงชื่อ ......................................................... หัวหน้าฝ่าย</div><div>(.........................................................)</div><div>วันที่ ..............................</div></div></div></section>';
  });
  return out;
}

/* ═════════ ข้อมูลสุขภาพ (ส่งออกให้หน่วยสุขภาพเจ้าหน้าที่) ═════════ */
PAGES.health = function (v) {
  setTop('ข้อมูลสุขภาพบุคลากรใหม่', 'ส่งออกเฉพาะผู้ที่ให้ความยินยอมข้อมูลอ่อนไหว · ทุกครั้งที่ส่งออกระบบบันทึกประวัติไว้');
  api('getHealthExport', {}).then(function (d) {
    var ok = d.rows.filter(function (r) { return r.consent && r.health; });
    v.innerHTML = '<div class="card"><div class="hd"><h3>' + ok.length + ' คน ที่ยินยอมและกรอกข้อมูลแล้ว</h3><button class="btn pri" id="hx">' + ico('download', 'sm') + 'ส่งออก Excel</button></div><div class="bd flush"><div class="tw"><table class="t"><thead><tr><th>ชื่อ</th><th>ตำแหน่ง</th><th>เริ่มงาน</th><th>โรคประจำตัว</th><th>ตับอักเสบบี</th><th>MMR</th><th>VZV</th></tr></thead><tbody>' +
      (ok.length ? ok.map(function (r) { var h = r.health; return '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.position) + '</td><td>' + dTh(r.startDate) + '</td><td>' + esc(h.chronic === 'มี' ? h.chronicDetail || 'มี' : h.chronic || '—') + '</td><td>' + esc(h.hepBVac || '—') + '</td><td>' + esc(h.mmr || '—') + '</td><td>' + esc(h.vzv || '—') + '</td></tr>'; }).join('') : '<tr><td colspan="7" class="empty">ยังไม่มีข้อมูล</td></tr>') + '</tbody></table></div></div></div>' +
      (d.rows.length - ok.length ? '<div class="note">' + ico('info') + '<span>ไม่ส่งออก ' + (d.rows.length - ok.length) + ' คน เพราะไม่ยินยอมข้อมูลอ่อนไหวหรือยังไม่กรอก</span></div>' : '');
    $('#hx').onclick = function () {
      var F = FORM_SPEC.filter(function (s) { return s.id === 'health'; })[0].fields.filter(function (f) { return f.p; });
      saveXlsx([{ name: 'สุขภาพ', aoa: [['รหัส', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'ฝ่าย', 'วันเริ่มงาน', 'เพศ', 'อายุ', 'โทรศัพท์'].concat(F.map(function (f) { return f.l; }))].concat(ok.map(function (r) { return [r.empCode, r.name, r.position, r.dept, dThL(r.startDate), r.sex, r.age, r.phone].concat(F.map(function (f) { return r.health[f.p.split('.')[1]] || ''; })); })) }], 'ข้อมูลสุขภาพบุคลากรใหม่_' + todayIso() + '.xlsx');
    };
  }, fail(v));
};

/* ═════════ ย้ายข้อมูลเดิม ═════════ */
var LEGACY_HEAD = [['empCode', 'รหัส'], ['name', 'ชื่อ'], ['position', 'ตำแหน่ง'], ['dept', 'หน่วยงาน'], ['empStatus', 'สถานะทำงาน'], ['right', 'สิทธิ์'], ['kind', 'เหตุการณ์'], ['effDate', 'วันที่มีผล'], ['endDate', 'ถึงวันที่'],
  ['amount', 'จำนวนเงิน'], ['oldAmount', 'เงินเดิม'], ['grp', 'กลุ่ม'], ['code', 'รหัส พ.ต.ส.'], ['oldGrp', 'กลุ่มเดิม'], ['oldCode', 'รหัสเดิม'], ['reason', 'เหตุผล'], ['text', 'ข้อความใน Note'], ['decision', 'ผลตรวจ (ใช้/ไม่ใช้)']];
PAGES.migrate = function (v) {
  setTop('ย้ายข้อมูลเดิม (Note)', 'นำเข้าไฟล์ Excel ที่ตรวจแล้ว · แถวที่ "ใช้" เข้าทะเบียนทันที แถวที่ยังไม่ตรวจเป็น "รอตรวจ" ไม่นับในสถานะและรายงาน', [mkBtn(ico('upload', 'sm') + 'นำเข้าไฟล์ที่ตรวจแล้ว', 'pri', function () { legacyImportDlg(v); })]);
  api('getLegacyPending').then(function (rows) {
    var R = K().RIGHT_TYPES || {}, st = { q: '', right: 'ALL', open: {} };
    var byP = {}; rows.forEach(function (e) { (byP[e.empCode] = byP[e.empCode] || { code: e.empCode, name: e.name, ev: [] }).ev.push(e); });
    var people = Object.keys(byP).map(function (k) { return byP[k]; });
    var cnt = { ALL: rows.length }; rows.forEach(function (e) { cnt[e.right] = (cnt[e.right] || 0) + 1; });
    var labels = { ALL: 'ทั้งหมด' }; Object.keys(cnt).forEach(function (k) { if (k !== 'ALL') labels[k] = (R[k] || {}).short || k; });
    v.innerHTML = '<div class="note">' + ico('info') + '<span>ใช้ไฟล์ "คิวตรวจย้ายข้อมูล Note" ที่ระบบเตรียมไว้ (ใส่ผลตรวจให้อัตโนมัติแล้วกว่า 90%) · ตรวจเฉพาะแถวที่ช่องผลตรวจว่าง จะตรวจในไฟล์หรือตรวจที่หน้านี้ก็ได้ · นำเข้าซ้ำได้ ระบบไม่สร้างแถวซ้ำ</span></div>' +
      '<div class="kpis"><div class="kpi"><div class="kh"><span class="l">รายการรอตรวจ</span><span class="tile violet">' + ico('clip', 'sm') + '</span></div><span class="v">' + money(rows.length) + '</span><span class="s">' + (rows.length >= 1500 ? 'แสดง 1,500 รายการแรก' : 'ไม่นับในสถานะจนกว่าจะยืนยัน') + '</span></div>' +
      '<div class="kpi"><div class="kh"><span class="l">บุคลากรที่ต้องดู</span><span class="tile brand">' + ico('users', 'sm') + '</span></div><span class="v">' + money(people.length) + '</span><span class="s">จัดกลุ่มรายคนด้านล่าง</span></div></div>' +
      '<div class="card"><div class="hd"><div class="toolbar grow"><input id="lgQ" placeholder="ค้นหาชื่อ รหัส หรือข้อความใน Note" style="max-width:320px">' + filterChips(cnt, 'ALL', labels).replace('class="chips"', 'class="chips" id="lgChips"') + '</div>' +
      '<div class="toolbar"><button class="btn sm ghost" id="lgExp">' + ico('chev', 'sm') + 'ขยายทั้งหมด</button><button class="btn sm ok" id="lgOk">' + ico('tick', 'sm') + 'ใช้ที่เลือก</button><button class="btn sm bad" id="lgNo">' + ico('x', 'sm') + 'ไม่ใช้ที่เลือก</button></div></div>' +
      '<div class="bd flush" id="lgBox"></div></div>';
    var draw = function () {
      var q = st.q.toLowerCase(), H = '', shown = 0;
      people.forEach(function (p) {
        var ev = p.ev.filter(function (e) { return (st.right === 'ALL' || e.right === st.right) && (!q || (p.code + p.name + e.note).toLowerCase().indexOf(q) >= 0); });
        if (!ev.length) return; shown++;
        var open = st.open[p.code] || st.all;
        H += '<div class="lg-p' + (open ? ' open' : '') + '" data-p="' + p.code + '"><div class="lg-h"><input type="checkbox" data-pall="' + p.code + '" aria-label="เลือกทั้งหมดของคนนี้"><button class="lg-t" data-tog="' + p.code + '"><span class="av sm">' + esc(initials(p.name)) + '</span><span class="grow"><b>' + esc(p.name || '—') + '</b><small class="mono">' + esc(p.code) + '</small></span><span class="tag violet">' + ev.length + ' รายการ</span>' + ico('chev', 'sm') + '</button></div>' +
          '<div class="lg-b">' + ev.map(function (e) { return '<label class="lg-e"><input type="checkbox" data-e="' + e.eid + '" data-pc="' + p.code + '"><span class="dot ' + e.kind + '"></span><span class="grow"><b>' + esc(e.rightLabel + ' · ' + e.kindLabel) + '</b> <span class="muted">' + (dTh(e.effDate) || '—') + (e.endDate ? '–' + dTh(e.endDate) : '') + (e.code ? ' · ' + esc(e.code) : '') + (e.amount ? ' · ' + money(e.amount) + ' บาท' : '') + '</span><small>' + esc(e.note) + '</small></span></label>'; }).join('') + '</div></div>';
      });
      $('#lgBox').innerHTML = H || emptyState('check', rows.length ? 'ไม่พบรายการตามตัวกรอง' : 'ไม่มีรายการรอตรวจ', rows.length ? 'ลองล้างคำค้นหรือเลือก "ทั้งหมด"' : 'ข้อมูลเดิมทุกแถวได้รับการยืนยันแล้ว');
    };
    draw();
    $('#lgQ').oninput = function () { st.q = this.value.trim(); draw(); };
    $('#lgChips').onclick = function (ev) { var c = ev.target.closest('[data-chip]'); if (!c) return; st.right = c.dataset.chip; $$('#lgChips .chip').forEach(function (x) { x.classList.toggle('on', x === c); }); draw(); };
    $('#lgExp').onclick = function () { st.all = !st.all; st.open = {}; this.innerHTML = ico('chev', 'sm') + (st.all ? 'ย่อทั้งหมด' : 'ขยายทั้งหมด'); draw(); };
    $('#lgBox').onclick = function (ev) {
      var t = ev.target.closest('[data-tog]'); if (t) { var c = t.dataset.tog; st.open[c] = !(st.open[c] || st.all); t.closest('.lg-p').classList.toggle('open'); return; }
      var pa = ev.target.closest('[data-pall]'); if (pa) { $$('[data-pc="' + pa.dataset.pall + '"]').forEach(function (x) { x.checked = pa.checked; }); }
    };
    var dec = function (ok, b) { var ids = $$('[data-e]:checked').map(function (c) { return c.dataset.e; }); if (!ids.length) { toast('เลือกรายการก่อน (ติ๊กที่ชื่อเพื่อเลือกทั้งหมดของคนนั้น)', 'warn'); return; } run(b, api('reviewLegacy', { eids: ids, ok: ok }), 'บันทึกแล้ว ' + ids.length + ' รายการ').then(function () { refreshBadges(); PAGES.migrate(v); }); };
    $('#lgOk').onclick = function () { dec(true, this); }; $('#lgNo').onclick = function () { dec(false, this); };
  }, fail(v));
};
function legacyImportDlg(v) {
  modal({ title: 'นำเข้าข้อมูลเดิมที่ตรวจแล้ว', icon: 'upload', html: '<input type="file" id="lgF" accept=".xlsx"><div id="lgP" class="muted">เลือกไฟล์คิวตรวจย้ายข้อมูล Note (.xlsx) — ระบบอ่านแผ่นงานที่มีหัวคอลัมน์ตามรูปแบบให้เอง</div>',
    onOpen: function (dlg) { $('#lgF', dlg).onchange = function () { var f = this.files[0]; readXlsx(f).then(function (wb) { var sn = wb.SheetNames.filter(function (n) { var a = XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: false, defval: '', range: 0 })[0] || []; return a.indexOf('ข้อความใน Note') >= 0 && a.indexOf('สิทธิ์') >= 0; })[0]; if (!sn) { $('#lgP', dlg).textContent = 'ไม่พบแผ่นงานที่มีหัวคอลัมน์ตามรูปแบบ (ต้องมี รหัส · สิทธิ์ · เหตุการณ์ · ข้อความใน Note …)'; dlg._rows = null; return; } var aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: false, defval: '' }), head = aoa[0].map(String); var idx = LEGACY_HEAD.map(function (h) { return head.indexOf(h[1]); }); dlg._rows = aoa.slice(1).filter(function (r) { return r.some(String); }).map(function (r) { var o = {}; LEGACY_HEAD.forEach(function (h, i) { o[h[0]] = idx[i] >= 0 ? String(r[idx[i]]).trim() : ''; }); return o; }); $('#lgP', dlg).textContent = 'พบ ' + dlg._rows.length + ' แถว · ใช้ ' + dlg._rows.filter(function (r) { return /^ใช้$/.test(r.decision); }).length + ' · ไม่ใช้ ' + dlg._rows.filter(function (r) { return /ไม่ใช้/.test(r.decision); }).length + ' · ยังไม่ตรวจ ' + dlg._rows.filter(function (r) { return !r.decision; }).length; }); }; },
    actions: [{ label: 'ยกเลิก' }, { label: 'นำเข้า', cls: 'pri', fn: function (dlg) {
      if (!dlg._rows) { toast('เลือกไฟล์ก่อน', 'warn'); return false; }
      var rows = dlg._rows, chunks = [], res = { persons: 0, events: 0, pending: 0, skipped: 0, errors: [] };
      for (var i = 0; i < rows.length; i += 500) chunks.push({ off: i, rows: rows.slice(i, i + 500) });
      return chunks.reduce(function (p, ch) { return p.then(function () { $('#lgP', dlg).textContent = 'กำลังนำเข้า ' + Math.min(ch.off + 500, rows.length) + ' / ' + rows.length + ' แถว …'; return api('importLegacy', { rows: ch.rows }).then(function (r) { ['persons', 'events', 'pending', 'skipped'].forEach(function (k) { res[k] += r[k]; }); res.errors = res.errors.concat(r.errors.map(function (x) { return { line: x.line + ch.off, reason: x.reason }; })); }); }); }, Promise.resolve())
        .then(function () { toast('นำเข้าแล้ว: บุคลากรใหม่ ' + res.persons + ' · เหตุการณ์ ' + res.events + ' (รอตรวจ ' + res.pending + ') · ข้าม ' + res.skipped + (res.errors.length ? ' · ผิดพลาด ' + res.errors.length : ''), res.errors.length ? 'warn' : 'ok', 9000);
          if (res.errors.length) modal({ title: 'แถวที่นำเข้าไม่ได้ ' + res.errors.length + ' แถว', icon: 'alert', html: '<div class="muted" style="margin-bottom:8px">แก้ในไฟล์แล้วนำเข้าซ้ำได้ (แถวที่เข้าแล้วไม่ซ้ำ)</div><div class="tw" style="max-height:50vh"><table class="t"><thead><tr><th>แถวในไฟล์</th><th>สาเหตุ</th></tr></thead><tbody>' + res.errors.map(function (x) { return '<tr><td class="mono">' + x.line + '</td><td>' + esc(x.reason) + '</td></tr>'; }).join('') + '</tbody></table></div>', actions: [{ label: 'ปิด' }] });
          invalidatePeople(); refreshBadges(); PAGES.migrate(v); });
    } }] });
}

/* ═════════ ตั้งค่า ═════════ */
PAGES.settings = function (v, args) {
  var tab = args[0] || 'general';
  setTop('ตั้งค่า', 'ค่าทั่วไป · ผู้ลงนาม · อัตรา พ.ต.ส. · ผู้ใช้และสิทธิ์ · ประวัติการใช้งาน');
  var T = [['general', 'ทั่วไป / การเข้าระบบ / PDPA'], ['signers', 'ผู้ลงนาม'], ['rates', 'อัตรา พ.ต.ส.'], ['users', 'ผู้ใช้และสิทธิ์'], ['audit', 'ประวัติการใช้งาน']];
  v.innerHTML = '<div class="card"><div class="tabs">' + T.map(function (t) { return '<button data-t="' + t[0] + '" class="' + (t[0] === tab ? 'on' : '') + '">' + t[1] + '</button>'; }).join('') + '</div><div class="bd" id="stab"><div class="muted">กำลังโหลด…</div></div></div>';
  $$('.tabs button', v).forEach(function (b) { b.onclick = function () { location.hash = '#/settings/' + b.dataset.t; }; });
  var box = $('#stab');
  if (tab === 'users') return api('getUsers').then(function (d) { usersTab(box, d, v); }, fail(box));
  if (tab === 'audit') return api('getAudit').then(function (d) { box.innerHTML = '<div class="tw" style="max-height:65vh"><table class="t"><thead><tr><th>เวลา</th><th>ผู้ใช้</th><th>การกระทำ</th><th>รายละเอียด</th></tr></thead><tbody>' + d.rows.map(function (r) { return '<tr><td class="nowrap">' + dtTh(r.at) + '</td><td>' + esc(r.who) + '</td><td>' + esc(r.action) + '</td><td class="sub">' + esc(r.detail) + '</td></tr>'; }).join('') + '</tbody></table></div>'; }, fail(box));
  api('getSettings').then(function (d) {
    if (tab === 'general') {
      var s = d.settings;
      box.innerHTML = '<div class="grid g2"><label class="fld span2"><span>ที่อยู่หน้าเว็บ (ใช้สร้างลิงก์เชิญ)</span><input id="s_webUrl" value="' + esc(s.webUrl) + '"></label>' +
        '<label class="fld"><span>การเข้าระบบของบุคลากร</span><select id="s_hisMode"><option value="TEST"' + (s.hisMode === 'TEST' ? ' selected' : '') + '>โหมดทดสอบ (รหัสผ่าน = รหัสเจ้าหน้าที่)</option><option value="HIS"' + (s.hisMode === 'HIS' ? ' selected' : '') + '>ตรวจกับระบบ HIS (abs_login)</option></select><small>HIS_API_TOKEN: ' + (d.hisToken ? 'ตั้งแล้ว' : '<b style="color:var(--bad)">ยังไม่ได้ตั้งใน Script Properties</b>') + '</small></label>' +
        '<label class="fld"><span>ที่อยู่ API ของ HIS</span><input id="s_hisUrl" value="' + esc(s.hisUrl) + '"></label>' +
        '<label class="fld"><span>อายุลิงก์เชิญ (วัน)</span><input id="s_inviteDays" value="' + esc(s.inviteDays) + '"></label><label class="fld"><span>ลบข้อมูลผู้ไม่ได้เข้าทำงานหลัง (เดือน)</span><input id="s_retainMonths" value="' + esc(s.retainMonths) + '"></label>' +
        '<label class="fld"><span>เบอร์ติดต่อ HR (แสดงในอีเมล/หน้าเว็บ)</span><input id="s_hrPhone" value="' + esc(s.hrPhone) + '"></label><label class="fld"><span>LINE Official</span><input id="s_hrLine" value="' + esc(s.hrLine) + '"></label>' +
        '<label class="fld span2"><span>ชื่อผู้ส่งอีเมล</span><input id="s_mailFromName" value="' + esc(s.mailFromName) + '"></label><label class="fld span2"><span>สถานที่ทำสัญญา (ค่าเริ่มต้น)</span><input id="s_hospitalPlace" value="' + esc(s.hospitalPlace) + '"></label>' +
        '<label class="fld"><span>ฉบับข้อความ PDPA</span><input id="s_pdpaVersion" value="' + esc(s.pdpaVersion) + '"><small>แก้ข้อความแล้วระบบเปลี่ยนเลขฉบับให้อัตโนมัติ ความยินยอมเดิมยังอ้างฉบับเดิม</small></label><div></div>' +
        '<label class="fld span2"><span>ข้อความขอความยินยอม: ข้อมูลทั่วไป</span><textarea id="s_pdpaGeneral" rows="5">' + esc(s.pdpaGeneral) + '</textarea></label>' +
        '<label class="fld span2"><span>ข้อความขอความยินยอม: ข้อมูลอ่อนไหว</span><textarea id="s_pdpaSensitive" rows="5">' + esc(s.pdpaSensitive) + '</textarea></label></div><div class="toolbar"><button class="btn pri" id="sSave">บันทึก</button><span class="muted">โควตาอีเมลวันนี้เหลือ ' + (d.mailQuota == null ? '—' : d.mailQuota) + '</span></div>';
      $('#sSave').onclick = function () { var o = {}; $$('[id^="s_"]', box).forEach(function (x) { o[x.id.slice(2)] = x.value; }); run(this, api('saveSettings', { settings: o }), 'บันทึกแล้ว').then(function () { PAGES.settings(v, ['general']); }); };
    } else if (tab === 'signers') {
      box.innerHTML = '<div class="note">' + ico('info') + '<span>เอกสารใช้ผู้ลงนามที่มีผล ณ วันนัดลงนามของรอบ เมื่อเปลี่ยนผู้บริหาร ให้ใส่วันสิ้นสุดของคนเดิม แล้วเพิ่มคนใหม่พร้อมวันเริ่ม เอกสารเก่าพิมพ์ซ้ำได้ชื่อเดิม</span></div><table class="t"><thead><tr><th>บทบาท</th><th>ชื่อ</th><th>บรรทัดตำแหน่ง</th><th>ช่วงที่มีผล</th><th></th></tr></thead><tbody>' +
        d.signers.map(function (s) { return '<tr><td>' + esc(d.signerRoles[s.role] || s.role) + '</td><td>' + esc(s.name) + '</td><td class="sub">' + esc([s.line1, s.line2, s.line3].filter(String).join(' / ')) + '</td><td>' + dTh(s.from) + ' – ' + (dTh(s.to) || 'ปัจจุบัน') + '</td><td><button class="btn sm" data-sg="' + s.id + '">แก้ไข</button></td></tr>'; }).join('') + '</tbody></table><div><button class="btn pri sm" id="sgAdd">' + ico('plus', 'sm') + 'เพิ่มผู้ลงนาม</button></div>';
      var dlg = function (s) {
        s = s || { role: 'DIRECTOR' };
        modal({ title: s.id ? 'แก้ไขผู้ลงนาม' : 'เพิ่มผู้ลงนาม', html: '<div class="grid g2"><label class="fld"><span>บทบาท</span><select id="gR">' + Object.keys(d.signerRoles).map(function (k) { return '<option value="' + k + '"' + (s.role === k ? ' selected' : '') + '>' + esc(d.signerRoles[k]) + '</option>'; }).join('') + '</select></label><label class="fld"><span>ชื่อ (ตามที่พิมพ์ในเอกสาร)</span><input id="gN" value="' + esc(s.name || '') + '"></label>' +
          '<label class="fld span2"><span>บรรทัดตำแหน่ง 1</span><input id="g1" value="' + esc(s.line1 || '') + '"></label><label class="fld span2"><span>บรรทัดตำแหน่ง 2</span><input id="g2" value="' + esc(s.line2 || '') + '"></label><label class="fld span2"><span>บรรทัดตำแหน่ง 3</span><input id="g3" value="' + esc(s.line3 || '') + '"></label>' +
          '<label class="fld"><span>มีผลตั้งแต่</span><input type="date" id="gF" value="' + esc(s.from || '') + '"></label><label class="fld"><span>ถึง (เว้นว่าง = ปัจจุบัน)</span><input type="date" id="gT" value="' + esc(s.to || '') + '"></label></div>',
          actions: (s.id ? [{ label: 'ลบ', cls: 'bad', fn: function () { return api('saveSigner', { signer: s, remove: true }).then(function () { PAGES.settings(v, ['signers']); }); } }] : []).concat([{ label: 'ยกเลิก' }, { label: 'บันทึก', cls: 'pri', fn: function () { return api('saveSigner', { signer: { id: s.id, role: $('#gR').value, name: $('#gN').value, line1: $('#g1').value, line2: $('#g2').value, line3: $('#g3').value, from: $('#gF').value, to: $('#gT').value } }).then(function () { toast('บันทึกแล้ว', 'ok'); PAGES.settings(v, ['signers']); }); } }]) });
      };
      $('#sgAdd').onclick = function () { dlg(); };
      box.onclick = function (ev) { var b = ev.target.closest('[data-sg]'); if (b) dlg(d.signers.filter(function (s) { return s.id === b.dataset.sg; })[0]); };
    } else if (tab === 'rates') {
      var rates = d.ptsRates.slice();
      var draw = function () {
        box.innerHTML = '<div class="note">' + ico('info') + '<span>ตามระเบียบสภากาชาดไทย ว่าด้วย พ.ต.ส. พ.ศ. 2548 และฉบับที่ 2 พ.ศ. 2550 · แก้ไขได้เมื่อระเบียบเปลี่ยน · รหัสใช้ในแบบ พ.ต.ส. และรายงานชีท 13</span></div><div class="tw" style="max-height:60vh"><table class="t"><thead><tr><th>สายงาน</th><th>กลุ่ม</th><th>รหัส</th><th>อัตรา</th><th>คุณลักษณะ</th><th></th></tr></thead><tbody>' +
          rates.map(function (r, i) { return '<tr><td><select data-i="' + i + '" data-k="line">' + Object.keys(d.lineLabel).map(function (l) { return '<option value="' + l + '"' + (r.line === l ? ' selected' : '') + '>' + esc(d.lineLabel[l].replace('สายงาน', '')) + '</option>'; }).join('') + '</select></td><td><input data-i="' + i + '" data-k="grp" value="' + r.grp + '" style="width:60px"></td><td><input data-i="' + i + '" data-k="code" value="' + esc(r.code) + '" style="width:90px"></td><td><input data-i="' + i + '" data-k="rate" value="' + r.rate + '" style="width:90px"></td><td><input data-i="' + i + '" data-k="desc" value="' + esc(r.desc) + '"></td><td><button class="btn icon ghost" data-rm="' + i + '" aria-label="ลบ">' + ico('trash') + '</button></td></tr>'; }).join('') +
          '</tbody></table></div><div class="toolbar"><button class="btn sm" id="rtAdd">' + ico('plus', 'sm') + 'เพิ่มรหัส</button><button class="btn pri" id="rtSave">บันทึกตารางอัตรา</button></div>';
        box.oninput = box.onchange = function (ev) { var x = ev.target; if (x.dataset.i) rates[+x.dataset.i][x.dataset.k] = x.value; };
        box.onclick = function (ev) { var b = ev.target.closest('[data-rm]'); if (b) { rates.splice(+b.dataset.rm, 1); draw(); } };
        $('#rtAdd').onclick = function () { rates.push({ line: 'NURSE', grp: 1, code: '', rate: 1000, desc: '' }); draw(); };
        $('#rtSave').onclick = function () { run(this, api('savePtsRates', { rates: rates }), 'บันทึกแล้ว').then(function (r) { S.boot.ptsRates = r.rates; }); };
      };
      draw();
    }
  }, fail(box));
};
function usersTab(box, d, v) {
  box.innerHTML = '<div class="tw"><table class="t"><thead><tr><th>รหัส</th><th>ชื่อ</th><th>หน่วยงาน</th><th>สิทธิ์</th><th>สถานะ</th><th>เข้าล่าสุด</th><th></th></tr></thead><tbody>' + d.users.map(function (u) {
    return '<tr><td class="mono">' + esc(u.empCode) + '</td><td>' + esc(u.name) + '</td><td>' + esc(u.unit) + '</td><td class="sub">' + u.perms.map(function (p) { return esc(d.perms[p] || p); }).join(' · ') + '</td><td>' + (u.active ? '<span class="tag ok">ใช้งาน</span>' : '<span class="tag">ปิด</span>') + (u.mustChange ? ' <span class="tag warn">ยังไม่เปลี่ยนรหัส</span>' : '') + '</td><td>' + dtTh(u.lastLogin) + '</td><td><button class="btn sm" data-u="' + u.empCode + '">แก้ไข</button></td></tr>';
  }).join('') + '</tbody></table></div><div><button class="btn pri sm" id="uAdd">' + ico('plus', 'sm') + 'เพิ่มผู้ใช้</button></div>';
  var dlg = function (u) {
    u = u || { perms: [], active: true };
    modal({ title: u.empCode ? 'แก้ไขผู้ใช้ ' + u.name : 'เพิ่มผู้ใช้ (รหัสผ่านเริ่มต้น = รหัสเจ้าหน้าที่)', size: 'wide', html: '<div class="grid g3"><label class="fld"><span>รหัสเจ้าหน้าที่</span><input id="uC" value="' + esc(u.empCode || '') + '"' + (u.empCode ? ' readonly' : '') + '></label><label class="fld"><span>ชื่อ</span><input id="uN" value="' + esc(u.name || '') + '"></label><label class="fld"><span>หน่วยงาน</span><input id="uU" value="' + esc(u.unit || '') + '"></label></div>' +
      '<div class="toolbar"><span class="muted">ชุดสิทธิ์สำเร็จรูป:</span>' + Object.keys(d.presets).map(function (k) { return '<button class="btn sm" data-pre="' + k + '">' + { RECRUIT: 'งานสรรหา', WELFARE: 'งานสวัสดิการ', PAYROLL: 'งานเงินเดือน (ทั้งหมด)' }[k] + '</button>'; }).join('') + '</div>' +
      '<div class="grid g2">' + Object.keys(d.perms).map(function (p) { return '<label class="chk"><input type="checkbox" data-perm="' + p + '"' + (u.perms.indexOf(p) >= 0 ? ' checked' : '') + '><span>' + esc(d.perms[p]) + '</span></label>'; }).join('') + '</div><label class="chk"><input type="checkbox" id="uA"' + (u.active ? ' checked' : '') + '><span>เปิดใช้งาน</span></label>',
      onOpen: function (dl) { $$('[data-pre]', dl).forEach(function (b) { b.onclick = function () { var set1 = d.presets[b.dataset.pre]; $$('[data-perm]', dl).forEach(function (c) { c.checked = set1.indexOf(c.dataset.perm) >= 0; }); }; }); },
      actions: (u.empCode ? [{ label: 'รีเซ็ตรหัสผ่าน', fn: function () { return api('resetUserPassword', { empCode: u.empCode }).then(function () { toast('รีเซ็ตแล้ว รหัสผ่านเริ่มต้น = รหัสเจ้าหน้าที่', 'ok'); }); } }] : []).concat([{ label: 'ยกเลิก' }, { label: 'บันทึก', cls: 'pri', fn: function (dl) {
        return api('saveUser', { user: { empCode: $('#uC').value, name: $('#uN').value, unit: $('#uU').value, active: $('#uA').checked, perms: $$('[data-perm]:checked', dl).map(function (c) { return c.dataset.perm; }) } }).then(function () { toast('บันทึกแล้ว', 'ok'); PAGES.settings(v, ['users']); });
      } }]) });
  };
  $('#uAdd').onclick = function () { dlg(); };
  box.onclick = function (ev) { var b = ev.target.closest('[data-u]'); if (b) dlg(d.users.filter(function (u) { return u.empCode === b.dataset.u; })[0]); };
}
