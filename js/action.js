$(document).ready(function(){
	$('#ham').on('click', function(){
		$('#optionPanel').toggleClass('toggleHamClass');
		$('#ham').toggleClass('toggleHamBtn');
		$('#mainTitle').toggleClass('toggleHamBtn');
	});
});