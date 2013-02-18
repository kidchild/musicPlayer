var filePath = "";											// 文件路径
var saveListFilePath = "\\tool\\musicList.sxx";				// 音乐列表保存文件路径及文件名
var playStatusFilePath = "\\tool\\playStatus.sxx";			// 上次播放时所选择音乐播放状态存档保存音量，播放顺序等……
var arr = new Array();										// 歌曲数组
var fso = new ActiveXObject("Scripting.FileSystemObject");	// 文件操作对象
var fl = "";												// 文件夹对象
var reg = "MP3,WMA,mp3,wma,AVI,avi";						// 文件类型
var file = "";												// 文件对象
var spaceHtml = "";											// 歌曲列表文本
var nowMusic = 0;											// 当前播放歌曲
var preMusic = 0;											// 上一首播放歌曲
var musicList = new Array();								// 列表数组
var playType = "order";									    // 播放状态（默认顺序）
var listIndex = 0;											// 播放的列表（默认第一列表）

//alert(nsPlayer.\);
/* 换歌，当没有选择确定歌曲时随机选歌进行切换
 * random-随机播放; order-顺序播放; single-单曲循环;
 */
function playNext()
{
	preMusic = nowMusic;
	if(playType == "random")
	{
		changeMusic();
	}
	else if(playType == "order")
	{
		nowMusic++;
		if(nowMusic == arr.length)
		{
			nowMusic = 0;
		}
		changeMusic(nowMusic);
	}
	else if(playType == "single")
	{
		changeMusic(preMusic);
	}
	else
	{
		changeMusic();
	}
}

//播放上一首
function playPre()
{
	changeMusic(preMusic);
}

function changeMusic(num){
	if(arr.length != 0)
	{
		$("music"+nowMusic).style.color = "blue";
		$("music"+preMusic).style.color = "blue";
		if(num == undefined)
			num = Math.floor(Math.random()*arr.length); //如果没有指定下一首则自动随机选歌
		nowMusic = num;
		filePath = new String(filePath);
		filePath = filePath.replace(/\\/g,'//');
		var url = unescape(filePath + "//" + arr[num]);
		wmp.open(url);
		setTimeout(playMusic,0);
		//document.getElementById("nowPlay").innerHTML = "正在播放：" + url;
		document.title = arr[num];
		$("music"+nowMusic).style.color = "red";
	}
}

//播放音乐
function playMusic()
{
	wmp.play();
}

//获取选择歌曲的文件夹路径，读出文件下所有歌曲
function showMusic()
{
	var tmpPath = document.getElementById("filePath").value;
	if(tmpPath == "")
	{
		alert("请选择路径！");
		return;
	}
	filePath = tmpPath;
	spaceHtml = "";
	arr.splice(0,arr.length);
	file = fso.getFile(filePath);
	filePath = file.parentFolder;
	openPath(filePath);	
}

//获取文件路径
function getFilePath(urlPath)
{
	file = fso.getFile(urlPath);
	urlPath = file.parentFolder;
	return urlPath;
}

//将列表路径保存至cookie中
function writeCookie(str)
{
	document.cookie = "musicPath=" + str + ";";
}

//读取cookie中保存的上次列表路径
function readCookie()
{
	filePath = getCookie("musicPath");
	openPath(filePath);
}

//打开路径中所有歌曲列表
function openPath(url)
{
	$("musicSpace").innerHTML = " ";
	spaceHtml = " ";
	arr.splice(0,arr.length);
	try
	{
		filePath = url;
		fl = fso.getFolder(filePath);
		var fls = new Enumerator(fl.Files);
		while(!fls.atEnd()){
			var of = fls.item();
			if(checkMusicType(of.name))
				arr.push(of.name);
			fls.moveNext();
		}
	}
	catch (e)
	{
		alert("获取路径失败！");
		buttonShow("none");
	}
	
	for(var i=0;i<arr.length;i++)
	{
		spaceHtml += "<a id='music" + i + "' href='javascript:changeMusic(" + i + ")'>" + arr[i] + "</a>&nbsp;&nbsp;&nbsp;";
		if(i%5 == 4 && i > 0)
			spaceHtml += "<br><br>";
	}
	if(arr.length == 0)
	{
		spaceHtml = "当前路径(<font color='red'>" + url + "</font>)下无音乐！";
	}
	$("musicSpace").innerHTML = spaceHtml;
	if(arr.length != 0)
	{
		buttonShow("");
		//writeCookie(encodeURIComponent(filePath));
	}
	else
	{
		buttonShow("none");
	}
}

