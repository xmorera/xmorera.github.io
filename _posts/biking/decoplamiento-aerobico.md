# ¿Qué es el **desacoplamiento aeróbico** (Pw\:HR o HR-decoupling)?

El **desacoplamiento** aeróbico mide la “deriva cardíaca” durante esfuerzos prolongados. En ciclismo, se calcula comparando la *eficiencia aeróbica* (NP/FC) de la primera mitad de un esfuerzo largo contra la segunda mitad. En la práctica, un esfuerzo constante y submáximo (por ejemplo, una subida larga o rodaje en zona 2-3) debería mostrar líneas casi paralelas de potencia vs. FC. El PW\:HR expresa en porcentaje cuánto se eleva la FC manteniendo la misma potencia (o viceversa), indicando la **desconexión** entre ambas señales a lo largo del tiempo.

Fisiológicamente, este fenómeno ocurre porque en esfuerzos largos disminuye gradualmente el volumen sistólico (por fatiga, calor o deshidratación) y el cuerpo responde elevando el pulso para mantener el gasto cardíaco. Una FC que sube manteniendo wattaje constante significa que el esfuerzo aeróbico está drenando reservas o fatiga muscular. En otras palabras, a igual carga externa el costo cardiovascular (FC) aumenta. El decoupling refleja así la *capacidad de durabilidad aeróbica*: cuanto menor sea, mejor será la adaptación cardiovascular del ciclista.

En TrainingPeaks y WKO5 este indicador aparece como **Pw\:HR** (también Pa\:HR en carrera), y suele obtenerse en esfuerzos >20 minutos en zonas aeróbicas.  Se calcula tomando el *factor de eficiencia* (EF = NP/FC medio) de la mitad inicial y de la mitad final del esfuerzo; por ejemplo:

> **Pw\:HR (%)** ≈ (EF<sub>2da mitad</sub> – EF<sub>1ra mitad</sub>) / EF<sub>1ra mitad</sub> × 100

TrainingPeaks facilita este cálculo automáticamente cuando resaltas una sección sostenida en el gráfico.

## Interpretación de valores: ¿qué significa alto o bajo?

Como regla práctica (inspirada en Joe Friel y entrenadores), un **Pw\:HR menor del 5%** se considera indicativo de buena adaptación aeróbica. Es decir, la FC no se dispara respecto a la potencia y el ciclista mantiene la misma producción de watts con un pulso estable. En cambio, valores por encima del 10–15% se interpretan como **desacople elevado**, señal de fatiga o falta de resistencia aeróbica. En entrenamientos intensos de base y subidas prolongadas, se busca que la deriva cardíaca sea mínima; por ejemplo, FasCat recomienda que un decoupling *“nice and flat, and under 1%”* en esfuerzos largos.

En resumen:

* **Desacople bajo (<5%)**: buen estado aeróbico y estabilidad cardiovascular. El ciclista resiste bien y produce la misma potencia sin subir demasiado el pulso.
* **Desacople medio (5–10%)**: tolerable, muestra algo de fatiga acumulada. Puede ser normal en esfuerzos muy largos o sesiones duras.
* **Desacople alto (>10%)**: déficit de resistencia aeróbica. Indica que al ciclista le cuesta sostener el esfuerzo: la FC se dispara o la potencia cae mucho en la segunda parte.

**Nota:** en ciclistas élite al aire libre la deriva suele ser muy baja (p.ej. 1–2% en carreras de <4h), gracias al fresco ambiente y adaptación. Sin embargo, en entrenos indoor o con calor, el desacople puede subir por factores externos (calor, hidratación, dieta).

## ¿Cuándo y dónde observar el desacoplamiento?

