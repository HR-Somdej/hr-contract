/* pages-staff.js — หน้าของบุคลากร: หน้าของฉัน · ฟอร์มบุคลากรใหม่ 8 ขั้น · ตรวจเอกสาร · ข้อมูลของฉัน · สิทธิ์ของฉัน
 *  FORM_SPEC ใช้ร่วมกับหน้าแอดมิน (แสดงข้อมูลที่บุคลากรกรอก) */
var TITLES = ['นาย', 'นาง', 'นางสาว'];
var PROVINCES = 'กรุงเทพมหานคร กระบี่ กาญจนบุรี กาฬสินธุ์ กำแพงเพชร ขอนแก่น จันทบุรี ฉะเชิงเทรา ชลบุรี ชัยนาท ชัยภูมิ ชุมพร เชียงราย เชียงใหม่ ตรัง ตราด ตาก นครนายก นครปฐม นครพนม นครราชสีมา นครศรีธรรมราช นครสวรรค์ นนทบุรี นราธิวาส น่าน บึงกาฬ บุรีรัมย์ ปทุมธานี ประจวบคีรีขันธ์ ปราจีนบุรี ปัตตานี พระนครศรีอยุธยา พะเยา พังงา พัทลุง พิจิตร พิษณุโลก เพชรบุรี เพชรบูรณ์ แพร่ ภูเก็ต มหาสารคาม มุกดาหาร แม่ฮ่องสอน ยโสธร ยะลา ร้อยเอ็ด ระนอง ระยอง ราชบุรี ลพบุรี ลำปาง ลำพูน เลย ศรีสะเกษ สกลนคร สงขลา สตูล สมุทรปราการ สมุทรสงคราม สมุทรสาคร สระแก้ว สระบุรี สิงห์บุรี สุโขทัย สุพรรณบุรี สุราษฎร์ธานี สุรินทร์ หนองคาย หนองบัวลำภู อ่างทอง อำนาจเจริญ อุดรธานี อุตรดิตถ์ อุทัยธานี อุบลราชธานี'.split(' ');
var ADDR_F = function (pre) {
  return [{ p: pre + '.houseNo', l: 'บ้านเลขที่', req: 1 }, { p: pre + '.moo', l: 'หมู่ที่' }, { p: pre + '.soi', l: 'ตรอก/ซอย' }, { p: pre + '.road', l: 'ถนน' },
    { p: pre + '.tambon', l: 'ตำบล/แขวง', req: 1 }, { p: pre + '.amphoe', l: 'อำเภอ/เขต', req: 1 }, { p: pre + '.province', l: 'จังหวัด', t: 'select', o: PROVINCES, req: 1 }, { p: pre + '.zip', l: 'รหัสไปรษณีย์', t: 'tel', req: 1, max: 5 }];
};
var YN3 = ['เคย', 'ไม่เคย', 'ไม่แน่ใจ'], VAC3 = ['เคยได้รับวัคซีน', 'ไม่เคยได้รับ', 'ไม่แน่ใจ'], TEST2 = ['เคยตรวจ', 'ไม่เคยตรวจ'];
var FORM_SPEC = [
  { id: 'general', n: 2, title: 'ข้อมูลทั่วไป', hint: 'กรอกตามบัตรประจำตัวประชาชน', fields: [
    { p: 'general.title', l: 'คำนำหน้า (ไทย)', t: 'select', o: TITLES.concat(['อื่น ๆ (ระบุในชื่อ)']), req: 1 },
    { p: 'general.firstName', l: 'ชื่อ (ไทย)', req: 1 }, { p: 'general.lastName', l: 'นามสกุล (ไทย)', req: 1 }, { p: 'general.nickname', l: 'ชื่อเล่น (ไทย)' },
    { p: 'general.titleEn', l: 'Name Title', t: 'select', o: ['Mr.', 'Mrs.', 'Miss', 'Ms.', 'Dr.'] }, { p: 'general.nameEn', l: 'Name (English)', req: 1 },
    { p: 'general.lastNameEn', l: 'Surname (English)' }, { p: 'general.nicknameEn', l: 'Nickname' },
    { p: 'general.sex', l: 'เพศ', t: 'radio', o: ['ชาย', 'หญิง'], req: 1 },
    { p: 'general.idIssue', l: 'วันออกบัตรประชาชน', t: 'date', req: 1 }, { p: 'general.idExpire', l: 'วันบัตรหมดอายุ', t: 'date', req: 1 },
    { p: 'general.marital', l: 'สถานภาพ', t: 'radio', o: ['โสด', 'สมรส', 'หย่า', 'หม้าย'], req: 1 },
    { p: 'general.nationality', l: 'สัญชาติ', def: 'ไทย' }, { p: 'general.ethnicity', l: 'เชื้อชาติ', sens: 1 }, { p: 'general.religion', l: 'ศาสนา', t: 'select', o: ['พุทธ', 'คริสต์', 'อิสลาม', 'ฮินดู', 'ซิกข์', 'ไม่นับถือศาสนา', 'อื่น ๆ'], sens: 1 },
    { p: 'general.birthCountry', l: 'สถานที่เกิด (ประเทศ)', def: 'ไทย' }, { p: 'general.birthProvince', l: 'สถานที่เกิด (จังหวัด)', t: 'select', o: PROVINCES },
    { p: 'general.phone', l: 'เบอร์โทรศัพท์มือถือ', t: 'tel', req: 1, max: 10 },
    { p: 'general.military', l: 'สถานะทางทหาร (เฉพาะชาย)', t: 'select', o: ['ผ่านการเกณฑ์ทหารแล้ว', 'สำเร็จหลักสูตร รด.', 'ได้รับการยกเว้น', 'ยังไม่ผ่านการเกณฑ์ทหาร'], show: function (m) { return get(m, 'general.sex') === 'ชาย'; } }
  ] },
  { id: 'addr', n: 3, title: 'ที่อยู่', hint: 'ที่อยู่ตามทะเบียนบ้านใช้ในหนังสือสัญญาทุกฉบับ', fields: [{ h: 'ที่อยู่ตามทะเบียนบ้าน' }].concat(ADDR_F('addrReg'),
    [{ h: 'ที่อยู่ปัจจุบัน (ที่ติดต่อได้)' }, { p: 'addrCur.same', l: 'ที่อยู่ปัจจุบันตรงกับทะเบียนบ้าน', t: 'check', w: 4 }],
    ADDR_F('addrCur').map(function (f) { f = Object.assign({}, f); f.req = 0; f.show = function (m) { return !get(m, 'addrCur.same'); }; return f; })) },
  { id: 'family', n: 4, title: 'ครอบครัว', hint: 'ชื่อบิดา มารดา คู่สมรส ใช้ในหนังสือสัญญาไม่ทำเวชฯ และใบเปิดสิทธิครอบครัว', fields: [
    { h: 'บิดา' }, { p: 'family.father.name', l: 'ชื่อ-นามสกุล บิดา', req: 1, w: 2 }, { p: 'family.father.nationalId', l: 'เลขบัตรประชาชน บิดา', t: 'tel', max: 13 },
    { p: 'family.father.status', l: 'สถานะ', t: 'select', o: ['มีชีวิต', 'ถึงแก่กรรม'] }, { p: 'family.father.job', l: 'อาชีพ' },
    { h: 'มารดา' }, { p: 'family.mother.name', l: 'ชื่อ-นามสกุล มารดา', req: 1, w: 2 }, { p: 'family.mother.nationalId', l: 'เลขบัตรประชาชน มารดา', t: 'tel', max: 13 },
    { p: 'family.mother.status', l: 'สถานะ', t: 'select', o: ['มีชีวิต', 'ถึงแก่กรรม'] }, { p: 'family.mother.job', l: 'อาชีพ' },
    { h: 'คู่สมรส', show: function (m) { return get(m, 'general.marital') === 'สมรส'; } },
    { p: 'family.spouse.name', l: 'ชื่อ-นามสกุล คู่สมรส', req: 1, w: 2, show: function (m) { return get(m, 'general.marital') === 'สมรส'; } },
    { p: 'family.spouse.nationalId', l: 'เลขบัตรประชาชน คู่สมรส', t: 'tel', max: 13, show: function (m) { return get(m, 'general.marital') === 'สมรส'; } },
    { p: 'family.spouse.phone', l: 'เบอร์โทรศัพท์คู่สมรส', t: 'tel', max: 10, show: function (m) { return get(m, 'general.marital') === 'สมรส'; } },
    { p: 'family.spouse.job', l: 'อาชีพคู่สมรส', show: function (m) { return get(m, 'general.marital') === 'สมรส'; } },
    { list: 'family.children', title: 'บุตร (ถ้ามี · ใช้เปิดสิทธิสวัสดิการ)', max: 6, fields: [{ k: 'name', l: 'ชื่อ-นามสกุล' }, { k: 'nationalId', l: 'เลขบัตรประชาชน', t: 'tel' }, { k: 'dob', l: 'วันเกิด', t: 'date' }] },
    { h: 'ผู้ติดต่อกรณีฉุกเฉิน' }, { p: 'family.emergency.name', l: 'ชื่อ-นามสกุล', req: 1 }, { p: 'family.emergency.relation', l: 'เกี่ยวข้องเป็น', t: 'select', o: ['บิดา/มารดา', 'คู่สมรส', 'พี่/น้อง', 'บุตร', 'ญาติ', 'เพื่อน', 'อื่น ๆ'] },
    { p: 'family.emergency.phone', l: 'เบอร์โทรศัพท์', t: 'tel', req: 1, max: 10 }, { p: 'family.emergency.address', l: 'ที่อยู่', w: 4 }
  ] },
  { id: 'work', n: 5, title: 'การศึกษา ใบอนุญาต และการเงิน', hint: 'ใช้ในสัญญาจ้าง แบบ พ.ต.ส. และใบสมัครกองทุนสำรองเลี้ยงชีพ', fields: [
    { list: 'education', title: 'ประวัติการศึกษา (เริ่มจากวุฒิสูงสุด)', max: 6, min: 1, fields: [{ k: 'level', l: 'ระดับ', t: 'select', o: ['ปริญญาเอก', 'ปริญญาโท', 'ประกาศนียบัตรบัณฑิต/วุฒิบัตร', 'ปริญญาตรี', 'อนุปริญญา/ปวส.', 'ปวช.', 'มัธยมศึกษา'] }, { k: 'degree', l: 'วุฒิ/ชื่อปริญญา' }, { k: 'major', l: 'สาขา' }, { k: 'institute', l: 'สถาบัน' }, { k: 'year', l: 'ปีที่จบ (พ.ศ.)', t: 'tel' }] },
    { h: 'ใบอนุญาตประกอบวิชาชีพ' }, { p: 'work.licenseNo', l: 'เลขที่ใบอนุญาต (เช่น ว.12345)' }, { p: 'work.licenseDate', l: 'วันที่ออกใบอนุญาต', t: 'date' },
    { p: 'work.licenseExpire', l: 'วันหมดอายุ (ถ้ามี)', t: 'date' }, { p: 'work.qualification', l: 'วุฒิบัตร/หนังสืออนุมัติเฉพาะทาง (ถ้ามี ระบุสาขา)' },
    { h: 'บัญชีธนาคารสำหรับรับเงินเดือน' }, { p: 'work.bankName', l: 'ธนาคาร', t: 'select', o: ['กสิกรไทย', 'กรุงไทย', 'ไทยพาณิชย์', 'กรุงเทพ', 'กรุงศรีอยุธยา', 'ทหารไทยธนชาต', 'ออมสิน', 'อื่น ๆ'], req: 1 },
    { p: 'work.bankBranch', l: 'สาขา' }, { p: 'work.bankAcct', l: 'เลขที่บัญชี', t: 'tel', req: 1 },
    { h: 'กองทุนสำรองเลี้ยงชีพ (สำหรับเจ้าหน้าที่ประจำ)' }, { p: 'pvd.rate', l: 'อัตราสะสมที่ต้องการ', t: 'select', o: ['3%', '4%', '5%', '6%', '7%', '8%', '9%', '10%', '11%', '12%', '13%', '14%', '15%'] },
    { p: 'pvd.option', l: 'ทางเลือกการลงทุน', t: 'select', o: ['1. ตราสารหนี้', '2. 90:10', '3. ผสม (หุ้น ≤20%)', '4. 70:30', '5. 60:40', '6. 40:60', '7. 20:80', '8. หุ้น 100%'], w: 2 },
    { list: 'pvd.beneficiaries', title: 'ผู้รับผลประโยชน์ (รวม 100%)', max: 4, fields: [{ k: 'name', l: 'ชื่อ-นามสกุล' }, { k: 'nationalId', l: 'เลขบัตรประชาชน', t: 'tel' }, { k: 'relation', l: 'ความสัมพันธ์' }, { k: 'share', l: 'ส่วนแบ่ง %', t: 'tel' }] }
  ] },
  { id: 'health', n: 6, title: 'คัดกรองสุขภาพ', hint: 'ส่งให้หน่วยสุขภาพเจ้าหน้าที่ใช้จัดโปรแกรมตรวจสุขภาพก่อนเข้าปฏิบัติงาน', sens: 1, fields: [
    { p: 'health.blood', l: 'กรุ๊ปเลือด', t: 'select', o: ['A', 'B', 'AB', 'O', 'ไม่ทราบ'] }, { p: 'health.weight', l: 'น้ำหนัก (กก.)', t: 'tel' }, { p: 'health.height', l: 'ส่วนสูง (ซม.)', t: 'tel' },
    { p: 'health.chronic', l: 'โรคประจำตัว', t: 'radio', o: ['ไม่มี', 'มี'] }, { p: 'health.chronicDetail', l: 'ระบุโรคและยาที่ได้รับ', w: 4, show: function (m) { return get(m, 'health.chronic') === 'มี'; } },
    { p: 'health.pregnant', l: 'การตั้งครรภ์', t: 'radio', o: ['ไม่ตั้งครรภ์', 'ตั้งครรภ์'], show: function (m) { return get(m, 'general.sex') === 'หญิง'; } },
    { p: 'health.weeks', l: 'อายุครรภ์ (สัปดาห์)', t: 'tel', show: function (m) { return get(m, 'health.pregnant') === 'ตั้งครรภ์'; } },
    { h: 'ไวรัสตับอักเสบบี' }, { p: 'health.hepB', l: '5.1 เคยเจ็บป่วยด้วยไวรัสตับอักเสบบี', t: 'radio', o: YN3, w: 2 }, { p: 'health.hepBVac', l: '5.2 วัคซีนไวรัสตับอักเสบบี', t: 'radio', o: VAC3, w: 2 },
    { p: 'health.hepBVacDetail', l: 'ปีที่ได้รับ และจำนวนเข็ม', w: 2 }, { p: 'health.hepBTest', l: '5.3 ตรวจภูมิคุ้มกัน', t: 'radio', o: TEST2 }, { p: 'health.hepBTestResult', l: 'ปี พ.ศ. ที่ตรวจ และผล' },
    { h: 'หัด คางทูม หัดเยอรมัน' }, { p: 'health.measles', l: '5.4 เคยเป็นโรคหัด', t: 'radio', o: YN3 }, { p: 'health.mumps', l: '5.5 เคยเป็นโรคคางทูม', t: 'radio', o: YN3 }, { p: 'health.rubella', l: '5.6 เคยเป็นโรคหัดเยอรมัน', t: 'radio', o: YN3 },
    { p: 'health.mmr', l: '5.7 วัคซีน MMR', t: 'radio', o: VAC3, w: 2 }, { p: 'health.mmrDetail', l: 'ปีที่ได้รับ และจำนวนเข็ม', w: 2 },
    { h: 'อีสุกอีใส' }, { p: 'health.varicella', l: '5.8 เคยเป็นโรคอีสุกอีใส', t: 'radio', o: YN3, w: 2 }, { p: 'health.vzv', l: '5.9 วัคซีน VZV', t: 'radio', o: VAC3, w: 2 },
    { p: 'health.vzvDetail', l: 'ปีที่ได้รับ และจำนวนเข็ม', w: 2 }, { p: 'health.vzvTest', l: '5.10 ตรวจ VZV IgG', t: 'radio', o: TEST2 }, { p: 'health.vzvTestResult', l: 'ปีที่ตรวจ และผล' },
    { h: 'บาดทะยัก คอตีบ ไอกรน' }, { p: 'health.tdap', l: '5.11 วัคซีนบาดทะยัก คอตีบ ไอกรน', t: 'radio', o: VAC3, w: 2 }, { p: 'health.tdapDetail', l: 'ชนิดวัคซีน ปีที่ได้รับ จำนวนเข็ม', w: 2 }
  ] }
];
function get(o, p) { return p.split('.').reduce(function (x, k) { return x == null ? undefined : x[k]; }, o); }
function set(o, p, v) { var ks = p.split('.'), x = o; for (var i = 0; i < ks.length - 1; i++) { if (x[ks[i]] == null || typeof x[ks[i]] !== 'object') x[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {}; x = x[ks[i]]; } x[ks[ks.length - 1]] = v; }

/* วาดช่องกรอก */
function fieldHtml(f, m, ro) {
  if (f.show && !f.show(m)) return '';
  if (f.h) return '<h4 class="span4" style="margin:8px 0 0">' + esc(f.h) + '</h4>';
  if (f.list) return listHtml(f, m, ro);
  var v = get(m, f.p); if ((v === undefined || v === '') && f.def) { v = f.def; set(m, f.p, v); }
  v = v == null ? '' : v;
  var cls = f.w === 4 ? 'span4' : f.w === 2 ? 'span2' : '', lab = '<span>' + esc(f.l) + (f.req ? '<b class="req">*</b>' : '') + '</span>';
  var dis = ro ? ' disabled' : '';
  if (f.t === 'check') return '<label class="chk ' + cls + '"><input type="checkbox" data-p="' + f.p + '"' + (v ? ' checked' : '') + dis + '><span>' + esc(f.l) + '</span></label>';
  if (f.t === 'radio') return '<div class="fld ' + cls + '">' + lab + '<div class="radios">' + f.o.map(function (o) { return '<label><input type="radio" name="' + f.p + '" data-p="' + f.p + '" value="' + esc(o) + '"' + (v === o ? ' checked' : '') + dis + '>' + esc(o) + '</label>'; }).join('') + '</div></div>';
  if (f.t === 'select') return '<label class="fld ' + cls + '">' + lab + '<select data-p="' + f.p + '"' + dis + '><option value="">— เลือก —</option>' + f.o.map(function (o) { return '<option' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + (v && f.o.indexOf(v) < 0 ? '<option selected>' + esc(v) + '</option>' : '') + '</select></label>';
  var type = f.t === 'date' ? 'date' : f.t === 'tel' ? 'text" inputmode="numeric' : 'text';
  return '<label class="fld ' + cls + '">' + lab + '<input type="' + type + '" data-p="' + f.p + '" value="' + esc(v) + '"' + (f.max ? ' maxlength="' + f.max + '"' : '') + dis + '></label>';
}
function listHtml(f, m, ro) {
  var arr = get(m, f.list); if (!Array.isArray(arr)) { arr = []; set(m, f.list, arr); }
  if (!arr.length && f.min) arr.push({});
  return '<div class="subcard span4"><h4>' + esc(f.title) + '</h4>' + arr.map(function (row, i) {
    return '<div class="grid g' + Math.min(5, f.fields.length) + '" style="grid-template-columns:repeat(' + f.fields.length + ',minmax(0,1fr)) auto">' + f.fields.map(function (c) {
      var p = f.list + '.' + i + '.' + c.k, v = row[c.k] == null ? '' : row[c.k];
      if (c.t === 'select') return '<label class="fld"><span>' + esc(c.l) + '</span><select data-p="' + p + '"' + (ro ? ' disabled' : '') + '><option value="">—</option>' + c.o.map(function (o) { return '<option' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>'; }).join('') + '</select></label>';
      return '<label class="fld"><span>' + esc(c.l) + '</span><input type="' + (c.t === 'date' ? 'date' : 'text') + '" data-p="' + p + '" value="' + esc(v) + '"' + (ro ? ' disabled' : '') + '></label>';
    }).join('') + (ro ? '' : '<button class="btn icon ghost" style="align-self:end" data-rm="' + f.list + '" data-i="' + i + '" aria-label="ลบแถว">' + ico('trash') + '</button>') + '</div>';
  }).join('') + (ro || arr.length >= f.max ? '' : '<div><button class="btn sm" data-add="' + f.list + '">' + ico('plus', 'sm') + 'เพิ่มแถว</button></div>') + '</div>';
}
/* แสดงข้อมูลแบบอ่านอย่างเดียว (หน้าแอดมิน / ข้อมูลของฉัน) */
function specView(spec, m) {
  return spec.fields.map(function (f) {
    if (f.show && !f.show(m)) return '';
    if (f.h) return '<dt class="span4" style="grid-column:1/-1;color:var(--ink);font-weight:600;margin-top:6px">' + esc(f.h) + '</dt>';
    if (f.list) { var a = get(m, f.list) || []; return '<dt>' + esc(f.title) + '</dt><dd>' + (a.length ? a.map(function (r) { return f.fields.map(function (c) { return r[c.k] ? esc(r[c.k]) : ''; }).filter(String).join(' · '); }).join('<br>') : '—') + '</dd>'; }
    var v = get(m, f.p); if (f.t === 'check') v = v ? 'ใช่' : 'ไม่ใช่'; if (f.t === 'date') v = dThL(v);
    return '<dt>' + esc(f.l) + '</dt><dd>' + (v === '' || v == null ? '<span class="muted">—</span>' : esc(v)) + '</dd>';
  }).join('');
}

/* ═════════ หน้าของฉัน ═════════ */
PAGES.me = function (v) {
  setTop('หน้าของฉัน', esc(S.me.name || ''));
  api('getMyForm').then(function (d) {
    S.my = d;
    var st = d.status, cand = S.me.kind === 'CAND';
    var docsWait = d.docs.filter(function (x) { return x.status === 'ISSUED'; }).length;
    var todo = (d.editable && cand ? 1 : 0) + docsWait;
    var h = '<div class="hero"><div><h2>' + greet() + ' คุณ' + esc(firstNameOf(d.name || S.me.name)) + '</h2><p>' + (todo ? 'มีสิ่งที่ต้องทำ ' + todo + ' รายการ' : cand ? 'ขอบคุณที่ส่งข้อมูล ฝ่ายทรัพยากรบุคคลจะแจ้งความคืบหน้าทางอีเมล' : 'ข้อมูลของคุณเป็นปัจจุบัน') + '</p></div>' +
      '<div class="hstats">' + (d.position ? '<div class="hs"><b style="font-size:16px">' + esc(d.position) + '</b><span>ตำแหน่ง</span></div>' : '') + (d.startDate ? '<div class="hs"><b style="font-size:16px">' + esc(dThL(d.startDate)) + '</b><span>วันที่เริ่มงาน</span></div>' : '') + '</div></div>';
    if (cand) {
      var stepN = { INVITED: 0, DRAFT: 0, RETURNED: 0, SUBMITTED: 1, VERIFIED: d.docs.length ? 2 : 1, ACTIVE: 3 }[st] || 0;
      if (st === 'VERIFIED' && d.docs.length && !docsWait) stepN = 3;
      var S4 = [['กรอกข้อมูลและแนบเอกสาร', 'ฟอร์ม 8 ส่วน'], ['ฝ่ายทรัพยากรบุคคลตรวจ', 'แจ้งผลทางอีเมล'], ['ตรวจเอกสารสัญญาของฉัน', 'ก่อนวันนัดลงนาม'], ['ลงนามสัญญา', 'ตามวันที่นัด']];
      h += '<div class="steps">' + S4.map(function (x, i) { return '<div class="s ' + (i < stepN ? 'done' : i === stepN ? 'now' : '') + '"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join('') + '</div>';
      if (st === 'RETURNED') h += '<div class="note bad">' + ico('alert') + '<div><b>ฝ่ายทรัพยากรบุคคลขอให้แก้ไขข้อมูล</b><div>' + esc(d.returnNote) + '</div></div></div>';
      if (d.editable) h += '<div class="card"><div class="bd"><div><b>ขั้นตอนต่อไป:</b> กรอกข้อมูลบุคลากรใหม่ให้ครบ แนบเอกสาร แล้วกดส่ง (บันทึกร่างไว้กรอกต่อภายหลังได้)</div><div><a class="btn pri" href="#/form">' + ico('edit') + 'กรอกข้อมูลบุคลากรใหม่</a></div></div></div>';
      if (st === 'SUBMITTED') h += '<div class="note">' + ico('info') + '<span>ส่งข้อมูลแล้ว ฝ่ายทรัพยากรบุคคลกำลังตรวจ เมื่อเอกสารสัญญาพร้อมจะแจ้งให้เข้ามาตรวจอีกครั้ง</span></div>';
    }
    if (docsWait) h += '<div class="note warn">' + ico('file') + '<div><b>มีเอกสาร ' + docsWait + ' ฉบับรอให้คุณตรวจ</b><div>กรุณาตรวจชื่อ ที่อยู่ จำนวนเงิน และวันที่ ให้ถูกต้องก่อนวันนัดลงนาม</div><div style="margin-top:6px"><a class="btn pri sm" href="#/mydocs">ตรวจเอกสาร</a></div></div></div>';
    h += '<div class="card"><div class="hd"><h3>ข้อมูลโดยย่อ</h3>' + statusTag(st) + '</div><div class="bd"><dl class="kv">' +
      '<dt>ชื่อ-นามสกุล</dt><dd>' + esc(d.name) + '</dd><dt>รหัสเจ้าหน้าที่</dt><dd>' + esc(d.empCode || 'ยังไม่ได้รับ') + '</dd>' +
      '<dt>ตำแหน่ง</dt><dd>' + esc(d.position || '—') + '</dd><dt>ฝ่าย/หน่วยงาน</dt><dd>' + esc([d.dept, d.unit].filter(String).join(' · ') || '—') + '</dd>' +
      '<dt>วันที่เริ่มงาน</dt><dd>' + (dThL(d.startDate) || '—') + '</dd><dt>เลขบัตรประชาชน</dt><dd>' + esc(d.nationalIdMasked || '—') + '</dd></dl></div></div>';
    if (S.me.kind === 'STAFF' && d.state) h += rightsCards(d.state);
    h += '<div class="muted" style="font-size:13px">สอบถาม ฝ่ายทรัพยากรบุคคล โทร ' + esc(d.hr.phone) + ' · ไลน์ ' + esc(d.hr.line) + '</div>';
    v.innerHTML = h;
  }, fail(v));
};
function rightsCards(state) {
  var R = K().RIGHT_TYPES || {}, ks = Object.keys(state).filter(function (k) { return state[k].status !== 'NONE'; });
  if (!ks.length) return '<div class="card"><div class="bd muted">ยังไม่มีข้อมูลสิทธิ์ค่าตอบแทนในทะเบียน</div></div>';
  return '<div class="kpis">' + ks.map(function (k) {
    var x = state[k];
    return '<div class="kpi"><span class="l">' + esc((R[k] || {}).label || k) + '</span><span class="v" style="font-size:22px">' + (x.amount ? money(x.amount) + ' <small style="font-size:13px;font-weight:500">บาท/เดือน</small>' : '—') + '</span><span>' + rightTag(x) + (x.since ? ' <span class="s">ตั้งแต่ ' + dTh(x.since) + '</span>' : '') + '</span></div>';
  }).join('') + '</div>';
}

/* ═════════ ฟอร์มบุคลากรใหม่ (8 ขั้น) ═════════ */
var WIZ = [{ id: 'consent', n: 1, title: 'ความยินยอม PDPA' }].concat(FORM_SPEC, [{ id: 'files', n: 7, title: 'เอกสารแนบ' }, { id: 'submit', n: 8, title: 'ตรวจทานและส่ง' }]);
PAGES.form = function (v, args) {
  setTop('กรอกข้อมูลบุคลากรใหม่', 'บันทึกร่างได้ทุกเมื่อ กลับมากรอกต่อด้วยลิงก์เดิม');
  api('getMyForm').then(function (d) {
    S.my = d;
    S.fm = { m: JSON.parse(JSON.stringify(d.form || {})), health: JSON.parse(JSON.stringify(d.health || {})), dirty: false,
      consent: { general: d.consents.some(function (c) { return c.kind === 'GENERAL' && c.accepted === 'TRUE'; }), sensitive: d.consents.some(function (c) { return c.kind === 'SENSITIVE' && c.accepted === 'TRUE'; }) } };
    S.fm.m.health = S.fm.health;
    if (!get(S.fm.m, 'general.firstName')) { set(S.fm.m, 'general.firstName', d.firstName); set(S.fm.m, 'general.lastName', d.lastName); if (TITLES.indexOf(d.title) >= 0) set(S.fm.m, 'general.title', d.title); set(S.fm.m, 'general.phone', d.phone); }
    var step = args[0] || (S.fm.consent.general ? 'general' : 'consent');
    drawWizard(v, step);
  }, fail(v));
};
function drawWizard(v, step) {
  var d = S.my, ro = !d.editable, list = WIZ.filter(function (w) { return !(w.sens && !S.fm.consent.sensitive); });
  if (!list.some(function (w) { return w.id === step; })) step = list[0].id;
  S.fm.step = step;
  var idx = list.findIndex(function (w) { return w.id === step; }), cur = list[idx];
  var body = '';
  if (ro) body += '<div class="note">' + ico('lock') + '<span>ส่งข้อมูลแล้ว แสดงแบบอ่านอย่างเดียว หากต้องการแก้ไขกรุณาติดต่อฝ่ายทรัพยากรบุคคล</span></div>';
  if (cur.id === 'consent') {
    body += '<div class="card"><div class="hd"><h3>ส่วนที่ 1 การให้ความยินยอมในการเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล</h3><span class="tag">ฉบับ ' + esc(d.pdpa.version) + '</span></div><div class="bd">' +
      '<p style="margin:0">แบบฟอร์มนี้เก็บข้อมูลเพื่อออกหนังสือสัญญาจ้าง คัดกรองสุขภาพบุคลากรใหม่ และจัดทำสัญญาต่าง ๆ ที่เกี่ยวข้องกับโรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา</p>' +
      '<h4 style="margin:4px 0 0">1.1 ข้อมูลส่วนบุคคลทั่วไป <span class="tag bad">จำเป็น</span></h4><div class="pdpa">' + esc(d.pdpa.general) + '</div>' +
      '<label class="chk"><input type="checkbox" id="cGen"' + (S.fm.consent.general ? ' checked' : '') + (ro ? ' disabled' : '') + '><span><b>ข้าพเจ้ายินยอม</b> ให้เก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคลตามวัตถุประสงค์ข้างต้น</span></label>' +
      '<h4 style="margin:8px 0 0">1.2 ข้อมูลส่วนบุคคลที่มีความอ่อนไหว (ศาสนา เชื้อชาติ สุขภาพ)</h4><div class="pdpa">' + esc(d.pdpa.sensitive) + '</div>' +
      '<label class="chk"><input type="checkbox" id="cSen"' + (S.fm.consent.sensitive ? ' checked' : '') + (ro ? ' disabled' : '') + '><span><b>ข้าพเจ้ายินยอม</b> ให้เก็บข้อมูลที่มีความอ่อนไหวเพื่อคัดกรองสุขภาพ (ถ้าไม่ยินยอม ระบบจะไม่แสดงส่วนที่ 6 และไม่เก็บศาสนา/เชื้อชาติ)</span></label>' +
      '</div></div>';
  } else if (cur.id === 'files') {
    var FK = d.fileKinds, has = {};
    d.files.forEach(function (f) { (has[f.kind] = has[f.kind] || []).push(f); });
    var sex = get(S.fm.m, 'general.sex'), mar = get(S.fm.m, 'general.marital');
    body += '<div class="card"><div class="hd"><h3>ส่วนที่ 7 เอกสารแนบ</h3><span class="muted">PDF หรือรูปถ่าย ไม่เกิน 8 MB ต่อไฟล์ · ถ่ายให้เห็นตัวอักษรชัดเจน</span></div><div class="bd">' +
      Object.keys(FK).map(function (k) {
        var req = FK[k].req || (k === 'F64' && sex === 'ชาย') || (k === 'F69' && mar === 'สมรส') || (k === 'F67' && ['DOC', 'DENT', 'PHARM', 'NURSE', 'ALLIED'].indexOf(d.posGroup) >= 0);
        var fs = has[k] || [];
        return '<div class="filerow"><div><b>' + esc(FK[k].label) + '</b>' + (req ? ' <span class="tag bad">จำเป็น</span>' : '') + (fs.length ? fs.map(function (f) {
          return '<div class="fn">' + ico('check', 'sm') + ' ' + esc(f.name) + ' · ' + Math.round(f.size / 1024) + ' KB <button class="btn ghost sm" data-view="' + f.fid + '">เปิดดู</button>' + (ro ? '' : '<button class="btn ghost sm bad" data-del="' + f.fid + '">ลบ</button>') + '</div>';
        }).join('') : '<div class="fn">ยังไม่ได้แนบ</div>') + '</div>' +
          (ro ? '' : '<label class="btn sm">' + ico('upload', 'sm') + 'แนบไฟล์<input type="file" accept="application/pdf,image/*" data-up="' + k + '" hidden></label>') + '</div>';
      }).join('') + '</div></div>';
  } else if (cur.id === 'submit') {
    body += '<div class="card"><div class="hd"><h3>ส่วนที่ 8 ตรวจทานและส่งข้อมูล</h3></div><div class="bd" id="sumBox">' +
      FORM_SPEC.filter(function (s) { return !(s.sens && !S.fm.consent.sensitive); }).map(function (s) { return '<div class="subcard"><h4>' + esc(s.title) + ' <button class="btn ghost sm" data-go="' + s.id + '">แก้ไข</button></h4><dl class="kv">' + specView(s, S.fm.m) + '</dl></div>'; }).join('') +
      '<div class="subcard"><h4>เอกสารแนบ ' + d.files.length + ' ไฟล์ <button class="btn ghost sm" data-go="files">แก้ไข</button></h4></div>' +
      (ro ? '' : '<label class="chk"><input type="checkbox" id="cTrue"><span>ข้าพเจ้าขอรับรองว่าข้อมูลที่กรอกและเอกสารที่แนบเป็นความจริงทุกประการ</span></label>') + '<div id="missBox"></div></div></div>';
  } else {
    body += '<div class="card"><div class="hd"><h3>ส่วนที่ ' + cur.n + ' ' + esc(cur.title) + '</h3><span class="muted">' + esc(cur.hint || '') + '</span></div><div class="bd"><div class="grid g4" id="secGrid">' +
      cur.fields.filter(function (f) { return !(f.sens && !S.fm.consent.sensitive); }).map(function (f) { return fieldHtml(f, S.fm.m, ro); }).join('') + '</div></div></div>';
  }
  var nav = '<nav class="wiz-nav">' + list.map(function (w) { return '<button data-go="' + w.id + '" class="' + (w.id === step ? 'on' : '') + '"><span class="n">' + w.n + '</span><span class="t">' + esc(w.title) + '</span></button>'; }).join('') + '</nav>';
  var foot = '<div class="wiz-foot"><div>' + (idx > 0 ? '<button class="btn" data-go="' + list[idx - 1].id + '">' + ico('back') + 'ย้อนกลับ</button>' : '') + '</div>' +
    '<span class="savestate" id="saveState">' + (S.fm.savedAt ? 'บันทึกล่าสุด ' + S.fm.savedAt.slice(11, 16) + ' น.' : '') + '</span><div class="toolbar">' +
    (ro ? '' : '<button class="btn" id="btnDraft">บันทึกร่าง</button>') +
    (cur.id === 'submit' ? (ro ? '' : '<button class="btn pri" id="btnSubmit">' + ico('paper') + 'ส่งข้อมูลให้ฝ่ายทรัพยากรบุคคล</button>') : '<button class="btn pri" data-go="' + list[idx + 1].id + '">ถัดไป</button>') + '</div></div>';
  v.innerHTML = '<div class="wiz">' + nav + '<div class="grid">' + body + foot + '</div></div>';
  bindWizard(v);
}
function bindWizard(v) {
  var m = S.fm.m;
  var onChange = function (ev) {
    var t = ev.target;
    if (t.id === 'cGen') { S.fm.consent.general = t.checked; S.fm.dirty = true; return; }
    if (t.id === 'cSen') { S.fm.consent.sensitive = t.checked; S.fm.dirty = true; drawWizard(v, S.fm.step); return; }
    var p = t.dataset.p; if (!p) return;
    var val = t.type === 'checkbox' ? t.checked : t.value;
    if (t.inputMode === 'numeric' && /nationalId|phone|zip|bankAcct/.test(p)) val = val.replace(/[^\d-]/g, '');
    set(m, p, val); S.fm.dirty = true;
    if (/general\.(sex|marital)|addrCur\.same|health\.(chronic|pregnant)/.test(p)) drawWizard(v, S.fm.step);
  };
  v.addEventListener('change', onChange);
  v.addEventListener('input', function (ev) { if (ev.target.dataset.p && ev.target.tagName === 'INPUT' && ev.target.type === 'text') { set(m, ev.target.dataset.p, ev.target.value); S.fm.dirty = true; } });
  v.onclick = function (ev) {
    var b = ev.target.closest('button,label'); if (!b) return;
    if (b.dataset.go) { goStep(v, b.dataset.go); return; }
    if (b.dataset.add) { var a = get(m, b.dataset.add) || []; a.push({}); set(m, b.dataset.add, a); S.fm.dirty = true; drawWizard(v, S.fm.step); return; }
    if (b.dataset.rm) { var r = get(m, b.dataset.rm) || []; r.splice(+b.dataset.i, 1); S.fm.dirty = true; drawWizard(v, S.fm.step); return; }
    if (b.dataset.view) { viewFile(b.dataset.view); return; }
    if (b.dataset.del) { confirmDlg('ลบไฟล์นี้?', 'ไฟล์ที่ลบจะไม่ถูกส่งให้ฝ่ายทรัพยากรบุคคล', 'ลบไฟล์', 'bad').then(function (ok) { if (ok) api('deleteFile', { fid: b.dataset.del }).then(function () { S.my.files = S.my.files.filter(function (f) { return f.fid !== b.dataset.del; }); drawWizard(v, 'files'); toast('ลบไฟล์แล้ว', 'ok'); }, function (e) { toast(e.message, 'bad'); }); }); return; }
  };
  $$('input[data-up]', v).forEach(function (inp) {
    inp.onchange = function () {
      var f = inp.files[0]; if (!f) return;
      var lab = inp.closest('label'); lab.classList.add('disabled');
      shrinkImage(f).then(function (ff) {
        if (ff.size > 8 * 1048576) throw new Error('ไฟล์ใหญ่เกิน 8 MB กรุณาย่อขนาดหรือสแกนใหม่');
        return fileToB64(ff).then(function (b64) { return api('uploadFile', { kind: inp.dataset.up, name: ff.name, mime: ff.type || 'application/pdf', b64: b64 }); });
      }).then(function (r) { S.my.files.push(r); toast('แนบไฟล์แล้ว', 'ok'); drawWizard(v, 'files'); }, function (e) { toast(e.message, 'bad'); lab.classList.remove('disabled'); });
    };
  });
  var bd = $('#btnDraft', v); if (bd) bd.onclick = function () { run(bd, saveDraft(), 'บันทึกร่างแล้ว'); };
  var bs = $('#btnSubmit', v); if (bs) bs.onclick = function () {
    if (!$('#cTrue').checked) { toast('กรุณาติ๊กรับรองความถูกต้องของข้อมูลก่อนส่ง', 'warn'); return; }
    run(bs, api('submitMyForm', { form: formPayload(), consent: S.fm.consent, health: S.fm.consent.sensitive ? S.fm.health : null })).then(function (r) {
      if (!r.ok) {
        $('#missBox').innerHTML = '<div class="note bad">' + ico('alert') + '<div><b>ยังส่งไม่ได้ ข้อมูลยังไม่ครบ ' + r.missing.length + ' รายการ</b><ul style="margin:6px 0 0;padding-left:18px">' + r.missing.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>';
        toast('ข้อมูลยังไม่ครบ ' + r.missing.length + ' รายการ', 'bad'); return;
      }
      S.fm.dirty = false;
      modal({ title: 'ส่งข้อมูลเรียบร้อย', icon: 'check', iconCls: 'ok', html: '<p style="margin:0">ฝ่ายทรัพยากรบุคคลได้รับข้อมูลของคุณแล้ว ระบบส่งอีเมลยืนยันไปที่ ' + esc(S.my.email || '') + '<br>เมื่อเอกสารสัญญาพร้อม เราจะแจ้งให้เข้ามาตรวจเอกสารอีกครั้ง</p>', actions: [{ label: 'กลับหน้าของฉัน', cls: 'pri', fn: function () { location.hash = '#/me'; } }] });
    }, function () { });
  };
}
function formPayload() { var f = {}; Object.keys(S.fm.m).forEach(function (k) { if (k !== 'health') f[k] = S.fm.m[k]; }); return f; }
function saveDraft() {
  return api('saveMyForm', { form: formPayload(), consent: S.fm.consent, health: S.fm.consent.sensitive ? S.fm.health : null }).then(function (r) {
    S.fm.dirty = false; S.fm.savedAt = r.savedAt;
    var s = $('#saveState'); if (s) s.textContent = 'บันทึกล่าสุด ' + r.savedAt.slice(11, 16) + ' น.';
    return r;
  });
}
function goStep(v, id) {
  if (S.fm.step === 'consent' && !S.fm.consent.general && id !== 'consent' && S.my.editable) { toast('กรุณากดยินยอมการเก็บข้อมูลส่วนบุคคลทั่วไปก่อน', 'warn'); return; }
  var p = S.fm.dirty && S.my.editable ? saveDraft().catch(function (e) { toast(e.message, 'bad'); }) : Promise.resolve();
  p.then(function () { drawWizard(v, id); window.scrollTo(0, 0); });
}
function viewFile(fid) {
  api('getFile', { fid: fid }).then(function (f) {
    var u = URL.createObjectURL(b64ToBlob(f.b64, f.mime));
    modal({ title: f.name, size: 'wide', html: /^image/.test(f.mime) ? '<img src="' + u + '" alt="' + esc(f.name) + '" style="max-width:100%">' : '<iframe src="' + u + '" title="' + esc(f.name) + '" style="width:100%;height:70vh;border:0"></iframe>',
      actions: [{ label: ico('download', 'sm') + 'ดาวน์โหลด', fn: function () { saveBlob(b64ToBlob(f.b64, f.mime), f.name); return false; } }, { label: 'ปิด' }], onClose: function () { URL.revokeObjectURL(u); } });
  }, function (e) { toast(e.message, 'bad'); });
}

/* ═════════ ตรวจเอกสารของฉัน ═════════ */
PAGES.mydocs = function (v) {
  setTop('ตรวจเอกสารของฉัน', 'ตรวจชื่อ ที่อยู่ จำนวนเงิน และวันที่ ก่อนฝ่ายทรัพยากรบุคคลพิมพ์ให้ลงนาม');
  api('getMyForm').then(function (d) {
    S.my = d;
    if (!d.docs.length) { v.innerHTML = '<div class="card"><div class="bd muted">ยังไม่มีเอกสาร เมื่อฝ่ายทรัพยากรบุคคลออกเอกสารแล้ว จะแสดงที่หน้านี้</div></div>'; return; }
    v.innerHTML = '<div class="card"><div class="bd flush"><div class="tw"><table class="t"><thead><tr><th>เอกสาร</th><th>เลขอ้างอิง</th><th>รอบ / วันนัดลงนาม</th><th>สถานะ</th><th></th></tr></thead><tbody>' +
      d.docs.map(function (x) {
        return '<tr><td><b>' + esc(x.kindLabel) + '</b>' + (x.flagNote ? '<div class="sub">แจ้งแก้: ' + esc(x.flagNote) + '</div>' : '') + '</td><td class="mono">' + esc(x.refNo || '—') + '</td><td>' + esc((x.snapshot.round || {}).name || '—') + '<div class="sub">' + dThL((x.snapshot.round || {}).signDate) + '</div></td><td>' + docTag(x.status) + '</td>' +
          '<td><button class="btn sm ' + (x.status === 'ISSUED' ? 'pri' : '') + '" data-doc="' + x.docId + '">' + ico('eye', 'sm') + (x.status === 'ISSUED' ? 'ตรวจเอกสาร' : 'เปิดดู') + '</button></td></tr>';
      }).join('') + '</tbody></table></div></div></div><div class="note">' + ico('info') + '<span>เอกสารเป็นฉบับตรวจทาน ข้อมูลสีน้ำเงินมาจากข้อมูลที่คุณกรอกและที่ฝ่ายทรัพยากรบุคคลกำหนด หากพบจุดผิด กด "แจ้งแก้ไข" แล้วระบุให้ชัดเจน</span></div>';
    v.onclick = function (ev) { var b = ev.target.closest('[data-doc]'); if (b) reviewDoc(d.docs.filter(function (x) { return x.docId === b.dataset.doc; })[0], v); };
  }, fail(v));
};
function docPreviewHtml(docs, mode) {
  return '<div class="docview"><div class="scale">' + DOCS.render(docs, { mode: mode || 'preview' }) + '</div></div>';
}
function fitPreview(dlg, n) {
  var box = $('.docview', dlg), sc = $('.scale', dlg); if (!box || !sc) return;
  var w = box.clientWidth - 32;
  if (w <= 0) { if ((n || 0) < 20) setTimeout(function () { fitPreview(dlg, (n || 0) + 1); }, 50); return; }
  var k = Math.min(1, w / (210 * 3.7795));
  sc.style.transform = ''; sc.style.height = ''; sc.style.width = (210 * 3.7795) + 'px';
  if ('zoom' in sc.style) sc.style.zoom = k;
  else { sc.style.transform = 'scale(' + k + ')'; sc.style.height = (sc.scrollHeight * k) + 'px'; }
  if (!dlg._fitDone) { dlg._fitDone = 1; DOCS.fontsReady().then(function () { DOCS.autofit(sc); }); }
  if (!dlg._fitBound) { dlg._fitBound = 1; window.addEventListener('resize', function () { if (document.body.contains(dlg)) fitPreview(dlg); }); }
}
function reviewDoc(doc, v) {
  var can2 = ['ISSUED', 'CONFIRMED', 'FLAGGED'].indexOf(doc.status) >= 0;
  var dlg = modal({ title: doc.kindLabel + (doc.refNo ? ' · ' + doc.refNo : ''), size: 'xl', noFocus: true, html: docPreviewHtml([doc]) +
      (can2 ? '<label class="fld"><span>ถ้าพบข้อผิดพลาด ระบุจุดที่ต้องแก้ไข</span><textarea id="flagNote" placeholder="เช่น ชื่อบิดาสะกดว่า … / บ้านเลขที่ที่ถูกต้องคือ …">' + esc(doc.flagNote || '') + '</textarea></label>' : ''),
    onOpen: function (d) { setTimeout(function () { fitPreview(d); }, 30); },
    actions: can2 ? [{ label: 'ปิด' }, { label: ico('alert', 'sm') + 'แจ้งแก้ไข', cls: 'bad', fn: function () { return api('reviewMyDoc', { docId: doc.docId, ok: false, note: $('#flagNote').value }).then(function () { toast('ส่งคำขอแก้ไขให้ฝ่ายทรัพยากรบุคคลแล้ว', 'ok'); PAGES.mydocs(v); }); } },
      { label: ico('tick', 'sm') + 'ข้อมูลถูกต้อง', cls: 'ok', fn: function () { return api('reviewMyDoc', { docId: doc.docId, ok: true }).then(function () { toast('ยืนยันเอกสารแล้ว', 'ok'); PAGES.mydocs(v); }); } }] : [{ label: 'ปิด' }] });
  return dlg;
}

/* ═════════ ข้อมูลของฉัน (บุคลากรปัจจุบัน) ═════════ */
PAGES.profile = function (v) {
  setTop('ข้อมูลของฉัน', 'ข้อมูลในทะเบียนของฝ่ายทรัพยากรบุคคล', [mkBtn(ico('edit', 'sm') + 'ขอแก้ไขข้อมูล', 'pri', function () { editRequestDlg(v); })]);
  api('getMyForm').then(function (d) {
    S.my = d;
    var m = d.form || {};
    var pend = (d.editReqs || []).filter(function (e) { return e.status === 'PENDING'; });
    v.innerHTML = (pend.length ? '<div class="note warn">' + ico('clock') + '<span>มีคำขอแก้ไขรอฝ่ายทรัพยากรบุคคลพิจารณา ' + pend.length + ' รายการ</span></div>' : '') +
      '<div class="card"><div class="hd"><h3>ข้อมูลการจ้าง</h3></div><div class="bd"><dl class="kv"><dt>ชื่อ-นามสกุล</dt><dd>' + esc(d.name) + '</dd><dt>รหัสเจ้าหน้าที่</dt><dd>' + esc(d.empCode) + '</dd><dt>ตำแหน่ง</dt><dd>' + esc(d.position) + '</dd><dt>ฝ่าย/หน่วยงาน</dt><dd>' + esc([d.dept, d.unit].filter(String).join(' · ')) + '</dd><dt>เบอร์โทรศัพท์</dt><dd>' + esc(d.phone || '—') + '</dd><dt>อีเมล</dt><dd>' + esc(d.email || '—') + '</dd><dt>ใบอนุญาต</dt><dd>' + esc(d.licenseNo || '—') + (d.licenseExpire ? ' (หมดอายุ ' + dThL(d.licenseExpire) + ')' : '') + '</dd></dl></div></div>' +
      (Object.keys(m).length ? FORM_SPEC.filter(function (s) { return !s.sens; }).map(function (s) { return '<div class="card"><div class="hd"><h3>' + esc(s.title) + '</h3></div><div class="bd"><dl class="kv">' + specView(s, m) + '</dl></div></div>'; }).join('') : '<div class="card"><div class="bd muted">ข้อมูลรายละเอียดของคุณยังไม่ได้บันทึกในระบบนี้ (นำเข้าจากระบบเดิมเฉพาะประวัติสิทธิ์) หากต้องการปรับปรุงข้อมูล กด "ขอแก้ไขข้อมูล"</div></div>') +
      ((d.editReqs || []).length ? '<div class="card"><div class="hd"><h3>คำขอแก้ไขของฉัน</h3></div><div class="bd flush"><table class="t"><tbody>' + d.editReqs.map(function (e) { return '<tr><td>' + dtTh(e.createdAt) + '</td><td>' + Object.keys(e.changes).map(function (k) { return esc((K().EDITABLE_BY_STAFF || {})[k] || k); }).join(', ') + '<div class="sub">' + esc(e.reason || '') + '</div></td><td>' + (e.status === 'PENDING' ? '<span class="tag warn">รอพิจารณา</span>' : e.status === 'APPROVED' ? '<span class="tag ok">อนุมัติแล้ว</span>' : '<span class="tag bad">ไม่อนุมัติ</span>') + (e.decisionNote ? '<div class="sub">' + esc(e.decisionNote) + '</div>' : '') + '</td></tr>'; }).join('') + '</tbody></table></div></div>' : '');
  }, fail(v));
};
function editRequestDlg(v) {
  var E = K().EDITABLE_BY_STAFF || {};
  modal({ title: 'ขอแก้ไขข้อมูล', icon: 'edit', html: '<div class="grid"><label class="fld"><span>ข้อมูลที่ต้องการแก้ไข</span><select id="erK">' + Object.keys(E).map(function (k) { return '<option value="' + k + '">' + esc(E[k]) + '</option>'; }).join('') + '</select></label>' +
    '<label class="fld"><span>ข้อมูลใหม่</span><textarea id="erV" placeholder="เช่น ที่อยู่ใหม่ทั้งหมด / ชื่อคู่สมรส / เลขบัญชีใหม่"></textarea></label>' +
    '<label class="fld"><span>เหตุผล / หลักฐาน (ถ้ามี)</span><input id="erR" placeholder="เช่น ย้ายทะเบียนบ้าน, จดทะเบียนสมรส"></label>' +
    '<div class="note">' + ico('info') + '<span>ฝ่ายทรัพยากรบุคคลจะตรวจและปรับปรุงให้ หากต้องใช้เอกสารประกอบ จะติดต่อกลับ</span></div></div>',
    actions: [{ label: 'ยกเลิก' }, { label: 'ส่งคำขอ', cls: 'pri', fn: function () { var ch = {}; ch[$('#erK').value] = $('#erV').value; return api('requestEdit', { changes: ch, reason: $('#erR').value }).then(function () { toast('ส่งคำขอแก้ไขแล้ว', 'ok'); PAGES.profile(v); }); } }] });
}

/* ═════════ สิทธิ์ค่าตอบแทนของฉัน ═════════ */
PAGES.myrights = function (v) {
  setTop('สิทธิ์ค่าตอบแทนของฉัน', 'สถานะปัจจุบันและประวัติจากทะเบียนของฝ่ายทรัพยากรบุคคล');
  api('getMyForm').then(function (d) {
    v.innerHTML = rightsCards(d.state || {}) + '<div class="card"><div class="hd"><h3>ประวัติ</h3></div><div class="bd">' + timelineHtml(d.events || [], false) + '</div></div>';
  }, fail(v));
};
function timelineHtml(evs, admin) {
  var list = evs.filter(function (e) { return admin || e.review !== 'PENDING' && e.review !== 'REJECTED'; }).slice().reverse();
  if (!list.length) return '<div class="muted">ยังไม่มีประวัติ</div>';
  return '<div class="tl">' + list.map(function (e) {
    var amt = e.kind === 'CHANGE' && e.oldAmount ? money(e.oldAmount) + ' → ' + money(e.amount) : e.amount ? money(e.amount) : '';
    var grp = e.code ? (e.oldCode && e.kind === 'CHANGE' ? e.oldCode + ' → ' : '') + e.code : '';
    return '<div class="ev"><span class="d">' + dTh(e.effDate) + (e.endDate ? '<br>ถึง ' + dTh(e.endDate) : '') + '</span><span class="dot ' + e.kind + '"></span><div class="tx"><b>' + esc(e.rightLabel) + ' · ' + esc(e.kindLabel) + '</b>' +
      (amt || grp ? ' <span class="muted">' + esc([grp, amt && amt + ' บาท'].filter(String).join(' · ')) + '</span>' : '') +
      (e.reason ? '<small>เหตุผล: ' + esc(e.reason) + '</small>' : '') + (e.ref ? '<small>อ้างอิง: ' + esc(e.ref) + '</small>' : '') +
      (admin && e.note ? '<small>' + esc(e.note) + '</small>' : '') + (admin && e.review === 'PENDING' ? '<small><span class="tag warn">รอตรวจ (ย้ายจาก Note)</span></small>' : '') +
      (admin && e.reportYm ? '<small>รายงานเดือน ' + ymTh(e.reportYm) + (e.locked ? ' · ปิดเดือนแล้ว' : '') + '</small>' : '') + '</div>' +
      (admin && !e.locked && can('rights.edit') ? '<span><button class="btn ghost sm" data-ev="' + e.eid + '">แก้ไข</button></span>' : '<span></span>') + '</div>';
  }).join('') + '</div>';
}
