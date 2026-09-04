# cripto/ — RSI + volumen + Oscilador Momentum-Ballenas (BTC)

Herramientas de análisis técnico sobre futuros de BTC en Crypto.com Exchange.
Sin dependencias: `indicadores.js` corre igual en Node y en el navegador.

```
cripto/
├─ indicadores.js       librería (RSI de Wilder, surge de volumen, ATR, escáner, replay, OMB)
├─ analisis.js          corre el escáner, el replay de la semana y el OMB sobre los snapshots
├─ pruebas.js           13 verificaciones (incluida la de ausencia de look-ahead)
├─ replay-btc.html      vista gráfica del replay
└─ datos/               snapshots crudos de la API + serie calculada
```

```bash
node cripto/pruebas.js     # 13/13
node cripto/analisis.js    # informe completo en consola
```

## Qué hace cada pieza

**`rsiWilder(cierres, 14)`** — RSI clásico de Wilder (suavizado 1/n), el mismo que
usan TradingView y la mayoría de las plataformas. El "RSI de Cutler" (medias
simples) da valores distintos; si su sistema usa ese, hay que cambiarlo aquí.

**`surgeVolumen(vols, {lookback:20, base:'mediana'})`** — razón entre el volumen de
la vela y el volumen típico de las 20 velas **previas** (la vela actual no entra en
su propia referencia). `3.0` equivale a "+200%". La base por defecto es la
**mediana**, no la media: una sola vela de capitulación infla la media y esconde
los surges siguientes.

**`escanear(velas, cfg)`** — devuelve las velas donde se cumplen ambas condiciones
a la vez. **`casiSenales`** devuelve las que más cerca estuvieron, que es lo que
sirve cuando el escáner devuelve cero: distingue "el filtro está mal calibrado" de
"el mercado no ofreció el evento".

**`replay(velas, cfg)`** — ejecuta las señales como operaciones largas con reglas
explícitas: confirma al cierre de la vela de señal, entra en la apertura de la
siguiente, stop en el mínimo menos `stopATR × ATR`, objetivo a `rr` veces el
riesgo, cierre por tiempo a `maxVelas`. Si stop y objetivo caen en la misma vela
asume el **stop** — sin datos intra-vela no se puede saber el orden, y el supuesto
contrario le regala rentabilidad al sistema.

**`osciladorMomentumBallenas(velas, opts)`** — ver abajo.

## El oscilador (OMB)

No mezcla las dos señales en un solo número opaco: las mantiene separadas y publica
la diferencia, que es lo accionable.

| serie | rango | qué mide |
|---|---|---|
| `flujo` | −100 … +100 | presión neta del dinero grande, z-score robusto (mediana/MAD) pasado por `tanh` |
| `tendencia` | −100 … +100 | `(cierre − EMA20) / ATR14`, o sea momentum normalizado por volatilidad |
| `omb` | −100 … +100 | promedio de ambas: impulso confirmado |
| `divergencia` | −200 … +200 | `flujo − tendencia`: **el dato** |

Lecturas, con umbral 30:

- `acumulacion_oculta` — tendencia < −30 y flujo > +30. El precio cae y el dinero
  grande compra: absorción.
- `distribucion_oculta` — el espejo. El precio sube y el tamaño vende.
- `impulso_confirmado` / `caida_confirmada` — ambas series del mismo lado.

### Los dos modos, y por qué importa la diferencia

**`modo:'tape'` (el bueno).** Recibe trades reales `{ts, price, qty, side}`. "Ballena"
= trade cuyo nocional supera el percentil 90 de una ventana móvil de 500 trades.
Umbral **relativo** al mercado del momento, no un número fijo en USD que envejece
mal cuando BTC pasa de 60k a 120k.

**`modo:'velas'` (el degradado, el que usa `analisis.js`).** Sin cinta de trades
aproxima la presión con el volumen firmado por la posición del cierre en el rango
(`CLV × volumen`), contando solo las velas de volumen concentrado. **Esto no es
actividad de ballenas: es concentración de volumen.** Lee el mecanismo, no lo opere.

Para tener flujo real hay que **acumular la cinta**: el endpoint público
`get-trades` devuelve como máximo 150 trades, que en BTCUSDPERP son unos 15
segundos de mercado. La única vía seria es suscribirse al WebSocket
`trade.BTCUSDPERP` y persistir. El módulo ya está listo para recibir eso.

## Límites de los datos (leer antes de sacar conclusiones)

1. **50 velas por petición.** El endpoint `get-candlestick` no acepta `count` ni
   rango. Eso da ~8 días en 4 h, ~2 días en 1 h y 50 días en 1 D. Una semana en 1 h
   **no se puede** reconstruir desde este endpoint.
2. **De los 8 futuros de BTC del venue, solo BTCUSDPERP negocia.** Los siete
   contratos con fecha mueven entre 0,01 y 1 BTC por semana, con la mayoría de las
   velas sin un solo trade. Calcular RSI o surge de volumen sobre ellos produce
   números, no información: el "precio" de una vela sin trades es el anterior
   arrastrado, así que el RSI tiende a 100/0 artificialmente y el surge es ruido
   dividido por ruido.
3. **La última vela de cada snapshot estaba en curso** al momento de la captura.
4. **El replay no incluye comisiones, funding ni slippage.**

## Reproducir con datos frescos

Los snapshots de `datos/` se tomaron el 2026-09-04 a las 14:14 UTC. Para
actualizarlos, reemplace el contenido de `velas` con la respuesta de
`public/get-candlestick` (mismo orden: más reciente primero) y vuelva a correr
`analisis.js`. El formato de vela es `[timestamp, open, high, low, close, volume]`.

---

Análisis técnico reproducible, no recomendación de inversión.
