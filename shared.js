function checkAuth(){
  if (localStorage.getItem('loggedin')!=='true') {
    window.location.href = 'login.html';
  }
}
