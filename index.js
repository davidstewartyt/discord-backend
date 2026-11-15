
const express = require("express");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

app.use(session({
  secret: process.env.SESSION_SECRET || "change-this-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  }
}));

const API = "https://discord.com/api/v10";

app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Discord Dashboard</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
*{box-sizing:border-box}
body{margin:0;background:#313338;color:white;font-family:Arial}
header{background:#1e1f22;padding:20px;font-size:22px;font-weight:bold}
main{max-width:850px;margin:50px auto;padding:20px}
.card{background:#2b2d31;padding:25px;border-radius:12px;margin-bottom:15px}
button,.login{background:#5865f2;color:white;border:0;padding:13px 20px;border-radius:6px;cursor:pointer;text-decoration:none;display:inline-block}
.server{background:#383a40;padding:14px;margin:8px 0;border-radius:7px}
img{width:65px;height:65px;border-radius:50%;vertical-align:middle;margin-right:15px}
.muted{color:#b5bac1}
</style>
</head>
<body>
<header>Discord Dashboard</header>
<main>
<div id="app" class="card">Loading...</div>
</main>
<script>
async function load(){
 const box=document.getElementById("app");
 try{
  const r=await fetch("/api/me");
  if(r.status===401){
   box.innerHTML='<h1>Welcome to your Discord dashboard</h1><p class="muted">Connect your Discord account to continue.</p><a class="login" href="/auth/discord">Login with Discord</a>';
   return;
  }
  const data=await r.json();
  const u=data.user;
  const avatar=u.avatar
   ? 'https://cdn.discordapp.com/avatars/'+u.id+'/'+u.avatar+'.png'
   : 'https://cdn.discordapp.com/embed/avatars/0.png';
  box.innerHTML='<img src="'+avatar+'"><strong>'+escapeHtml(u.global_name||u.username)+'</strong><p>@'+escapeHtml(u.username)+'</p><h2>Your servers ('+data.guilds.length+')</h2>'+
   data.guilds.map(g=>'<div class="server">'+escapeHtml(g.name)+'</div>').join('')+
   '<p><button onclick="logout()">Log out</button></p>';
 }catch(e){
  box.textContent="Could not load your account.";
 }
}
function escapeHtml(s){
 return String(s).replace(/[&<>"']/g,c=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
 }[c]));
}
async function logout(){
 await fetch("/auth/logout",{method:"POST"});
 location.reload();
}
load();
</script>
</body>
</html>
`);
});

app.get("/auth/discord", (req, res) => {
 const state = require("crypto").randomBytes(24).toString("hex");
 req.session.state = state;
 const params = new URLSearchParams({
  client_id: process.env.DISCORD_CLIENT_ID,
  redirect_uri: process.env.DISCORD_REDIRECT_URI,
  response_type: "code",
  scope: "identify guilds",
  state
 });
 res.redirect("https://discord.com/oauth2/authorize?"+params);
});

app.get("/auth/discord/callback", async (req,res)=>{
 if(req.query.error) return res.redirect("/");
 if(!req.query.code || req.query.state!==req.session.state)
  return res.status(400).send("Invalid login state.");
 try{
  const tokenResponse=await fetch(API+"/oauth2/token",{
   method:"POST",
   headers:{"Content-Type":"application/x-www-form-urlencoded"},
   body:new URLSearchParams({
    client_id:process.env.DISCORD_CLIENT_ID,
    client_secret:process.env.DISCORD_CLIENT_SECRET,
    grant_type:"authorization_code",
    code:req.query.code,
    redirect_uri:process.env.DISCORD_REDIRECT_URI
   })
  });
  const token=await tokenResponse.json();
  if(!token.access_token) throw new Error("Token exchange failed");

  const headers={Authorization:"Bearer "+token.access_token};
  const [userResponse,guildResponse]=await Promise.all([
   fetch(API+"/users/@me",{headers}),
   fetch(API+"/users/@me/guilds",{headers})
  ]);
  if(!userResponse.ok || !guildResponse.ok) throw new Error("Discord API failed");

  req.session.discord={
   user:await userResponse.json(),
   guilds:await guildResponse.json()
  };
  delete req.session.state;
  req.session.save(()=>res.redirect("/"));
 }catch(error){
  console.error(error);
  res.status(500).send("Discord login failed. Check your settings.");
 }
});

app.get("/api/me",(req,res)=>{
 if(!req.session.discord)
  return res.status(401).json({authenticated:false});
 res.json({
  authenticated:true,
  user:req.session.discord.user,
  guilds:req.session.discord.guilds
 });
});

app.post("/auth/logout",(req,res)=>{
 req.session.destroy(()=>res.json({ok:true}));
});

app.listen(PORT,"0.0.0.0",()=>{
 console.log("Discord dashboard running on port "+PORT);
});
