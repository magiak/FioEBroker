bindInput = function(input, scope) {
    if (!scope){
        scope = window;
    }

    var field = input.getAttribute('data-bind').split('.');

    scope[field[0]].onchange(function(){
        var val = scope[field[0]].get(field[1]);
        if (input.type === 'checkbox'){
            input.checked = val;
        } else {
            input.value = val;
        }

    });

    input.addEventListener('change', function(){
        var val = input.value;
        if (input.type === 'checkbox'){
            val = input.checked;
        }
        scope[field[0]].set(field[1], val);
    });

};