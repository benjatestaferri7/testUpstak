eventListener();
//lista de proyectos
var listaProyectos = document.querySelector('ul#proyectos');

function eventListener() {
    //Document ready jq
    document.addEventListener('DOMContentLoaded', function(){
        actualizarProgreso();
    });
    //btn para crear el proyecto
    document.querySelector('.crear-proyecto a').addEventListener('click', nuevoProyecto);

    //btn para una nueva tarea
    document.querySelector('.nueva-tarea').addEventListener('click',agregarTarea);

    //btns para las acciones de las tareas
    document.querySelector('.listado-pendientes').addEventListener('click', accionesTareas);
    
}

function nuevoProyecto(e) {
    e.preventDefault();

    //crea un imput para el name del nuevo proyecto
    var nuevoProyecto = document.createElement('li');
    nuevoProyecto.innerHTML = '<input type="text" id="nuevo-proyecto">';
    listaProyectos.appendChild(nuevoProyecto);

    //selecciono el id con el nuevoProyecto
    var inputNuevoProyecto = document.querySelector('#nuevo-proyecto');

    //al apretar enter crear el proyecto
    inputNuevoProyecto.addEventListener('keypress', function(e){
        var key = e.which || e.keyCode;
        if(key === 13){
            guardarProyectoDB(inputNuevoProyecto.value);
            listaProyectos.removeChild(nuevoProyecto);
        }
    });
}

function guardarProyectoDB(nombreProyecto){
    //Creo llamado a Ajax
    var xhr = new XMLHttpRequest();

    //Enviar datos por formData
    var datos = new FormData();
    datos.append('proyecto', nombreProyecto);
    datos.append('accion', 'crear');

    //Abro la conexión
    xhr.open('POST', 'inc/modelos/modelo-proyecto.php', true);

    //En la carga
    xhr.onload = function(){
        if(this.status === 200){
            //obtener los datos de la respuesta
            var respuesta = JSON.parse(xhr.responseText);
            var proyecto = respuesta.nombre_proyecto,
                id_proyecto = respuesta.id_insertado,
                tipo = respuesta.tipo,
                resultado = respuesta.respuesta;

            //comprobar la inserción de dts
            if(resultado === 'correcto'){
                //fue exitoso
                if(tipo === 'crear'){
                    //se creo un nuevo proyecto
                    //inyectar en el HTML
                    var nuevoProyecto = document.createElement('li');
                    nuevoProyecto.innerHTML = `
                        <a href="index.php?id_proyecto=${id_proyecto}" id="proyecto:${id_proyecto}">
                            ${proyecto}
                        </a>
                    `;
                    //agregar al html
                    listaProyectos.appendChild(nuevoProyecto);

                    //enviar alerta
                    swal({
                        title: 'Proyecto Creado',
                        text: 'El proyecto: ' + proyecto + ' se creó correctamente',
                        type: 'success'
                    })
                    .then(resultado=>{
                        //redireccionar a la nueva url
                        if(resultado.value){
                            window.location.href = 'index.php?id_proyecto=' + id_proyecto;

                        }
                    })
                }
                else{
                    //se actualizó o se eliminó
                }
            }
            else{
                //hubo un error
                swal({
                    type: 'error',
                    title: 'Error!',
                    text: 'Hubo un error!'
                })
            }
        }
    }

    //Enviar el Request
    xhr.send(datos);
}

