function disableEnter(event){
	 var keyCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	 if (keyCode == 13){
	  return false;
	 }
}

var time=5;//设定cookie保存时间
function setCookie(c_name,value,expiredays)
{
	var exdate=new Date()
	exdate.setDate(exdate.getDate()+expiredays)
	document.cookie=c_name+ "=" +escape(value)+
	((expiredays==null) ? "" : ";expires="+exdate.toGMTString())
}
function getCookie(c_name)
{
	if (document.cookie.length>0)
	  {
	  c_start=document.cookie.indexOf(c_name + "=")
	  if (c_start!=-1)
	    { 
	    c_start=c_start + c_name.length+1 
	    c_end=document.cookie.indexOf(";",c_start)
	    if (c_end==-1) c_end=document.cookie.length
	    return unescape(document.cookie.substring(c_start,c_end))
	    } 
	  }
	return ""
}
/*
 * 错误码	描述
 * 0	操作成功
 * 1	用户名已存在
 * 2	账户的邮箱验证链接无效，可能是链接不正确或已过期。
 * 3	您输入的密码不正确，请检查大写状态是否开启。
 * 4	您输入的用户名不存在
 * 5	密码重置链接无效，可能是链接不正确或已过期。
 * 6	您的设备数量达到上限
 * 7	您的好友数量达到上限
 * 8	对方的好友数量达到上限
 * 9	好友验证信息已过期
 * 10	共享设备数量不能超过100
 * 11	分组数量不能超过100
 * 12   分组不存在或已被删除
 * 13	用户未登录
 * 14	邮箱未验证
 * 15	设备已被添加到用户
 * 100	网络异常
 * 
 * 
 */
function transformCode(code)
{
	var retstr="";
	switch(code)
	{
	case 0:
		retstr="成功";
		break;
	case 1:
		retstr=jsLangArr.AccountExist;
		break;
	case 2:
		retstr=jsLangArr.ActivationInvalid;
		break;
	case 3:
		retstr=jsLangArr.IncorrectPassword;
		break;	
	case 4:
		retstr=jsLangArr.AccountNotExist;
		break;	
	case 5:
		retstr=jsLangArr.ReSetLink;
		break;	
	case 6:
		retstr=jsLangArr.DevicesLimit;
		break;	
	case 7:
		retstr=jsLangArr.YouFriendsLimit;
		break;	
	case 8:
		retstr=jsLangArr.AccFriendsLimit;
		break;	
	case 9:
		retstr=jsLangArr.ConfirmFriend;
		break;	
	case 10:
		retstr=jsLangArr.SharedDevices;
		break;
	case 11:
		retstr=jsLangArr.GroupLimit;
		break
	case 12:
		retstr=jsLangArr.GroupNotExist;
		break;
	case 13:
		retstr=jsLangArr.NotLogin;
		alert(retstr);
		setCookie("session_id","",time);
		window.location="home.php";
		break;
	case 14:
		retstr=jsLangArr.EmailUnverified;
		break;
	case 15:
		retstr=jsLangArr.DeviceBinded;
		break;
	case 100:
		{
			retstr=jsLangArr.NetworkError;
			alert(retstr);
			setCookie("session_id","",time);
			window.location="home.php";
			break;
		}
	}
	
	return retstr;
}



function selectLang(lang)
{
	setCookie("lang",lang,time);
	location.href=removeAnchor(location.href);
}

function removeAnchor(a)
{
	pos=a.indexOf("#");
	if(pos>0)
	{
		return a.substring(0,pos)
	}
	return a
		
}



//取得用户昵称并显示
function prepare_data_get_nick_name(account)
{
	var json='{"cmd":"account_info","data":{"account":\"'+account+'\"}}';
	return json;
}
function get_nick_name(account)
{
	get_info_account=account;
	postData("action.php",prepare_data_get_nick_name(account),state_changed_get_nick_name);
}

function state_changed_get_nick_name(arr)
{
	if(arr["code"] == 0)
	{
		document.getElementById('u_name').innerHTML="";
		//document.getElementById('u_name').innerHTML=arr["data"]["nick_name"];
		document.getElementById('u_name').appendChild(document.createTextNode(arr["data"]["nick_name"]));
	}
	else if(arr["code"]==13)
	{
		//alert("用户未登录。");
		setCookie("session_id","",time);
		window.location="home.php";
	}
	else{
		setCookie("session_id","",time);
		window.location="home.php";		
	}
}

function trim(str){ //删除左右两端的空格
	return str.replace(/(^\s*)|(\s*$)/g, "");
}



function GetObj(objName)
{
	if(document.getElementById)
	{
		return eval('document.getElementById("'+objName+'")');
	}
	else
	{
		return eval('document.all.'+objName); 
	}
}
function onclick1(objName)
{
	var obj = GetObj(objName);
	
	if(obj.value == obj.defaultValue)
	{
		obj.value='';
		obj.style.color='#000';
	}
}

function onBlur1(objName)
{	
	var obj = GetObj(objName);
	
	if(!obj.value)
	{
		obj.value=GetObj(objName).defaultValue;
		obj.style.color='#888';
	}	
}

function onclick2(objName1,objName2)
{
	var obj1 = GetObj(objName1);
	var obj2 = GetObj(objName2);
	//obj2.value='';
	if(obj1.value == obj1.defaultValue)
	{ 
		obj1.style.display='none';
		obj2.style.display='inline-block';
		obj2.style.color='#000';
		obj2.focus();
	}
}

function onBlur2(objName1,objName2)
{
	var obj1 = GetObj(objName1);
	var obj2 = GetObj(objName2);
	
	if(!obj1.value)
	{	
		obj1.style.display='none';
		obj2.style.display='inline-block';		
	}
}

function clearErrorMsg()
{
	document.getElementById("tipMsg").innerHTML="";
}