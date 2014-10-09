// 在 Cloud code 里初始化 Express 框架
require("cloud/json2.js");
var express = require('express');
var app = express();
var avosExpressCookieSession = require('avos-express-cookie-session');

// App 全局配置
app.set('views','cloud/views');   // 设置模板目录
app.set('view engine', 'ejs');    // 设置 template 引擎
app.use(express.bodyParser());    // 读取请求 body 的中间件

var avosExpressHttpsRedirect = require('avos-express-https-redirect');
app.use(avosExpressHttpsRedirect());

//启用cookie
app.use(express.cookieParser('Your Cookie Secure'));
//使用avos-express-cookie-session记录登录信息到cookie。
app.use(avosExpressCookieSession({ cookie: { maxAge: 3600000 },fetchUser:true}));


//AV.initialize("zvhpgwwhv1a9sofjo7wk6xs2in42ucoywny1tlskk41kbski", "o4lhqbul0fi6s77k3aw5crdtw6jx8p0q4yetw8aepm5jyku5");

// 使用 Express 路由 API 服务 /hello 的 HTTP GET 请求
app.get('/hello', function(req, res) {
  res.render('hello', { message: 'Congrats, you just set up your app!' });
});

app.get("/send",function(req,res){
	
    AV.User.requestMobilePhoneVerify('13545114526').then(function(){
        //发送成功
    	res.send("success.");
    }, function(err){
       //发送失败
    	res.send("failed.");
    });
});

app.get("/varify",function(req,res){
	var num=req.query.verify;
    AV.User.verifyMobilePhone(num).then(function(){
        //发送成功
    	res.send("success.");
    }, function(err){
       //发送失败
    	res.send("failed.");
    });
});


app.get("/reqsms",function(req,res){
	   AV.Cloud.requestSmsCode({
	       mobilePhoneNumber: '13545114526',
	       name: 'PP打车',
	       op: '付费',
	       ttl: 5
	    }).then(function(){
	        //发送成功
	    	res.send("success.");
	    }, function(err){
	        //发送失败
	    	res.send("failed.");
	    });
});


app.get("/verifysms",function(req,res){
	AV.Cloud.verifySmsCode(req.query.sms).then(function(){
	    //验证成功
		res.send("success.");
	}, function(err){
	    //验证失败
		res.send("failed.");
	});

});

app.post('/resetPassword',function(req,res){//通过邮箱来重置密码。
	AV.User.requestPasswordReset(req.body.account, {
		  success: function() {
		    // Password reset request was sent successfully
			 res.send("Password reset request was sent successfully.");
		  },
		  error: function(error) {
		    // Show the error message somewhere
		    res.render('message',{message: "Error: " + error.code + " " + error.message});
		  }
		});	
});
app.get("/action",function(req,res){
	console.log("start get action.");
	res.send("please use post method.");
});

