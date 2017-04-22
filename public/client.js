// client-side js
// run by the browser each time your view template is loaded
var request=window.superagent;
// by default, you've got jQuery,
// add other scripts at the bottom of index.html

class APILogin extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit=this.handleSubmit.bind(this);
    this.handleChange=this.handleChange.bind(this);
    this.state={name:"",password:""};
  }
  render(){
    return (<form class="login" onSubmit={this.handleSubmit}>
            <label>username:<input type="text" name="name" value={this.state.name} onChange={this.handleChange} /></label>
            <label>password:<input type="password" name="password" value={this.state.password} onChange={this.handleChange} /></label>
            <div class="error">{this.state.message}</div>
            <input type="submit" value="login" />
            </form>);
  }
  handleSubmit(event){
    var login=this;
    request.post("/api/login").query({user:this.state.name,password:this.state.password}).end(function(err,res){
      if (err) {
        login.setState({message:err});
      } else {
        login.props.onAPIKey(res.body.apikey);
      }
    });
    event.preventDefault();
  }
  handleChange(event){
    this.setState({[event.target.name]: event.target.value});
  }
};

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state={id:props.key,name:props.data.name,uid:props.data.uid,apikey:props.apikey};
    this.getBalance();
  }
  render() {
    return (<div><span>{this.state.name}</span><span>{this.state.uid}</span><span>{this.state.balance}</span></div>);
  }
  getBalance() {
    //API not yet implemented
    this.setState({balance:0});
  }
}
class AccountList extends React.Component {
  constructor (props) {
    super(props);
    this.state={apikey:props.apikey,accounts:[]};
    this.processAccountList=this.processAccountList.bind(this);
    request.get("/api/account").set("X-API-Key",this.state.apikey).end(this.processAccountList)
  }
  processAccountList(err,res) {
    if (!err && res.body) {
      const accounts=res.body.map((item) => <Account key={item._id} data={item} apikey={this.state.apikey} />);
      this.setState({accounts:accounts})
    } else {
      console.log(err);
    }
  }
  render(){
    if (this.state.accounts) {
      return (<div>
           {this.state.accounts}
           </div>)
    } else {
      return (<div> </div>)        
    }
  }
}
  

class BankApp extends React.Component {
  constructor() {
    super();
    this.state={
      apikey: false,
    };
  }
  render() {
    if (!this.state.apikey) {
      return <APILogin onAPIKey={(key)=>this.handleAPIKey(key)} />
    }
    return <AccountList apikey={this.state.apikey} />;
  }
  handleAPIKey(key) {
    this.setState({apikey:key});
  }
}

ReactDOM.render(
  <BankApp />,
  document.getElementById('content')
);