El desacoplamiento es útil **en entrenos largos de baja a moderada intensidad**. Idealmente, busca esfuerzos en *Zona 2-3* (aprox. 55–80% del FTP) donde la potencia se mantenga casi constante por 30–60+ minutos. Ejemplos: rodajes de base largos, secciones extensas de subidas, pruebas de 1h a ritmo constante, sesiones prolongadas en rodillo Wahoo o salidas de fondo. TrainingPeaks recomienda esfuerzos sostenidos (>20 min) en zona de resistencia para que Pw\:HR sea válido.

No es relevante en intervalos cortos ni en esfuerzos explosivos, ya que ahí domina el sistema anaeróbico. Tampoco usarlo en sesiones con cambios frecuentes de intensidad (salidas con muchos sprints, recorrido montañoso con variable). En cambio, es clave monitorizarlo en paseos de 3–5 horas con 2000m+, en tareas de fondo aeróbico y en subidas largas donde buscamos comprobar la estabilidad cardiovascular.

Por ejemplo, durante un rodaje base en Z2, observa al final la diferencia de FC respecto al inicio; o al repetir una subida larga, compara la potencia media y el pulso inicial vs. final. Este análisis ayuda a ajustar ritmos: si el desacoplamiento es >5% en un intento, quizá ibas demasiado fuerte y deberías bajar un poco para mantener el esfuerzo aeróbico.

## Selección de sesiones relevantes en TrainingPeaks

Para analizar históricamente tu desacoplamiento, primero localiza en **TrainingPeaks** los entrenos de largo aliento:

* Ve al *Calendario* o a la lista de workouts. Filtra por actividad de ciclismo (Ride) y por duración (ej. >3 h) o por desnivel acumulado. También puedes filtrar por fecha (temporada pasada, meses de base).
* Abre cada entrenamiento largo y comprueba que contenga datos de potencia y pulsaciones.

Una vez abierta la sesión:

1. En el gráfico de Power/HR, resalta con el ratón el bloque estable de tu esfuerzo constante (p.ej. 20–60 min).
2. En el panel de métricas (derecha), aparecerá el valor **pw\:hr** o **EF** para esa sección. (En la app móvil de TP también se muestra).
3. Anota el Pw\:HR resultante (por ejemplo, 4% o 12%). Si no aparece, asegúrate de estar sobre un tramo continuo.

Puedes repetir esto en varias sesiones históricas. Como consejo, guarda esos datos en una hoja de cálculo: fecha, tipo (rodaje, subida, test), potencia objetivo y Pw\:HR. Así podrás ver fácilmente cuáles sesiones tuvieron mayor desacoplamiento y enfocarte en ellas (p.ej. viejos entrenos de mala adaptación).

### Guía paso a paso para extraer datos históricos

1. **Filtros en TP:** En el calendario, selecciona el filtro (icono de embudo) y marca duración >3h y actividad “Ride”. Aplica.
2. **Exportar entrenos:** Para facilidad, descarga los archivos FIT/TCX de esas sesiones (en la vista del entrenamiento, botón de exportar).
3. **Análisis offline:** Importa los archivos en WKO5 (o en un software de análisis como Golden Cheetah).
4. **Reportes WKO5:** En WKO5, ve a la pestaña *Workouts* y agrega las métricas “Efficiency Factor” y “Decoupling” (pw\:hr) a tu vista. Ordena o filtra por el valor de decoupling.
5. **Comparar datos:** Identifica las sesiones con decoupling alto y revisa cómo estaban estructuradas (intensidad, duración, alimentación). Anótalas para diseñar entrenos contrarios.

## Uso de TrainingPeaks, Strava y WKO5

