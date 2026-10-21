/* core.js — แกนหน้าเว็บ: เรียกหลังบ้าน · ล็อกอิน 3 แบบ · เมนู · ป๊อปอัป/แจ้งเตือน · ตัวช่วยจัดรูปแบบ
 *  เรียกหลังบ้านแบบ fetch POST (ไม่ตั้ง Content-Type → ไม่มี preflight) · คำสั่งอ่านลองซ้ำได้ 3 ครั้ง · คำสั่งเขียนไม่ลองซ้ำ
 *  หน้าทดลองใช้ (ไฟล์เดียว) ตั้ง window.DEMO_RPC แทนการเรียกเครือข่าย */
var APP_BUILD = '2569-10-21.2';
var S = { token: null, me: null, boot: null };
var PAGES = {};

/* ═════════ เรียกหลังบ้าน ═════════ */
function isRead(a) { return /^(get|list|ping|login)/.test(a); }
function rawCall(action, payload) {
  var body = { action: action, token: S.token, payload: payload || {} };
  if (window.DEMO_RPC) return new Promise(function (res) { setTimeout(function () { res(window.DEMO_RPC(action, S.token, JSON.parse(JSON.stringify(payload || {})))); }, 120); });
  var waits = [700, 1600, 3200], tries = 0;
  var go = function () {
    return fetch(API_URL, { method: 'POST', redirect: 'follow', credentials: 'omit', cache: 'no-store', body: JSON.stringify(body) })
      .then(function (r) { return r.text(); })
      .then(function (t) {
        if (String(t).trim().charAt(0) === '<') { var e = new Error('เซิร์ฟเวอร์ Google ไม่ว่างชั่วคราว กรุณาลองอีกครั้ง'); e.retry = true; throw e; }
        return JSON.parse(t);
      })
      .catch(function (e) {
        if (isRead(action) && tries < waits.length) { var w = waits[tries++]; return new Promise(function (r) { setTimeout(r, w); }).then(go); }
        if (!e.retry && /fetch|network|Failed/i.test(e.message)) e = new Error('เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง');
        throw e;
      });
  };
  return go();
}
var _busyN = 0;
function loadbar(on) { _busyN += on ? 1 : -1; var b = document.getElementById('loadbar'); if (b) b.classList.toggle('on', _busyN > 0); }
function api(action, payload) {
  loadbar(true);
  return rawCall(action, payload).then(function (res) {
    loadbar(false);
    if (res.ok) return res.data;
    if (res.error === 'SESSION_EXPIRED') { sessionEnd('หมดเวลาการใช้งาน กรุณาเข้าสู่ระบบอีกครั้ง'); throw new Error('หมดเวลาการใช้งาน'); }
    if (res.error === 'MUST_CHANGE_PASSWORD') { changePasswordDlg(true); throw new Error('กรุณาเปลี่ยนรหัสผ่านก่อนใช้งาน'); }
    throw new Error(res.error);
  }, function (e) { loadbar(false); throw e; });
}
/* ปุ่มกดแล้วรอ: ปิดปุ่ม แสดงสถานะ แจ้งผล */
function run(btn, promise, okMsg) {
  if (btn) { btn.disabled = true; btn.dataset.t = btn.innerHTML; btn.innerHTML = '<span class="spin"></span>กำลังดำเนินการ…'; }
  return promise.then(function (x) { if (okMsg) toast(okMsg, 'ok'); return x; }, function (e) { toast(e.message, 'bad'); throw e; })
    .finally(function () { if (btn) { btn.disabled = false; btn.innerHTML = btn.dataset.t; } });
}