app.post("/action",function(req,res){
	console.log("start action.");
	console.log(req.body);
	var json=req.body;
	if(json != null && json.cmd!=null)
	{
		console.log("start cmd.");
		switch(json.cmd)
		{
		case "device_bind_status":
			check_device(json.data,res);
			break;
		case "account_info":
			get_current_info(res);
			break;
		case "sms_register":
			register_account(json.data,res);
			break;
		case "get_reg_sms":
			//requestSmsCode(json.data,res); 
			requestMobilePhoneVerify(json.data,res);
			break;
		case "verify_cellphone":
			verifyMobilePhone(json.data,res);
			break;
		case "login":
			loginsys(json.data,res);
			break;
		case "logout":
			log_out(res);			
			break;
		case "update_account_info":
			update_account_info(json.data,res);
			break;
		case "modify_password":
			modify_password(json.data,res);
			break;
		case "retrieve_reset_sms"://获取重置密码的手机验证码			
			console.log("start get_reset_password_sms_code.");
			var url="https://cn.avoscloud.com/1.1/requestPasswordResetBySmsCode";
			var body= {"mobilePhoneNumber": ""};
			body.mobilePhoneNumber=json.data.cellphone;
			request(url,body,res);
			break;
		case "sms_reset_password":	//重置密码
			sms_reset_password(json.data,res);
			break;
		case "add_device":
			add_device(json.data,res);
			break;
		case "get_device":
			get_device_list(json.data,res);
			break;
		case "del_device":
			del_device(json.data,res);
			break;
		case "get_Login_Sms_Code"://用手机号和验证码登录
			console.log("start get_login_sms_code.");
			var url="https://cn.avoscloud.com/1.1/requestLoginSmsCode";
			var body= {"mobilePhoneNumber": ""};
			body.mobilePhoneNumber=json.data.cellphone;
			if(body.mobilePhoneNumber==undefined||body.mobilePhoneNumber=="")
			{
				body.mobilePhoneNumber="13545114526";
			}
			request(url,body,res);
		    break;
		 case 'device_register':
			{
				//验证权限
				AV.User.logIn("__pilive_device_auth", req.body.data.auth_code, {
					success: function(user)
					{
						console.log("user logined : " + "__pilive_device_auth");
						RegisterDevice(req, res);
						AV.User.logOut();
					},
					error: function(user, error)
					{
						res.send('{"code"  :20, "desc" : "Not Authorized."}');
					}
				});
				break;
			}
			case 'device_query':
			{
				var Device = AV.Object.extend("Device");
				var query = new AV.Query(Device);
				query.equalTo("sn", req.body.data.device_sn);
				query.first({
					success: function(device) 
					{
						if(device == undefined)
						{
							console.log("Not Found");
							res.send('{"code"  :19, "desc" : "Not Found！"}');
						}
						else
						{
							var jsonObj = {
								code : 0, 
								desc : "ok", 
								data : {
									device_sn : device.get("sn"), 
									ip : device.get("ip"), 
									port : device.get("port"), 
									type : device.get("type"),
									name : device.get("name"),
									owner : device.get("owner").id
								}
							};
							var jsonString = JSON.stringify(jsonObj);
							console.log(jsonString);
							res.send(jsonString);
						}
					},
					error:function(error)
					{
						res.send('{"code"  :100, "desc" : Network error."}');
					}
				});
				break;
			}
			case 'check_device_auth':
			{
				//验证权限
				AV.User.logIn(req.body.data.account, req.body.data.password, {
					success: function(user)
					{
						console.log("user logined : " + user.get("username"));
						CheckAuth(req, res, user);
						AV.User.logOut();
					},
					error: function(user, error)
					{
						res.send('{"code"  :20, "desc" : "Not Authorized."}');
					}
				});
				break;
			}
			default:
			{
				res.send('{"code"  :102, "desc" : "not support"}');
				break;
			}
		}
	}
	else
	{
		console.log("Data fomat error.");
		
	}	
	
});

function check_device(data,res)
{
	var Device = AV.Object.extend("Device");
	var res_json={"code":0,"desc":""};
	
	if(check_mobilePhoneverified(res)==false)
		return;
	
	var query = new AV.Query(Device);	
	query.equalTo("sn",data.device_sn);
	query.first({success: function(object) {	
			if(object==null||object["owner"]==null)
			{
				res_json.code=0;
				res_json.desc="未绑定.";
			}
			else
			{
				res_json.code=15;
				res_json.desc="已绑定.";
			}
		},
		error:function(err)
	  {
			res_json.code=-1;
			res_json.desc="查询失败.";
	  }
		
	});
}


function log_out(res)
{
	console.log("logout");			
	AV.User.logOut();
	var ret={"code":0,"desc":"Log out system success."};
	res.json(ret);
}

function register_account(data,res){
	console.log("start register.");
	var res_json={"code":0,"desc":""};

	var user = new AV.User();
	user.set("username", data.cellphone);
	user.set("password", data.password);
	user.set("nickname", data.cellphone);
	//user.set("email", req.body.t_email);

	// other fields can be set just like with AV.Object
	user.setMobilePhoneNumber(data.cellphone);
 	user.signUp(null, {
	  success: function(user) {
		// Hooray! Let them use the app now.
		  //res_json="{\"code\":0,\"data\":{\"desc\":\"Register successfully.\"}}";
		  res_json.desc="Register successfully.";
		  console.log("s:"+JSON.stringify(res_json));
		  res.json(res_json);
	  },
	  error: function(user, error) {
		// Show the error message somewhere and let the user try again.
		  switch(error.code)
		  {
		  case 214:
			res_json.code=17;
			res_json.desc="该手机号已经被使用";
			break;
		  case 202:
			  res_json.code=1;
			  res_json.desc="用户名已存在";					  
			  break;
		  default:
			  res_json.code=error.code;
			  res_json.desc=error.message;
			  break;
		  }
		  
		  console.log("f:"+ JSON.stringify(res_json));
		  res.json(res_json);
	  }	
	});
	    
}

