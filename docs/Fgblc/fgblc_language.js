export default function fgblc_language(hljs) {
    return {
        contains: [

            // Comentarios estilo C++  // esto es un comentario
            hljs.COMMENT('//', '$'),

            // Keywords @ globales: @New @Config
            {
                className: 'keyword_context',
                begin: /@(New|Config)\b/
            },

            // Keywords # contextos locales: #Normal #Matrix #Generate #Custom
            {
                className: 'keyword_context_local',
                begin: /#(Normal|Matrix|Generate|Custom)\b/
            },

            // Tipos de salida: Vector Matrix
            {
                className: 'type',
                begin: /\b(Vector|Matrix)\b/
            },

            // name = [Nombre del generador]  — primera linea del archivo
            {
                className: 'title',
                begin: /(?<=name\s*=\s*\[)[^\]]+(?=\])/
            },

            // Nombre de feature dentro de [] — primer corchete
            // [RSI], [EMA], [ATR]...
            {
                className: 'dsl_name',
                begin: /(?<=\[)[A-Za-z_][A-Za-z0-9_]*(?=\])/
            },

            // Keys de parametros: Period=  rows=  cols=  idx=  start=
            {
                className: 'dsl_key',
                begin: /[A-Za-z_][A-Za-z0-9_]*(?==)/
            },

            // Valores despues del =: 14, CLOSE, H1, ENUM_...
            {
                className: 'dsl_val',
                begin: /(?<==)[^|)\]\n;,]+/
            },

            // Listas de indices: [1,2,3]  [0,1,5]
            {
                className: 'number',
                begin: /\b\d+(\.\d+)?\b/
            },

            // Punto y coma al final de cols=3;
            {
                className: 'punctuation',
                begin: /;/
            },

            // Separador de parametros |
            {
                className: 'punctuation',
                begin: /\|/
            }
        ]
    };
}