/* ═════════ ตัวช่วย ═════════ */
function $(s, r) { return (r || document).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function ico(n, cls) { return '<svg class="i' + (cls ? ' ' + cls : '') + '"><use href="#i-' + n + '"/></svg>'; }
var TH_MS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
var TH_ML = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
function dTh(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? (+m[3]) + ' ' + TH_MS[+m[2] - 1] + ' ' + String(+m[1] + 543).slice(-2) : ''; }
function dThL(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? (+m[3]) + ' ' + TH_ML[+m[2] - 1] + ' ' + (+m[1] + 543) : ''; }
function dtTh(s) { return s ? dTh(s.slice(0, 10)) + ' ' + String(s).slice(11, 16) + ' น.' : ''; }
function ymTh(ym) { var m = /^(\d{4})-(\d{2})/.exec(ym || ''); return m ? TH_ML[+m[2] - 1] + ' ' + (+m[1] + 543) : ''; }
function money(n) { var x = Number(n); return n === '' || n == null || isNaN(x) ? '—' : x.toLocaleString('en-US'); }
function todayIso() { var d = new Date(Date.now() + 7 * 3600e3); return d.toISOString().slice(0, 10); }
function K() { return (S.boot && S.boot.k) || {}; }
function can(p) { return S.me && S.me.kind === 'ADMIN' && (S.me.perms.indexOf(p) >= 0 || (S.me.perms.indexOf('admin') >= 0 && p !== 'health')); }
var ST_TAG = { INVITED: 'info', DRAFT: 'warn', SUBMITTED: 'brand', RETURNED: 'bad', VERIFIED: 'ok', ACTIVE: 'ok', LEFT: '' };
function statusTag(s) { return '<span class="tag ' + (ST_TAG[s] || '') + '">' + esc((K().PERSON_STATUS || {})[s] || s || '—') + '</span>'; }
var RS_TAG = { ACTIVE: ['ok', 'รับอยู่'], SUSPENDED: ['warn', 'ระงับ'], CANCELLED: ['', 'ยกเลิกแล้ว'], UPCOMING: ['info', 'รอเริ่ม'], NONE: ['', '—'] };
function rightTag(x, showAmt) {
  if (!x || !x.status || x.status === 'NONE') return '<span class="muted">—</span>';
  var t = RS_TAG[x.status] || ['', x.status];
  return '<span class="tag ' + t[0] + '">' + t[1] + (x.code ? ' ' + esc(x.code) : '') + (showAmt && x.amount ? ' · ' + money(x.amount) : '') + '</span>';
}
var DOC_ST = { ISSUED: ['info', 'รอเจ้าตัวตรวจ'], CONFIRMED: ['ok', 'เจ้าตัวยืนยันแล้ว'], FLAGGED: ['bad', 'แจ้งแก้'], PRINTED: ['brand', 'พิมพ์แล้ว'], SIGNED: ['ok', 'ลงนามแล้ว'], DRAFT: ['', 'ร่าง'] };
function docTag(s) { var t = DOC_ST[s] || ['', s]; return '<span class="tag ' + t[0] + '">' + t[1] + '</span>'; }
function fileToB64(file) {
  return new Promise(function (res, rej) {
    var r = new FileReader();
    r.onload = function () { res(String(r.result).split(',')[1]); };
    r.onerror = function () { rej(new Error('อ่านไฟล์ไม่สำเร็จ')); };
    r.readAsDataURL(file);
  });
}
/* ย่อรูปถ่ายเอกสารก่อนส่ง (กว้างสุด 2000px · JPEG 85%) */
function shrinkImage(file) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.2e6) return Promise.resolve(file);
  return new Promise(function (res) {
    var img = new Image(), u = URL.createObjectURL(file);
    img.onload = function () {
      var k = Math.min(1, 2000 / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (b) { URL.revokeObjectURL(u); res(b ? new File([b], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file); }, 'image/jpeg', .85);
    };
    img.onerror = function () { res(file); };
    img.src = u;
  });
}
function b64ToBlob(b64, mime) { var bin = atob(b64), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new Blob([a], { type: mime }); }
function saveBlob(blob, name) {
  var u = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = u; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 1500);
}
/* ส่งออก Excel (SheetJS) — sheets: [{name, aoa, cols:[ความกว้าง], merges:[]}] */
function saveXlsx(sheets, name) {
  if (!window.XLSX) { toast('ไลบรารี Excel ยังโหลดไม่เสร็จ กรุณาลองอีกครั้ง', 'bad'); return; }
  var wb = XLSX.utils.book_new();
  sheets.forEach(function (s) {
    var ws = XLSX.utils.aoa_to_sheet(s.aoa);
    if (s.cols) ws['!cols'] = s.cols.map(function (w) { return { wch: w }; });
    if (s.merges) ws['!merges'] = s.merges;
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  });
  XLSX.writeFile(wb, name);
}
function readXlsx(file) {
  return file.arrayBuffer().then(function (buf) {
    var wb = XLSX.read(buf, { type: 'array', cellDates: false, raw: false });
    return wb;
  });
}

/* ═════════ ป๊อปอัป / แจ้งเตือน ═════════ */
function toast(msg, kind, ms) {
  var t = document.createElement('div'), dur = ms || (kind === 'bad' ? 6500 : 3800);
  t.className = 'toast ' + (kind || '');
  t.innerHTML = '<span class="ti">' + ico(kind === 'ok' ? 'tick' : kind === 'bad' || kind === 'warn' ? 'alert' : 'info') + '</span><span class="tm">' + esc(msg) + '</span><button class="tx" aria-label="ปิด">' + ico('x', 'sm') + '</button><i class="tp" style="animation-duration:' + dur + 'ms"></i>';
  var box = $('#toasts'); box.appendChild(t);
  while (box.children.length > 4) box.firstChild.remove();
  var gone = function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 260); };
  $('.tx', t).onclick = gone;
  setTimeout(gone, dur);
}
/* modal({title, html, size:'wide'|'xl', icon, actions:[{label, cls, fn(dlg) → false = ไม่ปิด / Promise}], onOpen(dlg)}) */
function modal(o) {
  var back = document.createElement('div');
  back.className = 'back';
  back.innerHTML = '<div class="dlg ' + (o.size || '') + '" role="dialog" aria-modal="true"><div class="dh">' + (o.icon ? '<div class="ic ' + (o.iconCls || '') + '">' + ico(o.icon) + '</div>' : '') +
    '<h3>' + esc(o.title || '') + '</h3><button class="btn icon ghost x" aria-label="ปิด">' + ico('x') + '</button></div><div class="db">' + (o.html || '') + '</div>' +
    (o.actions && o.actions.length ? '<div class="df"></div>' : '') + '</div>';
  $('#layer').appendChild(back);
  var dlg = back.firstChild;
  var close = function () { back.remove(); document.removeEventListener('keydown', key); if (o.onClose) o.onClose(); };
  var key = function (ev) { if (ev.key === 'Escape' && !o.sticky) close(); };
  document.addEventListener('keydown', key);
  dlg.close = close;
  $('.x', dlg).onclick = close;
  if (!o.sticky) back.addEventListener('mousedown', function (ev) { if (ev.target === back) close(); });
  (o.actions || []).forEach(function (a) {
    var b = document.createElement('button');
    b.className = 'btn ' + (a.cls || '');
    b.innerHTML = a.label;
    b.onclick = function () {
      if (!a.fn) return close();
      var r = a.fn(dlg, b);
      if (r && r.then) run(b, r).then(function (x) { if (x !== false) close(); }, function () { });
      else if (r !== false) close();
    };
    $('.df', dlg).appendChild(b);
  });
  if (o.onOpen) o.onOpen(dlg);
  var f = $('input,select,textarea', $('.db', dlg)); if (f && !o.noFocus) setTimeout(function () { f.focus(); }, 60);
  return dlg;
}
function confirmDlg(title, html, okLabel, cls) {
  return new Promise(function (res) {
    var done = false;
    modal({ title: title, html: html, icon: cls === 'bad' ? 'alert' : 'help', iconCls: cls === 'bad' ? 'warn' : '', onClose: function () { if (!done) res(false); },
      actions: [{ label: 'ยกเลิก' }, { label: okLabel || 'ยืนยัน', cls: cls === 'bad' ? 'danger' : 'pri', fn: function () { done = true; res(true); } }] });
  });
}