function get_current_info(res)
{
	console.log("start get_account_info_by_id");
	var res_json={"code":0,"desc":"","data":{"username":"","nick_name":"","cellphone":""}};
	var user =AV.User.current();
	console.log("........");
	console.log(JSON.stringify(user));
	if(user!=null && user["_serverData"] != null &&user["_serverData"]["username"]!="")
	{
		//res_json="{\"code\":0,\"data\":"+JSON.stringify(user)+"}";
		res_json.code=0;
		res_json.desc="Success.";
		res_json.data.username=user["_serverData"]["username"];
		res_json.data.nick_name=user["_serverData"]["nickname"];
		res_json.data.cellphone=user["_serverData"]["mobilePhoneNumber"];
		console.log("s:"+JSON.stringify(res_json));
		res.json(res_json);
	}
	else
	{		 
		res_json.code=13;
		res_json.desc="Account is not logged in.";
		 console.log("f:"+ JSON.stringify(res_json));
		 res.json(res_json);
	}
}

function requestMobilePhoneVerify(data,res)	//主动请求验证码
{
	console.log("start requestMobilePhoneVerify.");
	var res_json={"code":0,"desc":""};

	 AV.User.requestMobilePhoneVerify(data.cellphone,{		   
		    name: "tvt home",
		    op: "验证手机号",
		    ttl: 20
		 }).then(function(){
	        //发送成功
		 
			res_json.desc="发送成功.";
			 console.log("f:"+ JSON.stringify(res_json));
			 res.json(res_json);
	    }, function(err){
	       //发送失败
	    	if(err.code==213)
    		{
	    		 res_json.code=18;
				 res_json.desc="手机号不存在.";
    		}
	    	else
    		{
	    		 res_json.code=err.code;
				 res_json.desc=err.message;
    		}
	    	
			 console.log("f:"+ JSON.stringify(res_json));
			 res.json(res_json);
	    });
}

function verifyMobilePhone(data,res)
{
	console.log("start verifyMobilePhone.");
	var res_json={"code":0,"desc":""};
	
	  AV.User.verifyMobilePhone(data.sms_code).then(function(){
	        //验证成功
			 res_json.desc="验证成功.";
			 console.log("f:"+ JSON.stringify(res_json));
			 res.json(res_json);
	    }, function(err){
	       //验证失败
	    	 res_json.code=err.code;
			 res_json.desc=err.message;
	    	 console.log("f:"+ JSON.stringify(res_json));
			 res.json(res_json);
	    });
}

function requestSmsCode(data,res)
{

	var res_json={"code":0,"desc":""};
	console.log(data);
	AV.Cloud.requestSmsCode({
	    mobilePhoneNumber: data.cellphone,
	    name: "tvt home",
	    op: "注册",
	    ttl: 20
	 }).then(function(){
	     //发送成功
		 //res_json="{\"code\":0,\"data\":{\"desc\":\"get sms code successfully.\"}}";
		 res_json.code=0;
		 res_json.desc="Get sms code successfully.";
		 res.json(res_json);
	 }, function(err){
	     //发送失败
		 res_json.code=err.code;
		 res_json.desc=err.message;
		 console.log("f:"+ JSON.stringify(res_json));
		 res.json(res_json);
	 });
}

function get_login_sms_code(data,res)
{
	var res_json={"code":0,"desc":""};
	console.log(data);
	
	AV.User.requestLoginSmsCode(data.cellphone).then(function(){
	     //发送成功					
		 //res_json="{\"code\":0,\"data\":{\"desc\":\"Get sms code successfully.\"}}";
		 res_json.code=0;
		 res_json.desc="Get sms code successfully.";
		 console.log("s:"+JSON.stringify(res_json));
		 res.json(res_json);					 
	 }, function(err){
	     //发送失败
		 res_json.code=err.code;
		 res_json.desc=err.message;		
		 console.log("f:"+ JSON.stringify(res_json));
		 res.json(res_json);
	 });
}

