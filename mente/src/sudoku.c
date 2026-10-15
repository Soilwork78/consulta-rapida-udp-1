/*
 * Generador de Sudoku con solución única.
 * C sin biblioteca estándar, compilado a WebAssembly (ver tools/build.py).
 *
 *   int sudoku_generar(unsigned semilla, int pistas)
 *       Llena PUZZLE (0 = casilla vacía) y SOLUCION. Devuelve las pistas que quedaron.
 *   unsigned char *sudoku_puzzle(void), *sudoku_solucion(void)
 *       Punteros a los dos tableros de 81 casillas en la memoria compartida.
 */

typedef unsigned int u32;

static unsigned char PUZZLE[81];
static unsigned char SOLUCION[81];
static unsigned char TAB[81];
static u32 estado = 1;

static u32 azar(void) {            /* xorshift32 */
    u32 x = estado;
    x ^= x << 13; x ^= x >> 17; x ^= x << 5;
    return estado = x;
}

static int caja(int i) { return (i / 27) * 3 + (i % 9) / 3; }

/* Máscara de dígitos ya usados en la fila, columna y caja de la casilla i */
static int usados(const unsigned char *t, int i) {
    int f = i / 9, c = i % 9, b = caja(i), m = 0;
    for (int k = 0; k < 9; k++) {
        m |= 1 << t[f * 9 + k];
        m |= 1 << t[k * 9 + c];
        int bi = (b / 3) * 27 + (b % 3) * 3 + (k / 3) * 9 + (k % 3);
        m |= 1 << t[bi];
    }
    return m >> 1;                 /* bit 0 = dígito 1 */
}

static int bits(int m) { int n = 0; while (m) { m &= m - 1; n++; } return n; }

/* Cuenta soluciones hasta 'tope', eligiendo siempre la casilla más restringida */
static int contar(unsigned char *t, int tope) {
    int mejor = -1, mejorLibres = 10, mascara = 0;
    for (int i = 0; i < 81; i++) {
        if (t[i]) continue;
        int libres = ~usados(t, i) & 0x1FF;
        int n = bits(libres);
        if (n == 0) return 0;
        if (n < mejorLibres) { mejor = i; mejorLibres = n; mascara = libres; if (n == 1) break; }
    }
    if (mejor < 0) return 1;
    int total = 0;
    for (int d = 0; d < 9 && total < tope; d++) {
        if (!(mascara & (1 << d))) continue;
        t[mejor] = (unsigned char)(d + 1);
        total += contar(t, tope - total);
    }
    t[mejor] = 0;
    return total;
}

/* Llena el tablero completo probando los dígitos en orden aleatorio */
static int llenar(unsigned char *t, int i) {
    while (i < 81 && t[i]) i++;
    if (i == 81) return 1;
    int libres = ~usados(t, i) & 0x1FF;
    int orden[9];
    for (int k = 0; k < 9; k++) orden[k] = k;
    for (int k = 8; k > 0; k--) { int j = azar() % (k + 1); int x = orden[k]; orden[k] = orden[j]; orden[j] = x; }
    for (int k = 0; k < 9; k++) {
        int d = orden[k];
        if (!(libres & (1 << d))) continue;
        t[i] = (unsigned char)(d + 1);
        if (llenar(t, i + 1)) return 1;
    }
    t[i] = 0;
    return 0;
}

int sudoku_generar(u32 semilla, int pistas) {
    estado = semilla ? semilla : 0x9E3779B9u;
    for (int i = 0; i < 81; i++) TAB[i] = 0;
    llenar(TAB, 0);
    for (int i = 0; i < 81; i++) { SOLUCION[i] = TAB[i]; PUZZLE[i] = TAB[i]; }

    int orden[81];
    for (int i = 0; i < 81; i++) orden[i] = i;
    for (int k = 80; k > 0; k--) { int j = azar() % (k + 1); int x = orden[k]; orden[k] = orden[j]; orden[j] = x; }

    int quedan = 81;
    for (int k = 0; k < 81 && quedan > pistas; k++) {
        int i = orden[k];
        unsigned char v = PUZZLE[i];
        PUZZLE[i] = 0;
        for (int j = 0; j < 81; j++) TAB[j] = PUZZLE[j];
        if (contar(TAB, 2) != 1) PUZZLE[i] = v;   /* quitarla rompe la unicidad */
        else quedan--;
    }
    return quedan;
}

unsigned char *sudoku_puzzle(void) { return PUZZLE; }
unsigned char *sudoku_solucion(void) { return SOLUCION; }
