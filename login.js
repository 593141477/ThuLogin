(function(){
	var SavedToken = {
		school_id: '',
		user_id: '',
		password: ''
	}
	function newParamType (name, filter) {
		return function(){return filter ? filter(SavedToken[name]) : SavedToken[name]};
	}
	var ParamType = {
		$school_id: newParamType('school_id'),
		$user_id: newParamType('user_id'),
		$password: newParamType('password'),
		$password_md5: newParamType('password', CryptoJS.MD5)
	}
	var LoginParam = {
	"learn": {
			url: "https://learn.tsinghua.edu.cn/MultiLanguage/lesson/teacher/loginteacher.jsp",
			method: "post",
			param: {
				userid: ParamType.$school_id,
				userpass: ParamType.$password,
				submit1: "登录"
			}
		},
	"info": {
			url: "https://info.tsinghua.edu.cn/Login",
			// url: "https://portal.tsinghua.edu.cn/Login",
			method: "post",
			param: {
				redirect:'NO',
				userName: ParamType.$user_id,
				password: ParamType.$password
			}
		},
	"net": {
			ajax_url: "http://net.tsinghua.edu.cn/do_login.php",
			url: "http://net.tsinghua.edu.cn/",
			method: "post",
			param: {
				username: ParamType.$user_id,
				password: function(){return '{MD5_HEX}'+(ParamType.$password_md5)()},
				action: 'login',
				ac_id: 1,
// 				is_pad: 2,
// 				n: 100,
// 				type: 1,
// 				drop: 0,
			}
		},
	"usereg": {
			ajax_url: "https://usereg.tsinghua.edu.cn/do.php",
			url: "http://usereg.tsinghua.edu.cn/",
			method: "post",
			param: {
				action:"login",
				user_login_name: ParamType.$user_id,
				user_password: ParamType.$password_md5,
			}
		},
	"email": {
			url: "https://mails.tsinghua.edu.cn/coremail/index.jsp",
			method: "post",
			param: {
				password: ParamType.$password,
				uid: ParamType.$user_id,
				domain: 'mails.tsinghua.edu.cn',
				locale: 'zh_CN',
				nodetect: 'false',
				'action:login': ''
			}
		}
	};
	var ThuLogin = {
		Init: function() {
			ThuLogin.LoadSavedToken()

			$('#menu>.login').click(function(e){
				var $target = $(e.target);
				var id = $target.is('.login') ?
					$target.prop('id') :
					$(e.target).parents('.login').prop('id');
				
				if(/login_\w+/.test(id)){
					ThuLogin.Login(id.substring(6));
				}
			});
			$('#button_option').click(ThuLogin.OpenOptionPage);
		},
		LoadSavedToken: function() {
			for(var key in localStorage) {
				if(SavedToken.hasOwnProperty(key))
					SavedToken[key] = localStorage[key]
			}
		},
		Login: function(site) {
			var config = LoginParam[site];
			var data = {};
			var $submit_form = $('#submit_form');

			if(! SavedToken.password) {
				ThuLogin.LoadSavedToken();
				if(! SavedToken.password) {
					ThuLogin.NoSavedToken();
					return;
				}
			}

			$submit_form.html('');
			$submit_form.prop('method',config.method);
			$submit_form.prop('action',config.url);

			for(var key in config.param) { 
				if (config.param.hasOwnProperty(key)) {
					var v = config.param[key];
					if(typeof(v) == 'function') {
						data[key] = v();
					}
					else {
						data[key] = v;
					}
				}
			}

			for(var key in data) {
				$('<input>').prop('type','hidden').prop('name',key).val(data[key]).appendTo($submit_form);
			}

			if(config.ajax_url){
				$.ajax(config.ajax_url,{
					data: $submit_form.serialize(),
					type: config.method,
					success: function(data){
						chrome.tabs.create({url: config.url});
					}
				});
				return;
			}

			$submit_form.submit();
		},
		NoSavedToken: function() {
			// alert('尚未设置登录密码!');
			ThuLogin.OpenOptionPage();
		},
		OpenOptionPage: function() {
			chrome.tabs.create({
				'url': chrome.extension.getURL('options.html')
			}, function(tab) {

			});
		}
	}
	ThuLogin.Init();
})();