/* ═════════ เข้าสู่ระบบ ═════════ */
function inviteToken() { var m = /invite=([A-Za-z0-9]+)/.exec(location.hash || ''); return m ? m[1] : ''; }
function showLogin(msg) {
  $('#boot').classList.add('hidden'); $('#app').classList.add('hidden'); $('#loginScreen').classList.remove('hidden'); navOpen(false); closePop();
  var inv = inviteToken();
  $('#loginTabs').classList.toggle('hidden', !!inv);
  $('#inviteBox').classList.toggle('hidden', !inv);
  $('#loginForm').classList.toggle('hidden', !!inv);
  if (msg) loginErr(msg);
  if (inv) {
    api('getInviteInfo', { invite: inv }).then(function (x) {
      $('#inviteWelcome').innerHTML = '<span>ยินดีต้อนรับ</span><b>คุณ' + esc(x.firstName) + '</b><span>' + esc(x.position || '') + (x.startDate ? ' · เริ่มงาน ' + dThL(x.startDate) : '') + '</span>';
    }, function (e) { $('#inviteWelcome').innerHTML = '<span>' + esc(e.message) + '</span>'; $('#inviteForm').classList.add('hidden'); });
  }
  api('getPublicInfo').then(function (x) {
    $('#loginBuild').textContent = 'รุ่น ' + x.build;
    S.hisMode = x.hisMode;
    setLoginMode(S.loginMode || 'staff');
  }, function () { $('#loginBuild').textContent = 'ยังเชื่อมต่อหลังบ้านไม่ได้'; });
}
function loginErr(m) { var b = $('#loginErr'); b.classList.toggle('hidden', !m); $('span', b).textContent = m || ''; }
function setLoginMode(m) {
  S.loginMode = m;
  $$('#loginTabs button').forEach(function (b) { b.classList.toggle('on', b.dataset.mode === m); });
  var his = S.hisMode === 'HIS';
  $('#loginHint').textContent = m === 'admin' ? 'เจ้าหน้าที่ฝ่ายทรัพยากรบุคคล ใช้รหัสผ่านของระบบนี้' : (his ? 'ใช้รหัสเจ้าหน้าที่และรหัสผ่านเดียวกับระบบ HIS ของโรงพยาบาล' : 'โหมดทดสอบ: รหัสผ่านคือรหัสเจ้าหน้าที่ 7 หลัก');
  $('#userLabel').textContent = 'รหัสเจ้าหน้าที่ 7 หลัก';
  $('#passLabel').textContent = m === 'admin' ? 'รหัสผ่านระบบทะเบียนสัญญา' : (his ? 'รหัสผ่าน HIS' : 'รหัสผ่าน');
  loginErr('');
}
function doLogin(ev) {
  ev.preventDefault();
  var code = $('#empCode').value.trim(), pw = $('#pass').value;
  run($('#loginBtn'), api(S.loginMode === 'admin' ? 'loginAdmin' : 'loginStaff', { empCode: code, password: pw })).then(afterLogin, function (e) { loginErr(e.message); });
}
function doInvite(ev) {
  ev.preventDefault();
  run($('#invBtn'), api('loginInvite', { invite: inviteToken(), nationalId: $('#invId').value, dob: $('#invDob').value })).then(afterLogin, function (e) { loginErr(e.message); });
}
function afterLogin(r) {
  S.token = r.token; S.me = r.me;
  try { localStorage.setItem('hrc_token', r.token); } catch (e) { }
  if (inviteToken()) history.replaceState(null, '', location.pathname + location.search + '#/me');
  startApp();
}
function sessionEnd(msg) {
  S.token = null; S.me = null;
  try { localStorage.removeItem('hrc_token'); } catch (e) { }
  $('#layer').innerHTML = '';
  showLogin(msg);
}
function logout() { api('logout').catch(function () { }); sessionEnd(''); location.hash = ''; }
function changePasswordDlg(force) {
  if ($('#pwDlg')) return;
  modal({ title: force ? 'ตั้งรหัสผ่านใหม่ก่อนเริ่มใช้งาน' : 'เปลี่ยนรหัสผ่าน', icon: 'key', sticky: !!force,
    html: '<div id="pwDlg" class="grid">' + (force ? '<div class="note warn">' + ico('alert') + '<span>เข้าครั้งแรกด้วยรหัสผ่านเริ่มต้น กรุณาตั้งรหัสผ่านใหม่ (อย่างน้อย 8 ตัว มีทั้งตัวเลขและตัวอักษร)</span></div>' : '') +
      '<label class="fld"><span>รหัสผ่านเดิม</span><input type="password" id="pwOld" autocomplete="current-password"></label>' +
      '<label class="fld"><span>รหัสผ่านใหม่</span><input type="password" id="pwNew" autocomplete="new-password"></label>' +
      '<label class="fld"><span>ยืนยันรหัสผ่านใหม่</span><input type="password" id="pwNew2" autocomplete="new-password"></label></div>',
    actions: (force ? [{ label: 'ออกจากระบบ', fn: function () { logout(); } }] : [{ label: 'ยกเลิก' }]).concat([{ label: 'บันทึกรหัสผ่านใหม่', cls: 'pri', fn: function () {
      if ($('#pwNew').value !== $('#pwNew2').value) { toast('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน', 'bad'); return false; }
      return api('changePassword', { oldPassword: $('#pwOld').value, newPassword: $('#pwNew').value }).then(function () {
        S.me.mustChange = false; toast('เปลี่ยนรหัสผ่านแล้ว', 'ok'); if (force) route();
      });
    } }]) });
}

