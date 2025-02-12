//----
function isitworkday(ddate) {
	var dd = eval(ddate.split('.')[0])
	var mm = eval(ddate.split('.')[1])
	var yyyy = eval(ddate.split('.')[2])
	if (yyyy<holiweek.length && yyyy>1994) {
    	hwdays = getholiweekdays(mm,yyyy)
    	return (hwdays.indexOf(dd)==-1)
	} else if (yyyy>=holiweek.length) {
	    let oraz = addnull(mm) + '-' + addnull(dd)
	    return (rusholidays.indexOf(oraz)==-1 && daynum(ddate)<6)
	} else {
	    return (daynum(ddate)<6)
	}
}

function firstworkdayfrom(ddate) {
	for (i=0; i<365; i++) {
		if ( isitworkday(ddate) ) {break;}
		else {ddate=plus(ddate)}
	}
	return ddate
}

function podrobnee1dayofdelay(iid) {
    if (iid=='top') {odraz='ffirstdate';oraz1='ddolg'} else {odraz='dolgdata'+iid;oraz1='dolg'+iid}
    let ddate = d.getElementById(odraz).value
    let ddolg = human(d.getElementById(oraz1).value)
    let vchera = minus(ddate)
    let nextWorkDay = firstworkdayfrom(ddate)
    let realdayofdelay = plus(nextWorkDay)

    let iddiv = 'podrobnee'
	str = '<div id=podrobnee>Если ' + ddate + ' введено как первый день просрочки' + ((ddolg!='') ? (' по оплате ' + ddolg + ' ' + valuta[curr]) : '') + ', то последним днём срока для оплаты определено ' + vchera + ' - нерабочий день.<br>'
	str+= 'Но согласно <a href=st193gk.htm class=llink target=_blank>ст. 193 ГК РФ</a>, если последний день срока приходится на нерабочий день, днём окончания срока считается ближайший следующий за ним рабочий день. Ближайшим рабочим днём, следующим за ' + vchera + ', является ' + nextWorkDay + '.<br>Тогда первым днём просрочки является ' + realdayofdelay
	str+= '.<br><br>Но если ' + ddate + ' введено не как первый день просрочки, то не требуется заменять эту дату. Например, если ранее был произведен расчет процентов по состоянию на ' + vchera + ', а теперь производится дорасчет процентов с ' + ddate + ' на ту же сумму основного долга, то заменять введённую дату не нужно.'
    str+= '<br><br><input type=button onClick="changeDisplay(\'podrobnee\');changeDisplay(\'zatemnenie\');return false;" value="Закрыть" class=mainbutton> &nbsp; '
    str+= '<input type=button onClick="d.getElementById(\'' + odraz + '\').value=\'' + realdayofdelay + '\';beg();changeDisplay(\'podrobnee\');changeDisplay(\'zatemnenie\');return false;" value="Заменить на ' + realdayofdelay + '" class=mainbutton>'
	str+= '</div>'
	change(str,iddiv)
}

function notworkdaywarn(ddate,iid) {
    if (ddate && ddate!='' && ddate.length==10) {
        let vchera = minus(ddate)
        if (isitworkday(vchera)) {
            str="<span class=warn id='warn"+iid+"'></span>"
    	} else {
    	    if (iid=='top') {orazz='ffirstdate'} else {orazz='dolgdata'+iid}
            realdayofdelay = plus(firstworkdayfrom(vchera));
            str="<span class=warn id='warn"+iid+"'><br>&#8593; Возможно, следует заменить дату на " + realdayofdelay + " &nbsp; <a class=llink onClick=\"importIzTabl('podrobnee');podrobnee1dayofdelay('" + iid + "');\">Подробнее</a> &nbsp; <a class=llink onClick='d.getElementById(\"" + orazz + "\").value=\"" + realdayofdelay + "\";beg();'>Заменить</a></span>"
    	}
    } else {
        str="<span class=warn id='warn"+iid+"'></span>"
    }
	return str
}

function firstdayofdelay(fdate) {
    iddiv='warntop'
    let str=notworkdaywarn(fdate,'top')
    change(str,iddiv)
}

function IsLeapYear(year) { 
    if(year%4 == 0) { 
        if(year%100 == 0) { 
            if(year%400 == 0) { 
                return true; 
            } 
            else 
                return false; 
        } 
        else 
            return true; 
    } 
    return false; 
}

function addfor366(aa1,aa2,oraz) {
	year1=eval(aa1.substr(6,aa1.length))
	year2=eval(aa2.substr(6,aa2.length))
    if (year1.toString().length==4 && year2.toString().length==4 && year2>=year1) {
        for (i=0; i<=(year2-year1); i++) {
            beginyear="01.01."+(year1+i)
            endyear="01.01."+(year1+i+1)
            if (IsLeapYear(year1+i) && beginyear.length==10 && endyear.length==10) {
                if (getmin(aa1,beginyear)==aa1 && aa1!=beginyear) {addbpdata(beginyear,oraz);}
                if (getmax(aa2,endyear)==aa2 && aa2!=endyear) {addbpdata(endyear,oraz);}
            }
        }
    }
}
function addbpdata(aa1,oraz) {
    if (oraz==0) {
        for (j=0;j<=bpdata.length-1;j++) {
            if (getmin(aa1,bpdata[j])==aa1 && aa1!=bpdata[j]) {
                bpdata.splice(j,0,aa1);
                bprocent[curr][okrug].splice(j,0,bprocent[curr][okrug][j-1]);
                break;
            }
        }
    }
    if (oraz==1) {
        for (j=0;j<=bsdata.length-1;j++) {
            if (getmin(aa1,bsdata[j])==aa1 && aa1!=bsdata[j]) {
                bsdata.splice(j,0,aa1);
                bsprocent.splice(j,0,bsprocent[j-1]);
                break;
            }
        }
    }
}

function exportHTML(){
    var header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
        "xmlns:w='urn:schemas-microsoft-com:office:word' "+
        "xmlns='http://www.w3.org/TR/REC-html40'>"+
        "<head><meta charset='utf-8'><title>Расчет с сайта 395gk.ru</title>"+
        "<style>" + ((kvskobnum > 10) ? "@page forLandscape{mso-page-orientation:landscape;size: 841.95pt 595.35pt;}div.forLandscape{page:forLandscape;}" : "") + "td{font-size:" + tfsize + "pt}</style></head><body>";
    var footer = "</body></html>";
    var sourceHTML = header+document.getElementById("rraschet").innerHTML+footer;
    var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = '395gk_ru.doc';
    fileDownload.click();
    document.body.removeChild(fileDownload);
}

//-----------------
function okrugl(oraz) { // округление
	mult=Math.pow(10,2)
	var a=""+(Math.round(oraz*mult)/mult)
	return a	
}

function change(str,iddiv) {
	var dom = d.createElement('DIV');
	dom.innerHTML = str;
	var cc = dom.childNodes;
	d.getElementById(iddiv).innerHTML = cc[0].innerHTML;
}

function punk(dosum) {
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
		    var reg=/\D*(\d+)\D+(\d*)\D*/	// игнорируем руб., коп. и т.п.
	        var abc=reg.exec(um)
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
    } else {return ''}
}

function returnmm(xdate) { // перенеси
    a1 = xdate.split('.')
    return a1[1]
}

function daysInMm(xdate) {
    a1 = xdate.split('.')
    return new Date(a1[2], a1[1], 0).getDate();
}

