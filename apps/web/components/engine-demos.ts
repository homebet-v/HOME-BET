export const engineDemos = {
  dice: {
    engine: "Dados",
    title: "Salón Esmeralda",
    href: "/juegos/dados",
    summary: "7 Down / 7 Up. Elegí si la suma será menor, mayor o igual a 7.",
    action: "Lanzar dados",
    motion: "Los dados están rodando…",
    rules: "7 Down gana con una suma de 2 a 6 y 7 Up con una suma de 8 a 12. Ambos pagan 2×. Si la suma es 7, solo gana 7 exacto, que paga 5×. Los pagos incluyen la apuesta.",
  },
  plinko: {
    engine: "Plinko",
    title: "Órbita Violeta",
    href: "/juegos/plinko",
    summary: "Soltá una esfera y seguí su descenso hasta una de nueve casillas.",
    action: "Soltar esfera",
    motion: "La esfera está en descenso…",
    rules: "La esfera puede ir a la izquierda o a la derecha en cada fila, con la misma probabilidad. La casilla final multiplica tu jugada por el valor que muestra.",
  },
  mines: {
    engine: "Minas",
    title: "Bóveda de Jade",
    href: "/juegos/minas",
    summary: "Abrí la bóveda, encontrá gemas y elegí cuándo cobrar.",
  },
  cards: {
    engine: "Mayor o menor",
    title: "Cámara Carmesí",
    href: "/juegos/mayor-menor",
    summary: "Leé la próxima carta, encadená aciertos y elegí cuándo cobrar.",
  },
} as const;
