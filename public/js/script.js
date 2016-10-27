$(function()
{
    //Para los servicios que se consumirán...
    var nomServicios = [
							{
								servicio 	: 	"Trae todas las tareas",
								urlServicio	: 	"getAllTask",
								metodo		: 	"GET"
							}
						];

    var consumeServicios = function(tipo, val, callback)
	{
		var servicio = {
							url 	: nomServicios[tipo - 1].urlServicio,
							metodo	: nomServicios[tipo - 1].metodo,
							datos 	: ""
						};
		
		
			servicio.datos = val !== "" ? JSON.stringify(val) : "";
		
		//Invocar el servicio...
		$.ajax(
		{
			url 		: servicio.url,
			type 		: servicio.metodo,
			data 		: servicio.datos,
			dataType 	: "json",
			contentType: "application/json; charset=utf-8"
		}).done(function(data)
		{
            callback(data);
		}).error(function(request, status, error)
        {
            alert(request.responseText);
            window.location = "/";
		});
	};


    //Para guardar el nombre del usuario...
    var $nomUsuario = $("#titulo").html();
    //Traer los TO-DO creados...
    var todos = [];
	consumeServicios(1, "", function(data){
        todos = data;

        //console.log(todos);

        muestraTodos(1, 0);
    });
    //Fin de los servicios consumidos...


//Poner la primera letra en mayuscula

function MaysPrimera(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}





    var contenidoTabla = function(data, type)
    {
        if(type === 1)
        {



            return "<tr id = 'td_"+(data.id_ejercicio)+"'>" +
                        "<td width='80%'><div id = 'txt_"+(data.id_ejercicio)+"' class = '"+(data.finish ? "terminado" : "")+"'>" + (data.nombre_ejercicio) + "</div>" +
                        "<span class = 'date'>"+(data.fecha_inicio)+ " - " + MaysPrimera(data.tipo.toLowerCase()) +"</span></td>" +
                       // "<td width='10%'><center><img src = 'img/trash.png' border = '0' id = 'del_"+(data.id)+"'/></center></td>" +
                        "<td width='10%'><center><img src = 'img/mail2.png' border = '0' id = '"+(data.id_ejercicio)+"'/></center></td>" +
                    "</tr>";
        }
        else
        {
            

            $("#" + data.id_ejercicio).click(function(event) {
                var ind = this.id;
                accionTodo(ind, 1);
            });
        }
    };

    //Para listar los trabajos...
    var muestraTodos = function (tipo, index)
    {
        $("#titulo").html($nomUsuario + " ("+(todos.length <= 9 ? "0" + todos.length : todos.length)+")");
        //Para mostrar todos los elementos...
        var $txt = "";
        if(tipo === 1)
        {
            $txt = "<table width='100%' border='0' cellspacing='0' cellpadding='0' id = 'tableTodo'>";
            for(var veces = 1; veces <= 2; veces++)
            {
                for(var i = todos.length - 1; i >= 0; i--)
                {
                    if(veces === 1)
                    {
                        $txt += contenidoTabla(todos[i], 1);
                    }
                    else
                    {
                        contenidoTabla(todos[i], 2);
                    }
                }
                if(veces === 1)
                {
                    $txt += "</table>";
                    $("#todos").html($txt);
                }
            }
        }
        else
        {
            $('#tableTodo').prepend(contenidoTabla(todos[index], 1));
            $("#td_" + todos[index].id).hide().fadeIn('fast');
            contenidoTabla(todos[index], 2);
        }
    };

    var accionTodo = function(ind, type)
    {

       // console.log(ind)

        var posInd = buscarIndice(ind);
        if(posInd >= 0)
        {
            if ( type === 1) 
            {

                /*
                swal
                    ({   
                        title   : "!Bien! :)",   
                        text    : "Se va a iniciar el ejercicio.",   
                        timer   : 2000,
                        type    : "success",  
                        showConfirmButton: false 
                    });
        
                var delay = 2000;
                setTimeout(function(){  window.location = "/enviarIdEjercicio/"+ind;  }, delay); 
                */ 

                window.location = "/enviarIdEjercicio/"+ind;
            }
        }
    };

    var buscarIndice = function(id)
    {
        var ind = -1;
        for(var i = 0; i < todos.length; i++)
        {
            if(todos[i].id_ejercicio === id)
            {
                ind = i;
                break;
            }
        }
        return ind;
    };

   

    $("#todos").height($(window).height() - 125);
    $(window).resize(function(event) {
        $("#todos").height($(window).height() - 125);
    });
});