//按钮初始化
function buttonShow(dis)
{
	$("changeMusic").style.display = dis;
	$("nextMusicBut").style.display = dis;
	$("preMusicBut").style.display = dis;
	$("playOrPause").style.display = dis;
}

//播放下一首，当没有歌曲播放时随机选取一首进行播放(未使用)
function nextMusic()
{
	if(nowMusic == "")
		nowMusic = Math.floor(Math.random()*arr.length);
	else
		nowMusic++;
	changeMusic(nowMusic);
}

//根据传入的cookieName返回对应的值
function getCookie(cookieName)
{
	var cookieStr = decodeURIComponent(document.cookie);
	var start=0,end=0
	if(cookieStr.indexOf(cookieName) != -1)
	{
		start = cookieStr.indexOf(cookieName + "=") + cookieName.length;
		end = cookieStr.indexOf(";",start) > 0 ? cookieStr.indexOf(";",start) : cookieStr.length;
		return cookieStr.substring(start+1,end);
	}
	else
	{
		return "";
	}
}

//判断是否是音乐文件
function checkMusicType(fileName)
{
	var musicTypes = reg.split(",");
	var flag = false;
	for(var n=0;n<musicTypes.length;n++)
	{
		if(fileName.indexOf(musicTypes[n]) != -1)
		{
			flag = true;
			break;
		}
	}
	return flag;
}

//取得存储文件对象
function getReadFileObj(filePath)
{
	var pageLocation = getFormatUrl();
	pageLocation = getFilePath(pageLocation) + filePath;
	var fileObj = fso.OpenTextFile(pageLocation,1);
	return fileObj;
}

//取得读写文件对象
function getWriteFileObj(filePath)
{
	var pageLocation = getFormatUrl();
	pageLocation = getFilePath(pageLocation) + filePath;
	var fileObj = fso.CreateTextFile(pageLocation,true);
	return fileObj;
}

//取得文件对象(未使用)
function getListFileObj()
{
	var pageLocation = getFormatUrl();
	pageLocation = getFilePath(pageLocation) + saveListFilePath;
	var fileObj = fso.getFile(pageLocation);
	return fileObj;
}

//保存列表
function saveList()
{
	var listName = $("listName").value;
	if(listName == "")
	{
		alert("请填写列表名称！");
		return;
	}

	if(filePath == "")
	{
		alert("当前列表为空！");
		return;
	}
	try
	{
		var readObj = getReadFileObj(saveListFilePath);
		var doc = "";
		if(!readObj.atEndOfStream)
		{
			doc = readObj.readAll();
		}
		
		filePath = new String(filePath);
		filePath = filePath.replace(/\\/g,'//');
		doc += listName + "|" + filePath;
		var writeObj = getWriteFileObj(saveListFilePath);
		writeObj.writeLine(doc);
		readObj.close();
		writeObj.close();
		musicList.push(new MusicList(listName,filePath));
		fullList();
		alert("保存列表成功！");
	}
	catch (e)
	{
		alert("保存列表失败！原因：" + e);
		return;
	}
}

//保存音乐播放时状态 @building
function saveStatus(type)
{
	try
	{
		var writeObj = getWriteFileObj(playStatusFilePath);
		writeObj.writeLine(type);
		writeObj.close();
	}
	catch (e)
	{
		alert("保存状态异常，原因：" + e);
		return;
	}
}

//读取上次播放状态 @building
function loadStatus()
{
	var musicTypes = document.all("musicType");
	var readObj = getReadFileObj(playStatusFilePath);
	while(!readObj.atEndOfStream)
	{
		var docLine = readObj.readLine();
		playType = docLine;
	}
	readObj.close();
	for(var i=0;i<musicTypes.length;i++)
	{
		if(playType == musicTypes[i].value)
		{
			musicTypes[i].checked = true;
		}
	}
}