function needwarndate(obj) {
    xdate = obj.value
    if (xdate=='' && ( obj==d.getElementById('ffirstdate') || obj==d.getElementById('sseconddate') ) ) {
        obj.className='date warnfon'
        obj.title='не заполнено обязательное поле'
        return
    } else if (xdate=='') {
        obj.className='date'
        obj.title=''
        return
    }
    xdate = checkstrdate(xdate)
    let yy=returndate(xdate).getFullYear()
    let mmonth=returnmm(xdate)
    let dd=returnday(xdate)
    let maxdd=daysInMm(xdate)
    let oraz=''
    if (dd>maxdd) oraz+='в этом месяце всего '+maxdd+' дн.'
    if (mmonth>12) oraz+=((oraz!='') ? '; ' : '')+'слишком большой номер месяца'
    if (yy<1995) oraz+=((oraz!='') ? '; ' : '')+'слишком маленький год для расчета'
    if (yy>(new Date().getFullYear()+1)) oraz+=((oraz!='') ? '; ' : '')+'слишком большой год для расчета'
    if (datavperiode(xdate,fdate,sdate)!=0) etadatavperiode=true; else etadatavperiode=false
    if (oraz!='') {
        obj.className='date' + ((!etadatavperiode) ? ' outofperiod' : '') + ' warnfon'
        obj.title=oraz+((!etadatavperiode) ? '; дата вне периода расчета' : '')
    } else {
        obj.className='date'+((!etadatavperiode) ? ' outofperiod' : '')
        obj.title=''+((!etadatavperiode) ? 'дата вне периода расчета' : '')
    }
    // if (datavperiode(xdate,fdate,sdate)==0) {
    //     obj.className+=' outofperiod'
    //     obj.title+=((oraz!='') ? '; ' : '')+'дата вне периода расчета'
    // }
}

function checkstrdate(xdate) {
	xdate = xdate.replace(' ','') // убрать пробелы
	xdate = xdate.replace(/[^\d]/g,'.') // заменить любой символ не цифры на тчк
	xdate = xdate.replace(/\.\./g,'.') // заменить 2 тчк на 1 тчк
	xsim = xdate.split('')
	if (xdate.length==2) {
		if ( /\d/.test(xsim[0]) && /\d/.test(xsim[1]) ) xdate+='.'
		if ( /\d/.test(xsim[0]) && xsim[1]=='.') xdate='0'+xdate
	}
	if (xdate.length==5) {
		if ( /\d/.test(xsim[3]) && /\d/.test(xsim[4]) ) xdate+='.'
		if ( /\d/.test(xsim[3]) && xsim[4]=='.') xdate=xsim[0]+xsim[1]+xsim[2]+'0'+xsim[3]+xsim[4]
	}
	if (xdate.length==8) {
		var oraz=xsim[6]+xsim[7]
		xdate = xdate.substr(0,6) + '20' + xdate.substr(6,2) // if (oraz!='19' && oraz!='20')
	}
	return xdate
}

function checkdate(obj) {
	xdate = obj.value
	xdate = xdate.replace(' ','') // убрать пробелы
	xdate = xdate.replace(/[^\d]/g,'.') // заменить любой символ не цифры на тчк
	xdate = xdate.replace(/\.\./g,'.') // заменить 2 тчк на 1 тчк
	xsim = xdate.split('')
	if (xdate.length==2) {
		if ( /\d/.test(xsim[0]) && /\d/.test(xsim[1]) && !keyCodeBackspace) xdate+='.'
		if ( /\d/.test(xsim[0]) && xsim[1]=='.') xdate='0'+xdate
	}
	if (xdate.length==5) {
		if ( /\d/.test(xsim[3]) && /\d/.test(xsim[4]) && !keyCodeBackspace) xdate+='.'
		if ( /\d/.test(xsim[3]) && xsim[4]=='.') xdate=xsim[0]+xsim[1]+xsim[2]+'0'+xsim[3]+xsim[4]
	}
	if (xdate.length==8) {
		var oraz=xsim[6]+xsim[7]
		if (oraz!='19' && oraz!='20') xdate = xdate.substr(0,6) + '20' + xdate.substr(6,2)
	}
	obj.value=xdate
//	needwarndate(obj)
}

function human(dosum) {
	var sum = ""+dosum
	sum = sum.replace(/\s+/g, '')
	sum = sum.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ') // разрядность
	if (sum.indexOf(".")!=-1) {						   // к десяткам копеек добавляем ноль
		var b=sum.substr(sum.indexOf("."),sum.length)
		if (b.length==2) sum+="0"
	}
	sum = sum.replace(/^00\./,'0,') // меняем 00. на 0,
	sum = sum.replace(/^00,/,'0,')
	sum = sum.replace(/\./g,',') // меняем тчк на зпт
	return sum
}

function changeDisplay(oraz) {
    if (d.getElementById(oraz).style.display == "block")
        d.getElementById(oraz).style.display = "none";
    else
        d.getElementById(oraz).style.display = "block";
}

function notDisplay(oraz) {
    if (d.getElementById(oraz).style.display != "none") d.getElementById(oraz).style.display = "none" 
}

function letDisplay(oraz) {
    if (d.getElementById(oraz).style.display == "none") d.getElementById(oraz).style.display = "block"
}

function letDisplayinline(oraz) {
    if (d.getElementById(oraz).style.display == "none") d.getElementById(oraz).style.display = "inline-block"
}

function importIzTabl(oraz) {
    changeDisplay(oraz);
    d.getElementById('zatemnenie').style.display = "block";
//    const impOpl = document.getElementById('ImportOplat');
//    impOpl.focus();
}

function cbplan(c1) {
	var a1 = c1.split('.')
	if (a1[1]!='12') {
		var c2 = '15.' + addnull(eval(a1[1])+1) + '.' + a1[2]
	}
	else {var c2 = '15.01.' + (eval(a1[2])+1)}
	return c2
}

function copyarray(orig,kop) {
	for (i=0;i<orig.length;i++) {
		kop[i] = orig[i];
	}
	if (Morator2022) {
    	for (i=0;i<kop.length;i++) {
    		if (kop[i]=='11.04.2022') {kop.splice(i,6,'01.04.2022','02.10.2022'); break;}
    	}
	}
}

function copyarray2(orig,kop) {
	for (j=0;j<9;j++) {
		kop[j]=[]
		for (i=0;i<((typeof(hit)=='undefined') ? 16 : hit)-kkod;i++) {
			kop[j][i] = orig[j][i]
		}
		if (Morator2022) {
    	    for (i=0;i<hit-kkod;i++) {
    	    	if (pdata[i]=='11.04.2022') {kop[j].splice(i,5,0); break;}
    	    }
	    }
	}
}

function copyarrayonly(orig,kop) {
    for (i=0;i<orig.length;i++) {
		kop[i] = orig[i];
	}
}

function myprocent() {
	d.getElementById('hiddenusersprocent').value=punk(d.getElementById('usersprocent').value);
	beg();
}

const rus='абвгдежзийклмнопрстухчшъыяАБВГДЕЖЗИЙКЛМНОПРСТУХЧШЪЫЯ'
const eng='abvgdejziyklmnoprstuhxwqfcABVGDEJZIYKLMNOPRSTUHXWQFC'
const rus1='ёщьфцэюЁЩЬФЦЭЮ'
const eng1='ewqfczyEWQFCZY'

/*Буквы, которые не сочетаются независимо от порядка расположения
ГЪ, ЕЭ, ЁЫ, ЁЭ, ЁЯ,ЖФ, ЖЩ, ЗЩ, ХЩ, ЦЩ, ЦЭ,  ФЦ, ЧЩ, ШЩ, ЧЭ, ЫЭ -------- АЬ, ЙЖ,  ЖЧ, УЬ,    , --- ЙЬ,ЖШ,ЬЫ,ОЫ,ЗП, УЫ,АЫ, 
const eng1='yqjwqfofzpufaf'
*/

