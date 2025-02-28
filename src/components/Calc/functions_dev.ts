/**
 * calculator
 */
const d = window.document;

const alfavit='tabcdefghijklmnopqrsuvwxyz';

let locationhash = '';

let hit = 60;

let gprocent: Array<any[]> = [[]];
let fprocent: Array<any[]> = [[]];
let fpdata: Array<String[]> = [[]];

let procent: Array<any[]> = [[]];

let global = {
  procent: gprocent,
  pdata: <Array<any[]>>[[]],
}

let frame0 = {
  sdata: <Array<any[]>>[[]], //window.frames[0].sdata
  sprocent: '', //window.frames[0].sprocent
  pdata: fpdata, //window.frames[0].pdata
  procent: fprocent //window.frames[0].procent
}


let sdata = frame0.sdata;
let sprocent = frame0.sprocent;
let pdata = frame0.pdata;


global.procent = frame0.procent;

global.pdata = pdata.concat(sdata)
  for (let i = 0; i < 9; i++) {
    global.procent[0][i] = global.procent[0][i].concat(sprocent);
  }
  for (let i = 1; i < 3; i++) {
    for (let j = 0; j < 9; j++) {
      for (let k = procent[i][j].length; k < procent[0][8].length; k++) {
        global.procent[i][j].push(global.procent[i][j][k - 1])
      }
    }
  }

  if (location.hash != '' && location.hash.indexOf("#d") != -1)
      link2code();

let fedokrug = ['Центральный', 'Северо-Западный', 'Южный', 'Северо-Кавказский', 'Приволжский', 'Уральский', 'Сибирский', 'Дальневосточный', 'Крымский']
let fedokrugweb = ['cfo', 'szfo', 'yfo', 'skfo', 'pfo', 'ufo', 'sfo', 'dfo', 'kfo']
let dn = ["дней", "день", "дня", "дня", "дня", "дней", "дней", "дней", "дней", "дней"]
let valuta = ["руб.", "$", "евро"]
let pdni = Array<string>;
let itog = Array<string>;
let rregvalue = '';
let kkod = 1;
//чтобы не делил на ноль при вводе делителя
let eff = 0;
let curr = 0;

const Morator2022El = d.getElementById('Moratoriy2022') as HTMLInputElement;
let Morator2022 = Morator2022El.checked;


/**
 * copyarray
 * @param orig 
 * @param kop 
 */
function copyarray(orig: Array<String>,kop: Array<String>) {
	for ( let i = 0; i < orig.length; i++ ) {
		kop[i] = orig[i];
	}

	if (Morator2022) {
    for (let i = 0; i < kop.length; i++) {
      if (kop[i] === '11.04.2022') { 
        kop.splice(i, 6, '01.04.2022', '02.10.2022'); 
        break;
      }
    }
	}
}

function copyarray2(orig: String[][], kop: String[][]) {
	for (let j = 0; j < 9; j++) {
		kop[j] = <String[]>[];
		for (let i = 0 ; i < ((typeof(hit)=='undefined') ? 16 : hit) - kkod ; i++) {
			kop[j][i] = orig[j][i];
		}
		if (Morator2022) {
			for (let i = 0; i < hit - kkod; i++) {
				if (pdata[i] === Array('11.04.2022')) {
					kop[j].splice(i , 5,'0'); 
					break;
				}
			}
		}
	}
}

function copyarrayonly(orig: Array<String>,kop: Array<String>) {
    for (let i=0; i < orig.length;i++ ) {
		kop[i] = orig[i];
	}
}

export function cutlink(a: string) {
  let oraz;
	let str = locationhash;
	let a1=str.substr(str.indexOf(a)+a.length,str.length)
	if (a1.indexOf("#")!=-1) {
		oraz = a1.substr(0,a1.indexOf("#"))		
	} else {
		oraz = a1
	}
	return oraz;
}

/**
 * Updates the display style of all elements with the specified class name.
 *
 * @param iid - The class name of the elements whose display style is to be updated.
 * @param noneblock - The new display style to be applied to the elements, e.g., 'none' or 'block'.
 */

function dowithclass(iid: string, noneblock: string) {
	let divsToHide = d.getElementsByClassName(iid) as HTMLCollectionOf<HTMLElement>; //divsToHide is an array
	for(let i = 0; i < divsToHide.length; i++){
		divsToHide[i].style.display = noneblock;
	}
}

export function addnull(i: number) {
  return (i < 10) ? "0" + i : i
}

export function date2calc(ddate: string) {
  if (ddate && /\d+\.\d+\.\d+/.test(ddate)) {
    let a1 = ddate.split('.');
    if (a1[2].length === 2) a1[2] = '20' + a1[2];
    return addnull(parseInt(a1[0])) + '.' + addnull(parseInt(a1[1])) + '.' + a1[2];
  } else return ''
}

export function dateplusdni(ddate: string, ddni: string) {
	let a1 = ddate.split('.');

	let data1 = new Date(Number(a1[2]), (Number(a1[1]) - 1), (parseFloat(Number(a1[0]) + ddni)));

	return addnull(data1.getDate()) + '.' + addnull((data1.getMonth()+1)) + '.' + data1.getFullYear();
}

export function human(dosum: string) {
	let sum = "" + dosum;
	sum = sum.replace(/\s+/g, '');
	sum = sum.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 '); // разрядность
	if (sum.indexOf(".")!=-1) {						   // к десяткам копеек добавляем ноль
		let b = sum.substr(sum.indexOf("."), sum.length);
		if (b.length==2) sum += "0";
	}
	sum = sum.replace(/^00\./,'0,'); // меняем 00. на 0,
	sum = sum.replace(/^00,/,'0,');
	sum = sum.replace(/\./g,','); // меняем тчк на зпт
	return sum;
}

export function sum2link(ssum: string ) {
  let oraz;
  if ( ssum !== '' ) {
    oraz = ssum.replace(/\s/g,'').replace(/,/g,'.').replace(/\.00/,'');
    oraz = oraz.replace(/000000000/g,'d').replace(/00000000/g,'v').replace(/0000000/g,'s').replace(/000000/g,'b').replace(/00000/g,'p').replace(/0000/g,'c').replace(/000/g,'k').replace(/00/g,'w')
    oraz = oraz.replace(/\.9/g,'D').replace(/\.8/g,'V').replace(/\.7/g,'S').replace(/\.6/g,'B').replace(/\.5/g,'P').replace(/\.4/g,'C').replace(/\.3/g,'K').replace(/\.2/g,'W').replace(/\.1/g,'L').replace(/\.0/g,'O')
    return oraz
  } else {
    return ''
  }
}

function sum2calc(ssum: string) {
  let oraz = '';
  if (ssum && ssum!='') {
    oraz = ssum
      .replace(/w/g,'00')
      .replace(/k/g,'000')
      .replace(/c/g,'0000')
      .replace(/p/g,'00000')
      .replace(/b/g,'000000')
      .replace(/s/g,'0000000')
      .replace(/v/g,'00000000')
      .replace(/d/g,'000000000');
    oraz = oraz
      .replace(/O/g,'.0')
      .replace(/L/g,'.1')
      .replace(/W/g,'.2')
      .replace(/K/g,'.3')
      .replace(/C/g,'.4')
      .replace(/P/g,'.5')
      .replace(/B/g,'.6')
      .replace(/S/g,'.7')
      .replace(/V/g,'.8')
      .replace(/D/g,'.9');
    oraz = oraz.replace(/\./g,',');
    return human(oraz);
  } else {
    return '';
  }
}

/** 
 * dummy 
 */
const ddolgEl = d.getElementById('ddolg') as HTMLInputElement; // dummy
const fdateEl = d.getElementById('ffirstdate') as HTMLInputElement; // dummy
const sdateEl = d.getElementById('sseconddate') as HTMLInputElement; // dummy
const okrugEl = d.getElementById('rregion') as HTMLSelectElement; // dummy
let okrugElSelectedIndex = '';

const effEl = d.getElementById('effdni') as HTMLInputElement; // dummy 
const rvidEl = d.getElementsByName('rrvid')[0] as HTMLInputElement; // dummy
const d36El = d.getElementById('divide360') as HTMLInputElement; // dummy

const currencyEl = d.getElementById('currency') as HTMLInputElement; // dummy
let currencyElSelectedIndex = '';