//取得列表
function loadList()
{
	var readObj = getReadFileObj(saveListFilePath);
	while(!readObj.atEndOfStream)
	{
		var docLine = readObj.readLine();
		var listObj = docLine.split("|");
		var musicListObj = new MusicList(listObj[0],listObj[1]);
		musicList.push(musicListObj);
	}
	fullList();
	readObj.close();
	changeMusic();
}

//填充列表
function fullList()
{
	$("musicList").innerHTML = " ";
	for(var i=0;i<musicList.length;i++)
	{
		$("musicList").innerHTML += "<a href='javascript:openPath(\"" + musicList[i].url + "\")'>" + musicList[i].name + "</a>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<a href='javascript:delectList(" + i + ")'>删除</a><br><br>";
	}
	if(musicList.length != 0)
	{
		openPath(musicList[0].url);
	}
}

//删除列表
function delectList(index)
{
	var readObj = getReadFileObj(saveListFilePath);
	var doc = "";
	doc = encodeURIComponent(readObj.readAll());
	var musicLists = doc.split("%0D%0A");
	musicLists.splice(index,1);
	var docTmp = "";
	for(var l=0;l<musicLists.length;l++)
	{
		if(musicLists[l] != "")
		{
			docTmp += musicLists[l] + "%0D%0A";
		}
	}
	var writeObj = getWriteFileObj(saveListFilePath);
	writeObj.write(decodeURIComponent(docTmp));
	musicList.splice(index,1);
	fullList();
	readObj.close();
	writeObj.close();
}

//获取文件路径
function getFormatUrl()
{
	var pagehref = unescape(document.location); //获取当前页面的完整文件URL
	var pageLocations = pagehref.split('///');
	var pageLocation = pageLocations[1]; //获取当前页面路径名
	return pageLocation;
}

//音乐列表对象函数
function MusicList(name,url)
{
	this.name = name;
	this.url = url;
}

//改变播放方式
function changeType(type)
{
	playType = type;
	saveStatus(playType);
}

//帮助
function help(helpObj)
{
	$(helpObj).focus();
	$(helpObj).select();
}

//音量控制开始
function setVolumeOnce(num)
{
	var tnum = wmp.Volume+num;
	if(tnum > 0)
	{
		tnum = 0;
	}
	if(tnum < -10000 )
	{
		tnum = -10000;
	}
	wmp.Volume = tnum;
	fillVolumeZoon();
}

function addVolume()
{
	interval = window.setInterval(addVolumeMethod,200);
}

function subVolume()
{
	interval = window.setInterval(subVolumeMethod,200);
}

function addVolumeMethod()
{
	setVolumeOnce(200);
}

function subVolumeMethod()
{
	setVolumeOnce(-200);
}

function stopSetVolume()
{
	try
	{
		window.clearInterval(interval);
	}
	catch (e)
	{
	}
}
//音量控制结束

//音量大小显示计算
function volumeCount()
{
	return Math.round(((wmp.Volume+10000))/100);
}

//显示音量大小
function fillVolumeZoon()
{
	var volume = volumeCount();
	$("volumeZoon").innerHTML = volume;
}

//播放/暂停控制
function playOrPause()
{
	if($("playOrPause").value == "暂停")
	{
		$("playOrPause").value = "播放";
		wmp.pause();
	}
	else
	{
		$("playOrPause").value = "暂停"
		wmp.play();
	}
}

//添加快捷键
function document.onkeydown()
{
	var keyCode = window.event.keyCode;
	switch(keyCode)
	{
		case 39: 
			playNext();
			break;
		case 37: 
			playPre();
			break;
		case 32: 
			playOrPause();
			break;
		case 38: 
			addVolumeMethod();
			break;
		case 40: 
			subVolumeMethod();
			break;
		default: return;
	}
}

//重载对象取得函数
function $(str)
{
	return document.getElementById(str);
}