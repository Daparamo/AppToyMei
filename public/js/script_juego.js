window.onload = function()
{




var id_ejercicio = $('#id_ejercicio').val();



//console.log(id_ejercicio);

 repeticiones = 0;
 tiempo = 0;
 coordenadas = [];
 tipo_ejercicio = "";

 //var posiciones_medico = '[{"x":-21.141573385620944,"y":86.15316791028813,"z":-144.11510261571146},{"x":70.59488144393714,"y":28.121677711246495,"z":149.38335726398827}]';
 // coordenadas = JSON.parse(posiciones_medico);



function traerCoordenadas (id_ejercicio,callback) 
    {
        var data = {};
        data.id_ejercicio = id_ejercicio;

                
        $.ajax(
        {
            url         : "/enviarIdEjercicio/traerCoordenadas",
            type        : "POST",
            data        : JSON.stringify(data),
            dataType    : "json",
            contentType: "application/json; charset=utf-8"
        }).done(function(data)
        {
            callback(data);

            
          

        }).error(function(request, status, error)
        {
            

            sweetAlert("Oops...", request.responseText, "error");
            window.location = "/";
        });

    }


traerCoordenadas(id_ejercicio, function(data)
            {

                
            repeticiones = data.repeticiones;
            tiempo = data.tiempo;
            coordenadas = JSON.parse(data.coordenadas) ;
            tipo_ejercicio = data.tipo;

    camera = 0      

    var renderer, scene;
    var effect, controls;
    var element, container;
    var clock = new THREE.Clock();

    //Esferas del cañón...
    var sphereShape = 0, sphereBody = 0, world = 0;
    balls = [], ballMeshes = [], cubes = [];
    //Para el disparo..
    var dt = 1 / 60; //Velocidad de salida de la bola
    var cont = 0, tiempoDisparo = 50; // Tiempo que se demora en dispara cada bola
    //Para el cañón...
    var ballShape = new CANNON.Sphere(0.8); //Tamaño de la bola que dispara
    var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32); //Crear la geometria de la bola
    var shootDirection = new THREE.Vector3();
    var shootVelo = 50; //Velocidad de disparo
    var projector = new THREE.Projector();
    var material = new THREE.MeshLambertMaterial( { color: 0xdddddd } );

    var divPuntua = document.getElementsByClassName('txt');
    
    
   // var maxCubes = 2; //Cubos en la escena  
    
   var maxCubes = coordenadas.length;
    var numChoca = 0; // Variable para conocer cuantos a destruido



   


    initCannon();
    init();
    animate();
    //Para los sonidos...
    createjs.Sound.registerSound("../sounds/collision8.mp3", "disparo"); //Cargar el sonido de disparo 
    createjs.Sound.registerSound("../sounds/explosion2.mp3", "explosion"); //Cargar el sonido de explosion 

      //Para el cañón...
    function initCannon()
    {
        world = new CANNON.World();
        world.gravity.set(0,0,0);
        var mass = 5, radius = 2;
        sphereShape = new CANNON.Sphere(radius);
        sphereBody = new CANNON.Body({ mass: mass });
        sphereBody.addShape(sphereShape);
        sphereBody.position.set(0,10,0);
        sphereBody.linearDamping = 0.9;
    }

    function init()
    {
        divPuntua[0].innerHTML = divPuntua[1].innerHTML = numChoca + " / " + maxCubes;
        renderer = new THREE.WebGLRenderer();
        element = renderer.domElement;
        container = document.getElementById('example');
        container.appendChild(element);
        //División de pantalla...
        //http://jaanga.github.io/cookbook/cardboard/readme-reader.html
        effect = new THREE.StereoEffect(renderer);
        effect.separation = 0.2;
        scene = new THREE.Scene();
        //Se agrega la camara...
        camera = new THREE.PerspectiveCamera(90, 1, 0.001, 700);
        camera.position.set(0, 10, 0);
        scene.add(camera);
        //Manejo de controls, OrbitControls...
        controls = new THREE.OrbitControls(camera, element);
        controls.rotateUp(Math.PI / 4);
        controls.target.set(
            camera.position.x + 0.1,
            camera.position.y + 0.1,
            camera.position.z
        );
        controls.noZoom = false;
        controls.noPan = false;
        //controls.autoRotate = true;

        var ambient = new THREE.AmbientLight( "0x111111" );
        scene.add( ambient );

        light = new THREE.SpotLight( "red" );
        light.position.set( -300, 30, 200);
        light.target.position.set( 0, 0, 0 );
        light.castShadow = true;
        light.shadowCameraNear = 20;
        light.shadowCameraFar = 50;//camera.far;
        light.shadowCameraFov = 40;
        light.shadowMapBias = 0.1;
        light.shadowMapDarkness = 0.7;
        light.shadowMapWidth = 2 * 512;
        light.shadowMapHeight = 2 * 512;
        scene.add(light);
        function setOrientationControls(e)
        {
            if (e.alpha)
            {
                controls = new THREE.DeviceOrientationControls(camera, true);
                controls.connect();
                controls.update();
                element.addEventListener('click', fullscreen, false);
                window.removeEventListener('deviceorientation', setOrientationControls, true);
            }
        }
        window.addEventListener('deviceorientation', setOrientationControls, true);
        //Para la creación de Cubos...


/*
        // Crear cubos*************

        //1. Elegir una textura
        var texture = new THREE.TextureLoader().load( 'img/crate.gif' );
        var material = new THREE.MeshBasicMaterial( { map: texture } );


        //2. Elegir el tamaño del cubo
        var geometry = new THREE.BoxGeometry(50,50,50); //Tamaño de los cubos (largo,alto,ancho)

        
        //3. Entregarselos al MESH
      
        cubo = new THREE.Mesh( geometry, material );


        //4. Poner coordenadsa donde quiere que salga el cubo.
        cubo.position.set(coordenadas[1].x, coordenadas[1].y, coordenadas[1].z); //Guardar el cubo en la posicion X,Y,Z
   
        //5. Agregarlo a la escena   
        scene.add(cubo); //Agregar el cubo creado a la escena
*/


        var cuboMateriales = [
   new THREE.MeshBasicMaterial({color:0x33FF00}),
   new THREE.MeshBasicMaterial({color:0x00CCFF}),
   new THREE.MeshBasicMaterial({color:0xFF0000}),
   new THREE.MeshBasicMaterial({color:0xFFCC00}),
   new THREE.MeshBasicMaterial({color:0x99FFFF}),
   new THREE.MeshBasicMaterial({color:0xFFFFFF})
];
var cuboMaterial = new THREE.MeshFaceMaterial(cuboMateriales);


        var geometry = new THREE.BoxGeometry(50,50,50);
       
        
        for(var i = 0; i < coordenadas.length ; i++)
        {
           
            
           cubes.push({
                            element : new THREE.Mesh(geometry, cuboMateriales),
                            x       : coordenadas[i].x,
                            y       : coordenadas[i].y,
                            z       : coordenadas[i].z,
                            name    : "cube_" + i,
                            vel     : 0
                        });

            

           
           
         
             cubo = new THREE.Mesh( geometry, material );

             

             cubo.position.set(coordenadas[i].x, coordenadas[i].y, coordenadas[i].z); //Guardar el cubo en la posicion X,Y,Z
   
                
    //       cubes[cubes.length - 1].element.position.set(2, 3);

       //   cubes[cubes.length - 1].element.name = "cube_" + i;

            scene.add(cubo);



        };


























        //***MIRA

        //Adicionar la mira y asociarla a la camara...
        var geometryTest = new THREE.BoxGeometry(1, 1, 0);
        var texture = THREE.ImageUtils.loadTexture('../img/miraWhite.png');
        texture.anisotropy = renderer.getMaxAnisotropy();
        var material = new THREE.MeshBasicMaterial({map: texture, transparent : true});
        personaje = new THREE.Mesh( geometryTest, material);
        camera.add(personaje);
        personaje.position.set(0, 0, -3);





        //CREAR EL ENTORNO DE MONTAÑAS 
        //dawnmountain-
        //place/place-
        //Extensión jpg
        //http://stemkoski.github.io/Three.js/Skybox.html
        var imagePrefix = "../img/dawnmountain-";
        var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
        var imageSuffix = ".png";
        var skyGeometry = new THREE.BoxGeometry( 800, 800, 800 ); //Posicion de la persona en la escena
        var materialArray = [];
        for (i = 0; i < 6; i++)
        {
            materialArray.push( new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
                side: THREE.BackSide
            }));
        }
        var skyMaterial = new THREE.MeshFaceMaterial( materialArray );
        var skyBox = new THREE.Mesh( skyGeometry, skyMaterial );
        scene.add(skyBox);
        //Fin del cielo...
        window.addEventListener('resize', resize, false);
    }



    function resize()
    {
        var width = container.offsetWidth;
        var height = container.offsetHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        effect.setSize(width, height);
    }

    function update(dt)
    {
        resize();
        camera.updateProjectionMatrix();
        controls.update(dt);
    }

    function render(dt)
    {

        effect.render(scene, camera);
    }

    function animate(t)
    {
        requestAnimationFrame(animate);
        cont++;
        if(cont >= tiempoDisparo)
        {
            //createjs.Sound.play("disparo");
            disparar();
            cont = 0;
        }
        for(var i = 0; i < cubes.length; i++)
        {
            cubes[i].angulo += cubes[i].vel;
            var radians = cubes[i].angulo * Math.PI / 270;
            cubes[i].element.position.x = Math.cos(radians) * cubes[i].lejania;
            cubes[i].element.position.z = Math.sin(radians) * cubes[i].lejania;
        }
        var eliminar = [];
        world.step(dt);
        for(i = 0; i < balls.length; i++)
        {
            ballMeshes[i].position.copy(balls[i].position);
            ballMeshes[i].quaternion.copy(balls[i].quaternion);
            if(balls[i].position.x >= 40 || balls[i].position.x <= -40)
            {
                eliminar.push(i);
            }
            else if (balls[i].position.y >= 40 || balls[i].position.y <= -40)
            {
                eliminar.push(i);
            }
            else if (balls[i].position.z >= 40 || balls[i].position.z <= -40)
            {
                eliminar.push(i);
            }
        }

        for(i = 0; i < eliminar.length; i++)
        {
            var selectedObject = scene.getObjectByName(ballMeshes[eliminar[i]].name);
            scene.remove(selectedObject);
            balls.splice(eliminar[i], 1);
            ballMeshes.splice(eliminar[i], 1);
        }
        update(clock.getDelta());
        render(clock.getDelta());
        collision();
    }

    function getShootDir(targetVec)
    {
        var vector = targetVec;
        targetVec.set(0,0,1);
        projector.unprojectVector(vector, camera);
        var ray = new THREE.Ray(sphereBody.position, vector.sub(sphereBody.position).normalize() );
        targetVec.copy(ray.direction);
    }

    var disparar = function()
    {
        //https://github.com/schteppe/cannon.js
        var x = sphereBody.position.x;
        var y = sphereBody.position.y;
        var z = sphereBody.position.z;
        ballBody = new CANNON.Body({ mass: 1 });
        ballBody.addShape(ballShape);
        var ballMesh = new THREE.Mesh( ballGeometry, material );
        ballMesh.name = "bullet_" + ballMesh.id;
        world.addBody(ballBody);
        scene.add(ballMesh);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;
        balls.push(ballBody);
        ballMeshes.push(ballMesh);
        getShootDir(shootDirection);
        ballBody.velocity.set(  shootDirection.x * shootVelo,
                                shootDirection.y * shootVelo,
                                shootDirection.z * shootVelo);

        // Move the ball outside the player sphere
        x += shootDirection.x * (sphereShape.radius*1.02 + ballShape.radius);
        y += shootDirection.y * (sphereShape.radius*1.02 + ballShape.radius);
        z += shootDirection.z * (sphereShape.radius*1.02 + ballShape.radius);
        ballBody.position.set(x,y,z);
        ballMesh.position.set(x,y,z);
    }

    //view-source:https://stemkoski.github.io/Three.js/Collision-Detection.html
    function collision()
    {
        var eliminar = [];
        for(var i = 0; i < cubes.length; i++)
        {
            var originPoint = cubes[i].element.position.clone();
            for (var vertexIndex = 0; vertexIndex < cubes[i].element.geometry.vertices.length; vertexIndex++)
            {
                var localVertex = cubes[i].element.geometry.vertices[vertexIndex].clone();
                var globalVertex = localVertex.applyMatrix4( cubes[i].element.matrix );
                var directionVector = globalVertex.sub( cubes[i].element.position );
                var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
                var collisionResults = ray.intersectObjects( ballMeshes );
                if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() )
                {
                    var selectedObject = collisionResults[0].object.name;
                    //createjs.Sound.play("explosion");
                    numChoca++;
                    divPuntua[0].innerHTML = divPuntua[1].innerHTML = numChoca + " / " + maxCubes;
                    if(numChoca >= maxCubes)
                    {
                        window.location = "https://github.com/Jorger/shoot_the_boxes_cardboard";
                    }
                    eliminar.push(i);
                }
            }
        }
        var indElimina = 0;
        for(i = 0; i < eliminar.length; i++)
        {
            var selectedObject = scene.getObjectByName(cubes[eliminar[i]].name);
            scene.remove(selectedObject);
            cubes.splice(eliminar[i], 1);
        }
    }

    function fullscreen()
    {
        if (container.requestFullscreen)
        {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.msRequestFullscreen)
        {
            document.documentElement.msRequestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen)
        {
            document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen)
        {
            document.documentElement.webkitRequestFullscreen();
        }
    }











            });   















   
};


