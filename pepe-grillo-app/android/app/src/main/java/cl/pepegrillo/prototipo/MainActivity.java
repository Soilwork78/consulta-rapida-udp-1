package cl.pepegrillo.prototipo;

import android.os.Bundle;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Pepe escucha solo con la app en primer plano: la pantalla no se apaga
        // mientras está abierta. Escuchar con la pantalla apagada requiere un
        // servicio en segundo plano (fuera del alcance de este prototipo).
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
