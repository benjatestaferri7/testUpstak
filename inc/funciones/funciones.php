<?php
    //obtiene la pagina actual que se ejecuta
    function obtenerPaginaActual() {
        $archivo = basename($_SERVER['PHP_SELF']);
        $pagina = str_replace(".php", "", $archivo);
        return $pagina;
    }

    //Consultas

    //Obtenertodos los proyectos
    function obtenerProyectos(){
        include 'conexion.php';
        try {
            return $conn->query('SELECT id, nombre FROM proyecto');
        } catch (Exception $e) {
            echo "Error! : " . $e->getMessage();
            return false;
        }
    }



?>