/* ═════════ เปิดระบบ / เมนู ═════════ */
function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
function firstNameOf(n) { return String(n || '').replace(/^คุณ/, '').replace(/^(นาย|นางสาว|นาง|นายแพทย์|แพทย์หญิง|ทันตแพทย์หญิง|ทันตแพทย์|เภสัชกรหญิง|เภสัชกร|ว่าที่ร้อยตรีหญิง|ว่าที่ร้อยตรี|ดร\.)\s*/, '').trim().split(/\s+/)[0] || ''; }
function greet() { var h = new Date().getHours(); return h < 12 ? 'สวัสดีตอนเช้า' : h < 17 ? 'สวัสดีตอนบ่าย' : 'สวัสดีตอนเย็น'; }
function initials(n) { n = String(n || '').replace(/^คุณ/, '').replace(/^(นาย|นางสาว|นาง|นายแพทย์|แพทย์หญิง|ทันตแพทย์หญิง|ทันตแพทย์|เภสัชกรหญิง|เภสัชกร|ดร\.)\s*/, '').trim(); return n ? n.charAt(0) : '?'; }
function startApp() {
  api('bootstrap').then(function (b) {
    S.boot = b; S.me = b.me;
    $('#boot').classList.add('hidden'); $('#loginScreen').classList.add('hidden'); $('#app').classList.remove('hidden');
    $('#meAv').textContent = initials(S.me.name || S.me.empCode);
    $('#meName').textContent = S.me.name || S.me.empCode;
    $('#meRole').textContent = S.me.kind === 'ADMIN' ? (S.me.unit || 'เจ้าหน้าที่ HR') : S.me.kind === 'CAND' ? 'บุคลากรใหม่' : 'รหัส ' + S.me.empCode;
    $('#verBox').textContent = 'รุ่น ' + APP_BUILD + (b.app.build !== APP_BUILD ? ' · หลังบ้าน ' + b.app.build : '');
    if (b.app.build !== APP_BUILD) toast('รุ่นหน้าเว็บ (' + APP_BUILD + ') ไม่ตรงกับหลังบ้าน (' + b.app.build + ') กรุณาแจ้งผู้ดูแลระบบ', 'warn', 9000);
    buildNav();
    $('#btnBell').classList.toggle('hidden', S.me.kind !== 'ADMIN');
    if (S.me.kind === 'ADMIN') refreshBadges();
    if (S.me.mustChange) changePasswordDlg(true);
    if (!location.hash || location.hash === '#' || location.hash === '#/' || /invite=/.test(location.hash)) location.hash = S.me.kind === 'ADMIN' ? '#/dash' : '#/me';
    route();
    if (!lsGet('hrc_tip_k', 0) && matchMedia('(min-width: 900px)').matches) { lsSet('hrc_tip_k', 1); setTimeout(function () { toast('เคล็ดลับ: กด Ctrl + K เพื่อค้นหาเมนู บุคลากร หรือคำสั่งได้ทันที', 'info', 6000); }, 1200); }
  }, function (e) { sessionEnd(e.message); });
}
/* โครงเมนู: กลุ่ม → รายการ (desc ใช้ในค้นหาด่วนและคำอธิบายเมื่อเมนูย่อ) */
function navGroups() {
  var c = function (p, x) { return p ? x : null; };
  var G = S.me.kind !== 'ADMIN' ? [
    { g: 'mine', label: 'ของฉัน', items: [
      { id: 'me', icon: 'home', label: 'หน้าของฉัน', desc: 'สถานะและสิ่งที่ต้องทำ' },
      S.me.kind === 'CAND' ? { id: 'form', icon: 'edit', label: 'กรอกข้อมูลบุคลากรใหม่', desc: 'ข้อมูลส่วนตัว ที่อยู่ ครอบครัว เอกสารแนบ' } : { id: 'profile', icon: 'user', label: 'ข้อมูลของฉัน', desc: 'ข้อมูลในทะเบียน และขอแก้ไข' },
      { id: 'mydocs', icon: 'file', label: 'ตรวจเอกสารของฉัน', desc: 'ตรวจสัญญาก่อนวันลงนาม' },
      c(S.me.kind === 'STAFF', { id: 'myrights', icon: 'coins', label: 'สิทธิ์ค่าตอบแทนของฉัน', desc: 'ไม่ทำเวชฯ พ.ต.ส. และประวัติ' })] }
  ] : [
    { g: 'home', label: 'หน้าหลัก', items: [{ id: 'dash', icon: 'dash', label: 'ภาพรวม', desc: 'แดชบอร์ด งานค้าง และสถิติ' }] },
    { g: 'people', label: 'บุคลากร', items: [
      c(can('people.view'), { id: 'intake', icon: 'inbox', label: 'บุคลากรใหม่', desc: 'นำเข้ารายชื่อ ส่งลิงก์เชิญ ตรวจข้อมูล' }),
      c(can('people.view'), { id: 'people', icon: 'users', label: 'ทะเบียนบุคลากร', desc: 'ค้นหาและดูข้อมูลรายคน' }),
      c(can('health'), { id: 'health', icon: 'heart', label: 'ข้อมูลสุขภาพ', desc: 'ส่งออกให้งานสุขภาพเจ้าหน้าที่' })] },
    { g: 'docs', label: 'สัญญาและเอกสาร', items: [
      c(can('docs'), { id: 'rounds', icon: 'file', label: 'รอบทำสัญญา / เอกสาร', desc: 'ออกเอกสาร พิมพ์ บันทึกลงนาม' })] },
    { g: 'pay', label: 'ค่าตอบแทน', items: [
      c(can('rights.view'), { id: 'rights', icon: 'coins', label: 'สิทธิ์ค่าตอบแทน', desc: 'เริ่ม ระงับ เปลี่ยนกลุ่ม ยกเลิก' }),
      c(can('report'), { id: 'report', icon: 'month', label: 'รายงานส่งงานเงินเดือน', desc: 'แผ่น 12 · 13 · 21 · 22 ก่อนวันที่ 5' }),
      c(can('report'), { id: 'review', icon: 'clip', label: 'ทบทวนไม่ทำเวชฯ ประจำปี', desc: 'บันทึกถึงหัวหน้าฝ่าย' })] },
    { g: 'sys', label: 'ระบบ', items: [
      c(can('migrate'), { id: 'migrate', icon: 'upload', label: 'ย้ายข้อมูลเดิม (Note)', desc: 'นำเข้าและตรวจข้อมูลย้อนหลัง' }),
      c(can('admin'), { id: 'settings', icon: 'gear', label: 'ตั้งค่า', desc: 'ทั่วไป ผู้ลงนาม อัตรา ผู้ใช้ ประวัติ' })] }
  ];
  G.forEach(function (g) { g.items = g.items.filter(Boolean); });
  return G.filter(function (g) { return g.items.length; });
}
function navItems() { var a = []; navGroups().forEach(function (g) { g.items.forEach(function (it) { it.grp = g.label; a.push(it); }); }); return a; }
function navById(id) { return navItems().filter(function (n) { return n.id === id; })[0]; }
function pins() { return lsGet('hrc_pins_' + (S.me && S.me.kind), []).filter(function (id) { return navById(id); }); }
function navLink(n, pinned) {
  return '<a href="#/' + n.id + '" data-id="' + n.id + '" data-tip="' + esc(n.label) + '">' + '<span class="ni">' + ico(n.icon) + '</span><span class="nl">' + esc(n.label) + '</span><span class="cnt hidden"></span>' +
    '<button class="pinb' + (pinned ? ' on' : '') + '" data-pin="' + n.id + '" title="' + (pinned ? 'เอาออกจากเมนูโปรด' : 'ปักหมุดเป็นเมนูโปรด') + '" aria-label="ปักหมุด">' + ico('star', 'sm') + '</button></a>';
}
function buildNav() {
  var G = navGroups(), P = pins(), col = lsGet('hrc_col', {}), h = '';
  if (P.length) h += '<div class="ng pinned"><div class="gh static"><span>' + ico('star', 'sm') + 'เมนูโปรด</span></div><div class="gi">' + P.map(function (id) { return navLink(navById(id), true); }).join('') + '</div></div>';
  G.forEach(function (g) {
    var single = G.length > 1 && g.items.length && g.g !== 'home' && g.g !== 'mine';
    h += '<div class="ng' + (col[g.g] ? ' col' : '') + '" data-g="' + g.g + '">' + (single ? '<button class="gh" data-tg="' + g.g + '"><span>' + esc(g.label) + '</span><em>' + g.items.length + '</em>' + ico('chev', 'sm') + '</button>' : '<div class="gh static"><span>' + esc(g.label) + '</span></div>') +
      '<div class="gi"><div>' + g.items.map(function (n) { return navLink(n, P.indexOf(n.id) >= 0); }).join('') + '</div></div></div>';
  });
  $('#nav').innerHTML = h;
  /* แถบล่างบนมือถือ: เมนูโปรดก่อน แล้วตามด้วยเมนูหลัก สูงสุด 4 ช่อง + ปุ่มเมนูทั้งหมด */
  var all = navItems(), main = S.me.kind === 'ADMIN' ? ['dash', 'intake', 'people', 'rights', 'rounds'] : all.map(function (n) { return n.id; });
  var ids = []; P.concat(main).forEach(function (id) { if (ids.length < 4 && ids.indexOf(id) < 0 && navById(id)) ids.push(id); });
  var shortL = { dash: 'ภาพรวม', intake: 'คนใหม่', people: 'ทะเบียน', rights: 'สิทธิ์', rounds: 'สัญญา', report: 'รายงาน', me: 'หน้าแรก', form: 'กรอกข้อมูล', profile: 'ข้อมูล', mydocs: 'เอกสาร', myrights: 'สิทธิ์', review: 'ทบทวน', health: 'สุขภาพ', migrate: 'ย้ายข้อมูล', settings: 'ตั้งค่า' };
  $('#tabbar').innerHTML = ids.map(function (id) { var n = navById(id); return '<a href="#/' + id + '" data-id="' + id + '">' + ico(n.icon) + '<span>' + esc(shortL[id] || n.label) + '</span><i class="cnt hidden"></i></a>'; }).join('') +
    (all.length > ids.length ? '<button type="button" id="tabMore">' + ico('grid') + '<span>เมนูทั้งหมด</span></button>' : '');
  if ($('#tabMore')) $('#tabMore').onclick = function () { navOpen(true); };
  markNav(S.curId);
  Object.keys(S.counts || {}).forEach(function (k) { navCount(k, S.counts[k]); });
}
function navOpen(on) { $('#app').classList.toggle('nav-open', on); document.body.classList.toggle('lock', on); }
function navCount(id, n) {
  S.counts = S.counts || {}; S.counts[id] = n;
  $$('[data-id="' + id + '"] .cnt').forEach(function (a) { a.textContent = n > 99 ? '99+' : n; a.classList.toggle('hidden', !n); });
}
function markNav(id) {
  var map = { person: 'people', round: 'rounds' }, on = map[id] || id;
  $$('#nav a, #tabbar a').forEach(function (a) { a.classList.toggle('on', a.dataset.id === on); });
  var cur = $('#nav .ng:not(.pinned) a.on'); if (cur) { var g = cur.closest('.ng'); if (g && g.classList.contains('col')) g.classList.remove('col'); }
}
/* งานค้าง (กระดิ่ง + ตัวเลขบนเมนู) */
function refreshBadges() {
  return api('getDashboard').then(function (d) {
    S.dash = d;
    var b = d.byStatus || {};
    navCount('intake', b.SUBMITTED || 0); navCount('rounds', d.docs.flagged || 0); navCount('people', d.edits || 0); navCount('migrate', d.migrateReview || 0);
    var n = (b.SUBMITTED || 0) + (d.docs.flagged || 0) + (d.edits || 0) + (d.licenseSoon || 0);
    $('#bellDot').classList.toggle('hidden', !n); $('#bellDot').textContent = n > 99 ? '99+' : n;
    return d;
  }).catch(function () { });
}
function bellMenu(btn) {
  var d = S.dash; if (!d) return refreshBadges().then(function () { if (S.dash) bellMenu(btn); });
  var b = d.byStatus || {}, L = [
    ['inbox', 'brand', b.SUBMITTED || 0, 'บุคลากรใหม่ส่งข้อมูลรอตรวจ', '#/intake/SUBMITTED'],
    ['alert', 'bad', d.docs.flagged, 'เอกสารที่เจ้าตัวแจ้งแก้', '#/rounds'],
    ['edit', 'warn', d.edits, 'คำขอแก้ไขข้อมูลจากบุคลากร', '#/people/edit'],
    ['clock', 'warn', d.licenseSoon, 'ใบอนุญาตหมดอายุใน 90 วัน', '#/people/license'],
    ['file', 'info', d.docs.waitStaff, 'เอกสารรอเจ้าตัวตรวจ', '#/rounds'],
    ['upload', 'violet', d.migrateReview, 'ข้อมูลเดิมจาก Note รอตรวจ', '#/migrate']].filter(function (x) { return x[2]; });
  popover(btn, '<div class="pop-h"><b>งานที่รอดำเนินการ</b><span class="muted">' + (L.length ? 'คลิกเพื่อไปยังงาน' : '') + '</span></div>' +
    (L.length ? L.map(function (x) { return '<a class="pop-i" href="' + x[4] + '"><span class="tile ' + x[1] + '">' + ico(x[0], 'sm') + '</span><span class="grow">' + esc(x[3]) + '</span><b class="n">' + money(x[2]) + '</b></a>'; }).join('') :
      '<div class="pop-empty">' + ico('check', 'lg') + '<b>ไม่มีงานค้าง</b><span class="muted">ทุกอย่างเรียบร้อยดี</span></div>'), 'right');
}
function userMenu(btn) {
  var dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
  var p = popover(btn, '<div class="pop-h me-h"><span class="av lg">' + esc(initials(S.me.name)) + '</span><span><b>' + esc(S.me.name || S.me.empCode) + '</b><span class="muted">' + esc($('#meRole').textContent) + '</span></span></div>' +
    (S.me.kind === 'ADMIN' ? '<button class="pop-i" data-a="pw"><span class="tile">' + ico('key', 'sm') + '</span><span class="grow">เปลี่ยนรหัสผ่าน</span></button>' : '') +
    '<button class="pop-i" data-a="theme"><span class="tile">' + ico(dark ? 'sun' : 'moon', 'sm') + '</span><span class="grow">' + (dark ? 'โหมดสว่าง' : 'โหมดมืด') + '</span></button>' +
    '<button class="pop-i" data-a="rail"><span class="tile">' + ico('sidebar', 'sm') + '</span><span class="grow">ย่อ/ขยายเมนูด้านข้าง</span><kbd>Ctrl B</kbd></button>' +
    '<button class="pop-i" data-a="keys"><span class="tile">' + ico('cmd', 'sm') + '</span><span class="grow">ค้นหาด่วน</span><kbd>Ctrl K</kbd></button>' +
    '<div class="pop-sep"></div><button class="pop-i bad" data-a="out"><span class="tile">' + ico('logout', 'sm') + '</span><span class="grow">ออกจากระบบ</span></button>', 'up');
  p.onclick = function (ev) {
    var a = ev.target.closest('[data-a]'); if (!a) return; closePop();
    ({ pw: function () { changePasswordDlg(false); }, theme: toggleTheme, rail: toggleRail, keys: function () { cmdk(); }, out: logout })[a.dataset.a]();
  };
}
var _pop = null;
function closePop() { if (_pop) { _pop.remove(); _pop = null; document.removeEventListener('mousedown', _popAway, true); } }
function _popAway(ev) { if (_pop && !_pop.contains(ev.target) && !ev.target.closest('[data-pop-owner]')) closePop(); }
function popover(anchor, html, dir) {
  closePop();
  var p = document.createElement('div'); p.className = 'pop'; p.innerHTML = html; document.body.appendChild(p); _pop = p;
  var r = anchor.getBoundingClientRect(), w = p.offsetWidth, h = p.offsetHeight, vw = innerWidth, vh = innerHeight;
  if (vw < 600) { p.classList.add('sheet'); }
  else if (dir === 'up') { p.style.left = Math.max(8, Math.min(r.left, vw - w - 8)) + 'px'; p.style.top = Math.max(8, r.top - h - 8) + 'px'; }
  else { p.style.left = Math.max(8, Math.min(r.right - w, vw - w - 8)) + 'px'; p.style.top = Math.min(r.bottom + 8, vh - h - 8) + 'px'; }
  setTimeout(function () { document.addEventListener('mousedown', _popAway, true); }, 0);
  p.addEventListener('click', function (ev) { if (ev.target.closest('a')) closePop(); });
  return p;
}
function toggleRail() { var on = !document.documentElement.classList.contains('rail'); document.documentElement.classList.toggle('rail', on); lsSet('hrc_rail', on ? 1 : 0); try { localStorage.setItem('hrc_rail', on ? '1' : '0'); } catch (e) { } }