* **TrainingPeaks:** Muestra automáticamente EF (NP/HR) y Pw\:HR en cada entreno con potencia+FC. Úsalo para chequear puntualmente cada sesión: en la vista de *Performance Management* o al abrir el workout. También puedes crear un *Campo Personalizado* o comentario con Pw\:HR para rastrearlo.
* **Strava:** No calcula decoupling. Sin embargo, es útil para **identificar rides largas** (ej. filtra actividades por tiempo/distancia o busca segmentos de subida largos). Una vez localizadas, descarga o sincroniza esas sesiones con TrainingPeaks/WKO para analizarlas. Strava Premium ofrece estimaciones de zonas de frecuencia cardíaca, pero para decoupling necesitarás TP o WKO.
* **WKO5:** Es una herramienta de análisis avanzada (de TrainingPeaks) que permite procesar toda tu base de datos de entrenos. En WKO5 puedes: graficar tendencias de EF y Pw\:HR a lo largo de los meses, compararlas entre tipos de entrenamiento o entre la primera y segunda mitad de un esfuerzo. Por ejemplo, puedes crear un informe que muestre el **Pw\:HR medio de cada mes** o visualizar todos tus entrenos >2h de zona 2 en una gráfica de decoupling. WKO5 también ofrece otras métricas de durabilidad (como “fatigue factor” o cambios en umbrales), lo que complementa el análisis. En resumen, mientras TP calcula decoupling sesión a sesión, WKO5 facilita ver la evolución histórica y comparar grupos de entrenos.

## Ejercicios y sesiones para mejorar el desacoplamiento

1. **Rodajes largos en Zona 2 (base aeróbica):** 3–5 horas continuas al 55–75% FTP, con alimentación e hidratación constantes. Estos ejercicios extensos (muy similares al esfuerzo real en subidas largas) aumentan las mitocondrias y la densidad capilar, y entrenan al corazón para mantener el pulso estable. Ejemplos: 4h en pelotón a ritmo conversacional, o una ruta montañosa moderada sin picos de intensidad. FasCat enfatiza que *“train a lot, or at least do a lot of long rides: long rides will build durability”*.

2. **Intervalos tempo acumulados:** Series prolongadas cerca del umbral aeróbico (≈88–95% FTP) con descansos muy cortos. Por ejemplo, 3×20–30 min al 90%FTP con 5–10’ de recuperación. Este tipo de trabajo genera fatiga acumulada mientras se mantiene alto wattaje, estabilizando la respuesta cardíaca. Un ejemplo real: un ciclista profesional hizo *3 intervalos de 20’ justo en el umbral*, manteniendo el Pw\:HR <5%, lo cual indicó una excelente adaptación. Puedes progresar añadiendo minutos o repeticiones gradualmente.

3. **Sweet-spot con fatiga:** Doble sesión de entrenamiento con umbral medio. Por ejemplo, en el rodillo: 2 rondas de 3×15’ en zona Sweet-Spot (88–94% FTP) con recuperación muy breve, descansando 10’ entre rondas. Otro formato es “Tempo extendido”: 60’ contínuos a \~85% FTP. La clave es simular estrés prolongado sin llegar a sprintar, forzando al cuerpo a carburar grasas y mantener el pulso.

4. **Entrenamientos en subida:** Realiza repeticiones largas en cuestas (o en rodillo con pendiente simulada) al 70–85% FTP. Por ejemplo, 2×30 min subiendo con recuperación suave bajando. Al estar el cuerpo inclinado y forzado, la FC tenderá a subir; entrena a contenerla al nivel objetivo. Otra variante es subir con intensidad constante y luego bajar con ritmo más suave, repitiendo. Esto entrena específicamente la estabilidad cardiovascular en el perfil que quieres mejorar.

5. **Pedaleo de cadencia baja (“fuerza-resistencia”):** Series cortas (5–10’) en subida o rodillo a cadencia muy baja (<60 rpm) al 80–90% FTP. Esto fortalece los músculos estabilizadores y mejora la eficiencia muscular, lo que ayuda a que en esfuerzos largos la potencia no decaiga. Complementa con gimnasio: **sentadillas, peso muerto y prensa** para aumentar la fuerza máxima de piernas, lo que a su vez mejora la economía en esfuerzos aeróbicos.

6. **Control de pulso:** En ciertos entrenos de base, intenta mantener fija la FC (p.ej. en 65% FCmáx) y deja que la potencia fluctúe. Esto “fuerza” a trabajar sistemas débiles de forma segura. Por el contrario, en otros entrenos mantén la potencia fija y observa la FC. Aprender a gestionar ambos enfoques mejora la adaptabilidad metabólica.