function loginsys(data,res)
{	
	var res_json={"code":0,"desc":""};
	console.log(data);
	var reg=/^[0-9]+$/i;
	if(reg.test(data.account) && data.account.length==11)	//用手机号登录
	{
		AV.User.logInWithMobilePhone(data.account,data.password,{
		  success: function(user) {
			    // Do stuff after successful login.
				  //res_json="{\"code\":0,\"data\":{\"desc\":\"log in system successfully.\"}}";
				  res_json.code=0;
				  res_json.desc="log in system successfully.";
				  res.json(res_json);
			  },
			  error: function(user, error) {
			    // The login failed. Check error to see why.
				  
				  switch(error.code)
				  {
				  case 211:
					  res_json.code=4;
					  res_json.desc="用户名不存在";
					  break;
				  case 210:
					  res_json.code=3;
					  res_json.desc="密码错误";
					  break;
				  default:
					  res_json.code=error.code;
					  res_json.desc=error.message;
					  break;
				  }
				 
				  console.log("f:"+ JSON.stringify(res_json));
				  res.json(res_json); 
			  }
			});
	}
	else
	{
	   AV.User.logIn(data.account, data.password, {
		  success: function(user) {
		    // Do stuff after successful login.
			  //res_json="{\"code\":0,\"data\":{\"desc\":\"log in system successfully.\"}}";
			  res_json.code=0;
			  res_json.desc="log in system successfully.";
			  res.json(res_json);
		  },
		  error: function(user, error) {
		    // The login failed. Check error to see why.
			  
			  switch(error.code)
			  {
			  case 211:
				  res_json.code=4;
				  res_json.desc="用户名不存在";
				  break;
			  case 210:
				  res_json.code=3;
				  res_json.desc="密码错误";
				  break;
			  default:
				  res_json.code=error.code;
				  res_json.desc=error.message;
				  break;
			  }
			 
			  console.log("f:"+ JSON.stringify(res_json));
			  res.json(res_json); 
		  }
		});
	
	}
}

function update_account_info(data,res)
{
	console.log("start update_account_info.")
	var res_json={"code":0,"desc":""};
	var user =AV.User.current();
	if(user!=null && user["_serverData"] != null &&user["_serverData"]["nickname"]!=null)
	{
		user.set("nickname",data.nick_name);
		user.set("mobilePhoneNumber",data.cellphone)
		user.save(null,{success: function(results) {
			 //res_json="{\"code\":0,\"message\":\"update info successfully.\"}";
			 res_json.code=0;
			 res_json.desc="Update info successfully.";
			 
			 console.log("s:"+JSON.stringify(res_json));
			 res.json(res_json);
		},
		error:function(object,error)
		{
			if(error.code==214)
			{
				res_json.code=17;
				res_json.desc="该手机号已经被使用";
			}
			else
			{
				res_json.code=error.code;
				res_json.desc=error.message;
			}
			 console.log("f:"+ JSON.stringify(res_json));
			 res.json(res_json);
		}
		});
	}
	else
	{
		 res_json.code=13;
		 res_json.desc="Account is not logged in.";
		 console.log("f:"+ JSON.stringify(res_json));
		 res.json(res_json);
	}
}

function modify_password(data,res)
{
	console.log("start modify_password");
	var res_json={"code":0,"desc":""};
	var user =AV.User.current();	
	
	if(user!=null && user["_serverData"] != null)
	{  
		var url="https://cn.avoscloud.com/1.1/users/";
		
		url = url+user["id"]+"/updatePassword";
		
		var body= {"old_password":"", "new_password":""};
		
		body.old_password=data.old_password;
		body.new_password=data.new_password;

		var header={"X-AVOSCloud-Session-Token":""};
		header.token=user["_sessionToken"];
		modify_password_request(url,body,res,header);
	}
	else
	{
		res_json.code=13;
		res_json.desc="Account is not logged in.";
		 console.log("f:"+ JSON.stringify(res_json));
		 res.json(res_json);
	}
}