const hiddenusersprocentEl = d.getElementById('hiddenusersprocent') as HTMLInputElement; // dummy
const qrcodeboxEl = d.getElementById('qrcodebox') as HTMLInputElement; // dummy

const copyRButtonEl = d.getElementById('copyRButton') as HTMLInputElement; // dummy
const copyRButton2El = d.getElementById('copyRButton2') as HTMLInputElement; // dummy
const copyRButton3El = d.getElementById('copyRButton3') as HTMLInputElement; // dummy
const copylinkbuttonEl = d.getElementById('copylinkbutton') as HTMLInputElement; // dummy
const copylinkbutton2El = d.getElementById('copylinkbutton2') as HTMLInputElement; // dummy
const currEl = d.getElementById('currency') as HTMLInputElement; // dummy
const sst317El = d.getElementById('sst317') as HTMLInputElement; // dummy

const oplatadata0El = d.getElementById('oplatadata0') as HTMLInputElement; // dummy
const oplata0El = d.getElementById('oplata0') as HTMLInputElement; // dummy
const npd0El = d.getElementById('npd0') as HTMLInputElement; // dummy

const rus = 'абвгдежзийклмнопрстухчшъыяАБВГДЕЖЗИЙКЛМНОПРСТУХЧШЪЫЯ'; // dummy
const eng = 'abvgdejziyklmnoprstuhxwqfcABVGDEJZIYKLMNOPRSTUHXWQFC'; // dummy
const rus1 = 'ёщьфцэюЁЩЬФЦЭЮ'; // dummy
const eng1 = 'ewqfczyEWQFCZY'; // dummy

const dolgdata0El = d.getElementById('dolgdata0') as HTMLInputElement;
const dolg0El = d.getElementById('dolg0') as HTMLInputElement;
const dolgprim0El = d.getElementById('dolgprim0') as HTMLInputElement;

function getarr4code(arr: Array<string>) {
  let arr4code: Array<string> = [];
  let dninum: number = 0;
  for (let i = 0; i < arr.length; i += 3) {
    if (arr[i] && /\d+\.\d+\.\d+/.test(arr[i])) {  // дата
      arr4code[i]=date2calc(arr[i]);
    } else if (arr[i]=='t') {
      arr4code[i]=arr4code[i-3];
    } else if (arr[i] && /^[A-Za-z]\d/.test(arr[i])) {
      let sotka: number = alfavit.indexOf(arr[i].charAt(0));
      if (sotka !== -1) {
        dninum = (sotka - 1) * 100 + parseFloat(arr[i].substr(1, arr[i].length));
        arr4code[i] = dateplusdni(arr4code[i-3], String(dninum));
      } else if (sotka==-1) {
        sotka = alfavit.indexOf(arr[i].charAt(0).toLowerCase());
        dninum = (sotka-1)*-100 - parseFloat(arr[i].substr(1,arr[i].length));
        arr4code[i] = dateplusdni(arr4code[i-3], String(dninum))
      }
    } else if (arr[i]=='') {
      arr4code[i]=''
    }
    
    if (arr[i+1]=='t')  { // сумма
      arr4code[i+1] = arr4code[i-3+1]
    } else {
      arr4code[i+1] = sum2calc(arr[i+1])
      // oraz = arr[i+1].replace(/w/g,'00').replace(/k/g,'000').replace(/c/g,'0000').replace(/p/g,'00000').replace(/b/g,'000000').replace(/s/g,'0000000').replace(/v/g,'00000000').replace(/d/g,'000000000')
      // arr4code[i+1] = oraz.replace(/O/g,'.0').replace(/L/g,'.1').replace(/W/g,'.2').replace(/K/g,'.3').replace(/C/g,'.4').replace(/P/g,'.5').replace(/B/g,'.6').replace(/S/g,'.7').replace(/V/g,'.8').replace(/D/g,'.9')
    }
    
    if (arr[i+2]=='t') { // примечание
      arr4code[i+2] = arr4code[i-3+2]
    } else {
      arr4code[i+2] = arr[i+2]
    }
  }
  return arr4code.slice();
}

function backprim(oraz: string) {
  if (oraz=='undefined' || oraz=='._undefined,_') {
    return '';
  } else if (oraz=='ttt') {
    return 'т';
  }

  oraz = oraz.replace(/0n0/g,'&');
  oraz=oraz.replace(/_nnn_/g,' № ');
  oraz=oraz.replace(/nnn_/g,'№ ');
  oraz=oraz.replace(/_nnn/g,' №');
  oraz=oraz.replace(/nnn/g,'№');
  oraz=oraz.replace(/_--l--_/g,' + ')
  oraz=oraz.replace(/--l--_/g,'+ ')
  oraz=oraz.replace(/_--l--/g,' +')
  oraz=oraz.replace(/--l--/g,'+')
  oraz=oraz.replace(/qqq/g,' ');
  oraz=oraz.replace(/\.\,/g, ';');
  oraz=oraz.replace(/\,\,\,/g, '#');
  oraz=oraz.replace(/-_/g, '&#706;');
  oraz=oraz.replace(/t_-/g, '>');
  oraz=oraz.replace(/f___/g, 'ф ');
  oraz=oraz.replace(/F___/g, 'Ф ');
  oraz=oraz.replace(/f__/g, 'ы ');
  oraz=oraz.replace(/F__/g, 'Ы ');
  oraz=oraz.replace(/e___/g, 'ё ');
  oraz=oraz.replace(/E___/g, 'Ё ');
  oraz=oraz.replace(/e__/g, 'е ');
  oraz=oraz.replace(/E__/g, 'Е ');
  oraz=oraz.replace(/y___/g, 'ю ');
  oraz=oraz.replace(/Y___/g, 'Ю ');
  oraz=oraz.replace(/y__/g, 'й ');
  oraz=oraz.replace(/Y__/g, 'Й ');
  oraz=oraz.replace(/c___/g, 'ц ');
  oraz=oraz.replace(/C___/g, 'Ц ');
  oraz=oraz.replace(/w___/g, 'щ '); // ёщьфцэю ешъыязй ewqfczy
  oraz=oraz.replace(/W___/g, 'Щ ');
  oraz=oraz.replace(/w__/g, 'ш ');
  oraz=oraz.replace(/W__/g, 'Ш ');
  oraz=oraz.replace(/q___/g, 'ь ');
  oraz=oraz.replace(/Q___/g, 'Ь ');
  oraz=oraz.replace(/q__/g, 'ъ ');
  oraz=oraz.replace(/Q__/g, 'Ъ ');
  oraz=oraz.replace(/z___/g, 'э ');
  oraz=oraz.replace(/Z___/g, 'Э ');
  oraz=oraz.replace(/z__/g, 'з ');
  oraz=oraz.replace(/Z__/g, 'З ');
  oraz=oraz.replace(/c__/g, 'я ');
  oraz=oraz.replace(/C__/g, 'Я ');
  oraz=oraz.replace(/0\/0/g, '%');

  let oraz1='';
  for (let i = 0; i < oraz.length; i++) {
    let j = oraz.charAt(i);
    let k = oraz.charAt(i + 1);
//	if (/\._([a-z]+)\,_/gi).test(oraz))
    if ( j === '.' && k === '_' && oraz.slice(Number(j)).indexOf(',_')!=-1) {
//	oraz1+=oraz.replace(/\._([a-z]+)\,_/i, "$&")
//	continue
    let a = oraz.slice(i + 2,oraz.slice(Number(j)).indexOf(',_'));
    oraz1 += a;
    i += a.length + 3;
  } else {
    if (eng1.indexOf(j) !== -1 && k === '_') {
      oraz1 += rus1.charAt(eng1.indexOf(j));
      i++;
    } else if (eng.indexOf(j) !== -1) {
      oraz1 += rus.charAt(eng.indexOf(j));
		} else {
			oraz1 += j;
		}  
  }
}
  oraz1=oraz1.replace(/__/g, ' ');
  return oraz1;
}

let oplatanum = 0;
let ostrbegin = '<span id=ooplata>';
let ostrend = '</span>';
let dolgnum=0;
let dostrbegin='<span id=dopdolg>';

