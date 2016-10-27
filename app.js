"use strict";
var express 		= 	require("express"),
	app				= 	express(),
	cons 			=	require("consolidate"),
	puerto 			= 	process.env.PORT || 8000,
	bodyParser 		= 	require('body-parser'),
	passport 		= 	require('passport'),
	LocalStrategy 	= 	require('passport-local').Strategy,
	cookieParser 	= 	require('cookie-parser'),
	session 		= 	require('express-session'),
	bcrypt 			= 	require('bcrypt-nodejs'),
	db   			= 	require('./modulos/database'),
	rutas			=	require('./modulos/rutas'),
	mailer 			= 	require('express-mailer'),
	fs 				= 	require('fs');

	//console.log(config.mail.user);
	//Realizar la conexión a la base de datos Mysql.....
		//Realizar la conexión a la base de datos Mysql.....
	db.conectaDatabase();
	//Para el manejo de autenticación...
	passport.use(new LocalStrategy(function(username, password, done)
	{
		var sql = "select password, correo from pacientes WHERE correo = '" + (username) + "'";
		db.queryMysql(sql, function(err, response)
		{
			if (err || response.length === 0 || !bcrypt.compareSync(password, response[0].password))
			{
				return done(null, false, {message: 'Usuario o contraseña no válido', usuario : username});
			}
			return done(null, response);
		});
	}));

	passport.serializeUser(function(user, done)
	{

		//console.log(user[0]);

	    done(null, user[0].correo);
	});

	passport.deserializeUser(function(username, done)
	{
		var sql = "select id, nombre from pacientes WHERE correo = '" + (username) + "'";
		//console.log(sql)

		db.queryMysql(sql, function(err, response)
		{
			if(response)
			{
				done(null, response);
			}
		});
	});


	//consolidate integra swig con express...
	app.engine("html", cons.swig); //Template engine...
	app.set("view engine", "jade");
	app.set("views", __dirname + "/vistas");
	app.use(express.static('public'));
	//Para indicar que se envía y recibe información por medio de Json...
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({extended: true}));
	//Para el manejo de las Cookies...
	app.use(cookieParser());
	app.use(session({
						secret: '$2a$10$GsvafBLCODG.gUNlB987fORJjTiwjiKs42MjAIqTMB3lour44n39K',
						cookie: { maxAge: 600000 },
						resave: true,
						saveUninitialized: true
					}));
	//app.use(session({secret: '$2a$10$GsvafBLCODG.gUNlB987fORJjTiwjiKs42MjAIqTMB3lour44n39K'}));
	app.use(passport.initialize());
	app.use(passport.session());



	//Rutas/Servicios REST
	app.get("/", rutas.index);
	//Mostrar la página de autenticación...
	app.get("/login", rutas.login);
	//Para realizar el proceso de autenticación...
	app.post('/login', rutas.loginPost);
	//Para cerrar la sesión..
	app.get("/logout", rutas.logout);
	//Traer todas las tareas...
	app.get('/getAllTask', rutas.getAllTask);






	app.get('/enviarIdEjercicio/:id', rutas.enviarIdEjercicio);



 //trae las cordenadas dado el ID del ejercicio
app.post('/enviarIdEjercicio/traerCoordenadas', rutas.traerCoordenadas);



	

	//Para realizar el envío de un email..
	app.post('/mail', function (req, res, next)
	{
		if(req.isAuthenticated())
		{
			var txtMsg = "Cordial saludo, tu amigo " + req.user[0].nombre +
						 ", desea compartir contigo el To-Do " + req.body.todo;
			app.mailer.send('mail',
			{
				to: req.body.email,
				subject: 'To-Do Compartido',
				text: txtMsg
			},
			function (err)
			{
				if (err)
				{
					res.json({status : false});
					return;
		    	}
				res.json({status : true});
			});
		}
		else
		{
			res.status(401).send("Acceso no autorizado");
		}
	});






	//Para cualquier url que no cumpla la condición...
	app.get("*", rutas.notFound404);
	//Iniciar el Servidor...
	var server = app.listen(puerto, function(err) {
	   if(err) throw err;
	   var message = 'Servidor corriendo en @ http://localhost:' + server.address().port;
	   console.log(message);
	});