function sms_reset_password(data,res)
{
	console.log("reset_password.");
	var res_json;
	
//	AV.User.logInWithMobilePhoneSmsCode(data["cellphone"],data["sms_code"]).then(function(obj) {
//		object.set("password",data["new_password"]);
//		object.save().then(function(obj) {
//			 res_json="{\"code\":0,\"desc\":\"Reset password successfully.\"}";
//			 console.log("s:"+JSON.stringify(res_json));
//			 res.send(res_json);						
//		},function(error){
//			 res_json="{\"code\":"+error.code+",\"desc\":\""+error.message+"\"}";
//			 console.log("s:"+JSON.stringify(res_json));
//			 res.send(res_json);						
//		});
//	});
		
	var url="https://cn.avoscloud.com/1.1/resetPasswordBySmsCode/";
	url = url+data.sms_code;
	var body= {"password": ""};
	body.password=data.new_password;
	var ext={"method":"PUT"};
	request(url,body,res,ext);
}

function add_device(data,res)
{	
	if(check_mobilePhoneverified(res)==false)
		return;
	
	var currentUser=AV.User.current();
	var res_json={"code":0,"desc":""};
	if(currentUser==null ||currentUser=="" )
	{
		res_json.code=13;
		res_json.desc="Account is not logged in.";
		 console.log("f:"+ JSON.stringify(res_json));
		 res.json(res_json);
		 return;
	}
	
	var Device = AV.Object.extend("Device");
	
	var query = new AV.Query(Device);	
	query.equalTo("sn",data.device_sn);
	query.first({
		success: function(object) {	
			
			if(object==null)
			{
				res_json.code=19;
				  res_json.desc="设备不存在.";
				  
				  console.log("s:"+JSON.stringify(res_json));
				  res.json(res_json);	
				  return;
			}
			
			if(object["owner"]==null) //设备未绑定
			{	
				 
				/*object.set("sn", data.device_sn);
				object.set("owner", currentUser);
				object.set("ip", data.ip);
				object.set("port", data.port);
				object.set("type", data.type);
				object.set("name", data.name);*/
				object.set("owner", currentUser);
				object.setACL(new AV.ACL(currentUser));//只有当前用户可以访问
				
				object.save(null, {
				  success: function(device) {
					  
					  var relation = currentUser.relation("Device");
					  relation.add(device);
					  currentUser.save();
					  
					  res_json.code=0;
					  res_json.desc="Add device successfully.";
					  
					  console.log("s:"+JSON.stringify(res_json));
					  res.json(res_json);	
				  },
				  error: function(device, error) {
					  res_json.code=error.code;
						res_json.desc=error.message;
					  console.log("f:"+ JSON.stringify(res_json));
					  res.json(res_json);	
				  }
				});
			}	
			else
			{
				res_json.code=15;
				res_json.desc="设备已经绑定.";
				  console.log("s:"+JSON.stringify(res_json));
				  res.json(res_json);	
			}
		
		},
		 error:function(err)
		  {
			  res_json.code=error.code;
			  res_json.desc=error.message;
			  console.log("f:"+ JSON.stringify(res_json));
			  res.json(res_json);	 
		  }
	});
	
}

function get_device_list(data,res)
{
	if(check_mobilePhoneverified(res)==false)
		return;
	
	var res_json={"code":0,"desc":"","data":{"device_array":[]}};
	var user = AV.User.current();
	if(user == null || user == "")
	{		
		 //res_json="{\"code\":-1,\"message\":\"current user is null.\"}";
		 res_json.code=13;
		 res_json.desc="Account is not logged in.";
		 console.log("s:"+JSON.stringify(res_json));
		 res.json(res_json);
		 return;
	}
	
	var relation = user.relation("Device");
	
	relation.query().find({
		  success: function(list) {
			  if(list.length!=0)
			  {
				// res_json="{\"code\":0,\"data\":{\"device_array\":"+JSON.stringify(list)+"}}";
				 res_json.code=0;
				 for(var i=0;i<list.length;i++)
				 {
					 var j_device={"device_sn":"","type":"","device_name":""};
					 
					 j_device.device_sn=list[i]["_serverData"]["sn"];
					 j_device.type=list[i]["_serverData"]["type"];
					 j_device.device_name=list[i]["_serverData"]["name"];

					 res_json.data.device_array[i]=j_device;
				 }
				//console.log("s:"+JSON.stringify(res_json));
				 res.json(res_json);	
			  }
			  else
			  {
				//res_json="{\"code\":0,\"data\":\"\"}";
				  res_json.code=0;
				  res_json.desc="当前用户未绑定设备";
				console.log("s:"+JSON.stringify(res_json));
				res.json(res_json);	
			  }
		  },
		  error:function(err)
		  {
			  //res_json="{\"code\":"+err.code+",\"message\":\""+err.message+"\"}";
			  res_json.code=err.code;
			  res_json.desc=err.message;
			  console.log("f:"+ JSON.stringify(res_json));
			  res.json(res_json);	 
		  }
		});		
}