//agregar tarea al proyecto seleccionado 
function agregarTarea(e){
    e.preventDefault();
    var nombreTarea = document.querySelector('.nombre-tarea').value;
    //validar que el campo este escrito
    if(nombreTarea === ''){
        swal({
            title: 'Error',
            text: 'Una tarea no puede ir vacia',
            type: 'error'
        })
    }
    else{
        //la tarea tiene algo, insertar en php

        //creo llamado a Ajax
        var xhr = new XMLHttpRequest();

        //crear formData
        var datos = new FormData();
        datos.append('tarea', nombreTarea);
        datos.append('accion', 'crear');
        datos.append('id_proyecto', document.querySelector('#id_proyecto').value);

        //abro la conexion
        xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);

        //ejecutarlo y resp
        xhr.onload = function(){
            if(this.status === 200){
                //correcto
                var respuesta = JSON.parse(xhr.responseText);
                //asignar valores
                var resultado = respuesta.respuesta,
                    tarea = respuesta.tarea,
                    id_insertado = respuesta.id_insertado,
                    tipo = respuesta.tipo;
                if(resultado === 'correcto'){
                    //se agrego de forma correcta
                    if(tipo === 'crear'){
                        //muestro alerta swal
                        swal({
                            type: 'success',
                            title: 'Tarea Creada',
                            text: 'La tarea: ' + tarea + ' se creó de forma correcta'
                        });

                        //Selecionar el parrafo con la list vacia
                        var parrafoListaVacia = document.querySelectorAll('.lista-vacia');
                        if(parrafoListaVacia.length > 0){
                            document.querySelector('.lista-vacia').remove();
                        }

                        //templates
                        var nuevaTarea = document.createElement('li');

                        //agrego id
                        nuevaTarea.id = 'tarea:' + id_insertado;

                        //agrego la clase tarea
                        nuevaTarea.classList.add('tarea');

                        //haciendo el html
                        nuevaTarea.innerHTML = `
                            <p>${tarea}</p>
                            <div class="acciones">
                                <i class="far fa-check-circle"></i>
                                <i class="fas fa-trash"></i>
                            </div>
                        `;

                        //agregarlo al html
                        var listado = document.querySelector('.listado-pendientes ul');
                        listado.appendChild(nuevaTarea);

                        //limpiar el form
                        document.querySelector('.agregar-tarea').reset();

                        //actualizar el progreso
                        actualizarProgreso();
                    }
                }
                else{
                    //hubo un error
                    swal({
                        type: 'error',
                        title: 'Error!',
                        text: 'Hubo un error'
                    })
                }
            }
        }

        //enviar la query
        xhr.send(datos);


    }
}

//cambiar el estado de las tareas o eliminar
function accionesTareas(e){
    e.preventDefault();
    
    if(e.target.classList.contains('fa-check-circle')) {
        if(e.target.classList.contains('completo')) {
            e.target.classList.remove('completo');
            cambiarEstadoTarea(e.target, 0);
        } 
        else {
            e.target.classList.add('completo');
            cambiarEstadoTarea(e.target, 1);
        }
    }
    if(e.target.classList.contains('fa-trash')){
        Swal.fire({
            title: 'Estas seguro/a?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Si, borrar',
            cancelButtonText: 'Cancelar'
          }).then((result) => {
            if (result.value) {

                var tareaEliminar = e.target.parentElement.parentElement;
                //borrar de la db
                eliminarTareaDB(tareaEliminar);
                //borrar del html
                tareaEliminar.remove();
              Swal.fire(
                'Eliminado!',
                'La tarea fue eliminada.',
                'success'
              )
            }
          })
    }
}

//completa o descompleta una tarea
function cambiarEstadoTarea(tarea, estado) {
    var idTarea = tarea.parentElement.parentElement.id.split(':');
    
    // crear llamado ajax
    var xhr = new XMLHttpRequest();
    
    // informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'actualizar');
    datos.append('estado', estado);
    
    // abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);
    
    // on load
    xhr.onload = function() {
        if(this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            //actualizar progreso
            actualizarProgreso();
        }
    }
    // enviar la petición
    xhr.send(datos);
}

//Elimina las tareas de la db
function eliminarTareaDB(tarea){
    var idTarea = tarea.id.split(':');
    
    // crear llamado ajax
    var xhr = new XMLHttpRequest();
    
    // informacion
    var datos = new FormData();
    datos.append('id', idTarea[1]);
    datos.append('accion', 'eliminar');
    
    // abrir la conexion
    xhr.open('POST', 'inc/modelos/modelo-tareas.php', true);
    
    // on load
    xhr.onload = function() {
        if(this.status === 200) {
            console.log(JSON.parse(xhr.responseText));
            
            //comprobar que hay tareas
            var listaTareasRestantes = document.querySelectorAll('li.tarea');
            if(listaTareasRestantes.length === 0) {
                document.querySelector('.listado-pendientes ul').innerHTML = "<p class='lista-vacia'>No hay tareas en este proyecto</p>";
            }
            //actualizar el progreso
            actualizarProgreso();
        }
    }
    // enviar la petición
    xhr.send(datos);
}

//actualiza el avance del proyecto
function actualizarProgreso(){
    //obtener todas las tareas
    const tareas = document.querySelectorAll('li.tarea');

    //obtener las tareas completadas
    const tareasCompletadas = document.querySelectorAll('i.completo');

    //Determinar el avance
    const avance = Math.round((tareasCompletadas.length / tareas.length) * 100);

    //asignar el avance a la barra
    const porcentaje = document.querySelector('#porcentaje');
    porcentaje.style.width = avance+'%';

    //mostrar una alerta al 100%
    if(avance === 100){
        swal({
            type: 'success',
            title: 'Proyecto Terminado!',
            text: 'Ya no tienes tareas pendientes'
        })
    }
}