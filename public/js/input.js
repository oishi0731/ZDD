function sizeCountUTF8()
{  
    var tempCount = 0; 
    for (var i=0; i<this.length; i++) 
    {  
        var c = this.charCodeAt(i);  
        if (c < 0x80)
	    {
		    tempCount++;
	    }
	    else if(c < 0x0800)
	    {
		    tempCount+=2;
	    }
	    else if (c < 0x010000)
	    {
		    tempCount+=3;
	    } 
    } 
    return tempCount; 
}

function sizeCountAnsi()
{
    var tempCount = 0;
    for (var i=0; i<this.length; i++) 
    {  
        var c = this.charCodeAt(i);  
        //单字节加1  
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) 
        {  
            tempCount++;  
        }
        else 
        {     
            tempCount+=2;  
        }
    } 
    return tempCount;
}

function SubStringOfBytesUTF8(start, strLen)
{
    var lengthOfByte = 0;
    
    if(strLen <= 0)
    {
        return "";
    }
    
    for(var i = start; i < this.length; i++)
    {
        var c = this.charCodeAt(i);
        if(lengthOfByte > strLen)
        {
            break;
        }
        if (c < 0x80)
	    {
		    lengthOfByte++;
	    }
	    else if(c < 0x0800)
	    {
		    lengthOfByte+=2;
	    }
	    else if (c < 0x010000)
	    {
		    lengthOfByte+=3;
	    } 
	    else if(c < 0x200000)
    	{
	    	lengthOfByte+=4;
    	}
        if(lengthOfByte >= strLen)
        {
            if(lengthOfByte > strLen)
            {
                i--;
            }
            break;
        }
    }
    return this.substr(start, i-start+1);
}

function SubStringOfBytesAnsi(start, strLen)
{
    var lengthOfByte = 0;
    
    if(strLen <= 0)
    {
        return "";
    }
    
    for(var i = start; i < this.length; i++)
    {
        var c = this.charCodeAt(i);
        if(lengthOfByte > strLen)
        {
            break;
        }
        if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) 
        {  
            lengthOfByte++;  
        }
        else 
        {     
            lengthOfByte+=2;  
        }
        
        if(lengthOfByte >= strLen)
        {
            if(lengthOfByte > strLen)
            {
                i--;
            }
            break;
        }
    }
    return this.substr(start, i-start+1);
}

String.prototype.sizeUTF8 = sizeCountUTF8;
String.prototype.SubStringOfBytesUTF8 = SubStringOfBytesUTF8;
String.prototype.size = sizeCountAnsi;
String.prototype.SubStringOfBytes = SubStringOfBytesAnsi;



function isNumberInput(field,event)
{
    var key, keyChar;
    if (window.event) 
    {
        key = window.event.keyCode;
    }
    else if (event) 
    {
        key = event.which;
    }
    else 
    {
        return true;
    }
    //检测空格等特殊字符
    if (key == null || key == 0 || key == 8 || key == 13 || key == 27)
    return true;
    keyChar = String.fromCharCode(key);
    if (/\d/.test(keyChar)) 
    {
//      window.staus = "";
        return true;
    }
    else
    {
//      window.status = "本区域只接受数字输入";
        return false;
    }
}

function InputCheck(obj,Max,Min)
{
    tempA = obj.value;
    tempB = tempA.replace(/[^0-9]*/g,"");
    obj.value = tempB;
    if(tempB == "") 
    {
        obj.value = Min;
    }
    if(Min != 0)
    {
        if(tempB == 0)
        {
            obj.value = Min;
        }
        if (tempB < Min) 
        {
            obj.value = Min;
        }
    }
    if(tempB > Max)
    {
        obj.value = Max;
    }
}

function LenCheck(obj,evt,constL)
{
    var tempA = obj.value;
    var key=evt.charCode|evt.keyCode;
    if (key == null || key == 0 || key == 8 || key == 13 || key == 27 ||　key == 46)
    {
        return true;
    }
    if (tempA.sizeUTF8() < constL) 
    {
        return true;
    }
    else
    {
        obj.value = tempA.SubStringOfBytesUTF8(0,constL);
        obj.onchange();
        return false;
    }
}

function KeyupCheck(obj,constL)
{
    var tempA = obj.value;
    if(tempA.sizeUTF8() > constL)
    {
        obj.value = tempA.SubStringOfBytesUTF8(0,constL);
        obj.onchange();
        return false;
    }
    return true;
}

function KeyupCheckEx(obj,constL)
{
    var tempA = obj.value;
    tempA=tempA.replace(/[^\w\.\/]/ig,''); //只能输入数字和字母 
    if (obj.value != tempA) 
    {
        obj.value = tempA;
    }
    
    if(tempA.sizeUTF8() > constL)
    {
        obj.value = tempA.SubStringOfBytesUTF8(0,constL);
        obj.onchange();
        return false;
    }
    return true;
}

function OnChangeCheck(obj,constL)
{
    var tempA = obj.value;
    if(tempA.sizeUTF8() > constL)
    {
        obj.value = tempA.SubStringOfBytesUTF8(0,constL);
        return false;
    }
    return true;
}