/**
 * link2code
 * 
 * Read parameters from location hash and fill the form with them.
 * 
 * Reads the following parameters:
 * - #f - first date
 * - #s - second date
 * - #d - amount of loan
 * - #r - region
 * - #e - number of days in the year
 * - #m - currency
 * - #p - users percent
 * - #t - divide 360
 * - #c - show print version
 * - #b - Moratoriy 2022
 * - #o - payments
 * - #u - debts
 * - #v - view
 * - #z - use 317.1
 * 
 * @return {void}
 */
export function link2code() {
  let orazf = date2calc(cutlink("#f"));
  let orazs = date2calc(cutlink("#s"));
  
  fdateEl.value = orazf;
  
  sdateEl.value = orazs;
  
  ddolgEl.value = sum2calc(cutlink("#d"));
  
  if (locationhash.indexOf('#r') !== -1) okrugElSelectedIndex = cutlink("#r");
  if (locationhash.indexOf('#e') !== -1) effEl.value = cutlink("#e");
  if (locationhash.indexOf('#m') !== -1) currencyElSelectedIndex = cutlink("#m");
  if (locationhash.indexOf('#p') !== -1) hiddenusersprocentEl.value = cutlink("#p");
  if (locationhash.indexOf('#t') !== -1) d36El.value = '' + 365;
  if (locationhash.indexOf('#t') ==-1 && locationhash.indexOf('#d')!=-1) d36El.value = '' + 360;
  if (locationhash.indexOf('#c') !==-1) {
    dowithclass('noprint2','none');
    dowithclass('showprint','block');
    qrcodeboxEl.checked = false;
  } else {
    qrcodeboxEl.checked = true;
  }
  if (locationhash.indexOf('#b')!=-1) {
    Morator2022El.checked = true;
  } else {
    Morator2022El.checked = false;
  }

  if (locationhash.indexOf('#o') !== -1) {
    let str = cutlink("#o");
    if (str.charAt(str.length-1) === ';') str = str.substr(0,str.length-1);
    let orazArrr = str.split(';');
    let ostr = '';
    let orazArr: string[] = getarr4code(orazArrr);
    oplatadata0El.value = orazArr[0];
    oplata0El.value = orazArr[1];
    npd0El.value = backprim(decodeURI(orazArr[2]));
    oplatanum = orazArr.length/3 - 1;

    for (let i = 3; i < orazArr.length; i += 3) {
      ostr += 
      '<br><input type=text class="date" placeholder="дд.мм.гггг" id=oplatadata' + i/3 + 
      ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + orazArr[i] + 
      '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма оплаты" id=oplata' + i/3 + 
      ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + orazArr[i+1] + 
      '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=npd' + i/3 + 
      ' onClick=beg() onkeyup=beg() value="' + backprim(decodeURI(orazArr[i+2])) + 
      '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета оплаты" onClick=oplataplus()> <input type=button value=" - " title="удалить эту строку с данными об оплате" onClick=oplataminus(' + i/3 + ')>'
    }

    let iddiv = 'ooplata';
    str = ostrbegin + ostr + ostrend;
    change(str,iddiv);
  }
//------------------------------------------------------------
  if (locationhash.indexOf('#u')!=-1) {
    let str = cutlink("#u");
    if (str.charAt(str.length-1)==';') str = str.substr(0,str.length-1);
    let orazArrr = str.split(';');
    let ostr = '';
    let orazArr = getarr4code(orazArrr);
    dolgdata0El.value = orazArr[0]
    dolg0El.value = orazArr[1]
    dolgprim0El.value = backprim(decodeURI(orazArr[2]))
    dolgnum = orazArr.length/3 - 1;
    for (let i = 3 ; i < orazArr.length; i += 3) {
      ostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=dolgdata' + i/3 + 
        ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + orazArr[i] + 
        '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма долга" id=dolg' + i/3 + 
        ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + orazArr[i+1] + 
        '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=dolgprim' + i/3 + 
        ' onClick=beg() onkeyup=beg() value="' + backprim(decodeURI(orazArr[i+2])) + 
        '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета долга" onClick=dolgplus()> <input type=button value=" - " title="удалить эту строку с данными о долге" onClick=dolgminus(' + i/3 + 
        ')><span class=warn id=warn' + i/3 + 
        '></span>'
    }

    let iddiv = 'dopdolg';
    str = ostrbegin + ostr + ostrend;
    change(str,iddiv);
  }
//-------------------------------------------------------------
  if (locationhash.indexOf('#v')!=-1) {
    let oraz=cutlink("#v");
    const rrvidcol = d.getElementsByName('rrvid') as NodeListOf<HTMLInputElement>;
    if (oraz=='0') {
      rrvidcol[0].checked = true;
      rrvidcol[1].checked = false;
    } else {
      rrvidcol[0].checked = false;
      rrvidcol[1].checked = true;
    }
  }

let oraz = cutlink("#z");
if (oraz === '1') {
  sst317El.checked = true;
} else {
  sst317El.checked = false;
}

beg()
}

export function segodnya() {
	let today = new Date()
	
	//beg(); // в разработке
}

function change(str: string, iddiv: string) {
	let dom = d.createElement('DIV');
	dom.innerHTML = str;
	let cc = dom.childNodes as NodeListOf<HTMLElement>;
  const iddivEl = d.getElementById(iddiv) as HTMLElement;
	iddivEl.innerHTML = cc[0].innerHTML;
}

/**  
 * punk - dummy function - заменить
 * @param str
 */
function punk(dosum: string) {
  /* удалить начало коммента
  if (dosum!='') {
      dosum = dosum.replace(/\s+/g, '')
      um=""; lastletter=dosum.charAt(dosum.length-1); skoba1=skoba2=0;

    for (i=0; i<=dosum.length; i++) { // удаляем пробелы в сумме, заменяем зпт на тчк
      a=dosum.charAt(i);
      if (a==" ") um+="";
      else if (a=="," || a=="?") um+=".";
      else um+=a

      if (a=="(") skoba1++;    // определяем, сколько открытых и закрытых скоб
      else if (a==")") skoba2++
    }
    if (um=="") um=0

    if (/[abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZабвгдеёжзийклмнопрстуфхцчшщъыьэюяАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ]/.test(um) ) {
      let reg=/\D*(\d+)\D+(\d*)\D*/	// игнорируем руб., коп. и т.п.
/* удалить начало коммента        var abc=reg.exec(um)
      if (abc[2]!="") um=abc[1]+"."+abc[2];
      else um=abc[1]
    }

    if (lastletter=="+" || lastletter=="-") um+="0";
    else if (lastletter=="*" || lastletter=="/") um+="1";

    if (skoba1>skoba2) {
      for (i=0;i<(skoba1-skoba2);i++) {um+=")"}
    }
    if (skoba1<skoba2) {
      for (i=0;i<(skoba2-skoba1);i++) {um="("+um}
    }

    if (um.length==(skoba1+skoba2)) um=0
    if (um=="()") um=0

    return okrugl(parseFloat(um))
  } else {return ''};*/
  return dosum; //dummy
}

