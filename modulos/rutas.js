var bcrypt          = 	require('bcrypt-nodejs'),
    passport 	    = 	require('passport'),
    db   		    = 	require('./database'),
	date 			= 	new Date(),
	fechaActual 	= 	(date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    db.conectaDatabase();

//Crear un token único relacionado al ID de la tarea...
var guid = function()
{
	function s4()
	{
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var index = function(req, res)
{
	if(!req.isAuthenticated())
    {
        res.redirect('/login');
    }
    else
    {
        var user = req.user;
		res.render("index", {
			titulo 	:  	"ToyMei - App",
			usuario	:	user[0].nombre
		});
    }
};

var login = function(req, res)
{
	res.render("login", {
		titulo 	:  	"ToyMei - App"
	});
};


var enviarIdEjercicio = function(req, res)
{
	
	if(req.isAuthenticated())
	{
		console.log(req.params.id);

		res.render("vista_juego", 
		{
			id_ejercicio : req.params.id
		});
	}
	else
	{
		res.status(401).send("Acceso no autorizado");
	}

};



var loginPost = function (req, res, next)
{
	passport.authenticate('local', {
	successRedirect: '/index',
	failureRedirect: '/login'},
	function(err, user, info)
	{
		if(err)
		{
			return res.render('login', {titulo: 'ToyMei - App', error: err.message});
		}
		if(!user)
		{
			return res.render('login', {titulo: 'ToyMei - App', error: info.message, usuario : info.usuario});
		}
		return req.logIn(user, function(err)
		{
			if(err)
			{
				return res.render('login', {titulo: 'ToyMei - App', error: err.message});
			}
			else
			{
				return res.redirect('/');
			}
		});
	})(req, res, next);
};

var logout = function(req, res)
{
	if(req.isAuthenticated())
	{
		req.logout();
    }
	res.redirect('/login');
}




var getAllTask =  function(req, res)
{
	//Traer todos los To-Do's...
	if(req.isAuthenticated())
	{
		//console.log(req.user[0])

		var sql = "select * from ejercicio where id_paciente = '" + req.user[0].id +"'";
		//console.log(sql);
		db.queryMysql(sql, function(err, data){
			if (err) throw err;
			res.json(data);
		});
	}
	else
	{
		res.status(401).send("Acceso no autorizado");
	}
};








var traerCoordenadas =  function(req, res)
{
	
	if(req.isAuthenticated())
	{
		
		var data = req.body;

		var sql = "select tiempo, repeticiones, tipo, coordenadas from ejercicio where id_ejercicio = '" + data.id_ejercicio +"'";
		console.log(sql);
		db.queryMysql(sql, function(err, respuesta){
			if (err) throw err;

			console.log(respuesta)
			res.json
			({
				tiempo : respuesta[0].tiempo,
				repeticiones : respuesta[0].repeticiones,
				tipo 		 : respuesta[0].tipo,
				coordenadas  : respuesta[0].coordenadas
			});
		});
	}
	else
	{
		res.status(401).send("Acceso no autorizado");
	}
};






var notFound404 = function(req, res)
{
	res.status(404).send("Página no encontrada :( en el momento");
};

//Crear o edita un usuario...

//Exportar las rutas...
module.exports.index = index;
module.exports.login = login;
module.exports.loginPost = loginPost;
module.exports.logout = logout;
module.exports.getAllTask = getAllTask;
module.exports.notFound404 = notFound404;
module.exports.enviarIdEjercicio = enviarIdEjercicio;

module.exports.traerCoordenadas = traerCoordenadas;











