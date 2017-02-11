import React from 'react';
import ReactDOM from 'react-dom';

import configs from './config';

class Login extends React.Component {

	constructor(props) {
		super(props);
		this.state={
			facebook: false,
			google: false
		}
		this.loginWith=this.loginWith.bind(this);
		this.logout=this.logout.bind(this);
	}

	loginWith(auth) {
		if(auth==="google") {
			this.googleSignin();
		} else {
			this.facebookSignin();
		}
	}

	logout(auth) {
		console.log("auth",auth)
		if(auth==="facebook") {
			FB.logout( (res)=> {
				document.querySelector(".json-facebook").innerHTML=null;
				this.setState({
					facebook: false
				})
			});
		} else if(auth==="google") {
			gapi.auth2.getAuthInstance().signOut().then(()=> {
				document.querySelector(".json-google").innerHTML=null;
				this.setState({
					google: false
				})
	    });
		}
	}

	facebookSignin() {
		let temp={};
		FB.login((resp)=>{
			console.log(resp);
			if (resp.status === "connected") {
				FB.api("/me?fields=name,first_name,last_name,email,picture,age_range,birthday,gender,link,locale", (res)=> {
					console.log(res);
					temp={
						name: res.name,
						first_name: res.first_name,
						last_name: res.last_name,
						email: res.email,
						expiry: resp.authResponse.expiresIn,
						token: resp.authResponse.accessToken,
						gender: res.gender,
						birthday: res.birthday || null,
						imageUrl: res.picture.data.url,
						id: res.id,
						url: res.link,
						ageRange: res.age_range.min,
						language: res.locale || "en"
					}
					document.querySelector(".json-facebook").innerHTML=jsonView(temp);
					this.setState({
						facebook: true
					})
				});
			} else {
				this.facebookSignin();
				console.log("not connected");
			}
		},{ scope: "public_profile,email,user_friends,user_birthday" });
	}

	/*
		Google login using google javascript sdk.
		Client.plus.people is deprecated. will not give any data after 2017 Q1.
		Verification is required.
	*/

	googleSignin() {
		let temp={};
		gapi.auth2.getAuthInstance().signIn().then((gres)=>{
			gapi.client.plus.people.get({'userId': 'me'}).execute((res)=> {
				let resp=gres.getAuthResponse();
				temp={
					name: res.displayName,
					first_name: res.name.givenName,
					last_name: res.name.familyName,
					email: res.emails[0].value,
					expiry: resp.expires_at,
					token: resp.access_token,
					gender: res.gender,
					birthday: res.birthday || null,
					imageUrl: res.image.url,
					id: res.id,
					url: res.url,
					ageRange: res.ageRange.min,
					language: res.language || "en"
				}
				document.querySelector(".json-google").innerHTML=jsonView(temp);
				this.setState({
					google: true
				});
			});
		});
	}

	render() {
		return (<div>
				<div className="container-fluid">
					<div className="row">
						<div className="col-xs-12 col-sm-12 col-md-6">
							<div className="header">
								Login with Google
							</div>
							<div className="body">
								<button name="login" onClick={()=> this.loginWith('google')}>Google</button>
								{ this.state.google ? <button name="logout" onClick={()=> this.logout('google')}>Logout</button> : '' }
							</div>
							<div className="json-data">
								<div className="json-google"></div>
							</div>
						</div>
						<div className="col-xs-12 col-sm-12 col-md-6">
							<div className="header">
								Login with Facebook
							</div>
							<div className="body">
								<button name="login" onClick={()=> this.loginWith('facebook')}>Facebook</button>
								{ this.state.facebook ? <button name="logout" onClick={()=> this.logout('facebook')}>Logout</button> : '' }
							</div>
							<div className="json-data">
								<div className="json-facebook"></div>
							</div>
						</div>
					</div>
				</div>
			</div>)
	}
}

function jsonView(jsonVar) {
	var jsonStr = JSON.stringify(jsonVar),
    regeStr = '',
    f = {
            brace: 0
        };

	regeStr = jsonStr.replace(/({|}[,]*|[^{}:]+:[^{}:,]*[,{]*)/g, function (m, p1) {
	    var rtnFn = function() {
	            return '<div style="text-indent: ' + (f['brace'] * 20) + 'px;">' + p1 + '</div>';
	        },
	        rtnStr = 0;
	    if (p1.lastIndexOf('{') === (p1.length - 1)) {
	        rtnStr = rtnFn();
	        f['brace'] += 1;
	    } else if (p1.indexOf('}') === 0) {
	        f['brace'] -= 1;
	        rtnStr = rtnFn();
	    } else {
	        rtnStr = rtnFn();
	    }
	    return rtnStr;
	});
	return regeStr;
}

window.onload=()=> {
	console.log("initalized");
	gapi.load('auth2', ()=> {
		gapi.client.load('plus','v1').then(()=> {
			gapi.auth2.init({
				client_id: configs.google,
				immediate: true,
				cookiepolicy: 'single_host_origin',
				scope: 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/plus.me', //https://www.googleapis.com/userinfo/v2/me
				// approval_prompt: 'force'
			});
		});
	});

	FB.init({
		appId      : configs.facebook,
		xfbml      : true,
		version    : 'v2.8',
		cookie     : true,
		status     : true
	});
	FB.AppEvents.logPageView();

	ReactDOM.render(<Login />, document.getElementById('root'))
}
