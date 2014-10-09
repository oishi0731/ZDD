require("cloud/app.js");
// Use AV.Cloud.define to define as many cloud functions as you want.
// For example:
AV.Cloud.define("hello", function(request, response) {
  response.success("Hello world!");
});


AV.Cloud.define("clear", function(request, response) {
	  clear_overdue_account();
	  response.success("Hello1 world!");
	});

function clear_overdue_account()
{
	var query = new AV.Query(AV.User);
	query.equalTo("mobilePhoneVerified", false);
	
	var now= new Date();
	//console.log("now1="+now);
	now.setDate(now.getDate()-1);
	console.log("now2="+now);

	query.lessThan("createdAt",now);
	
	query.find({
		success: function(results) 
		{
			if(results!=undefined && results.length>0)
			{
				console.log("len="+results.length)
//				for(var i=0;i<results.length;i++)
//				{
//					console.log(results[i]["_serverData"]["username"]);
//					console.log(results[i]["_serverData"]["nickname"]);
//					console.log(results[i]["_serverData"]["mobilePhoneVerified"]);
//					console.log(results[i]["_serverData"]["email"]);
//					console.log(".......");
//					//console.log(JSON.stringify(results));
//				}
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
			
			console.log("query success.");
		},
		error:function(error)
		{
			console.log("query failed.");
		}
	});
}