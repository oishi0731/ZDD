function chkemailaddr(email) //检查输入的地址是否为合法邮件地址
{
	//var reg=/^([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\-|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}([\.][a-z]{2})?$/gi;	
	//var reg=/^[a-z0-9]([a-z0-9]*[-_]?[a-z0-9]+)*@([a-z0-9]*[-_]?[a-z0-9]+)+[\.][a-z]{2,3}([\.][a-z]{2})?$/i;
	var reg=/^[a-z0-9]([a-z0-9\.\_\-])*@([a-z0-9\-\_])+\.[a-z]{2,3}(\.[a-z]{2})?$/i;
	return reg.test(email);
}

function checkUsername(name)	//用户名为邮箱时检查
{
	var retstr="";
	if(!chkemailaddr(name))
	{
		retstr=jsLangArr.EmailCheck;          	
	}
	else if(name.length > 60)
	{
		retstr=jsLangArr.AccountLength;        
	}	
	return retstr;
}

function checkUserNameEx(name)	//用户名为字母数字和‘_’组合
{
	var retstr="";
	//var reg=/^[a-zA-Z]+[a-zA-Z0-9_]+$/gi;
	var reg=/^[0-9]+$/gi;
	if(!reg.test(name) || name.length != 11)
	{
		retstr="请输入11位的手机号.";
	}
//	else if(name.length>20)
//	{
//		retstr="用户名必须小于20个字符.";
//	}
	return retstr;
}

function checkPassward(passwd)
{
	var retstr="";
	if(passwd=="" || passwd==null){
		retstr=jsLangArr.PassWordNull;
		return retstr;
	}
	else if(passwd.length>20 || passwd.length<8)
	{
		retstr=jsLangArr.PassWordLength;
		return retstr;
	}
	
	var reg=/^[a-zA-Z0-9_]+$/gi;
	if(!reg.test(passwd))
	{
		retstr=jsLangArr.PassWordType;
	}
	return retstr;
}

function checkPasswardNew(passwd)
{
	var retstr="";
	if(passwd=="" || passwd==null){
		retstr=jsLangArr.NewPassWordNull;
		return retstr;
	}
	else if(passwd.length>20 || passwd.length<8)
	{
		retstr=jsLangArr.NewPassWordLength;
		return retstr;
	}
	
	var reg=/^[a-zA-Z0-9_]+$/gi;
	if(!reg.test(passwd))
	{
		retstr=jsLangArr.NewPassWordType;
		return retstr;
	}
	return retstr;
}

function checkVerifycode(vcode)
{
	var retstr="";
	if(vcode=="" || vcode==null){
		retstr=jsLangArr.VerifyCodeNull;
	}
	else if(vcode.length!=4)
	{
		retstr=jsLangArr.EnterVerifycode;
	}
	
	return retstr;
}

function checkCellphone(number)
{
	var retstr="";
	var reg=/^[0-9]*$/gi;
	if(!reg.test(number))
	{
		retstr=jsLangArr.CellPhoneChk;
		return retstr;
	}
	
	if(number.length<5 || number.length>20)
	{
		retstr=jsLangArr.CellPhoneLength;
	}
	
	return retstr;
}