7. **Entrenamientos combinados:** Ejercicios tipo “tándem”: comienza con 30–60’ en Zona 2 y sin recupero haces un intervalo de 10–20’ en Zona 3. Esto entrena al cuerpo a subir la intensidad bajo fatiga. Por ejemplo, tras 2h suaves, realiza 3×10’ al 95% FTP. Al acabar, revisa el Pw\:HR del bloque final; con el tiempo, debería reducirse.

Cada una de estas sesiones debe programarse de forma progresiva. Cuida la nutrición e hidratación (la deshidratación aumenta el pulso) y deja días de recuperación. En resumen: combina **rodajes básicos largos** con **intervalos amplios de umbral/tempo** y subidas específicas, siempre procurando que la FC no se dispare demasiado. Con el tiempo, tu cuerpo aprenderá a mantener la potencia con menor pulso.

## Registrar el progreso y reducir el desacoplamiento

* **Pruebas periódicas:** Realiza tests de deriva cada 4–6 semanas. Un test clásico es rodar 60’ a intensidad constante (ritmo de charla) y medir el aumento de FC en la segunda mitad. Otra opción es el protocolo de FasCat: *“Ride 1000 kJ, then do a 5-min max effort”* antes y después; si la potencia final cae >3–5%, hay margen de mejora en durabilidad.

* **Seguimiento en TrainingPeaks:** Agrega comentarios o campos personalizados con el valor de Pw\:HR (o EF) de tus sesiones clave. Usa los Reportes de TP: por ejemplo, genera un *Historial de métricas* mensual de EF o crea una tabla de sesiones larga vs decoupling. Observa la tendencia: idealmente, con meses de entrenamiento, tu Pw\:HR debería disminuir (o incluso ser negativo si la segunda mitad sales con mayor eficiencia). Un indicador indirecto es el **EF**: TrainingPeaks señala que un aumento en el EF significa que produces más vatios al mismo pulso.

* **WKO5 y otras herramientas:** En WKO5 puedes graficar el **EF** o el **Decoupling (%)** a lo largo del tiempo. Por ejemplo, abre la vista de *Diagnóstico* y selecciona EF mensual. Si ves que el EF sube y el Pw\:HR baja (tendencia decreciente), vas por buen camino. También revisa métricas relacionadas (FTP bajo fatiga, desplazamiento de umbrales, etc.).

* **Ajuste de entrenamiento:** Si tras algunas semanas no mejora el desacoplamiento, revisa estos puntos: ¿estás descansando suficiente? ¿Comes/hidratas adecuadamente en entrenos largos? ¿Tus zonas de esfuerzo están bien calibradas (un FTP erróneo puede hacerte entrenar más duro de lo necesario)? Chema Arguedas recomienda, si el pulso se dispara antes de tiempo, enfocar las primeras semanas de base **en FC** (entrenando con zona de pulsaciones y sin excederlas) hasta relajar la respuesta cardíaca. Luego gradualmente incorpora más trabajo por potencia.

En definitiva, el **progreso se mide como una menor deriva cardíaca** en esfuerzos similares. Con entrenamiento consistente, buena alimentación y recuperación, verás cómo en tus subidas largas el pulso se mantiene más estable: ¡eso significa mayor durabilidad! Recuerda revisar siempre tus datos con criterio y en contexto (evitando analizar sesiones condicionadas por enfermedad o calor extremo).

**Referencias:** El desacoplamiento aeróbico ha sido tratado por fuentes de entrenamiento como TrainingPeaks y entusiastas del ciclismo, y está relacionado con conceptos científicos de *“durabilidad”* en ejercicio prolongado. En la práctica, entrenamientos extensos en base aeróbica y tests de deriva de FC ayudan a optimizar esta métrica.
