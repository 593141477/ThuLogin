$('#save_form').submit(function(){
	var input = $(this).find('input');
	$.each(input,function(index) {
		var obj = input[index];
		if(obj.name){
			localStorage[obj.name] = obj.value;
		}
	});
	alert('设置已保存!');
	return false;
});