function primcheck(oraz) {
    if (oraz=='т') return 'ttt'
    oraz=oraz.replace(/undefined/g,"").replace(/([a-z]+)/gi,"\._$&\,_").replace(/%/g,'0/0')
    oraz=oraz.replace(/&/g,'0n0')
    oraz=oraz.replace(/\s№\s/g,'_nnn_').replace(/№\s/g,'nnn_').replace(/\s№/g,'_nnn').replace(/№/g,'nnn')
    oraz=oraz.replace(/\s\+\s/g,'_--l--_').replace(/\+\s/g,'--l--_').replace(/\s\+/g,'_--l--').replace(/\+/g,'--l--')
    let oraz1=''
    for (let i=0;i<oraz.length;i++) {
        let j=oraz.charAt(i)
        if (rus1.indexOf(j)!=-1) {
            oraz1+=eng1.charAt(rus1.indexOf(j))+'_'
        } else if (rus.indexOf(j)!=-1) {
            oraz1+=eng.charAt(rus.indexOf(j))
        } else {oraz1+=j}
    }
    oraz=oraz1;
	oraz=oraz.replace(/;/g,'.,');
	oraz=oraz.replace(/#/g,',,,');
	oraz=oraz.replace(/</g,'-_');
	oraz=oraz.replace(/>/g,'t_-');
	oraz=oraz.replace(/\s/g,'__');
//	oraz=oraz.replace(/\s/g,'qqq');
	return oraz;
}

function backprim(oraz) {
    if (oraz=='undefined' || oraz=='._undefined,_') {
        return ''
    } else if (oraz=='ttt') {
        return 'т'
    }
    oraz=oraz.replace(/0n0/g,'&')
    oraz=oraz.replace(/_nnn_/g,' № ')
    oraz=oraz.replace(/nnn_/g,'№ ')
    oraz=oraz.replace(/_nnn/g,' №')
    oraz=oraz.replace(/nnn/g,'№')
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
	for (let i=0;i<oraz.length;i++) {
	    let j=oraz.charAt(i)
	    let k=oraz.charAt(i+1)
//	    if (/\._([a-z]+)\,_/gi).test(oraz))
	    if (j=='.' && k=='_' && oraz.slice(j).indexOf(',_')!=-1) {
//	        oraz1+=oraz.replace(/\._([a-z]+)\,_/i, "$&")
//	        continue
            let a=oraz.slice(i+2,oraz.slice(j).indexOf(',_'))
            oraz1+=a
            i+=a.length+3
	    } else {
	        if (eng1.indexOf(j)!=-1 && k=='_') {
                oraz1+=rus1.charAt(eng1.indexOf(j));
                i++;
            } else if (eng.indexOf(j)!=-1) {
                 oraz1+=rus.charAt(eng.indexOf(j))
            } else {oraz1+=j}  
	    }
	}
	oraz1=oraz1.replace(/__/g, ' ');
	return oraz1;
}

function datavperiode(ddate,fdate,sdate) {
    orazdate = returndate(ddate)
//    if (getmin(fdate,ddate)==fdate && getmax(sdate,ddate)==sdate) return 1;
    if (orazdate>=returndate(fdate) && returndate(sdate)>=orazdate) return 1;
    else return 0
}

function addnbsp(num) {
    return num.replace(/\s/g,'&nbsp;')
}

programplusminus = false
oplprogramplusminus = false
kvskobnum = 6
qrmistake = false
function beg() {
	dolg = punk(d.getElementById('ddolg').value)
	fdate = d.getElementById('ffirstdate').value; 
	sdate = d.getElementById('sseconddate').value;
	okrug = d.getElementById('rregion').value
	eff = d.getElementById('effdni').value
	rvid = (d.getElementsByName('rrvid')[0].checked) ? 0 : 1
	d36 = d.getElementById('divide360').value
	Morator2022 = d.getElementById('Moratoriy2022').checked
	psumma = 0
	kolvo = kolvo1 = 0
	oplata4link=''
	dolg4link=''
	d.getElementById('copyRButton').value=d.getElementById('copyRButton2').value=d.getElementById('copyRButton3').value="Копировать расчет"
	d.getElementById('copylinkbutton').value=d.getElementById('copylinkbutton2').value="Копировать ссылку";
	tfsize='12'

	curr = d.getElementById('currency').value
	if (curr!=0) {d.getElementById('sst317').checked = 0; d.getElementById('sst317').setAttribute('disabled', 'disabled');} else {d.getElementById('sst317').removeAttribute('disabled');}

	if (getmin(fdate,"31.07.2016")==fdate || curr!=0) {d.getElementById('regionmenu').style.display='';d.getElementById('regionmenu2').style.display='';} 
	else {d.getElementById('regionmenu').style.display='none';d.getElementById('regionmenu2').style.display='none';}
	
	if (getmin(fdate,'01.10.2022')==fdate && getmin(sdate,'01.04.2022')=='01.04.2022') d.getElementById('moratormenu').style.display='';
	else d.getElementById('moratormenu').style.display='none'

	st317 = d.getElementById('sst317').checked
	
	oplata = []
	oplatadni = []
	npd = []
	platil = 0

	dolgi = []
	dolgdni = []
    dolgprim = []
    dolgbyl = 0
	
	bpdata=[]
	bprocent=[[],[],[]]
    copyarray(pdata,bpdata)	//if (copyarray(pdata,bpdata); else copyarray(pdatarub,bpdata)
	copyarray2(procent[0],bprocent[0])
	copyarray2(procent[1],bprocent[1])
	copyarray2(procent[2],bprocent[2])
	if (curr!=0) bprocent[curr][okrug][0] = d.getElementById('hiddenusersprocent').value

    if (fdate!='' && sdate!='' && d36!=360) {addfor366(fdate,sdate,0);}
	
	oplata1=[]
	oplatadni1=[]
	npd1=[] // примечания у одинаковых дат чз зпт
	npd2=[]

	dolg1=[]
	dolgdni1=[]
	dolgprim1=[] // примечания у одинаковых дат чз зпт
	dolgprim2=[]

	oplataprimnum=0

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

function addqr1raz() {
    d.getElementById('qrcodebox').checked = false
    beg()
    d.getElementById('qrcodebox').checked = true
    return false
}

function cleanwarn() {
    notDisplay('warncontainer')
}

function cleanwarn0() {
	var iddiv = 'warn0'
	str = '<span class=warn id=warn0></span>'
	change(str,iddiv)
}

function clean() {
	d.getElementById('ddolg').value = ''
	d.getElementById('ffirstdate').value = ''
	d.getElementById('sseconddate').value = ''
	d.getElementById('regionmenu').style.display = 'none'
	d.getElementById('regionmenu2').style.display = 'none'
	d.getElementById('moratormenu').style.display = 'none'
	d.getElementById('copyRButton').value=d.getElementById('copyRButton2').value=d.getElementById('copyRButton3').value="Копировать расчет"
	d.getElementById('copylinkbutton').value=d.getElementById('copylinkbutton2').value="Копировать ссылку"
	d.getElementById('Moratoriy2022').checked = 0
	d.getElementById('sst317').checked = 0
	d.getElementById('oplata0').value = d.getElementById('oplatadata0').value = d.getElementById('npd0').value = ''
	d.getElementById('dolg0').value = d.getElementById('dolgdata0').value = d.getElementById('dolgprim0').value = ''
	oplatanum = 0
	dolgnum = 0
	curr = 0; d.getElementById('currency').value = 0
	d.getElementById('hiddenusersprocent').value = 0
	d.getElementById('Moratoriy2022').removeAttribute('disabled')
	d.getElementById('sst317').removeAttribute('disabled')
	programplusminus = false
	oplprogramplusminus = false
	kvskobnum = 6
	qrmistake = false
	d.getElementById('qrcodebox').checked = true
	d.getElementById('cenaprocent').value = ''
	d.getElementById('cenadolgprocent').value = ''
	d.getElementById('cenaprocent').innerHTML = '0 р. (проценты)'
	d.getElementById('cenadolgprocent').innerHTML = '0 р. = 0 + 0 (долг + %)'
	d.getElementById('cenasvoya').value = ''
	d.getElementById('hrefgp').href = 'https://395gk.ru/gp/'
	d.getElementById('linksymbnum').innerHTML = ''
	d.getElementById('linksymbnum2').innerHTML = ''

	oplata1=[]
	oplatadni1=[]
	npd1=[]

	dolg1=[]
	dolgdni1=[]
	dolgprim1=[]

	var iddiv = 'rraschet'
	str = '<div id="rraschet">При сумме задолженности <b>0</b> руб. (' + fedokrug[okrug] + ' федеральный округ)<br>'
	str += 'проценты за пользование чужими денежными средствами составляют:</div>'
	change(str,iddiv)

	var iddiv = 'kkolvo'
	str = '<span id="kkolvo"></span>'
	change(str,iddiv)
	
	var iddiv = 'ooplata'
	str = '<span id="ooplata"></span>'
	change(str,iddiv)

	var iddiv = 'dopdolg'
	str = '<span id="dopdolg"></span>'
	change(str,iddiv)

	var iddiv = 'warntop'
	str = '<span class=warn id=warntop></span>'
	change(str,iddiv)

	var iddiv = 'llink'
	str = '<span id=llink>Ссылка на расчет: <a href=https://395gk.ru class=llink target=_blank id=copy_from_href>https://395gk.ru/</a></span>'
	change(str,iddiv)

	var iddiv = 'llink2'
	str = '<span id=llink2>Ссылка на расчет: <a href=https://395gk.ru class=llink target=_blank>https://395gk.ru/</a></span>'
	change(str,iddiv)
	
    change('<span id=qr1raz></span>','qr1raz')
	
	for (let i=0; i<d.querySelectorAll('.date').length; i++) {
	    d.querySelectorAll('.date')[i].className='date'
	    d.querySelectorAll('.date')[i].title=''
	}
	
	cleanwarn()
	cleanwarn0()
}

function setCookie (name, value, expires, path, domain, secure) {
      d.cookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
}

function getCookie(name) {
	var matches = d.cookie.match(new RegExp(
	  "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	))
	return matches ? decodeURIComponent(matches[1]) : 'zero' 
}

oplatanum = 0;
ostrbegin = '<span id=ooplata>';
ostrend = '</span>';
function oplataplus() {
	ostr = ''
	for (i=1;i<=oplatanum;i++) {
        try {
    		if (oplatadni1[i] && oplatadni1[i]!='') oraz=minus(oplatadni1[i]); else oraz=''            
        } catch(err) {
            oraz=''
        }
		if (oplata1[i] && oplata1[i]!='') oraz1=human(oplata1[i]); else oraz1=''											
		ostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=oplatadata' + i + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + oraz + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма оплаты" id=oplata' + i + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + oraz1 + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=npd' + i + ' onClick=beg() onkeyup=beg() value="' + ((npd1[i]) ? npd1[i] : '') + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета оплаты" onClick=oplataplus()> <input type=button value=" - " title="удалить эту строку с данными об оплате" onClick=oplataminus(' + i + ')>'
	}
	oplatanum++
	ostr += '<br><input type=text class=date placeholder="дд.мм.гггг" id=oplatadata' + oplatanum + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма оплаты" id=oplata' + oplatanum + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=npd' + oplatanum + ' onClick=beg() onkeyup=beg() size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета оплаты" onClick=oplataplus()> <input type=button value=" - " title="удалить эту строку с данными об оплате" onClick=oplataminus(' + oplatanum + ')>'
	
	if (oplata1[0]) d.getElementById('oplata0').value=human(oplata1[0])
	
	iddiv = 'ooplata'
	str = ostrbegin + ostr + ostrend
	change(str,iddiv)
	
	for (let i=0; i<d.querySelectorAll('.date').length; i++) {
	    needwarndate(d.querySelectorAll('.date')[i])
	}
	
	ccalendar()
	Listener4backspace()
}

dolgnum=0;
dostrbegin='<span id=dopdolg>'
function dolgplus() {
	dostr = ''
//	dolgnum++
	for (let ij=1;ij<=dolgnum;ij++) {
	    try {
            if (!dolgdni1[ij] || dolgdni1[ij]=='') {oraz=''} else {oraz=dolgdni1[ij];}	        
	    } catch(err) {
	        oraz=''
	    }
		if (dolg1[ij] && dolg1[ij]!='') oraz1=human(dolg1[ij]); else oraz1=''
		dostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=dolgdata' + ij + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + oraz + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма долга" id=dolg' + ij + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + oraz1 + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=dolgprim' + ij + ' onClick=beg() onkeyup=beg() value="' + ((dolgprim1[ij]) ? dolgprim1[ij] : '') + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета долга" onClick=dolgplus()> <input type=button value=" - " title="удалить эту строку с данными о долге" onClick=dolgminus(' + ij + ')>'
		if (oraz!='') {dostr += notworkdaywarn(dolgdni1[ij],ij);} else {dostr += '<span class=warn id=warn' + ij + '></span>';}
	}
	dolgnum++

	dostr += '<br><input type=text class=date placeholder="дд.мм.гггг" id=dolgdata' + dolgnum + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма долга" id=dolg' + dolgnum + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=dolgprim' + dolgnum + ' onClick=beg() onkeyup=beg() size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета долга" onClick=dolgplus()> <input type=button value=" - " title="удалить эту строку с данными о долге" onClick=dolgminus(' + dolgnum + ')><span class=warn id=warn' + dolgnum + '></span>'

	programplusminus = false
	
	if (dolg1[0]) d.getElementById('dolg0').value=human(dolg1[0])
	
	iddiv = 'dopdolg'
	str = dostrbegin + dostr + '</span>'
	change(str,iddiv)
	
	for (let i=0; i<d.querySelectorAll('.date').length; i++) {
	    needwarndate(d.querySelectorAll('.date')[i])
	}
	
	ccalendar()
	Listener4backspace()
}

function importDolgi() {
	oraz = d.getElementById('importDolga').value;
	var orazstr = oraz.split('\n')
	for (let i=0;i<orazstr.length;i++) {
		if (orazstr[i]!='') {
			importDolg = orazstr[i].split('\t')
			if (importDolg[0]!='' && importDolg[1]!='') {
			    if (dolgi=='' && dolgdni=='' && dolgprim=='') {
			        dolgdni[0]=checkstrdate(importDolg[0]);
			        dolgi[0]=importDolg[1].trim();
//			        dolgi[0]=okrugl(eval(importDolg[1].trim()));
			        if (importDolg[2] && importDolg[2]!='undefined') dolgprim[0]=importDolg[2];
			    } else {
    		    	dolgdni.push(importDolg[0]); // добавляем в конец массива
    		    	dolgi.push(importDolg[1].trim());
    		    	dolgprim.push(importDolg[2]);
//      			dolgprim.push(((importDolg[2]) ? importDolg[2] : ""));
			    }
    			dolgbyl = 2
   		    }
   		    if (dolg1=='' && dolgdni1=='' && dolgprim1=='') {
			    dolgdni1[0]=importDolg[0];
			    dolg1[0]=importDolg[1].trim();
			    if (importDolg[2] && importDolg[2]!='undefined') dolgprim1[0]=importDolg[2];   		        
   		    } else {
           		dolgdni1.push(importDolg[0]);
        		dolg1.push(importDolg[1].trim());
        		dolgprim1.push(importDolg[2]);
//         		dolgprim1.push(((importDolg[2]) ? importDolg[2] : ""));
   		    }
			dolgnum++
		}
	}
	
// это можно в отдельную функцию
	dostr = ''

	for (let i=1;i<=dolgnum;i++) {
		if (dolgdni1[i] && dolgdni1[i]!='') oraz=dolgdni1[i]; else oraz=''
		if (dolg1[i] && dolg1[i]!='') oraz1=human(punk(dolg1[i])); else oraz1=''
		dostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=dolgdata' + i + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + checkstrdate(oraz) + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма долга" id=dolg' + i + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + oraz1 + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=dolgprim' + i + ' onClick=beg() onkeyup=beg() value="' + ((dolgprim1[i]) ? dolgprim1[i] : '') + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета долга" onClick=dolgplus()> <input type=button value=" - " title="удалить эту строку с данными о долге" onClick=dolgminus(' + i + ')>'
		if (oraz!='') {dostr += notworkdaywarn(dolgdni1[i],i);} else {dostr += '<span class=warn id=warn' + i + '></span>';}
	}
	
	if (d.getElementById('dolgdata0').value=='' && d.getElementById('dolg0').value=='' && d.getElementById('dolgprim0').value=='') {
        d.getElementById('dolgdata0').value=checkstrdate(dolgdni1[0])
        d.getElementById('dolg0').value=human(punk(dolg1[0]))
        d.getElementById('dolgprim0').value=dolgprim1[0]
	}
	programplusminus = true
// конец

	iddiv = 'dopdolg'
	str = dostrbegin + dostr + '</span>'
	change(str,iddiv)
	
	d.getElementById('importDolga').value='';
	
	changeDisplay('divImportDolga');
	changeDisplay('zatemnenie');
	
	beg()
	ccalendar()
	Listener4backspace()
}

function importOplaty() {
	oraz = d.getElementById('importOplat').value;
	var orazstr = oraz.split('\n')
	for (let i=0; i<orazstr.length; i++) {
		if (orazstr[i]!='') {
			importOpl = orazstr[i].split('\t')
			if (importOpl[0]!='' && importOpl[1]!='') {
			    if (oplata=='' && oplatadni=='' && npd=='') {
			        oplatadni[0]=checkstrdate(importOpl[0]);
			        oplata[0]=importOpl[1].trim();
			        if (importOpl[2] && importOpl[2]!='undefined') npd[0]=importOpl[2];
			    } else {
    		    	oplatadni.push(plus(checkstrdate(importOpl[0]))); // добавляем в конец массива
    		    	oplata.push(importOpl[1].trim());
    		    	npd.push(importOpl[2]);
			    }
    			platil = 2
   		    }
   		    if (oplata1=='' && oplatadni1=='' && npd1=='') {
			    oplatadni1[0]=checkstrdate(importOpl[0]);
			    oplata1[0]=importOpl[1].trim();
			    if (importOpl[2] && importOpl[2]!='undefined') npd1[0]=importOpl[2];   		        
   		    } else {
           		oplatadni1.push(plus(checkstrdate(importOpl[0])));
        		oplata1.push(importOpl[1].trim());
        		npd1.push(importOpl[2]);
   		    }
			oplatanum++
		}
	}

// это можно в отдельную функцию
	ostr = ''

	for (let i=1; i<=oplatanum; i++) {
		if (oplatadni1[i] && oplatadni1[i]!='') oraz=minus(oplatadni1[i]); else oraz=''
		if (oplata1[i] && oplata1[i]!='') oraz1=human(punk(oplata1[i])); else oraz1=''
		ostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=oplatadata' + i + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + oraz + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма оплаты" id=oplata' + i + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + oraz1 + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=npd' + i + ' onClick=beg() onkeyup=beg() value="' + ((npd1[i]) ? npd1[i] : '') + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета оплаты" onClick=oplataplus()> <input type=button value=" - " title="удалить эту строку с данными об оплате" onClick=oplataminus(' + i + ')>'
	}
	
	if (d.getElementById('oplatadata0').value=='' && d.getElementById('oplata0').value=='' && d.getElementById('npd0').value=='') {
        d.getElementById('oplatadata0').value=checkstrdate(oplatadni1[0])
        d.getElementById('oplata0').value=human(punk(oplata1[0]))
        d.getElementById('npd0').value=npd1[0]
	}
	oplprogramplusminus = true
// конец

	iddiv = 'ooplata'
	str = ostrbegin + ostr + '</span>'
	change(str,iddiv)
	
	d.getElementById('importOplat').value='';
	
	changeDisplay('divImportOplat');
	changeDisplay('zatemnenie');
	
	beg()
	ccalendar()
	Listener4backspace()
}

function oplataminus(a1) {
	ostr = ''
	oplatanum--
	for (let i=1;i<=oplatanum;i++) {
		try {
		    if (a1==i) {oplatadni1.splice(i,1); oplata1.splice(i,1); npd1.splice(i,1)}
		} catch(err) {}
		try {
    		if (oplatadni1[i] && oplatadni1[i]!='') oraz=minus(oplatadni1[i]); else oraz=''            
        } catch(err) {
            oraz=''
        }
		if (oplata1[i] && oplata1[i]!='') oraz1=human(oplata1[i]); else oraz1=''
		ostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=oplatadata' + i + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + oraz + '" size=10  autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма оплаты" id=oplata' + i + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + oraz1 + '" size=15  autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=npd' + i + ' onClick=beg() onkeyup=beg() value="' + ((npd1[i]) ? npd1[i] : '') + '" size=10  autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета оплаты" onClick=oplataplus()> <input type=button value=" - " title="удалить эту строку с данными об оплате" onClick=oplataminus(' + i + ')>';	
	}
	oplprogramplusminus = false
	
	if (oplata1[0]) d.getElementById('oplata0').value=human(oplata1[0])
	
	iddiv = 'ooplata'
	str = ostrbegin + ostr + ostrend
	change(str,iddiv)
	beg();
	ccalendar()
	Listener4backspace()
}

function dolgminus(a1) {
	dostr = ''
	dolgnum--
	for (let i=1;i<=dolgnum;i++) {
		try {
		    if (a1==i) {dolgdni1.splice(i,1); dolg1.splice(i,1); dolgprim1.splice(i,1)}
		} catch(err) {}
	    try {
    		if (dolgdni1[i] && dolgdni1[i]!='') oraz=dolgdni1[i]; else oraz=''        
	    } catch(err) {
	        oraz=''
	    }
		if (dolg1[i] && dolg1[i]!='') oraz1=human(dolg1[i]); else oraz1=''
		dostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=dolgdata' + i + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + oraz + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма долга" id=dolg' + i + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + oraz1 + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=dolgprim' + i + ' onClick=beg() onkeyup=beg() value="' + ((dolgprim1[i]) ? dolgprim1[i] : '') + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета долга" onClick=dolgplus()> <input type=button value=" - " title="удалить эту строку с данными о долге" onClick=dolgminus(' + i + ')>';
		if (oraz!='') {dostr += notworkdaywarn(dolgdni1[i],i);} else {dostr += '<span class=warn id=warn' + i + '></span>';}
	}
	programplusminus = false
	
	if (dolg1[0]) d.getElementById('dolg0').value=human(dolg1[0])
	
	iddiv = 'dopdolg'
	str = dostrbegin + dostr + '</span>'
	change(str,iddiv)
	beg();
	ccalendar()
	Listener4backspace()
}

function sum2link(ssum) {
    if (ssum!='') {
        oraz = ssum.replace(/\s/g,'').replace(/,/g,'.').replace(/\.00/,'')
        oraz = oraz.replace(/000000000/g,'d').replace(/00000000/g,'v').replace(/0000000/g,'s').replace(/000000/g,'b').replace(/00000/g,'p').replace(/0000/g,'c').replace(/000/g,'k').replace(/00/g,'w')
        oraz = oraz.replace(/\.9/g,'D').replace(/\.8/g,'V').replace(/\.7/g,'S').replace(/\.6/g,'B').replace(/\.5/g,'P').replace(/\.4/g,'C').replace(/\.3/g,'K').replace(/\.2/g,'W').replace(/\.1/g,'L').replace(/\.0/g,'O')
        return oraz
    } else {
        return ''
    }
}

function sum2calc(ssum) {
    if (ssum && ssum!='') {
        oraz = ssum.replace(/w/g,'00').replace(/k/g,'000').replace(/c/g,'0000').replace(/p/g,'00000').replace(/b/g,'000000').replace(/s/g,'0000000').replace(/v/g,'00000000').replace(/d/g,'000000000')
        oraz = oraz.replace(/O/g,'.0').replace(/L/g,'.1').replace(/W/g,'.2').replace(/K/g,'.3').replace(/C/g,'.4').replace(/P/g,'.5').replace(/B/g,'.6').replace(/S/g,'.7').replace(/V/g,'.8').replace(/D/g,'.9')
        oraz = oraz.replace(/\./g,',')
        return human(oraz)
    } else {
        return ''
    }
}

function delnull(i) {
    return (i.length==2 && i<10) ? i.charAt(1) : i
}

function date2link(ddate) {
    if (ddate!='') {
        var a1 = ddate.split('.')
        if (a1[2]=='2020') {
            a1[2]='20'
        } else {
            if (a1[2].length==4) a1[2]=a1[2].replace(/20/,'')
        }
        ddate=delnull(a1[0])+'.'+delnull(a1[1])+'.'+a1[2]
    }
    return ddate
}

function dateplusdni(ddate,ddni) {
	let a1 = ddate.split('.')
	let data1 = new Date(a1[2], (a1[1]-1), (parseFloat(a1[0])+ddni))
	return addnull(data1.getDate()) + '.' + addnull((data1.getMonth()+1)) + '.' + data1.getFullYear()
}

function date2calc(ddate) {
	if (ddate && /\d+\.\d+\.\d+/.test(ddate)) {
		let a1 = ddate.split('.')
		if (a1[2].length==2) a1[2]='20'+a1[2]
		return addnull(parseInt(a1[0]))+'.'+addnull(parseInt(a1[1]))+'.'+a1[2]
	} else return ''
}

const rarealfavit = 'eghijmnruxyz123456789EGHIJMNRUXYZ'

function getlink() {
    rvid = (d.getElementsByName('rrvid')[0].checked) ? 0 : 1
    if (getmin(fdate,"31.07.2016")==fdate) {okrugg='&r'+d.getElementById('rregion').selectedIndex} else {okrugg=''}
    oplata4link = get4link(oplatadni1,oplata1,npd2,false)
    if (oplata4link!=';;;') {
        if (oplata4link.slice(0,2)!='#o') oplata4link='&o'+oplata4link
    } else {oplata4link=''}
    dolg4link = get4link(dolgdni1,dolg1,dolgprim2,true)
    if (dolg4link!=';;;') {
        if (dolg4link.slice(0,2)!='#u') dolg4link='&u'+dolg4link
    } else {dolg4link=''}
    if (eff==0) {eff=''} else {eff='&e1'}
    if (rvid==0) {rvid='&v0'} else {rvid=''}
    if (curr==0) {currr=''} else {currr='&m'+curr}
    oraz1 =	sum2link(d.getElementById('ddolg').value)
    oraz2 = date2link(fdate) + '&s' + date2link(sdate) + okrugg + oplata4link + dolg4link + eff + rvid + currr + ((d.getElementById('hiddenusersprocent').value!=0) ? '&p'+d.getElementById('hiddenusersprocent').value : '') + ((d36!=360) ? '&t' : '')  + ((Morator2022) ? '&b' : '')
    uniquesymb = ''
    if (oraz2.length > 200 && oraz2.indexOf(';;')!=-1) {
        oraz = oraz1 + oraz2
        for (let i=0; i<rarealfavit.length; i++) {
            let a = rarealfavit.charAt(i)
            if (oraz.indexOf(a)==-1) {
                uniquesymb = a
                break
            }
        }
        if (uniquesymb!='') return '#d' + oraz1 + '&0' + uniquesymb + '&f' + oraz2.replace(/;;/g,uniquesymb)
    }
    return '#d' + oraz1 + '&f' + oraz2
}

const alfavit='tabcdefghijklmnopqrsuvwxyz'

function get4link(ddni,ssumma,pprim,etodolg) {
    if (etodolg) arrdni = [date2link(ddni[0])]
    else arrdni = [date2link(minus(ddni[0]))]
    for (let i=1; i<ddni.length; i++) {
        let dninum = dni(ddni[i-1],ddni[i],0) - 1
        if (dninum>0 && dninum<2500) {
            let chastnoe = Math.floor(dninum/100) + 1
            oraz = alfavit.charAt(chastnoe) + (dninum % 100)
        } else if (dninum<0 && dninum>-2500) {
            let chastnoe = Math.floor(-dninum/100) + 1
            oraz = alfavit.charAt(chastnoe).toUpperCase() + (-dninum % 100)
        } else if (dninum==0) {
            oraz = 't'
        } else {
           if (etodolg) oraz = date2link(ddni[i]);
           else oraz = date2link(minus(ddni[i]))
        }
        arrdni.push(oraz)
    }
    arrsum = []
    for (let i=0; i<ssumma.length; i++) {
        if (i>0 && ssumma[i-1]==ssumma[i] && ssumma[i]!='') {
            oraz='t'
        } else {
            oraz = sum2link(ssumma[i])
        }
        arrsum.push(oraz)
    }
    arrprim = []
    for (let i=0; i<pprim.length; i++) {
        if (i>0 && pprim[i-1]==pprim[i] && pprim[i]!='') {   
            oraz='t'
        } else {
            oraz=primcheck(backprim(pprim[i]))
        }
        arrprim.push(oraz)
    }
    oraz=''
    for (let i=0; i<ddni.length;i++) {
        oraz += arrdni[i] + ';' + arrsum[i] + ';' + arrprim[i] + ';'
    }
    return oraz
}

function sharelink() { //  + '#z' + ((st317) ? '1' : '0') //резерв dfsrouevmptbz qqq wk
	var a = getlink()
	a+= '##'
	if (a == '#d#f#s#t##' || a == '#d&f&s&t##') a='';  // '#d#f#s#r0#o;;;#u;;;#e0#v1#z0#m0#t'
	var link = 'https://395gk.ru' + d.location.pathname + a
	var len = link.length
	if (len>86) oraz='Ссылка'; else oraz=link
	let notneedqr = d.getElementById('qrcodebox').checked
	
	iddiv = 'llink'
	str = '<span id=llink>Ссылка на расчет: <a href=' + link + ' class=llink target=_blank id=copy_from_href title=' + link + '>' + oraz + '</a></span>'
	change(str,iddiv)
	
	iddiv = 'llink2'
	str = '<span id=llink2>Ссылка на расчет: <a href=' + link + ' class=llink target=_blank title=' + link + '>' + oraz + '</a></span>'
	change(str,iddiv)
	
	iddiv = 'linksymbnum'
	okon4anie = ''
	if (len % 10 > 1 && len % 10 < 5) okon4anie='а';
	else if (len % 10 > 4 || len % 10 == 0) okon4anie='ов'
	if (len > 9 && len < 15) okon4anie='oв'
	str = '<span id=linksymbnum>&nbsp;&nbsp;' + len + ' симв. '
	str+= '<input type="checkbox" id="tip8" class="tip-checkbox"><label for="tip8" class="support"><em><abbr title="Нажмите для просмотра комментария"><noindex>?</noindex></abbr></em></label><span class="tip-block"><span class="tip">' + len + ' символ' + okon4anie + ' в ссылке на этот расчет.<!--<br>Есть нюансы для ссылок длиннее 255 символов.--><label for="tip8" class="tip-close"><noindex>X</noindex></label></span></span></span>'
	change(str,iddiv)
	
	iddiv = 'linksymbnum2'
	str = '<span id=linksymbnum2>&nbsp;&nbsp;' + len + ' симв. '
	str+= '<input type="checkbox" id="tip9" class="tip-checkbox"><label for="tip9" class="support"><em><abbr title="Нажмите для просмотра комментария"><noindex>?</noindex></abbr></em></label><span class="tip-block"><span class="tip">' + len + ' символов в ссылке на этот расчет.<!--<br>Есть нюансы для ссылок длиннее 255 символов.--><label for="tip9" class="tip-close"><noindex>X</noindex></label></span></span></span>'
	change(str,iddiv)
	
//	change('<a id="qrcode"></a>','qrcode')

// <input type=button value="Копировать расчет" id=copyRButton2 onClick=copyTableToBufer('rraschet') class=mainbutton title="Копировать расчет в буфер обмена">

	if (notneedqr) {
//	    change('<a id="linkdescription"></a>','linkdescription')
	    notDisplay('space4qr')
	    change('<span id=space4qr></span>','space4qr')
	    change('<span id=qr1raz>&nbsp;&nbsp;<input type=button value="+ QR-код к этому расчету" onClick=addqr1raz() class=mainbutton title="Добавить к этому расчету QR-код со ссылкой на расчет"></span>','qr1raz')
	} else {
	    change('<div id=space4qr><br><a href=https://395gk.ru id=linkdescription class=llink target=_blank>Ссылка на расчет</a><br><br><span id=qrcode></span></div>','space4qr')
	    change('<span id=qr1raz></span>','qr1raz')
	    letDisplay('space4qr')
        if (link.length<100) ssize=128; 
        else if (link.length<470) ssize=200;
        else ssize=256
        qrcode = new QRCode(d.getElementById("qrcode"), {
            width : ssize,
            height : ssize,
            correctLevel: QRCode.CorrectLevel.M,
        });
        try {
            qrcode.makeCode(link);
            d.getElementById('qrcode').href=link
            d.getElementById('linkdescription').href=link
            d.getElementById('linkdescription').title=link
            qrmistake = false
        } catch {
            notDisplay('space4qr')
	        change('<span id=space4qr></span>','space4qr')
	        d.getElementById('qrcodebox').checked = true
	        qrmistake = true
	        beg()
        }
	}
}

function page4print() {
    let oraz = 'https://395gk.ru/' + getlink() + '#c' + '##'
    window.open(oraz);
}

function ordinaryview() {
    let oraz = 'https://395gk.ru/' + getlink() + '##';
    window.open(oraz);
}

// #d 123333 (долг) | #0 с уникальным символом | #f 02.11.2015 (firstdate) | #s 14.11.2015 (seconddate) | #r 3 (регион) | #o 03.11.2015;500;; (oplata) | #u (ув.долга) | #e 1 (календарные дни или эфф) | #v 1 (внешний вид расчета) | #z 0 (расчет по 317.1) | #m 0 (руб.) | #p (процент потребителя) | #b (мораторий 2022) | #t | #c (версия для печати)

function getlochash(a) { //dfsrouevmptbz
    if (a===undefined) {
        lochash = location.hash;
    } else {
        a = a.replace('395gk.ru/ - ','395gk.ru/#').replace('395gk.ru/%20-%20','395gk.ru/#').replace('395gk.ru/-','395gk.ru/#')
        lochash=a.substr(a.indexOf('#'),a.length-1);
    }
    if (lochash.indexOf('##')!=-1) lochash = lochash.substr(0,lochash.indexOf('##'))
    if (lochash.indexOf('%23%23')!=-1) lochash = lochash.substr(0,lochash.indexOf('%23%23'))
    lochash = lochash.replace(/%23([d0fsrouevzmpbtс]+)/g,"#$1").replace(/&([0fsrouevzmpbtс]+)/g,"#$1")
    if (lochash.indexOf('#0')!=-1) {
        let letternum = lochash.indexOf('#0')+2
        uniquesymb=lochash.charAt(letternum)
        oraz = lochash.substr(letternum+1,lochash.length)
        let re = new RegExp(uniquesymb, 'g')
        oraz = oraz.replace(re, ';;')
        lochash = lochash.substr(0,letternum-2)+oraz
    }
    window.locationhash = lochash.replace(/%20/g,"").replace(/%3B/g,";").replace("#u#","#").replace("#o#","#").replace(/%2C/g,',').replace(/&amp;/g,'&') // замена %23 на #, %20 на ""
}

getlochash()

function cutlink(a) {
	let str = locationhash;
	let a1 = str.substr(str.indexOf(a) + a.length,str.length);
	
	if (a1.indexOf("#")!=-1) {
		let oraz = a1.substr(0,a1.indexOf("#"));		
	} else {
		let oraz = a1;
	}

	return oraz;
}

function dowithclass(iid,noneblock) {
	let divsToHide = d.getElementsByClassName(iid); //divsToHide is an array
	for(let i = 0; i < divsToHide.length; i++){
		divsToHide[i].style.display = noneblock;
	}
}

function getarr4code(arr) {
    let arr4code = []
    for (i=0; i<arr.length; i+=3) {
			
			if (arr[i] && /\d+\.\d+\.\d+/.test(arr[i])) {  // дата
				arr4code[i]=date2calc(arr[i])
			} else if (arr[i]=='t') {
				arr4code[i]=arr4code[i-3]
			} else if (arr[i] && /^[A-Za-z]\d/.test(arr[i])) {
				sotka = alfavit.indexOf(arr[i].charAt(0))
				if (sotka!=-1) {
					dninum = (sotka-1)*100 + parseFloat(arr[i].substr(1,arr[i].length))
					arr4code[i] = dateplusdni(arr4code[i-3],dninum)
				} else if (sotka==-1) {
					sotka = alfavit.indexOf(arr[i].charAt(0).toLowerCase())
					dninum = (sotka-1)*-100 - parseFloat(arr[i].substr(1,arr[i].length))
					arr4code[i] = dateplusdni(arr4code[i-3],dninum)
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
	return arr4code.slice()
}

function link2code() {
	let orazf = date2calc(cutlink("#f"));
	let orazs = date2calc(cutlink("#s"));
	d.getElementById('ffirstdate').value = orazf;
	d.getElementById('sseconddate').value = orazs;
	d.getElementById('ddolg').value = sum2calc(cutlink("#d"));
	if (locationhash.indexOf('#r')!=-1) d.getElementById('rregion').selectedIndex = cutlink("#r");
	if (locationhash.indexOf('#e')!=-1) d.getElementById('effdni').value = cutlink("#e");
	if (locationhash.indexOf('#m')!=-1) d.getElementById('currency').selectedIndex = cutlink("#m");
	if (locationhash.indexOf('#p')!=-1) d.getElementById('hiddenusersprocent').value = cutlink("#p");
	if (locationhash.indexOf('#t')!=-1) d.getElementById('divide360').value = 365;
	if (locationhash.indexOf('#t')==-1 && locationhash.indexOf('#d')!=-1) d.getElementById('divide360').value = 360;
	if (locationhash.indexOf('#c')!=-1) {
		dowithclass('noprint2','none')
		dowithclass('showprint','block')
		d.getElementById('qrcodebox').checked = false
	} else {
		d.getElementById('qrcodebox').checked = true
	}
	if (locationhash.indexOf('#b')!=-1) {
		d.getElementById('Moratoriy2022').checked = true;
	} else {
		d.getElementById('Moratoriy2022').checked = false;
	}

	if (locationhash.indexOf('#o')!=-1) {
		let str = cutlink("#o");
		if (str.charAt(str.length-1)==';') str = str.substr(0,str.length-1);
		let orazArrr = str.split(';');
		let ostr = '';
		orazArr = getarr4code(orazArrr)
		d.getElementById('oplatadata0').value = orazArr[0]
		d.getElementById('oplata0').value = orazArr[1]
		d.getElementById('npd0').value = backprim(decodeURI(orazArr[2]))
		oplatanum = orazArr.length/3 - 1

		for (i=3;i<orazArr.length;i+=3) {
			ostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=oplatadata' + i/3 + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + orazArr[i] + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма оплаты" id=oplata' + i/3 + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + orazArr[i+1] + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=npd' + i/3 + ' onClick=beg() onkeyup=beg() value="' + backprim(decodeURI(orazArr[i+2])) + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета оплаты" onClick=oplataplus()> <input type=button value=" - " title="удалить эту строку с данными об оплате" onClick=oplataminus(' + i/3 + ')>'
		}
	
		iddiv = 'ooplata';
		str = ostrbegin + ostr + ostrend;
		change(str,iddiv);
	}
//------------------------------------------------------------
	if (locationhash.indexOf('#u')!=-1) {
		let str = cutlink("#u")
		if (str.charAt(str.length-1)==';') str = str.substr(0,str.length-1)
		let orazArrr = str.split(';')
    let ostr = ''
		orazArr = getarr4code(orazArrr);
		d.getElementById('dolgdata0').value = orazArr[0]
		d.getElementById('dolg0').value = orazArr[1]
		d.getElementById('dolgprim0').value = backprim(decodeURI(orazArr[2]))
		dolgnum = orazArr.length/3 - 1
		for (i=3;i<orazArr.length;i+=3) {
			ostr += '<br><input type=text class="date" placeholder="дд.мм.гггг" id=dolgdata' + i/3 + ' onClick="checkdate(this);beg()" onkeyup="checkdate(this);beg()" value="' + orazArr[i] + '" size=10 autocomplete=off>&nbsp;&nbsp; на сумму <input type=text title="сумма долга" id=dolg' + i/3 + ' onClick=beg() onkeyup=beg() onBlur="this.value=human(punk(this.value))" value="' + orazArr[i+1] + '" size=15 autocomplete=off>&nbsp;&nbsp; прим. <input type=text title="примечание" id=dolgprim' + i/3 + ' onClick=beg() onkeyup=beg() value="' + backprim(decodeURI(orazArr[i+2])) + '" size=10 autocomplete=off> <input type=button value=" + " title="добавить ниже строку для учета долга" onClick=dolgplus()> <input type=button value=" - " title="удалить эту строку с данными о долге" onClick=dolgminus(' + i/3 + ')><span class=warn id=warn' + i/3 + '></span>'
		}
	
		iddiv = 'dopdolg'
		str = ostrbegin + ostr + ostrend
		change(str,iddiv)
	}
//-------------------------------------------------------------
    if (locationhash.indexOf('#v')!=-1) {
    	var oraz=cutlink("#v")
    	if (oraz=='0') {
    		d.getElementsByName('rrvid')[0].checked = true;
    		d.getElementsByName('rrvid')[1].checked = false;
    	} else {
    		d.getElementsByName('rrvid')[0].checked = false;
    		d.getElementsByName('rrvid')[1].checked = true;
    	}
    }
	
	var oraz=cutlink("#z")
	if (oraz=='1') {
		d.getElementById('sst317').checked = true;
	} else {
		d.getElementById('sst317').checked = false;
	}
	
	beg()
}
function segodnya() {
	today = new Date()
	d.getElementById('sseconddate').value=addnull(today.getDate()) + '.' + addnull((today.getMonth()+1)) + '.' + today.getFullYear()
	d.getElementById('sseconddate').className='date'
	beg()
}

//---- копирование
function copyToBufer(iid) {
	fnSelect(iid);
	d.execCommand("copy");
	fnDeSelect();
}

function copyTableToBufer(iid) {
	copyToBufer(iid);
	d.getElementById('copyRButton').value=d.getElementById('copyRButton2').value=d.getElementById('copyRButton3').value="Скопировано в буфер обмена";
	d.getElementById('copylinkbutton').value=d.getElementById('copylinkbutton2').value="Копировать ссылку";
}

function fnSelect(iid) {
	fnDeSelect();
	if (d.selection) {
		var range = d.body.createTextRange();
		range.moveToElementText(d.getElementById(iid));
		range.select();
	}
	else if (window.getSelection) {
		var range = d.createRange();
		range.selectNode(d.getElementById(iid));
		window.getSelection().addRange(range);
	}
}
function fnDeSelect() {
	if (d.selection)
		d.selection.empty();
	else if (window.getSelection)
		window.getSelection().removeAllRanges();
}
//----------------------------------------------------dwCopy
  document.addEventListener("click", function(isdw)
  {
      name_data  = isdw . target . dataset;
      if(name_data.fromid)
      {
         function dwCopy() {
         var theget= document.querySelector("#"+name_data .fromid);
         var newinput   = document.createElement("textarea");
         if(name_data.from =="href")        { newinput.value = theget. href;}
         if(name_data.from =="href_no_go")  { event.preventDefault(); newinput.value = theget. href; }
         if(name_data.from =="innerHTML")   { newinput.value = theget. innerHTML;}
         if(name_data.from =="outerHTML")   { newinput.value = theget. outerHTML;}
         if(name_data.from =="value")       { newinput.value = theget. value;}
         if(name_data.from =="placeholder") { newinput.value = theget. placeholder;}
         if(name_data.from =="src") { newinput.value = theget. src;}
         if(name_data.from =="data") newinput.value = theget. dataset. copy_value;

         document.body.appendChild(newinput);
         newinput.select();
         document.execCommand("copy");
         document.body.removeChild(newinput);
         }
         dwCopy();
      }
  });
//----------------------------------------------------dwCopy