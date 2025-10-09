# Formulario de contrato de compraventa de vehículos

Este repositorio contiene un formulario web multipaso para formalizar contratos de compraventa de vehículos en España. La interfaz incluye barra de progreso, validaciones en vivo y un resumen imprimible del acuerdo.

## Cómo ejecutar la demo

1. Sitúate en la carpeta del proyecto.
2. Abre `index.html` en tu navegador o levanta un servidor estático:
   ```bash
   python -m http.server 8000
   ```
3. Visita `http://localhost:8000` para interactuar con el formulario.

## Validaciones incluidas

- DNI/NIE con formato estándar.
- Matrícula española (formato `0000 XXX`).
- Teléfono nacional de 9 dígitos.
- Correo electrónico con estructura válida.

## Nota sobre la alerta de GitHub

Si GitHub muestra el aviso amarillo **"Some comments aren't visible on the classic Files Changed page"**, significa que hay comentarios de revisión asociados a líneas que ya no aparecen en la vista clásica del diff (por ejemplo, porque el archivo es grande o la conversación se dejó en otra iteración). Para verlos:

1. Pulsa en el botón **"Show comments"** o cambia a la vista **"Conversation"** de la pull request.
2. Revisa y resuelve cada comentario desde allí.
3. Una vez resueltos, la alerta desaparecerá.

Esta alerta no afecta al código ni a la ejecución del proyecto; solo indica que quedan comentarios pendientes por revisar.