function del_device(data,res)
{
	if(check_mobilePhoneverified(res)==false)
		return;
	
	console.log("start del_device.")
	var res_json={"code":0,"desc":""};
	var currentUser = AV.User.current();
	if(currentUser == null || currentUser == "")
	{		
		res_json.code=13;
		res_json.desc="Account is not logged in.";
		 console.log("s:"+JSON.stringify(res_json));
		 res.json(res_json);
		 return;
	}
	
	var Device = AV.Object.extend("Device");	
	var query = new AV.Query(Device);
	
	query.equalTo("sn",data.device_sn);
	query.first({
		  success: function(object) {
			  if(object!=null)
			  {
				  var relation = currentUser.relation("Device");	//删除关联
				  relation.remove(object);
				  currentUser.save();
				  
				  object.set("owner",null);	//将所有者设为空。
				  object.save(null, {
					    success: function(obj) {
					        // The save was successful.
					    	console.log("set owner null success.");
					      },
					      error: function(obj, error) {
					        // The save failed.  Error is an instance of AV.Error.
					    	  console.log("f:"+error.code+","+error.message);
					      }
					    });
				  res_json.code=0;
				  res_json.desc="Delete device successfully.";
				  res.json(res_json);	
				  console.log("s:"+JSON.stringify(res_json));
			  }
			  else
			  {
				  //res_json="{\"code\":-1,\"data\":\"delete device failed.\"}";
				  res_json.code=13;
				  res_json.desc="设备未被绑定.";
				  res.json(res_json);	
			  }
		  },
		  error:function(err)
		  {
			  res_json.code=err.code;
			  res_json.desc=err.message;
			  console.log("f:"+ JSON.stringify(res_json));
			  res.json(res_json);	 
		  }
	});
}

function request(url,body,res,ext)
{	
	console.log("start request.");
	var res_json={"code":0,"desc":"","data":""};
	var param={
			method: 'POST',
			url: '',
			headers: {
				'X-AVOSCloud-Application-Id': 'zvhpgwwhv1a9sofjo7wk6xs2in42ucoywny1tlskk41kbski',
				'X-AVOSCloud-Application-Key': 'o4lhqbul0fi6s77k3aw5crdtw6jx8p0q4yetw8aepm5jyku5',
				'Content-Type': 'application/json'
			},
			body: {
				"": ""
			},
			success: function(httpResponse) {
				console.log(httpResponse.text);				
				if(httpResponse.text!=""&&httpResponse.text!={})
				{
					res_json.data=httpResponse.text;
				}	
				res_json.desc="Requrest success.";
				
				res.json(res_json);
			},
			error: function(httpResponse) {
				console.error('Request failed with response code ' + httpResponse.status);	
				console.log(JSON.stringify(httpResponse));
				if(httpResponse.status==400)
				{
					res_json.code=16;//验证码错误
				}
				else
				{
					res_json.code=httpResponse.status;
				}
				
				res_json.desc=httpResponse.data.error;
				res.json(res_json);
			}
		};
	param.url=url;
	param.body=body;
	if(ext!=undefined)
	{
		console.log(ext.method);
		param.method=ext.method;
	}
	console.log(param);	
	AV.Cloud.httpRequest(param);
}
function modify_password_request(url,body,res,header)
{
	console.log("start modify_password_request.");
	var res_json={"code":0,"desc":"","data":""};
	var param={
			method: 'PUT',
			url: '',
			headers: {
				'X-AVOSCloud-Application-Id': 'zvhpgwwhv1a9sofjo7wk6xs2in42ucoywny1tlskk41kbski',
				'X-AVOSCloud-Application-Key': 'o4lhqbul0fi6s77k3aw5crdtw6jx8p0q4yetw8aepm5jyku5',
				'X-AVOSCloud-Session-Token':header.token,
				'Content-Type': 'application/json'
			},
			body: {
				"": ""
			},
			success: function(httpResponse) {
				console.log(httpResponse.text);				
				if(httpResponse.text!=""&&httpResponse.text!={})
				{
					res_json.data=httpResponse.text;
				}	
				res_json.desc="Requrest success.";
				
				res.json(res_json);
			},
			error: function(httpResponse) {
				console.error('Request failed with response code ' + httpResponse.status);				
				res_json.code=3;//定义为密码错误.
				res_json.desc="Password error.";
				res.json(res_json);
			}
		};
	param.url=url;
	param.body=body;	
	console.log(param);
	AV.Cloud.httpRequest(param);
}

