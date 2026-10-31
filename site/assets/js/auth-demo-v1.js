(function(){
 "use strict";
 const demo={email:"demo@kavanah.vn",password:"Kavanah123!",name:"Tài khoản demo"};
 const modal=document.getElementById("authModal"),open=document.getElementById("authOpen"),close=document.getElementById("authClose"),form=document.getElementById("authForm"),message=document.getElementById("authMessage"),user=document.getElementById("authUser"),userName=document.getElementById("authUserName"),logout=document.getElementById("authLogout");
 if(!modal||!open||!close||!form||!message||!user||!userName||!logout)return;
 function setModal(isOpen){modal.hidden=!isOpen;if(isOpen){message.textContent="";document.getElementById("authEmail").focus();}}
 function paint(){
  const loggedIn=localStorage.getItem("kavanah-demo-session")==="active";
  document.body.classList.toggle("auth-locked",!loggedIn);
  modal.classList.toggle("auth-required",!loggedIn);
  open.hidden=loggedIn;user.classList.toggle("active",loggedIn);userName.textContent=loggedIn?demo.name:"";
  if(!loggedIn)setModal(true);
 }
 open.addEventListener("click",()=>setModal(true));
 close.addEventListener("click",()=>{if(!modal.classList.contains("auth-required"))setModal(false);});
 modal.addEventListener("click",event=>{if(event.target===modal&&!modal.classList.contains("auth-required"))setModal(false);});
 document.addEventListener("keydown",event=>{if(event.key==="Escape"&&!modal.hidden&&!modal.classList.contains("auth-required"))setModal(false);});
 form.addEventListener("submit",event=>{
  event.preventDefault();
  const email=document.getElementById("authEmail").value.trim().toLowerCase();
  const password=document.getElementById("authPassword").value;
  if(email!==demo.email||password!==demo.password){message.textContent="Email hoặc mật khẩu demo chưa đúng.";return;}
  localStorage.setItem("kavanah-demo-session","active");form.reset();setModal(false);paint();
 });
 logout.addEventListener("click",()=>{localStorage.removeItem("kavanah-demo-session");paint();});
 paint();
})();
