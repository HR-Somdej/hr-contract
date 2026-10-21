/* docs.js — วาดหน้าเอกสาร A4 จาก "ชุดข้อมูล" (snapshot) ที่หลังบ้านเก็บไว้ ณ เวลาที่ออกเอกสาร
 *  • ข้อความตายตัวพิมพ์ตามแบบฟอร์มเดิม · ข้อมูลที่ระบบเติมเป็นสีน้ำเงินบนเส้นประ (พิมพ์ขาวดำได้)
 *  • สัญญาไม่ทำเวชฯ / แบบคำขอ / แบบ พ.ต.ส. มีเครดิต "พิมพ์โดยระบบอัตโนมัติ" + เลขอ้างอิง ท้ายทุกหน้า
 *  • DOCS.render(docs, {mode:'print'|'preview', printedAt}) → HTML หลายหน้า · DOCS.print(html) → พิมพ์ทันที
 */
var DOCS = (function () {
  var TH_M = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
  function e(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function dParts(d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(d || ''); return m ? { d: +m[3], m: TH_M[+m[2] - 1], y: +m[1] + 543 } : { d: '', m: '', y: '' }; }
  function dTh(d) { var p = dParts(d); return p.d ? p.d + ' ' + p.m + ' ' + p.y : ''; }
  function money(n) { n = Number(n || 0); return n ? n.toLocaleString('en-US') : ''; }

  /* จำนวนเงินเป็นคำอ่านภาษาไทย */
  function bahtText(n) {
    n = Math.round(Number(n || 0) * 100) / 100;
    if (!n) return 'ศูนย์บาทถ้วน';
    var D = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'], P = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน'];
    function grp(s) {
      var out = '', L = s.length;
      for (var i = 0; i < L; i++) {
        var d = +s[i], pos = L - i - 1;
        if (!d) continue;
        if (pos === 0 && d === 1 && L > 1) out += 'เอ็ด';
        else if (pos === 1 && d === 2) out += 'ยี่';
        else if (pos === 1 && d === 1) out += '';
        else out += D[d];
        out += P[pos];
      }
      return out;
    }
    function words(s) {
      s = s.replace(/^0+/, '') || '0';
      if (s.length > 6) return words(s.slice(0, -6)) + 'ล้าน' + grp(s.slice(-6));
      return grp(s);
    }
    var parts = n.toFixed(2).split('.'), b = words(parts[0]), st = +parts[1];
    return (b ? b + 'บาท' : '') + (st ? words(parts[1]) + 'สตางค์' : 'ถ้วน');
  }

  /* ช่องกรอก: ข้อมูลอยู่บนเส้นประ · w = ความกว้างขั้นต่ำ (ซม.) · ไม่มีข้อมูล = เส้นประว่างให้เขียนมือ */
  /* นับความยาวเฉพาะตัวอักษรหลัก (ไม่นับสระบน-ล่าง/วรรณยุกต์) เพื่อย่อฟอนต์ในช่องที่ข้อความยาว */
  function vlen(v) { return String(v == null ? '' : v).replace(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/g, '').length; }
  function fit(v, w) { return ''; var cap = (w || 2.2) * 3.2, n = vlen(v); return n > cap * 2.2 ? ' s3' : n > cap * 1.6 ? ' s2' : n > cap * 1.15 ? ' s1' : ''; }
  function F(v, w, cls) { return '<span class="f' + (cls ? ' ' + cls : '') + fit(v, w || 2.2) + '" style="min-width:' + (w || 2.2) + 'cm">' + (v === '' || v == null ? '&nbsp;' : e(v)) + '</span>'; }
  function FX(v, cls) { return '<span class="f fx' + (cls ? ' ' + cls : '') + '">' + (v === '' || v == null ? '&nbsp;' : e(v)) + '</span>'; }
  function addrLine(a) { a = a || {}; return a; }
  function nm(p) { return { first: (p.title && !/^(นาย|นาง|นางสาว)$/.test(p.title) ? p.title : '') + (p.firstName || ''), last: p.lastName || '' }; }

  function credit(doc, opt, page, total) {
    if (!(opt.creditKinds || {})[doc.kind]) return '';
    var t = opt.printedAt ? dTh(opt.printedAt.slice(0, 10)) + ' เวลา ' + opt.printedAt.slice(11, 16).replace(':', '.') + ' น.' : '';
    var left = opt.mode === 'preview' ? 'ฉบับให้เจ้าของข้อมูลตรวจทาน · ยังไม่ใช่ฉบับลงนาม' : 'พิมพ์โดยระบบอัตโนมัติ ฝ่ายทรัพยากรบุคคล เมื่อวันที่ ' + t;
    return '<div class="credit"><span>' + left + '</span><span>เลขอ้างอิง ' + e(doc.refNo || '-') + ' · หน้า ' + page + '/' + total + '</span></div>';
  }
  function page(inner, doc, opt, n, total, extra) {
    return '<section class="page' + (extra ? ' ' + extra : '') + (opt.mode === 'preview' ? ' preview' : '') + '">' + inner + credit(doc, opt, n, total) + '</section>';
  }
  function sig(role, name, lines) {
    return '<div class="sg"><div class="who">ลงชื่อ ......................................................... ' + e(role) + '</div>' +
      '<div>( ' + (name ? '<span class="nm">' + e(name) + '</span>' : '<span class="nm blank">&nbsp;</span>') + ' )</div>' +
      (lines || []).filter(String).map(function (l) { return '<div>' + e(l) + '</div>'; }).join('') + '</div>';
  }

  /* ───────── หนังสือสัญญาไม่ทำเวชฯ (3 หน้า) ───────── */
  function npContract(doc, opt) {
    var s = doc.snapshot, p = s.person, o = s.opts, a = p.addr || {}, n = nm(p), r = s.round || {}, dir = (s.signers || {}).director || {};
    var b = dParts(p.dob), married = /สมรส/.test(p.marital || ''), sp = p.spouse || {};
    var spAddr = sp.sameAddr === false && sp.addr ? sp.addr : a;
    var P1 =
      '<h1>หนังสือสัญญาการรับเงินเพิ่มพิเศษสำหรับแพทย์ สัตวแพทย์ ทันตแพทย์ และเภสัชกร<br>ที่ปฏิบัติงานในสถานบริการของสภากาชาดไทยและไม่ทำเวชปฏิบัติส่วนตัว<br>และหรือปฏิบัติงานโรงพยาบาลเอกชน</h1><div class="rule"></div>' +
      '<div class="right"><p>เขียนที่ ' + e(r.place || s.place) + '</p><div class="row">วันที่ ' + F(dTh(r.signDate), 5) + '</div></div>' +
      '<p class="mt"><b>หนังสือฉบับนี้ทำขึ้นไว้เพื่อเป็นหลักฐานแสดงว่า</b></p>' +
      '<div class="row ind0">ข้าพเจ้า ชื่อ ' + F(n.first) + ' นามสกุล ' + F(n.last) + '</div>' +
      '<div class="row">ตำแหน่ง ' + F(p.position) + ' ระดับ ' + FX(p.level || '-') + ' ปฏิบัติงานที่หน่วย ' + F(p.unit || '-') + '</div>' +
      '<div class="row">ฝ่าย ' + F(String(p.dept || '').replace(/^ฝ่าย/, '')) + ' สังกัด <b>โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา</b></div>' +
      '<div class="row">เกิดเมื่อวันที่ ' + FX(b.d) + ' เดือน ' + F(b.m) + ' พ.ศ. ' + FX(b.y) + ' อยู่บ้านเลขที่ ' + F(a.houseNo) + ' หมู่ที่ ' + FX(a.moo || '-') + '</div>' +
      '<div class="row">ตรอก/ซอย ' + F(a.soi || '-') + ' ถนน ' + F(a.road || '-') + ' ตำบล/แขวง ' + F(a.tambon) + '</div>' +
      '<div class="row">อำเภอ/เขต ' + F(a.amphoe) + ' จังหวัด ' + F(a.province) + ' โทรศัพท์ ' + F(p.phone) + '</div>' +
      '<div class="row">ชื่อบิดา ' + F(p.father) + ' ชื่อมารดา ' + F(p.mother) + '</div>' +
      '<div class="row">ชื่อสามี/ภรรยา ' + F(married ? sp.name : '-') + ' ได้รับอนุมัติให้มีสิทธิได้รับเงินเพิ่มพิเศษฯ</div>' +
      '<div class="row">เป็นเงินเดือนละ ' + FX(money(o.amount), 'w3') + ' บาท ( ' + F(bahtText(o.amount)) + ' )</div>' +
      '<div class="row">นับตั้งแต่ ' + F(dTh(o.effDate)) + ' เป็นต้นไป</div>' +
      '<p class="ind mt">โดยระหว่างเวลาที่ข้าพเจ้าได้รับเงินเพิ่มพิเศษดังกล่าว ข้าพเจ้าซึ่งในสัญญานี้เรียกว่า “ผู้ให้สัญญา” ฝ่ายหนึ่ง ขอให้สัญญาไว้แก่สภากาชาดไทย ซึ่งในสัญญานี้เรียกว่า “ผู้รับสัญญา” อีกฝ่ายหนึ่ง ดังมีข้อความต่อไปนี้</p>' +
      '<p class="cl">ข้อ 1 ผู้ให้สัญญาได้ทราบและเข้าใจหลักเกณฑ์และแนวทางปฏิบัติในการจ่ายเงินเพิ่มพิเศษสำหรับ แพทย์ สัตวแพทย์ ทันตแพทย์ และเภสัชกรที่ไม่ทำเวชปฏิบัติส่วนตัว และหรือปฏิบัติงานโรงพยาบาลเอกชน ตามที่สภากาชาดไทยได้กำหนดไว้แล้ว ขณะทำสัญญานี้ ผู้ให้สัญญาขอผูกพันและจะปฏิบัติตามหลักเกณฑ์ดังกล่าว ทั้งที่มีอยู่แล้วและที่จะมีขึ้นในภายหน้าโดยเคร่งครัด</p>' +
      '<p class="cl">ข้อ 2 ในระหว่างที่สัญญามีผลบังคับใช้อยู่และผู้ให้สัญญาจะได้รับเงินเพิ่มพิเศษหรือไม่ก็ตาม ผู้ให้สัญญาจะไม่ทำเวชปฏิบัติส่วนตัว และหรือปฏิบัติงานในสถานพยาบาล หรือโรงพยาบาลเอกชน ไม่ว่าจะเป็นการตรวจรักษา การรับปรึกษา การแปรผล การตรวจวินิจฉัย หรือการให้บริการทางสัตวแพทย์ ทันตกรรมใด ๆ การจ่ายยา การผลิตยา หรือการให้บริการของการแพทย์และการสาธารณสุขใด ๆ ซึ่งมีความหมายในทำนองเดียวกัน</p>' +
      '<p class="cl">ข้อ 3 ผู้ให้สัญญาจะไม่ประพฤติผิดจริยธรรมแห่งวิชาชีพ หรือข้อจำกัดและเงื่อนไขในการประกอบโรคศิลปะจนถูกลงโทษให้พักใช้ใบอนุญาตประกอบวิชาชีพ หรือถูกเพิกถอนใบอนุญาตประกอบวิชาชีพ ตลอดระยะเวลาที่ผู้ให้สัญญายังมีข้อผูกพันตามสัญญานี้</p>';
    var P2 = '<p class="pno">- 2 -</p>' +
      '<p class="cl">ข้อ 4 ผู้ให้สัญญาจะต้องเป็นผู้ที่ไม่อยู่ในระหว่างการลาศึกษา การลาฝึกอบรม หรือดูงาน หรือการลาประเภทอื่น ที่ทำให้เหลือวันปฏิบัติงานน้อยกว่า 15 วันทำการในเดือนนั้น เว้นแต่การลาอุปสมบท การลาไปประกอบพิธีฮัจย์ หรือการลาคลอดบุตร กรณีตามวรรคหนึ่ง หากมีวันปฏิบัติราชการถึง 15 วันทำการให้ได้รับเงินพิเศษ</p>' +
      '<p class="cl">ข้อ 5 ถ้าผู้ให้สัญญาไม่ปฏิบัติ หรือปฏิบัติฝ่าฝืนสัญญานี้ ผู้ให้สัญญาจะไม่มีสิทธิรับเงินเพิ่มพิเศษฯ ในเดือนนั้นทั้งเดือน</p>' +
      '<p class="cl">กรณีที่ผู้ให้สัญญาถูกเพิกถอน หรือถูกสั่งพักใบอนุญาตประกอบวิชาชีพ ให้ถือว่าเป็นอันหมดสิทธิได้รับเงินเพิ่มพิเศษในเดือนที่ถูกสั่งพัก หรือเพิกถอนใบอนุญาตแล้วแต่กรณี</p>' +
      '<p class="cl">ข้อ 6 ผู้ให้สัญญาจะบอกเลิกสัญญาโดยไม่ได้รับความยินยอมเป็นลายลักษณ์อักษรจากผู้รับสัญญามิได้ การแจ้งของดรับเงินเพิ่มพิเศษเป็นครั้งคราวในระหว่างสัญญามีผลบังคับใช้อยู่จะกระทำมิได้</p>' +
      '<p class="cl">การบอกเลิกสัญญาตามวรรคหนึ่ง ผู้ให้สัญญาจะต้องแจ้งให้ผู้รับสัญญาทราบโดยยื่นหนังสือผ่านคณะกรรมการพิจารณาจ่ายเงินเพิ่มพิเศษล่วงหน้าไม่น้อยกว่า 30 วัน ก่อนถึงวันเลิกรับเงินเพิ่มพิเศษ</p>' +
      '<p class="cl">ข้อ 7 ถ้าผู้ให้สัญญาซึ่งรับเงินเพิ่มพิเศษแล้ว ปรากฏว่าเป็นผู้ประพฤติผิดสัญญาในข้อหนึ่งข้อใดในสัญญานี้ ผู้ให้สัญญาจะต้องคืนเงินเพิ่มพิเศษให้แก่ผู้รับสัญญาตามที่ได้รับจากสภากาชาดไทย รวมทั้งต้องจ่ายเงินเป็นเบี้ยปรับให้แก่ผู้รับสัญญาอีกสองเท่าของเงินที่ผู้ให้สัญญาจะต้องชดใช้คืนบวกกับดอกเบี้ยร้อยละ 15 ต่อปีของเงินที่ได้รับทั้งหมดนับแต่วันที่ผิดสัญญา</p>' +
      '<p class="cl">เพื่อประโยชน์ในการคำนวณค่าปรับตามวรรคหนึ่ง เมื่อผู้ให้สัญญามีสิทธิได้รับเงินเพิ่มพิเศษตามสัญญาแล้ว แต่ไม่รับเงินนั้นด้วยเหตุใด ๆ ให้ถือว่าผู้ให้สัญญาได้รับเงินเพิ่มพิเศษนั้นแล้วตั้งแต่วันที่มีสิทธิ</p>' +
      '<p class="cl">ข้อ 8 ผู้ให้สัญญาจะต้องนำเงินไปชำระแก่ผู้รับสัญญาแก่สภากาชาดไทยภายใน 7 วัน นับแต่วันที่ได้รับแจ้งให้ทราบถึงยอดเงินที่ต้องชำระ และผู้ให้สัญญายอมให้ผู้รับสัญญารับ หรือหักเอาเงินบำเหน็จบำนาญหรือเงินอื่นใดที่ผู้ให้สัญญามีสิทธิได้รับจากสภากาชาดไทย เพื่อเอาชดใช้เงินที่ผู้ให้สัญญาต้องรับผิดชอบตามสัญญานี้ และยอมให้บังคับเอาจากทรัพย์สินอื่น ๆ ของผู้ให้สัญญาได้อีก หากผู้ให้สัญญาไม่ชำระภายในกำหนด หรือชำระให้แต่ไม่ครบ ทั้งนี้จะโดยความยินยอมของผู้รับสัญญาหรือไม่ก็ตาม ผู้ให้สัญญายอมให้คิดดอกเบี้ยร้อยละ 15 ต่อปี ของเงินที่ยังไม่ได้ชำระอีกด้วย</p>' +
      '<p class="cl">ข้อ 9 ผู้รับสัญญาสงวนไว้ซึ่งสิทธิที่จะจ่าย หรืองดจ่ายเงินเพิ่มพิเศษตามสัญญานี้ได้ โดยไม่ต้องเลิกสัญญานี้ เมื่อผู้ให้สัญญาประพฤติ หรือปฏิบัติผิดสัญญานี้ หรือเมื่อสภากาชาดไทยได้ประกาศใช้หลักเกณฑ์การจ่ายเงินประจำตำแหน่งแล้ว</p>' +
      '<p class="cl">ข้อ 10 ผู้ให้สัญญายอมให้ผู้รับสัญญาฟ้องร้องบังคับชำระหนี้ได้ทันที โดยมิต้องบอกกล่าวก่อน</p>' +
      '<p class="cl">หนังสือสัญญานี้ทำขึ้นสามฉบับมีข้อความตรงกัน โดยสภากาชาดไทยถือไว้ 2 ฉบับ และผู้ให้สัญญาถือไว้ 1 ฉบับ</p>';
    var P3 = '<p class="pno">- 3 -</p>' +
      '<p class="cl">ผู้ให้สัญญาได้อ่านและเข้าใจข้อความในสัญญานี้โดยตลอด เห็นว่าถูกต้องตรงตามความประสงค์ทุกประการแล้ว จึงได้ลงลายมือชื่อไว้เป็นหลักฐานสำคัญต่อหน้าพยาน</p>' +
      '<div class="sig">' + sig('ผู้ให้สัญญา', p.fullName) + sig('ผู้รับสัญญา', dir.name, [dir.line1, dir.line2, dir.line3]) +
      sig('พยาน', r.witness1) + sig('พยาน', r.witness2) + '</div>' +
      (married ? '<div class="spouse"><h2>คำยินยอมในกรณีผู้ให้สัญญาเป็นผู้มีคู่สมรส</h2>' +
        '<div class="row ind0">ข้าพเจ้าชื่อ ' + F(nm({ firstName: (sp.name || '').split(' ')[0] }).first) + ' นามสกุล ' + F((sp.name || '').split(' ').slice(1).join(' ')) + '</div>' +
        '<div class="row">อยู่บ้านเลขที่ ' + F(spAddr.houseNo) + ' หมู่ที่ ' + FX(spAddr.moo || '-') + ' ตรอก/ซอย ' + F(spAddr.soi || '-') + ' ถนน ' + F(spAddr.road || '-') + '</div>' +
        '<div class="row">ตำบล/แขวง ' + F(spAddr.tambon) + ' อำเภอ/เขต ' + F(spAddr.amphoe) + ' จังหวัด ' + F(spAddr.province) + '</div>' +
        '<div class="row">โทรศัพท์ ' + FX(sp.phone, 'w4') + ' ซึ่งเป็นสามี/ภรรยาของผู้ให้สัญญา</div>' +
        '<p>ยอมผูกพันตนตามสัญญานี้และยินยอมในการที่ภรรยา/สามีของข้าพเจ้าทำสัญญานี้ จึงลงลายมือชื่อต่อหน้าพยานไว้เป็นหลักฐาน</p>' +
        '<div class="sig">' + sig('ผู้ยินยอม', sp.name) + sig('พยาน', r.witness1) + sig('พยาน', r.witness2) + '</div></div>' : '');
    return [P1, P2, P3].map(function (h, i) { return page(h, doc, opt, i + 1, 3); }).join('');
  }

  /* ───────── แบบคำขอรับเงินไม่ทำเวชฯ (แพทย์/ทันตแพทย์ 2 หน้า · เภสัชกร มีผู้ช่วยผู้อำนวยการเพิ่ม) ───────── */
  function serviceLen(start, at) {
    if (!start || !at) return '-';
    var y = +at.slice(0, 4) - +start.slice(0, 4), m = +at.slice(5, 7) - +start.slice(5, 7);
    if (+at.slice(8, 10) < +start.slice(8, 10)) m--;
    if (m < 0) { y--; m += 12; }
    if (y < 0) return '-';
    return (y ? y + ' ปี ' : '') + (m ? m + ' เดือน' : (y ? '' : 'ไม่ถึง 1 เดือน'));
  }
  function npReq(doc, opt) {
    var s = doc.snapshot, p = s.person, o = s.opts, a = p.addr || {}, r = s.round || {}, sg = s.signers || {}, st = dParts(p.startDate);
    var pharm = o.variant === 'PHARM';
    var dept = String(p.dept || '').replace(/^ฝ่าย/, '');
    var P1 =
      '<h1>แบบคำขอรับเงินเพิ่มพิเศษสำหรับแพทย์ สัตวแพทย์ ทันตแพทย์ และเภสัชกร<br>ที่ปฏิบัติงานในสถานบริการของสภากาชาดไทยและไม่ทำเวชปฏิบัติส่วนตัว<br>และหรือปฏิบัติงานโรงพยาบาลเอกชน</h1><div class="rule dash"></div>' +
      '<div class="right"><p>ที่ ' + e(s.place) + '</p><div class="row">วันที่ ' + F(dTh(r.signDate), 5) + '</div></div>' +
      '<div class="row mt">เรียน ' + F('หัวหน้าฝ่าย' + dept, 8) + '</div>' +
      '<div class="row ind0">ข้าพเจ้า ' + F(p.fullName, 7) + ' อายุ ' + FX(p.age) + ' ปี</div>' +
      '<div class="row">ตำแหน่ง ' + F(p.position, 5) + ' สาขา ' + F(p.unit || '-', 4) + ' ระดับ ' + FX(p.level || '-') + '</div>' +
      '<div class="row">ได้เข้าทำงานในสภากาชาดไทย ตั้งแต่วันที่ ' + FX(st.d) + ' เดือน ' + F(st.m) + ' พ.ศ. ' + FX(st.y) + ' รวมเวลา ' + F(serviceLen(p.startDate, r.signDate) || '-', 2) + '</div>' +
      '<div class="row">มีภูมิลำเนาอยู่บ้านเลขที่ ' + F(a.houseNo, 2) + ' ถนน ' + F(a.road || '-') + ' ตำบล/แขวง ' + F(a.tambon) + '</div>' +
      '<div class="row">อำเภอ/เขต ' + F(a.amphoe) + ' จังหวัด ' + F(a.province) + ' รหัสไปรษณีย์ ' + F(a.zip, 1.8) + '</div>' +
      '<div class="row">โทรศัพท์ ' + F(p.phone, 3.2) + ' สังกัดกอง <b>โรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา</b></div>' +
      '<div class="row">ฝ่าย ' + F(dept, 4) + ' หน่วยงาน ' + F(p.unit || dept, 4) + ' โทรศัพท์ 038-320-200 ต่อ ' + F('', 1.6) + '</div>' +
      '<p>มีความประสงค์จะขอรับเงินเพิ่มพิเศษสำหรับแพทย์ สัตวแพทย์ ทันตแพทย์ และเภสัชกรที่ปฏิบัติงานในสถานบริการของสภากาชาดไทย ซึ่งไม่ได้ทำเวชปฏิบัติส่วนตัว และหรือปฏิบัติงานในโรงพยาบาลเอกชน</p>' +
      '<div class="row">เป็นเงินเดือนละ ' + FX(money(o.amount), 'w3') + ' บาท ( ' + F(bahtText(o.amount)) + ' )</div>' +
      '<p class="ind">ทั้งนี้ ข้าพเจ้าขอให้คำรับรองว่าข้าพเจ้า จะตั้งใจปฏิบัติงาน หรือได้ปฏิบัติงานมาแล้วด้วยความเสียสละ โดยมีผลงานเป็นที่ประจักษ์ดังนี้</p>' +
      '<div class="row">' + F(o.workNote || '', 15) + '</div>' +
      '<p>ซึ่งพร้อมที่จะได้รับการประเมินตลอดเวลา ข้าพเจ้าได้รับทราบหลักเกณฑ์และแนวทางปฏิบัติในการจ่ายเงินเพิ่มพิเศษสำหรับแพทย์ สัตวแพทย์ ทันตแพทย์ และเภสัชกรที่ปฏิบัติงานในสถานบริการของสภากาชาดไทย โดยไม่ทำเวชปฏิบัติส่วนตัว และหรือปฏิบัติงานโรงพยาบาลเอกชน ตามที่สภากาชาดไทยกำหนดแล้ว</p>' +
      '<p class="ind">จึงเรียนมาเพื่อโปรดพิจารณาอนุมัติจ่ายเงินเพิ่มพิเศษตามหลักเกณฑ์ที่สภากาชาดไทยกำหนดให้แก่ข้าพเจ้าต่อไป พร้อมกับคำขอนี้ข้าพเจ้าได้แนบหลักฐาน</p>' +
      '<div class="lst"><div>1. สำเนาทะเบียนบ้าน</div><div>2. หลักฐานการแจ้งเลิก (ถ้ามี)</div><div class="in">2.1 เป็นผู้ดำเนินการสถานพยาบาลส่วนตัว</div><div class="in">2.2 เป็นผู้ดำเนินการ หรือร่วมดำเนินการในสถานพยาบาล หรือโรงพยาบาลเอกชน</div><div class="in">2.3 เป็นผู้ดำเนินการ หรือควบคุมห้างร้าน บริษัท โรงงานที่ขาย หรือผลิตยา</div></div>' +
      '<div class="sig">' + sig('', p.fullName) + '</div>';
    function step(to, toName, byLines) {
      return '<div class="step"><div class="row">เรียน ' + e(to) + ' ( ' + F(toName, 5) + ' )</div><div class="dotline"><u>เพื่อโปรดพิจารณา</u></div>' +
        '<div class="sg"><div class="who">(ลงชื่อ) .........................................................</div><div>( <span class="nm blank">&nbsp;</span> )</div>' + (byLines || []).filter(String).map(function (l) { return '<div>' + e(l) + '</div>'; }).join('') + '</div></div>';
    }
    var vice = sg.vice || {}, asst = sg.assist || {}, dir = sg.director || {};
    var P2 = '<p class="pno">- 2 -</p>' +
      (pharm ? step('ผู้ช่วยผู้อำนวยการ', asst.name, []) + step('รองผู้อำนวยการ', vice.name, [asst.line1 || 'ผู้ช่วยผู้อำนวยการโรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา'])
        : step('รองผู้อำนวยการ', vice.name, [])) +
      step('ผู้อำนวยการ', dir.name, [vice.line1 || 'รองผู้อำนวยการโรงพยาบาลสมเด็จพระบรมราชเทวี ณ ศรีราชา']) +
      '<div class="step"><div class="row">เรียน คณะกรรมการพิจารณาจ่ายเงินเพิ่มพิเศษ</div><div class="dotline"><u>เพื่อพิจารณาและดำเนินการต่อไป</u></div>' +
      '<div class="sg"><div class="who">(ลงชื่อ) .........................................................</div><div>(' + e(dir.name || '') + ')</div><div>' + e(dir.line1 || '') + '</div><div>' + e(dir.line2 || '') + '</div></div></div>';
    return [P1, P2].map(function (h, i) { return page(h, doc, opt, i + 1, 2); }).join('');
  }

  /* ───────── แบบขอรับค่าตอบแทน พ.ต.ส. (FM-HRM-008 ถึง 012 · 3 หน้า) ───────── */
  var PTS_FORM_NO = { DOC: 'FM-HRM-008/02', DENT: 'FM-HRM-009/02', NURSE: 'FM-HRM-010/02', ALLIED: 'FM-HRM-011/02', PHARM: 'FM-HRM-012/03' };
  var PTS_POS = { DOC: 'นายแพทย์', DENT: 'ทันตแพทย์', NURSE: 'พยาบาลวิชาชีพ', ALLIED: 'สหสาขาวิชาชีพ', PHARM: 'เภสัชกร' };
  function evidence(line, x) {
    var lic = line === 'DOC' ? 'ใบอนุญาตเป็นผู้ประกอบวิชาชีพเวชกรรม' : line === 'DENT' ? 'ใบอนุญาตเป็นผู้ประกอบวิชาชีพทันตกรรม' : line === 'PHARM' ? 'ใบอนุญาตเป็นผู้ประกอบวิชาชีพเภสัชกรรม' : line === 'NURSE' ? 'ใบอนุญาตเป็นผู้ประกอบวิชาชีพการพยาบาล' : 'ใบอนุญาตเป็นผู้ประกอบวิชาชีพ/โรคศิลปะ';
    var out = [lic];
    if (/^(นพ2[1]|นพ3|ทพ31)/.test(x.code)) out.push('วุฒิบัตร หรือหนังสืออนุมัติแสดงความรู้ความชำนาญในการประกอบวิชาชีพ');
    if (/^(นพ22|ทพ21)/.test(x.code)) out.unshift('ปริญญาบัตร (โท/เอก)');
    if (/^(พว26|พว31|พว32|พว33|พว35|พว25)/.test(x.code)) out.push('ประกาศนียบัตรหลักสูตรเฉพาะทางที่สภาการพยาบาลรับรอง');
    if (/^ภก2/.test(x.code)) out.push('หนังสือมอบหมายงานจากผู้บังคับบัญชา');
    return out;
  }
  function ptsTable(rates, o, mode, minGrp) {
    var rows = rates.filter(function (x) { return x.grp >= (minGrp || 1); }), h = '';
    var span = {}; rows.forEach(function (x) { span[x.grp] = (span[x.grp] || 0) + 1; });
    h += '<table class="ft"><thead><tr><th style="width:1.1cm">ระบุ</th><th style="width:1.2cm">กลุ่มที่</th><th style="width:1.5cm">รหัส</th><th>คุณลักษณะ</th><th style="width:2cm">อัตราไม่เกิน<br>(บาท/เดือน)</th><th style="width:5cm">(สำเนา) เอกสารประกอบ<br>ลงนามรับรองสำเนาถูกต้อง</th></tr></thead><tbody>';
    var seen = {};
    rows.forEach(function (x) {
      var hit = o.mode === mode && o.code === x.code, first = !seen[x.grp]; seen[x.grp] = 1;
      var grpHit = o.mode === mode && o.grp == x.grp;
      var ev = first ? evidence(o.line, x).map(function (t) { return '<div><span class="box sm">' + (grpHit ? '✓' : '') + '</span> ' + e(t) + '</div>'; }).join('') : '';
      h += '<tr' + (hit ? ' class="hit"' : '') + '><td class="c"><span class="box">' + (hit ? '✓' : '') + '</span></td>' +
        (first ? '<td class="c" rowspan="' + span[x.grp] + '">' + x.grp + '</td>' : '') + '<td class="c">' + e(x.code) + '</td><td>' + e(x.desc) +
        (hit && o.specialty ? '<div class="spec">(ระบุสาขา) <span class="fv">' + e(o.specialty) + '</span></div>' : '') + '</td>' +
        (first ? '<td class="c" rowspan="' + span[x.grp] + '">' + money(x.rate) + '</td><td class="ev" rowspan="' + span[x.grp] + '">' + ev + '</td>' : '') + '</tr>';
    });
    return h + '</tbody></table>';
  }
  function ptsForm(doc, opt) {
    var s = doc.snapshot, p = s.person, o = s.opts, rates = s.rates || [], st = dParts(p.startDate), ef = dParts(o.effDate);
    var fno = PTS_FORM_NO[o.line] || 'FM-HRM', pos = PTS_POS[o.line] || '';
    var ttl = String(p.title || ''), first = p.firstName || '', last = p.lastName || '';
    var head = '<div class="ptshead"><div class="bx">เลขที่สารบรรณของฝ่ายฯ<br>ที่ ............/............<br>วันที่ ......./......./.......</div>' +
      '<div class="tt">แบบขอรับค่าตอบแทน<br>ประเภทเงินเพิ่มสำหรับตำแหน่งที่มีเหตุพิเศษของผู้ปฏิบัติงาน<br>ด้านการสาธารณสุข (พ.ต.ส.) ตำแหน่ง <u>' + e(pos) + '</u></div>' +
      '<div class="bx">สด.ทบ.ที่ ............/............<br>วันที่ ......./......./.......</div></div>';
    var info = '<p class="sm b">ข้อมูลส่วนตัว (กรอกข้อมูลให้ครบถ้วน)</p>' +
      '<div class="row sm">1. รหัสประจำตัว ' + F(p.empCode, 2.3) + ' คำนำหน้าชื่อ ' + F(ttl, 2) + ' ชื่อ ' + F(first, 3) + ' นามสกุล ' + F(last, 3) + '</div>' +
      '<div class="row sm">2. บรรจุเข้าปฏิบัติงานเมื่อวันที่ ' + F(dTh(p.startDate), 3.4) + ' ตำแหน่ง ' + F(p.position, 5) + '</div>' +
      '<div class="row sm">&nbsp;&nbsp;&nbsp;ฝ่าย ' + F(String(p.dept || '').replace(/^ฝ่าย/, ''), 6) + ' หน่วยงาน ' + F(p.unit || '-', 5) + '</div>' +
      '<div class="row sm">3. ขอรับค่าตอบแทนประเภท พ.ต.ส. สำหรับตำแหน่ง <u>' + e(pos) + '</u> ตั้งแต่วันที่ ' + F(ef.d ? ef.d + '/' + (+((o.effDate || '').slice(5, 7))) + '/' + ef.y : '', 3) + ' เป็นต้นไป</div>' +
      '<div class="row sm">&nbsp;&nbsp;&nbsp;เลขที่ใบอนุญาตประกอบวิชาชีพ ' + F(p.licenseNo, 3) + ' ออกให้ ณ วันที่ ' + F(dTh(p.licenseDate), 3.2) + '</div>' +
      '<p class="xs c it">(โปรดระบุเครื่องหมาย ✓ และกรุณาส่งแบบฟอร์มมายังฝ่ายทรัพยากรบุคคล พร้อมแนบเอกสารประกอบครบถ้วน)</p>';
    var newBox = '<div class="secbar"><span class="box">' + (o.mode === 'NEW' ? '✓' : '') + '</span> กรณีขอครั้งแรก (บรรจุใหม่ / โอนย้าย)</div>' +
      '<p class="xs c it">(โปรดส่งเอกสารคืน ฝ่ายทรัพยากรบุคคล ภายใน 3 วันทำการ (นับจากวันที่บรรจุ) เพื่อให้ได้รับเงิน พ.ต.ส. พร้อมกับเงินเดือน เดือนแรก)</p>' + ptsTable(rates, o, 'NEW', 1);
    var chBox = '<div class="secbar"><span class="box">' + (o.mode === 'CHANGE' ? '✓' : '') + '</span> กรณีเปลี่ยนกลุ่ม</div>' +
      '<p class="xs c">เปลี่ยน <b>จาก</b> กลุ่มที่ ' + FX(o.mode === 'CHANGE' ? o.oldGrp : '') + ' รหัสจัดกลุ่ม ' + FX(o.mode === 'CHANGE' ? o.oldCode : '') + ' <b>เป็น</b> กลุ่มที่ ' + FX(o.mode === 'CHANGE' ? o.grp : '') + ' รหัสจัดกลุ่ม ' + FX(o.mode === 'CHANGE' ? o.code : '') + '</p>' +
      ptsTable(rates, o, 'CHANGE', 2);
    var applicant = '<table class="ft two"><tr><th>ส่วนของ : ผู้ขอรับเงิน</th><th>ความเห็นผู้บังคับบัญชา</th></tr><tr><td>' +
      '<p class="ind sm">ข้าพเจ้าขอรับรองว่ามีคุณลักษณะประกอบการจัดกลุ่ม เพื่อขอรับค่าตอบแทน พ.ต.ส. ว่าเป็นความจริง หากข้าพเจ้าแสดงข้อมูลผิดพลาด และได้รับค่าตอบแทน พ.ต.ส. ไปแล้ว ข้าพเจ้ายินดีนำเงินที่ได้รับไปแล้วส่งคืนให้แก่สภากาชาดไทยตามจำนวนที่ได้รับที่ผิดพลาดไป</p>' +
      '<div class="sgs"><div>ลงชื่อ.......................................................</div><div>( <span class="nm">' + e(p.fullName) + '</span> )</div><div>วันที่ ...........................</div></div></td><td>' +
      '<p class="sm"><b>เรียน หัวหน้าฝ่ายทรัพยากรบุคคล</b></p><p class="sm"><span class="box">&nbsp;</span> เห็นชอบ</p><p class="sm"><span class="box">&nbsp;</span> ไม่เห็นชอบ เพราะ .......................................</p><p class="sm ind">จึงเรียนมาเพื่อโปรดดำเนินการต่อไป</p>' +
      '<div class="sgs"><div>.......................................................</div><div>(.......................................................)</div><div>หัวหน้าฝ่าย ' + e(String(p.dept || '').replace(/^ฝ่าย/, '')) + '</div><div>วันที่ ...........................</div></div></td></tr></table>';
    var hr = '<table class="ft two"><tr><th colspan="2" class="bar">ส่วนของ : ฝ่ายทรัพยากรบุคคล</th></tr><tr><th><span class="box">&nbsp;</span> กรณี : <u>เป็นไป</u>ตามหลักเกณฑ์</th><th><span class="box">&nbsp;</span> กรณี : <u>ไม่เป็นไป</u>ตามหลักเกณฑ์</th></tr><tr><td>' +
      '<p class="sm"><b>เรียน หัวหน้าฝ่ายทรัพยากรบุคคล</b></p><p class="sm ind">ได้ตรวจสอบเอกสารหลักฐานต่าง ๆ ประกอบการพิจารณาเรียบร้อยแล้ว ถูกต้อง ครบถ้วน ผู้ขอรับค่าตอบแทนประเภท พ.ต.ส. เป็นบุคลากรในตำแหน่ง ' + F(p.position, 3) +
      ' กลุ่มที่ ' + FX(o.grp) + ' รหัสจัดกลุ่ม ' + FX(o.code) + ' เป็นผู้มีคุณสมบัติที่จะได้รับเงินค่าตอบแทน พ.ต.ส. ในอัตรา ' + FX(money(o.rate)) + ' บาท/เดือน ตั้งแต่วันที่ ' + F(dTh(o.effDate), 3) + ' เป็นต้นไป</p>' +
      '<div class="sgs"><div>ลงชื่อ.......................................................ผู้ตรวจสอบ</div><div>(.......................................................)</div><div>ตำแหน่ง .......................................</div><div>วันที่ ...........................</div></div></td><td>' +
      '<p class="sm"><b>เรียน หัวหน้าฝ่ายทรัพยากรบุคคล</b></p><p class="sm ind">การขอรับเงิน พ.ต.ส. ในครั้งนี้ไม่เป็นไปตามหลักเกณฑ์ จึงเรียนมาเพื่อโปรดทราบและเห็นควรส่งเรื่องกลับฝ่ายเพื่อทราบ</p><div class="sgs"><div>ลงชื่อ.......................................ผู้ตรวจสอบ</div><div>วันที่ ...........................</div></div></td></tr>' +
      '<tr><th colspan="2" class="bar">ส่วนของ : การนำเสนอเพื่อพิจารณา</th></tr><tr><td><p class="sm"><b>เรียน รองผู้อำนวยการ</b></p><p class="sm ind">เพื่อขออนุมัติจ่าย พ.ต.ส. ให้กับ ' + F(p.fullName, 3.5) + ' ตำแหน่ง ' + F(p.position, 2.5) + ' กลุ่มที่ ' + FX(o.grp) + ' รหัสจัดกลุ่ม ' + FX(o.code) +
      ' ในอัตรา ' + FX(money(o.rate)) + ' บาท/เดือน โดยมีผลตั้งแต่วันที่ ' + F(dTh(o.effDate), 3) + ' เป็นต้นไป จึงเรียนมาเพื่อโปรดพิจารณา</p>' +
      '<div class="sgs"><div>.......................................................</div><div>(' + e(((s.signers || {}).hrHead || {}).name || '.......................................................') + ')</div><div>หัวหน้าฝ่ายทรัพยากรบุคคล</div><div>วันที่ ...........................</div></div></td><td>' +
      '<p class="sm"><b>เรียน หัวหน้าฝ่ายทรัพยากรบุคคล</b></p><p class="sm"><span class="box">&nbsp;</span> อนุมัติ ตามหลักเกณฑ์ฯ</p><p class="sm"><span class="box">&nbsp;</span> ไม่อนุมัติ เนื่องจาก ...................................</p><p class="sm ind">จึงเรียนมาเพื่อดำเนินการต่อไป</p>' +
      '<div class="sgs"><div>.......................................................</div><div>(' + e(((s.signers || {}).vice || {}).name || '.......................................................') + ')</div><div>รองผู้อำนวยการ</div><div>วันที่ ...........................</div></div></td></tr>' +
      '<tr><td colspan="2"><p class="sm"><b>เรียน</b> ............................................... (งานบริหารเงินเดือนฯ) <b>สำเนา</b> หัวหน้าฝ่าย ' + e(String(p.dept || '').replace(/^ฝ่าย/, '')) + ' เพื่อทราบและดำเนินการต่อไป</p>' +
      '<div class="sgs"><div>.......................................................</div><div>(.......................................................)</div><div>หัวหน้าฝ่ายทรัพยากรบุคคล &nbsp; วันที่ .....................</div></div></td></tr></table>';
    var foot = function (n) { return '<div class="fno"><span>' + n + ' / 3</span><span>' + fno + '</span></div>'; };
    return [head + info + newBox + foot(1), chBox + applicant + foot(2), hr + foot(3)].map(function (h, i) { return page(h, doc, opt, i + 1, 3, 'pts'); }).join('');
  }

  var RENDER = { NP_CONTRACT: npContract, NP_REQ: npReq, PTS_FORM: ptsForm };
  function render(docs, opt) {
    opt = opt || {};
    opt.creditKinds = opt.creditKinds || { NP_CONTRACT: 1, NP_REQ: 1, PTS_FORM: 1 };
    return (docs || []).map(function (d) { var fn = RENDER[d.kind]; return fn ? fn(d, opt) : '<section class="page"><p>ยังไม่รองรับเอกสาร ' + e(d.kind) + '</p></section>'; }).join('');
  }

  /* พิมพ์: ใส่หน้าไว้ใน #printArea แล้วสั่งพิมพ์ เมื่อปิดหน้าต่างพิมพ์ล้างทิ้ง (กันชั้นค้างทับหน้า — บทเรียน 41) */
  function print(html) {
    var area = document.getElementById('printArea');
    area.innerHTML = html;
    document.body.classList.add('printing');
    var done = function () { document.body.classList.remove('printing'); area.innerHTML = ''; window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    fontsReady().then(function () {
      autofit(area);
      setTimeout(function () {
        try { window.print(); } catch (x) { }
        setTimeout(function () { if (document.body.classList.contains('printing')) done(); }, 1500);
      }, 200);
    });
  }
  /* ย่อตัวอักษรในช่องกรอกที่ข้อความยาวเกินช่อง ทีละ 0.5pt (ไม่ให้ถูกตัดเป็น …) */
  function autofit(root) {
    var hid = root && root.id === 'printArea' && !root.offsetWidth, keep = hid ? root.style.cssText : '';
    if (hid) root.style.cssText = 'display:block;position:absolute;left:-10000px;top:0';
    try { autofit2(root); } finally { if (hid) root.style.cssText = keep; }
  }
  function autofit2(root) {
    var L = (root || document).querySelectorAll('.page .f, .page .nm');
    for (var i = 0; i < L.length; i++) {
      var el = L[i], fs = parseFloat(getComputedStyle(el).fontSize) * 0.75, n = 0;
      while (el.scrollWidth > el.clientWidth + 1 && fs > 8 && n++ < 16) { fs -= 0.5; el.style.fontSize = fs + 'pt'; }
    }
  }
  /* โหลดฟอนต์เอกสารให้เสร็จก่อนพิมพ์ (ถ้ายังโหลดไม่เสร็จ Chrome จะพิมพ์ตัวหนังสือเป็นช่องว่าง) */
  function fontsReady() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    var t = 'กขคabc123';
    return Promise.all(['400', '600', '700'].map(function (w) { return document.fonts.load(w + ' 14pt SarabunDoc', t).catch(function () { }); }))
      .then(function () { return document.fonts.ready; }).catch(function () { });
  }
  if (document.fonts && document.fonts.load) setTimeout(fontsReady, 1500);
  return { render: render, print: print, fontsReady: fontsReady, autofit: autofit, bahtText: bahtText, dTh: dTh, money: money, serviceLen: serviceLen };
})();