function beg() {
  let dolg = punk(ddolgEl.value);
  
	let fdate = fdateEl.value; 
	
  let sdate = sdateEl.value;

	let okrug = okrugEl.value;

	let eff = effEl.value;

	let rvid = (rvidEl.checked) ? 0 : 1;

	let d36 = d36El.value;

	Morator2022 = Morator2022El.checked;
	let psumma = 0;
	let kolvo = 0;
  let kolvo1 = 0;
	let oplata4link = '';
	let dolg4link = '';

	copyRButtonEl.value = copyRButton2El.value = copyRButton3El.value="Копировать расчет"

  copylinkbuttonEl.value=copylinkbutton2El.value="Копировать ссылку";
	let tfsize='12';

  let curr = Number(currEl.value);
	
	if (curr !== 0) {
    sst317El.checked = false;
    sst317El.setAttribute('disabled', 'disabled');
  } else {
    sst317El.removeAttribute('disabled');
  }

  const regionmenuEl = d.getElementById('regionmenu') as HTMLInputElement; // dummy
  const regionmenu2El = d.getElementById('regionmenu2') as HTMLInputElement; // dummy

	if (getmin(fdate,"31.07.2016")==fdate || curr!=0) {
    regionmenuEl.style.display='';
    regionmenu2El.style.display='';
  } else {
    regionmenuEl.style.display='none';
    regionmenu2El.style.display='none';
  }
	
  const moratormenuEl = d.getElementById('moratormenu') as HTMLInputElement; // dummy

	if (
    getmin(fdate,'01.10.2022') == fdate && getmin(sdate,'01.04.2022')=='01.04.2022') moratormenuEl.style.display='';
	else moratormenuEl.style.display='none'

  const st317El = d.getElementById('st317') as HTMLInputElement; // dummy
	let st317 = st317El.checked;
	
	let oplata = [];
	let oplatadni = [];
	let npd = [];
	let platil = 0;

	let dolgi = [];
	let dolgdni = [];
  let dolgprim = [];
  let dolgbyl = 0;
	
	let bpdata = <String[]>[];
	let bprocent = <String[][]>[[]];
  
	let _pdata = pdata.map(x => String(x));

  copyarray(_pdata,bpdata)	//if (copyarray(pdata,bpdata); else copyarray(pdatarub,bpdata)
	copyarray2(procent[0], <String[][]>[bprocent[0]])
	copyarray2(procent[1], <String[][]>[bprocent[1]])
	copyarray2(procent[2], <String[][]>[bprocent[2]])
	
  if ( curr!==0 ) {
		let _curr = bprocent[curr];

		_curr[okrug][0] = hiddenusersprocentEl.value;
	}

    if (fdate!='' && sdate!='' && d36!=360) {addfor366(fdate,sdate,0);}
	
	let oplata1=[]
	let oplatadni1=[]
	let npd1=[] // примечания у одинаковых дат чз зпт
	let npd2=[]

	let dolg1=[]
	let dolgdni1=[]
	let dolgprim1=[] // примечания у одинаковых дат чз зпт
	let dolgprim2=[]

	let oplataprimnum=0

	for (i=0;i<=oplatanum;i++) {
		var a1=d.getElementById('oplatadata'+i).value;
		var b1=d.getElementById('oplata'+i).value.replace(/\s/g,'');
		var c1=primcheck(d.getElementById('npd'+i).value);

		if (a1!="" && b1!="" && c1!="") oplataprimnum++
		
//		oplata4link+= date2link(a1) + ';' + sum2link(b1) + ';' + c1 + ';'
		b1 = b1.replace(',','.')
		npd2.push(c1)
		c1 = backprim(c1)
		
//		if (isNaN(a1)) a1=''
		if (isNaN(b1)) b1='';
	
		if (a1!='' && b1!='') {
			oplatadni.push(plus(a1)); // добавляем в конец массива
			oplata.push(b1);
			npd.push(c1);
			platil = 2
		}
		oplatadni1.push(plus(a1));
		oplata1.push(b1);
		npd1.push(c1)
	}
	
//	npd2 = []
//	copyarrayonly(npd1,npd2)

	dolgprimnum=0
	for (i=0;i<=dolgnum;i++) {
		var a1=minus(d.getElementById('dolgdata'+i).value);
		var b1=d.getElementById('dolg'+i).value.replace(/\s/g,'');
		var c1=primcheck(d.getElementById('dolgprim'+i).value);

		if (a1!="" && b1!="" && c1!="") dolgprimnum++
		
//		dolg4link+= date2link(plus(a1)) + ';' + sum2link(b1) + ';' + c1 + ';'
		b1 = b1.replace(',','.')
		dolgprim2.push(c1)
		c1 = backprim(c1)
		
//		if (isNaN(a1)) a1=''
		if (isNaN(b1)) b1='';
	
		if (a1!='' && b1!='') {
			dolgdni.push(plus(a1)); // добавляем в конец массива
			dolgi.push(b1);
			dolgprim.push(c1);
			dolgbyl = 2
		}
		dolgdni1.push(plus(a1));
		dolg1.push(b1);
		dolgprim1.push(c1)
	}
	
	numDolgavPeriode=0
	for (i=0;i<dolgi.length;i++) {
	    numDolgavPeriode+=datavperiode(dolgdni[i],fdate,sdate)
	}
	
	if (dolgprimnum!=0 && numDolgavPeriode!=0) {ud=1} else {ud=0}
	
	for (i=0;i<oplata.length;i++) {
		for (j=0;j<=bpdata.length-1;j++) {
			if (oplatadni[i]==getmax(oplatadni[i],bpdata[j]) && oplatadni[i]==getmin(bpdata[j+1],oplatadni[i]) && oplatadni[i]!=bpdata[j] && oplatadni[i]!=bpdata[j+1]){
				bpdata.splice(j+1,0,oplatadni[i]);
				for (ij=0;ij<9;ij++) {bprocent[curr][ij].splice(j+1,0,bprocent[curr][ij][j]);}
			}
		}
	}

	for (i=0;i<dolgi.length;i++) {
		for (j=0;j<=bpdata.length-1;j++) {
			if ( dolgdni[i]==getmax(dolgdni[i],bpdata[j]) && dolgdni[i]==getmin(bpdata[j+1],dolgdni[i]) && dolgdni[i]!=bpdata[j] && dolgdni[i]!=bpdata[j+1] ) {
				bpdata.splice(j+1,0,dolgdni[i]);
				for (ij=0;ij<9;ij++) {bprocent[curr][ij].splice(j+1,0,bprocent[curr][ij][j]);}
			}
		}
	}

	for (i=0;i<oplata.length;i++) { //суммируем оплаты, произошедшие в 1 день, и удаляем первые значения из массива
		for (j=i;j<oplata.length;j++) {
			if (oplatadni[i]==oplatadni[j] && i!=j) {
				oraz=parseFloat(oplata[j])+parseFloat(oplata[i]);
				oplata[j]=okrugl(oraz);
				if (npd[i]!=npd[j]) {
    				if (npd[i]!='' && npd[j]!='') npd[j]=npd[i]+', '+npd[j]
    				if (npd[i]!='' && npd[j]=='') npd[j]=npd[i]
//    				if (npd[i]=='' && npd[j]!='') npd[j]='в т.ч. '+npd[j]
				}
				oplatadni.splice(i,1)
				oplata.splice(i,1)
				npd.splice(i,1)
				j--
			}
		}
	}

	for (i=0;i<oplata.length;i++) { //суммируем оплаты, произошедшие в 1 день, и удаляем первые значения из массива
		for (j=i;j<oplata.length;j++) {
			if (oplatadni[i]==oplatadni[j] && i!=j) {
				oraz=parseFloat(oplata[j])+parseFloat(oplata[i]);
				oplata[j]=okrugl(oraz);
				if (npd[i]!=npd[j]) {
    				if (npd[i]!='' && npd[j]!='') npd[j]=npd[i]+', '+npd[j]
    				if (npd[i]!='' && npd[j]=='') npd[j]=npd[i]
				}
				oplatadni.splice(i,1)
				oplata.splice(i,1)
				npd.splice(i,1)
				j--
			}
		}
	}
	
	numOplatvPeriode=0
	oplataLastDay='01.01.1995'
	for (i=0;i<oplata.length;i++) {
	    numOplatvPeriode+=datavperiode(oplatadni[i],fdate,sdate) // 	    numOplatvPeriode+=datavperiode(minus(oplatadni[i]),fdate,sdate)
	    if (getmax(oplatadni[i],oplataLastDay)==oplatadni[i]) oplataLastDay = oplatadni[i]
	}

	for (i=0;i<dolgi.length;i++) { //суммируем долги, возникшие в 1 день, и удаляем первые значения из массива
		for (j=i;j<dolgi.length;j++) {
			if (dolgdni[i]==dolgdni[j] && i!=j) {
				oraz=parseFloat(dolgi[j])+parseFloat(dolgi[i]);
				dolgi[j]=okrugl(oraz);
				if (dolgprim[i]!=dolgprim[j]) {
    				if (dolgprim[i]!='' && dolgprim[j]!='') dolgprim[j]=dolgprim[i]+', '+dolgprim[j]
    				if (dolgprim[i]!='' && dolgprim[j]=='') dolgprim[j]=dolgprim[i]
				}
				dolgdni.splice(i,1)
				dolgi.splice(i,1)
				dolgprim.splice(i,1)
				j--
			}
		}
	}

	for (i=0;i<dolgi.length;i++) { //суммируем долги, возникшие в 1 день, и удаляем первые значения из массива
		for (j=i;j<dolgi.length;j++) {
			if (dolgdni[i]==dolgdni[j] && i!=j) {
				oraz=parseFloat(dolgi[j])+parseFloat(dolgi[i]);
				dolgi[j]=okrugl(oraz);
				if (dolgprim[i]!=dolgprim[j]) {
    				if (dolgprim[i]!='' && dolgprim[j]!='') dolgprim[j]=dolgprim[i]+', '+dolgprim[j]
    				if (dolgprim[i]!='' && dolgprim[j]=='') dolgprim[j]=dolgprim[i]
				}
				dolgdni.splice(i,1)
				dolgi.splice(i,1)
				dolgprim.splice(i,1)
				j--
			}
		}
	}
	
	if (numOplatvPeriode==0) platil=0
	if (numDolgavPeriode==0) dolgbyl=0
	
	plata = []
	platadni = []
	pd = []
	for (i=0; i<bpdata.length; i++) {
		plata[i]=0
		platadni[i]='-'
		pd[i] = '-'
	}
	
	for (i=0; i<oplata.length; i++) {
		for (j=0; j<bpdata.length; j++) {
			if (oplatadni[i]==bpdata[j]) {
				plata.splice(j,1,oplata[i]);
				platadni.splice(j,1,oplatadni[i]);
				pd.splice(j,1,npd[i]);
				if (pd[j]=='') pd[j]='-'
			}
		}
	}

	dolgplata = []
	dolgplatadni = []
	dolgpd = []
	for (i=0; i<bpdata.length; i++) {
		dolgplata[i]=0
		dolgplatadni[i]='-'
		dolgpd[i] = '-'
	}
	
	for (i=0; i<dolgi.length; i++) {
		for (j=0; j<bpdata.length; j++) {
			if (dolgdni[i]==bpdata[j]) {
				dolgplata.splice(j,1,dolgi[i]);
				dolgplatadni.splice(j,1,dolgdni[i]);
				dolgpd.splice(j,1,dolgprim[i]);
				if (dolgpd[j]=='') dolgpd[j]='-'
			}
		}
	}
	
	oplataNevPeriode = false
	if (numOplatvPeriode < oplatadni.length && returndate(oplataLastDay) > returndate(plus(sdate)) ) oplataNevPeriode = true
	if (oplataprimnum!=0 && numOplatvPeriode!=0) {od=1} else {od=0}
	
	if (rvid==0) {
		if (getmin(fdate,"31.07.2016")==fdate) {oraz=' (' + fedokrug[okrug] + ' федеральный округ)';} else {oraz=''}
		raschet = 'При сумме задолженности <b>' + human(dolg) + '</b> ' + valuta[curr] + oraz + '<br>'
		if (platil!=0 || dolgbyl!=0) {
			raschet+= 'c учетом ' + ((platil!=0) ? 'частичной оплаты' : '') + ((platil!=0 && dolgbyl!=0) ? ' и ' : '') + ((dolgbyl!=0) ? 'увеличения долга' : '') + ' '
		}
		raschet += 'проценты за пользование чужими денежными средствами составляют:</br>'	
	} else {
		if (getmin(fdate,"31.07.2016")==fdate) {oraz='Ставка,</nobr><br>' + fedokrug[okrug] + '<br>фед. округ'} else {oraz="Ставка"}
		tfsize =    (platil==0 && dolgbyl==0) ? '12' :
		            (platil!=0 && dolgbyl!=0) ? '8' : 
		            (od!=0 || ud!=0) ? '8' : '10';
		tcellpadding =  (platil==0 && dolgbyl==0) ? '5' :
		                (platil!=0 && dolgbyl!=0) ? '3' : 
		                (od!=0 || ud!=0) ? '3' : '4';
		raschet = '<table border=1 style="padding:4px;border-collapse:collapse; text-align:center; font-size:' + tfsize + 'pt" cellpadding=' + tcellpadding + '>' +
				'<tr style="background-color: #F0F0F0;">' +
					'<td rowspan=2><nobr>Задолженность,</nobr><br>' + valuta[curr] + '</td>' +
					'<td colspan=3>Период просрочки</td>' +
					((platil!=0) ? '<td colspan=' +(2+od) + '>Оплата</td>' : '') +
					((dolgbyl!=0) ? '<td colspan=' + (2+ud) + '>Увеличение долга</td>' : '') +
					'<td rowspan=2><nobr>' + oraz + '</td>' +
                                        ((d36!=360) ? '<td rowspan=2><nobr>Дней</nobr><br>в<br>году</td>' : '') +
					'<td rowspan=2><nobr>Проценты,</nobr><br>' + valuta[curr] + '</td></tr>' +
				'<tr style="background-color: #F0F0F0;">' +
					'<td>c</td><td>по</td><td>дни</td>' + ((platil!=0) ? '<td><nobr>сумма,</nobr> ' + valuta[curr] + '</td><td>дата</td>' + ((od==1) ? '<td>примечание</td>' : '') : '') + ((dolgbyl!=0) ? '<td><nobr>сумма,</nobr> ' + valuta[curr] + '</td><td>дата</td>' + ((ud==1) ? '<td>примечание</td>' : '') : '') + '</tr>' +
				'<tr style="background-color: #F0F0F0;">'	
		kvskobnum=5+platil+od+dolgbyl+ud+((d36!=360) ? 1 : 0);
		for (i=1;i<=kvskobnum;i++) {raschet+= '<td>[' + i + ']</td>'}
		if (d36==360) {oraz='[' + kvskobnum + ']/360'} else {oraz='[' + (kvskobnum-1) + ']/[' + kvskobnum + ']'}
		raschet+='<td><nobr>[1]x[4]x' + oraz + '</nobr></td></tr>'
	}

	cleanwarn()
	
	var iddiv = 'ffedokrug'
	var oraz = '<a href=svedcb/' + fedokrugweb[okrug] + ((curr==1) ? 'usd' : '') + ((curr==2) ? 'eur' : '') + '.htm class=llink title="Средние ставки банковского процента по вкладам физ.лиц" target=_blank>' + fedokrug[okrug] + ' федеральный округ</a>'
	var drstr = '<span id="ffedokrug">' + oraz + '</span>'
	change(drstr,iddiv)

	pdolg = [dolg]

	for (i=1; i<bpdata.length; i++) {
		pdolg[i] = okrugl(pdolg[i-1] - plata[i] + eval(dolgplata[i]))
//		if (pdolg[i]<0) pdolg[i]=0
	}

	today = new Date()
	todaydate = addnull(today.getDate()) + '.' + addnull((today.getMonth()+1)) + '.' + today.getFullYear()
//	var oraz = getmax(todaydate,cbplan(pdata[pdata.length-2]))
	str = ''
	warnnum = 0

	firstdayofdelay(fdate);
	
//	if (getmax(sdate,oraz)==sdate && sdate!='') {
//		if (warnnum!=0) str+='<br><br>'
//		warnnum++
//		d.getElementById('sseconddate').style.borderColor="red"
//		str+= 'Ожидается, что ' + oraz + '&nbsp;&nbsp;ЦБ РФ <a href="go.htm?url=www.cbr.ru/statistics/?Prtid=int_rat&ch=PAR_222#CheckedItem" class=llink title="Средние ставки банковского процента по вкладам физ.лиц в рублях для целей применения ст.395 ГК РФ" target=_blank>опубликует</a> новые процентные ставки.'
//		str+= ' Произвести расчет по ' + minus(oraz) + ' ? <input type=button value=OK onClick="d.getElementById(\'sseconddate\').value=\'' + minus(oraz) + '\';beg();">'
//	}
	if (curr!=0 && getmin(fdate,'31.05.2015',eff)==fdate) {
		if (warnnum!=0) str+='<br><br>'
		warnnum++
		str+= 'Для валюты калькулятор самостоятельно определяет процентную ставку только с 01.06.2015.<br>Укажите, какую процентную ставку применить за период с ' + fdate + ' по ' + getmin(sdate,'31.05.2015',eff) + ':&nbsp;<input type=text size=5 id="usersprocent" value=' + human(d.getElementById('hiddenusersprocent').value) + '> % <input type=button value=OK onClick=myprocent()>'
	}

//	change('<div style="color:red" id="warn">' + str + '</div>','warn')
	
	if (fdate!='' && sdate!='') {
		var counter=0
		fullplata = dolgfullplata = 0
		srvprocent = 0
		for (i=0; i<bpdata.length-1; i++) {
			if (bpdata[i]==getmin(sdate,bpdata[i]) && bpdata[i+1]==getmax(fdate,bpdata[i+1]) && fdate==getmin(fdate,sdate) && fdate==getmin(fdate,minus(bpdata[i+1]))) {pdni[i]=dni(getmax(fdate,bpdata[i]),getmin(sdate,minus(bpdata[i+1])),eff);} // && pdolg[i]!=0
			else pdni[i]=0
            oraz=getmax(fdate,bpdata[i])
            if (d36!=360 && IsLeapYear(eval(oraz.substr(6,oraz.length)))) {d36=366} else {d36=d.getElementById('divide360').value}
            oraz1=((pdolg[i]<0) ? 0 : pdolg[i])

//была обф-ция 4х строк
            let hhost = ali+'5g'+'k.'+'r'+'u'
            if (location.host.indexOf(hhost) == 0 || location.host.indexOf(hhost) == 4) {
                itog[i] = okrugl(oraz1 * eval(bprocent[curr][okrug][i]) * pdni[i] / (d36 * 100));
            }
            psumma = psumma + eval(itog[i]);

			if (pdni[i]!=0) { // && (pdolg[i]!=0 || plata[i]!=0)
                if (pdolg[i]==0 && plata[i]==0) {raschet+=''}
                else {
                    if (pdolg[i]<=0) pdni[i]=0
                    if (rvid==0) {
                        if (pdolg[i]>0) raschet+= '- с ' + getmax(fdate,bpdata[i]) + ' по ' + getmin(sdate,minus(bpdata[i+1])) + ' (' + pdni[i] + ' дн.): '
                        if (pdolg[i]>0) raschet+= human(pdolg[i]) + ' x ' + pdni[i] + ' x ' + human(bprocent[curr][okrug][i]) + '% / ' + d36 + ' = <b>' + human(eval(itog[i])) + '</b> ' + valuta[curr] + '<br>'
				    } else {
                        if (platil!=0) {oraz=human(plata[i])+'</td><td>'+minus(''+platadni[i])+'</td>' + ((od==1) ? '<td>' + ((pd[i]) ? pd[i] : '') + '</td>' : '') + '<td>'} else {oraz=''}
                        if (d36!=360) {moraz='<td>'+((pdolg[i]!=0) ? d36 : '-')+'</td>'} else {moraz=''}
                        if (dolgbyl!=0) {oraz1=human(dolgplata[i])+'</td><td>'+dolgplatadni[i]+'</td>' + ((ud==1) ? '<td>' + ((dolgpd[i]) ? dolgpd[i] : '') + '</td>' : '') + '<td>'} else {oraz1=''}
                        raschet+= '<tr><td>' + human(pdolg[i]) + '</td><td>' + ((pdolg[i]!=0) ? getmax(fdate,bpdata[i]) : '-') + '</td><td>' + ((pdolg[i]!=0) ? getmin(sdate,minus(bpdata[i+1])) : '-') + '</td><td>' + pdni[i] + '</td><td>' + oraz + oraz1 + ((pdolg[i]!=0) ? human(bprocent[curr][okrug][i]) + '%' : '-') + ((bprocent[curr][okrug][i]==0) ? '<br><span style="font-size:8pt"><nobr>(мораторий)</nobr></span>' : '') +'</td>' + moraz + '<td>' + human(eval(itog[i])) + '</td></tr>'
                    }
                    counter++
                    srvprocent+=pdni[i]*bprocent[curr][okrug][i];
                    kolvo1+=pdni[i];
				    fullplata+=parseFloat(plata[i])
				    dolgfullplata+=eval(dolgplata[i])
                }
			}
			if (pdolg[i]>0) kolvo+=pdni[i]
		}
		if (psumma!=0) {
			if (counter>1) {
				if (rvid==0) {raschet+= 'Итого: <b>' + human(okrugl(psumma)) + '</b> ' + valuta[curr] + '<br>';}
				else {
					if (platil!=0) {oraz='<td><b><nobr>' + addnbsp(human(okrugl(fullplata))) + '</nobr></b></td><td></td>' + ((od==1) ? '<td></td>' : '');} else {oraz=''}
					if (dolgbyl!=0) {oraz1='<td><b><nobr>' + addnbsp(human(okrugl(dolgfullplata))) + '</nobr></b></td><td></td>' + ((ud==1) ? '<td></td>' : '');} else {oraz1=''}
					raschet+= '<tr><td colspan=3 style="text-align:right"><b>Итого:</b></td><td><b>' + kolvo1 + '</b></td>' + oraz + oraz1 + '<td><b><nobr>' + human(okrugl(srvprocent/kolvo)) + '%</nobr></b></td>' + ((d36!=360) ? '<td></td>' : '') + '<td><b><nobr>' + addnbsp(human(okrugl(psumma))) + '</nobr></b></td></tr>';
				}
			}
		}
	}
	if (rvid!=0) raschet+= '</table>'

	bsdata=[]
	bsprocent=[]
	copyarray(sdata,bsdata)
	copyarray(sprocent,bsprocent)

    if (fdate!='' && sdate!='' && d36!=360) {addfor366(getmax(fdate,'01.06.2015'),sdate,1);}

	for (i=0;i<oplata.length;i++) {
		for (j=0;j<bsdata.length;j++) {
			if(oplatadni[i]==getmax(oplatadni[i],bsdata[j]) && oplatadni[i]==getmin(bsdata[j+1],oplatadni[i]) && oplatadni[i]!=bsdata[j] && oplatadni[i]!=bsdata[j+1]) {
				bsdata.splice(j+1,0,oplatadni[i]);
				bsprocent.splice(j+1,0,bsprocent[j]);
			}
		}
	}

	for (i=0;i<dolgi.length;i++) {
		for (j=0;j<bsdata.length;j++) {
			if (dolgdni[i]==getmax(dolgdni[i],bsdata[j]) && dolgdni[i]==getmin(bsdata[j+1],dolgdni[i]) && dolgdni[i]!=bsdata[j] && dolgdni[i]!=bsdata[j+1] ) {
				bsdata.splice(j+1,0,dolgdni[i]);
				bsprocent.splice(j+1,0,bsprocent[j]);
			}
		}
	}
	
	splata = []
	splatadni = []
	spd = []
	for (i=0; i<bsdata.length; i++) {
		splata[i]=0
		splatadni[i]='-'
		spd[i]='-'
	}

	sdolgplata = []
	sdolgplatadni = []
	sdolgpd = []
	for (i=0; i<bsdata.length; i++) {
		sdolgplata[i]=0
		sdolgplatadni[i]='-'
		sdolgpd[i]='-'
	}	
	
	predoplata=0
	for (i=0; i<oplata.length; i++) {
		for (j=0; j<bsdata.length; j++) {
			if (oplatadni[i]==bsdata[j]) {
				splata.splice(j,1,oplata[i]);
				splatadni.splice(j,1,oplatadni[i]);
				spd.splice(j,1,npd[i]);
				if (spd[j]=='') spd[j]='-'
			}
		}
		if (oplatadni[i]==getmin(oplatadni[i],bsdata[0]) && oplatadni[i]!=bsdata[0]) {
			predoplata+=eval(oplata[i])
		}
	}
	
	for (i=1;i<=dolgnum;i++) {
		if (dolgdni1[i]=='' && dolg1[i]=='' && dolgprim1[i]=='' && programplusminus) dolgminus(i)
	}
	programplusminus=false
	
	for (i=1;i<=oplatanum;i++) {
		if (oplatadni1[i]=='' && oplata1[i]=='' && npd1[i]=='' && oplprogramplusminus) oplataminus(i)
	}
	oplprogramplusminus=false
	
//----
	dolgsverhu=0
	for (i=0; i<dolgi.length; i++) {
		for (j=0; j<bsdata.length; j++) {
			if (dolgdni[i]==bsdata[j]) {
				sdolgplata.splice(j,1,dolgi[i]);
				sdolgplatadni.splice(j,1,dolgdni[i]);
				sdolgpd.splice(j,1,dolgprim[i]);
				if (sdolgpd[j]=='') sdolgpd[j]='-'
			}
		}
		if (dolgdni[i]==getmin(dolgdni[i],bsdata[0]) && dolgdni[i]!=bsdata[0]) {
			dolgsverhu+=eval(dolgi[i])
		}
	}
//----	
	sdolg = [dolg-splata[0]-predoplata+dolgsverhu]

	for (i=1; i<bsdata.length; i++) {
		sdolg[i] = okrugl(sdolg[i-1] - splata[i] + eval(sdolgplata[i]))
//		if (sdolg[i]<0) sdolg[i]=0
	}

	itog317 = []
	sdni = []
	srvprocent317 = 0
	sfullplata = 0
	sdolgfullplata = 0
	skolvo = 0
	summa317 = 0
	counter=0
	
	if (st317) {
		if (rvid==0) {
			raschet+= '<br><br><b>Расчет процентов по денежному обязательству по ст. 317.1 ГК РФ</b><br><br>'
			raschet+= 'При сумме задолженности <b>' + human(dolg) + '</b> руб. '
			if (platil!=0 || dolgbyl!=0) {
				raschet+= 'c учетом ' + ((platil!=0) ? 'частичной оплаты' : '') + ((platil!=0 && dolgbyl!=0) ? ' и ' : '') + ((dolgbyl!=0) ? 'увеличения долга' : '') + '<br>'
			}
			raschet+= 'проценты по ст. 317.1 ГК РФ составляют:<br>'
		} else {
			raschet+= '<table border=1 style="border-collapse:collapse; text-align:center;" cellpadding=4>' +
				'<thead><br><br><b>Расчет процентов по денежному обязательству по ст. 317.1 ГК РФ</b><br><br></thead>' +
				'<tr style="background-color: #F0F0F0;">' +
					'<td rowspan=2>Задолженность,<br>руб.</td>' +
					'<td colspan=3>Период пользования</td>' +
					((platil!=0) ? '<td colspan=' + (2+od) + '>Оплата</td>' : '') +
					((dolgbyl!=0) ? '<td colspan=' + (2+ud) + '>Увеличение долга</td>' : '') +
					'<td rowspan=2>Ставка</td>' +
					((d36!=360) ? '<td rowspan=2>Дней<br>в<br>году</td>' : '') +
					'<td rowspan=2>Проценты,<br>руб.</td></tr>' +
				'<tr style="background-color: #F0F0F0;">' +
					'<td>c</td><td>по</td><td>дни</td>' + ((platil!=0) ? '<td><nobr>сумма,</nobr> ' + valuta[curr] + '</td><td>дата</td>' + ((od==1) ? '<td>примечание</td>' : '') : '') + ((dolgbyl!=0) ? '<td><nobr>сумма,</nobr> ' + valuta[curr] + '</td><td>дата</td>' + ((ud==1) ? '<td>примечание</td>' : '') : '') + '</tr>' +
				'<tr style="background-color: #F0F0F0; font-size: 13px">'
			var j=5+platil+od+dolgbyl+ud+((d36!=360) ? 1 : 0);
			for (i=1;i<=j;i++) {raschet+= '<td>[' + i + ']</td>'}
			if (d36==360) {oraz='[' + j + ']/360'} else {oraz='[' + (j-1) + ']/[' + j + ']'}
			raschet+='<td><nobr>[1]x[4]x' + oraz + '</nobr></td></tr>'
		}

		for (i=0; i<bsdata.length; i++) {
			if (bsdata[i]==getmin(sdate,bsdata[i]) && bsdata[i+1]==getmax(fdate,bsdata[i+1]) && fdate==getmin(fdate,sdate) && fdate==getmin(fdate,minus(bsdata[i+1]))) {
				sdni[i]=dni(getmax(fdate,bsdata[i]),getmin(sdate,minus(bsdata[i+1])),eff);
                if (sdolg[i]<=0) sdni[i]=0
				srvprocent317+=sdni[i]*bsprocent[i];
				sfullplata+=eval(splata[i]);
				sdolgfullplata+=eval(sdolgplata[i]);
				skolvo+=sdni[i]
			} else {sdni[i]=0}
			oraz=getmax(getmax(fdate,'01.06.2015'),bsdata[i])
			if (d36!=360 && IsLeapYear(eval(oraz.substr(6,oraz.length)))) {d36=366} else {d36=d.getElementById('divide360').value}
			oraz1=((sdolg[i]<0) ? 0 : sdolg[i])
			itog317[i] = okrugl(oraz1 * sdni[i] * bsprocent[i]/(d36*100))
			summa317+=eval(itog317[i])
			if (rvid==0) {
				if (itog317[i]!=0) {
					if (sdolg[i]>0) raschet+= '- c ' + getmax(fdate,bsdata[i]) + ' по ' + getmin(sdate,minus(bsdata[i+1])) + ' (' + sdni[i] + ' дн.): '
					if (sdolg[i]>0) raschet+= human(sdolg[i]) + ' x ' + sdni[i] + ' x ' + human(bsprocent[i]) + '% / ' + d36 + ' = <b>' + human(itog317[i]) + '</b> руб.<br>'
					if (sdolg[i]>0) counter++
				}
			} else {
				if (itog317[i]!=0 || splata[i]!=0) {
					if (platil!=0) {
						if (i!=0) oraz= human(splata[i]) + '</td><td>' + minus(''+splatadni[i]) + '</td>' + ((od==1) ? '<td>' + spd[i] + '</td>' : '') + '<td>'
						if (i==0) {
							var a1=(splatadni[i]!='-') ? 'по ' : ''
							oraz= human(eval(splata[i])+eval(predoplata)) + '</td><td><nobr>' + a1 + minus(''+splatadni[i]) + '</nobr></td>' + ((od==1) ? '<td>' + spd[i] + '</td>' : '') + '<td>'
						}
					} else {oraz=''}
					if (d36!=360) {moraz='<td>'+((sdolg[i]!=0) ? d36 : '-')+'</td>'} else {moraz=''}
					if (dolgbyl!=0) {oraz1=human( ((i==0) ? eval(sdolgplata[i])+eval(dolgsverhu) : sdolgplata[i]) )+'</td><td>'+sdolgplatadni[i]+'</td>' + ((ud==1) ? '<td>' + ((sdolgpd[i]) ? sdolgpd[i] : '') + '</td>' : '') + '<td>'} else {oraz1=''}
					raschet+= '<tr><td>' + human(sdolg[i]) + '</td><td>' + ((sdolg[i]!=0) ? getmax(fdate,bsdata[i]) : '-') + '</td><td>' + ((sdolg[i]!=0) ? getmin(sdate,minus(bsdata[i+1])) : '-') + '</td><td>' + sdni[i] + '</td><td>' + oraz + oraz1 + ((sdolg[i]!=0) ? human(bsprocent[i]) + '%' : '-') + '</td>' + moraz + '<td>' + human(eval(itog317[i])) + '</td></tr>'
					counter++
				}
			}
		}
		if (summa317!=0) {
			if (counter>1) {
				if (rvid==0) {raschet+= 'Итого: <b>' + human(okrugl(summa317)) + '</b> руб.<br>';}
				else {
					if (platil!=0) {oraz='<td><b><nobr>' + human(okrugl(eval(sfullplata)+eval(predoplata))) + '</nobr></b></td><td></td>' + ((od==1) ? '<td></td>' : '');} else {oraz=''}
					if (dolgbyl!=0) {oraz1='<td><b><nobr>' + human(okrugl(eval(sdolgfullplata)+eval(dolgsverhu))) + '</nobr></b></td><td></td>' + ((ud==1) ? '<td></td>' : '');} else {oraz1=''}
					raschet+= '<tr><td colspan=3 style="text-align:right"><b>Итого:</b></td><td><b>' + skolvo + '</b></td>' + oraz + oraz1 + '<td><b>' + human(okrugl(srvprocent317/skolvo)) + '%</b></td>' + ((d36!=360) ? '<td></td>' : '') + '<td><b>' + human(okrugl(summa317)) + '</b></td></tr>';
				}
			}
		}
		if (rvid!=0) {raschet+= '</table>'}
		
		vsego = eval(okrugl(psumma)) + eval(okrugl(summa317))
		raschet+= '<br><br>ВСЕГО: ' + human(okrugl(psumma)) + ' + ' + human(okrugl(summa317)) + ' = <b>' + human(okrugl(vsego)) + '</b> руб.'
	}
	
	var iddiv = 'rraschet'
	str = '<div id="rraschet"><div class="forLandscape"><h2 style="font-family: Times New Roman; font-size:16px; margin:0;">Расчет процентов по правилам статьи 395 ГК РФ</h2><br>' + raschet + '<div id=space4qr></div></div></div>'
	change(str,iddiv)

	if (kolvo!=0) {
		var iddiv = 'kkolvo'
		oraz = ""+kolvo
		bkv = oraz.charAt(oraz.length-1)
		if (oraz.length>=2 && oraz.charAt(oraz.length-2)=="1") bkv=0
		str = '<span id="kkolvo">&nbsp;&nbsp;' + kolvo + ' ' + dn[bkv] + '</span>'
		change(str,iddiv)
	}
	
	for (let j=0; j<dolgdni1.length; j++) {
	    if (dolgdni1[j].length==10) {
		    var iddiv='warn'+j;
		    var oraz = notworkdaywarn(dolgdni1[j],j)
		    change(oraz,iddiv)
		}
	}

	uvDolgaMorator2022=false // увелич-е долга в период моратория
	if (Morator2022) {
	    for (i=0;i<dolgi.length;i++) {
	        if (datavperiode(dolgdni[i],'01.04.2022','01.10.2022')==1 && datavperiode(dolgdni[i],fdate,sdate)==1) {
	            uvDolgaMorator2022=true;
	            break;
	        }
	    }
	}
	
	sharelink()
	
	warning=[]
	
	if (returndate(fdate) > returndate(sdate)) {
	    warning.push('Введён период расчета ' + fdate + ' - ' + sdate + '. Но начало периода расчета не может быть позже окончания периода расчета.')
	}
	
	if (today < returndate(sdate)) {
	    warning.push('Введена дата окончания расчета в будущем. В отношении будущего периода расчет произведен по известной в настоящее время ключевой ставке ЦБ РФ. В будущем ключевая ставка ЦБ РФ может измениться.')
	}
	
	if (oplataNevPeriode || numDolgavPeriode < dolgdni.length) {
	    if (oplataNevPeriode && numDolgavPeriode < dolgdni.length) oraz='оплате и увеличении долга';
	    else if (oplataNevPeriode) oraz='оплате';
	    else if (numDolgavPeriode < dolgdni.length) oraz='увеличении долга';
	    warning.push('Введены данные об '+oraz+' за пределами периода расчёта (такие даты выделены голубым фоном). Если нужно отразить в расчёте все введённые данные об '+oraz+', то соответственно измените период расчёта (вторая строка калькулятора). Поле калькулятора "конец периода расчета" предполагает указание даты окончания для всего расчета (с охватом дат увеличений долга и оплат), а не только для первоначально введённой задолженности.')
	}
	
	if (uvDolgaMorator2022) {
	    warning.push('Выбрана опция не начислять проценты в период моратория. При этом введены данные об увеличении долга в период моратория. Но запрет начислять проценты не распространяется на задолженность, возникшую в период моратория (с 01.04.2022). Рекомендуется вместо текущего расчета сформировать два расчета: в одном - не учитывать задолженность, возникшую с 01.04.2022 и далее, и выбрать опцию не начислять проценты в период моратория; во втором - учесть задолженность, возникшую с 01.04.2022 и далее, и не выбирать опцию о неначислении процентов в период моратория. Оплаты между двумя этими расчетами следует разнести, в зависимости от того, какую именно задолженность (приведенную в первом или втором расчете) погашают эти оплаты.')
	}
	
    if (eff=="#e1") {
        warning.push('Выбрана опция об определении периода "из расчета 30 дней в месяце (360 дней в году)". Рекомендуется выбрать опцию об определении периода "в календарных днях".<br>Исключения:<br>1) если производится расчет договорной неустойки с условием об определении периода из расчета 30 дней в месяце;<br>2) если расчет относится к периоду до 24.03.2016 (тогда в судебной практике встречались оба подхода).<br>Подробнее см. в <a href=https://395gk.ru/#faq3 class=llink target=_blank>ответе на вопрос № 3</a>.')
    }
	
	if (d36==360) {
	    warning.push('Выбрана опция "делить на 360". С 24.03.2016 вместо этой опции рекомендуется выбирать опцию "делить на 365 (366)" (см. <a href=https://395gk.ru/#faq8 class=llink target=_blank>ответ на вопрос № 8</a>). Исключение: если производится расчет договорной неустойки с условием о делении на 360.')
	}
	
	linklength = d.getElementById('copy_from_href').href.length;
	if (linklength>1225) {
	    warning.push('Ссылка на расчет состоит из ' + linklength + ' символов. Ссылки с длиной больше 1225 символов могут не восприниматься как ссылки в Ворде (такая ссылка "некликабельна"). Ссылки с длиной больше 255 символов не воспринимаются как ссылки в Excel. В таких случаях можно из документа с некликабельной ссылкой скопировать полный адрес ссылки и вставить его в адресную строку браузера, затем нажать клавишу Enter.<br>Кроме того, браузеры воспринимают только первые 2700-3000 символов ссылки, что может приводить к потере части данных для более длинных ссылок. В таком случае можно воспользоваться <a onClick="importIzTabl(\'divimportfromlink\');" class=llink title="импортировать данные для заполнения калькулятора из ссылки на расчет&#013;(актуально для ссылок длиннее 2700-3000 символов)">импортом данных из ссылки на расчет</a> (эту опцию можно найти в верхнем правом углу калькулятора). Можно также сократить ссылку на расчет, если исключить или минимизировать данные в полях с примечаниями, либо сделать несколько расчетов вместо одного.')
	}
	
	if (curr!=0) {
	    warning.push('Калькулятор при расчете в долларах и евро актуален в период с 01.06.2015 по 31.07.2016. Далее (с 01.08.2016) калькулятор при расчете в долларах и евро неактуален, т.к. не учитывает ответ на вопрос № 3 раздела "Разъяснения по вопросам, возникающим в судебной практике" из "Обзора судебной практики Верховного Суда Российской Федерации N 1 (2017)" (утв. Президиумом Верховного Суда РФ 16.02.2017), согласно которому проценты за пользование чужими денежными средствами в иностранной валюте рассчитываются, по общему правилу, исходя из средних ставок по краткосрочным кредитам в иностранной валюте. Cведения об этих ставках можно найти на сайте ЦБ РФ - <a href=https://cbr.ru/statistics/?PrtId=int_rat target=_blank class=llink>https://cbr.ru/statistics/?PrtId=int_rat</a>')
	}
	
	if (qrmistake) {
	    warning.push('Генерация Qr-кода ссылки на этот расчет вызывала ошибку (обычно, из-за слишком длинной ссылки) и была отключена.')
	}
	
	if (warning.length!=0 && locationhash.indexOf('#c')==-1) {
	    letDisplay('warncontainer')
	    str='<b>Обратите внимание:</b>'
	    for (let i=0; i<warning.length; i++) {
	        if (warning.length>1) oraz='<b>' + (i+1) + '.</b> ';
	        else oraz=''
	        str+='<br>' + oraz + warning[i]
	    }
	    d.getElementById('warnings').innerHTML=str
	}
	
	for (let i=0; i<d.querySelectorAll('.date').length; i++) {
	    needwarndate(d.querySelectorAll('.date')[i])
	}
	
	ccalendar()
	
	d.getElementById('cenaprocent').innerHTML = human(okrugl(psumma)) + ' р. (проценты)'
	d.getElementById('cenaprocent').value=punk(okrugl(psumma))
    const dolgplusprocent=okrugl(parseFloat(okrugl(psumma))+parseFloat(pdolg[pdolg.length-1]))
	d.getElementById('cenadolgprocent').innerHTML = human(dolgplusprocent) + ' р. = ' + human(pdolg[pdolg.length-1]) + ' + ' + human(okrugl(psumma)) + ' (долг + %)'
	d.getElementById('cenadolgprocent').value=dolgplusprocent
	getgp()
	
} // end of beg() function beg()


/**
 * calendar
 */

let ali = 39;
let calcul = 1 + location.host.indexOf(ali + '5' + 'g' + 'k' + '.' + 'r' + 'u')

/**
 * getmin
 * @param c1 
 * @param c2 
 * @returns 
 */
function getmin(c1, c2) {
  try {
    let a1 = c1.split('.')
    let a2 = c2.split('.')
    let data1 = new Date(a1[2],(a1[1] - 1),a1[0])
    let data2 = new Date(a2[2],(a2[1] - 1),a2[0])
    if (calcul != 0) {
      return ((data2 - data1) >= 0) ? c1 : c2
    } else {
      return c1
    }
  } catch (err) {
    return c1;
  }
}