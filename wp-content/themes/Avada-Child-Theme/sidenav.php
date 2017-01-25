<link rel="stylesheet" href="nav.css">
<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/smoothness/jquery-ui.css">
<script src="//code.jquery.com/jquery-1.12.4.js"></script>
<script src="//code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
<script>
/* Set the width of the side navigation to 250px */
function openNav() {
	document.getElementById("mySidenav").style.width = "250px";
}

/* Set the width of the side navigation to 0 */
function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
}
</script>


<div id="mySidenav" class="sidenav">
  <a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
  <a href="#">About</a>
  <a href="#">Services</a>
  <a href="#">Clients</a>
  <a href="#">Contact</a>
</div>

<!-- Use any element to open the sidenav -->
<div id="Sidenav_box">
	<div id="Sidenav_menu">
		<ul id="main_toggle">
			<li><a href="http://113366.com/ksystem" target="_blank"><img src="http://ksystem.kimyosunnyc.com/wp-content/uploads/2017/01/main_tab_01.png" alt="원격지원"></a></li>
			<li><a onclick="openNav()" href="#"><img src="http://ksystem.kimyosunnyc.com/wp-content/uploads/2017/01/main_tab_02.png" alt="공지사항"></a></li>
			<li><a href="/mobile/"><img src="http://ksystem.kimyosunnyc.com/wp-content/uploads/2017/01/main_tab_03.png" alt="모바일ERP"></a></li>
			<li><a href="/클라우드-erp-2/"><img src="http://ksystem.kimyosunnyc.com/wp-content/uploads/2017/01/main_tab_04.png" alt="클라우드서비스"></a></li>
		</ul>
	</div>
</div>