/* ═════════ ค้นหาด่วน (Ctrl+K) ═════════ */
function cmdk() {
  if (!S.me || $('.cmdk')) return;
  closePop(); navOpen(false);
  var back = document.createElement('div'); back.className = 'cmdk-back';
  back.innerHTML = '<div class="cmdk" role="dialog" aria-label="ค้นหาด่วน"><div class="ck-in">' + ico('search') + '<input id="ckQ" placeholder="พิมพ์ชื่อเมนู ชื่อหรือรหัสบุคลากร หรือคำสั่ง…" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div><div class="ck-list" id="ckList"></div>' +
    '<div class="ck-foot"><span><kbd>↑</kbd><kbd>↓</kbd> เลือก</span><span><kbd>Enter</kbd> เปิด</span><span><kbd>Esc</kbd> ปิด</span></div></div>';
  document.body.appendChild(back);
  var people = null, sel = 0, items = [];
  var close = function () { back.remove(); document.removeEventListener('keydown', key, true); };
  var acts = [];
  if (S.me.kind === 'ADMIN') {
    if (can('invite')) acts.push({ icon: 'plus', label: 'เพิ่มบุคลากรใหม่ทีละคน', desc: 'บุคลากรใหม่', go: function () { location.hash = '#/intake'; setTimeout(function () { var b = $$('#pgActs .btn').filter(function (x) { return /เพิ่มทีละคน/.test(x.textContent); })[0]; if (b) b.click(); }, 450); } });
    if (can('docs')) acts.push({ icon: 'file', label: 'สร้างรอบทำสัญญาใหม่', desc: 'รอบทำสัญญา', go: function () { location.hash = '#/rounds'; setTimeout(function () { var b = $$('#pgActs .btn').filter(function (x) { return /สร้างรอบใหม่/.test(x.textContent); })[0]; if (b) b.click(); }, 450); } });
    if (can('report')) acts.push({ icon: 'download', label: 'ส่งออกรายงานส่งงานเงินเดือน', desc: 'รายงาน', go: function () { location.hash = '#/report'; } });
  }
  acts.push({ icon: 'moon', label: 'สลับโหมดสว่าง/มืด', desc: 'การแสดงผล', go: toggleTheme });
  acts.push({ icon: 'sidebar', label: 'ย่อ/ขยายเมนูด้านข้าง', desc: 'การแสดงผล', go: toggleRail });
  acts.push({ icon: 'logout', label: 'ออกจากระบบ', desc: 'บัญชี', go: logout });
  var norm = function (x) { return String(x || '').toLowerCase().replace(/\s+/g, ''); };
  var render = function () {
    var q = norm($('#ckQ').value), H = '', i = 0; items = [];
    var add = function (title, arr) {
      if (!arr.length) return;
      H += '<div class="ck-g">' + title + '</div>';
      arr.forEach(function (x) { items.push(x); H += '<button class="ck-i' + (i === sel ? ' on' : '') + '" data-i="' + i + '"><span class="tile ' + (x.cls || '') + '">' + ico(x.icon, 'sm') + '</span><span class="grow"><b>' + esc(x.label) + '</b><small>' + esc(x.desc || '') + '</small></span>' + (x.kbd ? '<kbd>' + x.kbd + '</kbd>' : ico('chevr', 'sm')) + '</button>'; i++; });
    };
    var menus = navItems().filter(function (n) { return !q || norm(n.label + n.desc + n.grp).indexOf(q) >= 0; }).map(function (n) { return { icon: n.icon, label: n.label, desc: n.grp + ' · ' + n.desc, go: function () { location.hash = '#/' + n.id; } }; });
    add('เมนู', menus.slice(0, q ? 8 : 12));
    if (people && q) add('บุคลากร', people.filter(function (p) { return norm(p.name + p.empCode + p.position + p.dept).indexOf(q) >= 0; }).slice(0, 8).map(function (p) {
      return { icon: 'user', cls: 'brand', label: p.name, desc: [p.empCode, p.position, p.dept].filter(Boolean).join(' · '), go: function () { location.hash = '#/person/' + p.pid; } }; }));
    add('คำสั่ง', acts.filter(function (a) { return !q || norm(a.label + a.desc).indexOf(q) >= 0; }));
    if (!items.length) H = '<div class="ck-empty">' + ico('search', 'lg') + '<b>ไม่พบ “' + esc($('#ckQ').value) + '”</b><span>ลองพิมพ์ชื่อ นามสกุล หรือรหัสเจ้าหน้าที่ 7 หลัก</span></div>';
    $('#ckList').innerHTML = H;
    var on = $('#ckList .ck-i.on'); if (on) on.scrollIntoView({ block: 'nearest' });
  };
  var pick = function (k) { var x = items[k]; if (!x) return; close(); x.go(); };
  var key = function (ev) {
    if (ev.key === 'Escape') { ev.preventDefault(); close(); }
    else if (ev.key === 'ArrowDown') { ev.preventDefault(); sel = Math.min(items.length - 1, sel + 1); render(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); sel = Math.max(0, sel - 1); render(); }
    else if (ev.key === 'Enter') { ev.preventDefault(); pick(sel); }
  };
  document.addEventListener('keydown', key, true);
  back.addEventListener('mousedown', function (ev) { if (ev.target === back) close(); });
  $('#ckList', back).addEventListener('click', function (ev) { var b = ev.target.closest('.ck-i'); if (b) pick(+b.dataset.i); });
  $('#ckList', back).addEventListener('mousemove', function (ev) { var b = ev.target.closest('.ck-i'); if (b && +b.dataset.i !== sel) { sel = +b.dataset.i; $$('.ck-i', back).forEach(function (x) { x.classList.toggle('on', +x.dataset.i === sel); }); } });
  $('#ckQ').addEventListener('input', function () { sel = 0; render(); });
  render(); setTimeout(function () { $('#ckQ').focus(); }, 20);
  if (S.me.kind === 'ADMIN' && can('people.view') && typeof peopleCache === 'function') peopleCache().then(function (d) { people = d.rows || []; if ($('.cmdk')) render(); }).catch(function () { });
}