function check_mobilePhoneverified(res)
{
	var user=AV.User.current();
	var res_json={"code":0,"desc":""};
	if(user["_serverData"]["mobilePhoneVerified"]==false)
	{	
		res_json.code=22;//定义为密码错误.
		res_json.desc="手机号未验证.";
		console.log(JSON.stringify(res_json));
		res.json(res_json);
		return false;	
	}
	else
	{
		return true;
	}
}

function RegisterDevice(req, res)
{
	var Device = AV.Object.extend("Device");
	var query = new AV.Query(Device);
	query.equalTo("sn", req.body.data.device_sn);
	query.first({
		success: function(device) 
		{
			if(device == undefined)
			{
				device = new Device();
				device.set("sn", req.body.data.device_sn);
			}
			
			device.set("type", "ipc");
			device.set("ip", req.body.data.ip);
			device.set("port", req.body.data.port);

			device.save(null, {
				success: function(dev)
				{
					res.send('{"code"  :0, "desc" : "update device ok"}');
				},
				error:function(dev, error)
				{
					console.log("#1 - " + error.code + " : " + error.message);
					res.send('{"code"  :100, "desc" : Network error."}');
				}
			});
		},
		error:function(error)
		{
			console.log(error.code + " : " + error.message);
			res.send("#2 - " + '{"code"  :100, "desc" : Network error."}');
		}
	});
}

function CheckAuth(req, res, user)
{
	var Device = AV.Object.extend("Device");
	var query = new AV.Query(Device);
	query.equalTo("sn", req.body.data.device_sn);
	query.first({
		success: function(device) 
		{
			if(device == undefined)
			{
				console.log("Not Found");
				res.send('{"code"  :19, "desc" : "Not Found！"}');
			}
			else
			{
				var owner = device.get("owner");
				var auth_code = "auth_none";
				if(owner != undefined)
				{
					if(user.id == owner.id)
					{
						auth_code = "auth_owner";
					}
				}
				var jsonObj = {
					code : 0, 
					desc : "ok", 
					data : {
						auth : auth_code
					}
				};
				var jsonString = JSON.stringify(jsonObj);
				console.log(jsonString);
				res.send(jsonString);
			}
		},
		error:function(error)
		{
			res.send('{"code"  :100, "desc" : Network error."}');
		}
	});
}

app.get("/test",function(req,res){
	clear_overdue_account_();
	res.send("end");
});


function clear_overdue_account_()
{
	var query = new AV.Query(AV.User);
	query.equalTo("mobilePhoneVerified", false);
	
	var now= new Date();
	console.log("now1="+now);
	now.setDate(now.getDate()-20);
	console.log("now2="+now);

	query.lessThan("createdAt",now);
	
	query.find({
		success: function(results) 
		{
			if(results!=undefined && results.length>0)
			{
				console.log("len="+results.length)
				for(var i=0;i<results.length;i++)
				{
					console.log(results[i]["_serverData"]["username"]);
					console.log(results[i]["_serverData"]["nickname"]);
					console.log(results[i]["_serverData"]["mobilePhoneVerified"]);
					console.log(results[i]["_serverData"]["email"]);
					console.log(".......");
					//console.log(JSON.stringify(results));
				}
				results[0].destroy({
					  success: function(myObject) {
						    // The object was deleted from the AVOS Cloud.
						  console.log("del suc");
						  },
						  error: function(myObject, error) {
						    // The delete failed.
						    // error is a AV.Error with an error code and description.
							  
							  console.log("delete failed");
						  }
						});
			}
			
			console.log("success.");
		},
		error:function(error)
		{
			console.log("failed.");
		}
	});
}


// 最后，必须有这行代码来使 express 响应 HTTP 请求
app.listen();