function setTop(title, sub, acts) {
  $('#pgTitle').textContent = title; $('#pgSub').innerHTML = sub || ''; $('#pgActs').innerHTML = '';
  (acts || []).filter(Boolean).forEach(function (a) { $('#pgActs').appendChild(a); });
  $('#pgActs').classList.toggle('hidden', !$('#pgActs').children.length);
  var n = navById(S.curId === 'person' ? 'people' : S.curId === 'round' ? 'rounds' : S.curId);
  $('#pgCrumb').innerHTML = n ? esc(n.grp) + (n.label !== title ? ico('chevr', 'sm') + '<a href="#/' + n.id + '">' + esc(n.label) + '</a>' : '') : '';
  document.title = title + ' · ทะเบียนสัญญา HR';
}
function mkBtn(label, cls, fn) { var b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.innerHTML = label; b.onclick = function () { fn(b); }; return b; }
function skeleton() {
  return '<div class="skel"><div class="sk-row">' + '<i class="sk kpi"></i>'.repeat(4) + '</div><i class="sk card"></i><i class="sk line"></i><i class="sk line s"></i></div>';
}
function route() {
  if (!S.me) return;
  closePop();
  var h = (location.hash || '').replace(/^#\/?/, ''), parts = h.split('/'), id = parts[0] || (S.me.kind === 'ADMIN' ? 'dash' : 'me');
  var allowed = navItems().some(function (n) { return n.id === id; }) || (id === 'person' && can('people.view')) || (id === 'round' && can('docs'));
  if (!allowed) id = S.me.kind === 'ADMIN' ? 'dash' : 'me';
  S.curId = id;
  markNav(id);
  navOpen(false);
  var v = $('#view'); v.onclick = null; v.innerHTML = skeleton();
  v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
  var pg = PAGES[id];
  if (!pg) { v.innerHTML = '<div class="note bad">ไม่พบหน้า</div>'; return; }
  try { pg(v, parts.slice(1)); } catch (e) { v.innerHTML = '<div class="note bad">' + esc(e.message) + '</div>'; console.error(e); }
  window.scrollTo(0, 0);
}
function fail(v) { return function (e) { v.innerHTML = '<div class="empty-state bad">' + ico('alert', 'lg') + '<b>เกิดข้อผิดพลาด</b><span>' + esc(e.message) + '</span><button class="btn sm" onclick="route()">' + ico('activity', 'sm') + 'ลองอีกครั้ง</button></div>'; }; }
function emptyState(icon, title, sub, btn) { return '<div class="empty-state">' + ico(icon || 'inbox', 'lg') + '<b>' + esc(title) + '</b>' + (sub ? '<span>' + esc(sub) + '</span>' : '') + (btn || '') + '</div>'; }

/* โหมดสี */
function toggleTheme() {
  var cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  var nx = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nx);
  try { localStorage.setItem('hrc_theme', nx); } catch (e) { }
  $$('#btnTheme use, #themeLogin use').forEach(function (u) { u.setAttribute('href', nx === 'dark' ? '#i-sun' : '#i-moon'); });
}

window.addEventListener('hashchange', function () { if (/invite=/.test(location.hash)) { if (S.token) { api('logout').catch(function () { }); } return sessionEnd(''); } route(); });
document.addEventListener('keydown', function (ev) {
  if (!S.me) return;
  var k = (ev.key || '').toLowerCase();
  if ((ev.ctrlKey || ev.metaKey) && k === 'k') { ev.preventDefault(); cmdk(); }
  else if ((ev.ctrlKey || ev.metaKey) && k === 'b') { ev.preventDefault(); toggleRail(); }
  else if (k === '/' && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '') && !$('#layer .back')) { ev.preventDefault(); cmdk(); }
});
document.addEventListener('DOMContentLoaded', function () {
  $('#loginForm').addEventListener('submit', doLogin);
  $('#inviteForm').addEventListener('submit', doInvite);
  $$('#loginTabs button').forEach(function (b) { b.onclick = function () { setLoginMode(b.dataset.mode); }; });
  $('#eyeBtn').onclick = function () { var p = $('#pass'); p.type = p.type === 'password' ? 'text' : 'password'; $('use', this).setAttribute('href', p.type === 'password' ? '#i-eye' : '#i-x'); };
  $('#railBtn').onclick = function () { if (matchMedia('(max-width: 899px)').matches) navOpen(true); else toggleRail(); };
  $('#scrim').onclick = function () { navOpen(false); };
  $('#sideClose').onclick = function () { navOpen(false); };
  $('#sideSearch').onclick = cmdk; $('#btnSearch').onclick = cmdk;
  $('#btnBell').setAttribute('data-pop-owner', '1'); $('#meBtn').setAttribute('data-pop-owner', '1');
  $('#btnBell').onclick = function () { if (_pop) return closePop(); bellMenu(this); };
  $('#meBtn').onclick = function () { if (_pop) return closePop(); userMenu(this); };
  $('#btnTheme').onclick = toggleTheme; $('#themeLogin').onclick = toggleTheme;
  if (document.documentElement.getAttribute('data-theme') === 'dark') $$('#btnTheme use, #themeLogin use').forEach(function (u) { u.setAttribute('href', '#i-sun'); });
  $('#nav').addEventListener('click', function (ev) {
    var pb = ev.target.closest('[data-pin]');
    if (pb) { ev.preventDefault(); ev.stopPropagation(); var id = pb.dataset.pin, P = pins(), i = P.indexOf(id); if (i >= 0) P.splice(i, 1); else P.push(id); lsSet('hrc_pins_' + S.me.kind, P); buildNav(); toast(i >= 0 ? 'เอาออกจากเมนูโปรดแล้ว' : 'ปักหมุดเป็นเมนูโปรดแล้ว', 'ok', 2000); return; }
    var tg = ev.target.closest('[data-tg]');
    if (tg) { var c = lsGet('hrc_col', {}), g = tg.dataset.tg; c[g] = !c[g]; lsSet('hrc_col', c); tg.parentNode.classList.toggle('col', c[g]); }
  });
  /* ปัดลิ้นชักเมนูไปทางซ้ายเพื่อปิด */
  var sx = null; $('#side').addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  $('#side').addEventListener('touchend', function (e) { if (sx != null && e.changedTouches[0].clientX - sx < -60) navOpen(false); sx = null; }, { passive: true });
  /* ตารางทุกตารางเลื่อนแนวนอนได้บนจอแคบ (ห่อด้วย .tw อัตโนมัติ) */
  var wrapT = function (root) { $$('table.t', root).forEach(function (t) { if (!t.parentNode.classList.contains('tw')) { var w = document.createElement('div'); w.className = 'tw'; t.parentNode.insertBefore(w, t); w.appendChild(t); } }); };
  if (window.MutationObserver) { new MutationObserver(function () { wrapT($('#view')); wrapT($('#layer')); }).observe(document.body, { childList: true, subtree: true }); }
  var tk = null; try { tk = localStorage.getItem('hrc_token'); } catch (e) { }
  if (inviteToken()) { try { localStorage.removeItem('hrc_token'); } catch (e) { } return showLogin(); }
  if (tk) { S.token = tk; startApp(); } else showLogin();
});
