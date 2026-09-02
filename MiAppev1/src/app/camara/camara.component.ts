import { Component } from '@angular/core'
import { RadSideDrawer } from 'nativescript-ui-sidedrawer'
import { Application, ImageAsset, ImageSource, Utils, isAndroid } from '@nativescript/core'
import { Toasty, ToastDuration, ToastPosition } from '@triniwiz/nativescript-toasty'
import { isAvailable, requestPermissions, takePicture } from '@nativescript/camera'
import { shareText } from '@nativescript/social-share'

const ASUNTO = 'Foto desde MiAppev1'

@Component({
  selector: 'Camara',
  templateUrl: './camara.component.html',
  styleUrls: ['./camara.component.css'],
})
export class CamaraComponent {
  foto: ImageAsset | null = null

  texto = ''

  ocupado = false

  get hayFoto(): boolean {
    return this.foto !== null
  }

  get hayTexto(): boolean {
    return this.texto.trim() !== ''
  }

  async tomarFoto(): Promise<void> {
    if (this.ocupado) {
      return
    }

    if (!isAvailable()) {
      this.avisar('La camara no esta disponible en este dispositivo')

      return
    }

    this.ocupado = true

    try {
      const permisos = await requestPermissions()

      if (!permisos.Success) {
        this.avisar('Hace falta el permiso de camara para tomar la foto')

        return
      }

      this.foto = await takePicture({
        width: 1024,
        height: 1024,
        keepAspectRatio: true,
        saveToGallery: false,
      })
    } catch (error) {
      
      console.log('Camara: no se completo la captura', error)
    } finally {
      this.ocupado = false
    }
  }

  async compartirImagen(): Promise<void> {
    if (this.ocupado || !this.foto) {
      return
    }

    this.ocupado = true

    try {
      const imagen = await ImageSource.fromAsset(this.foto)

      if (!imagen) {
        this.avisar('No se pudo preparar la imagen')

        return
      }

      if (!isAndroid) {
        this.avisar('Compartir imagen solo esta implementado en Android')

        return
      }

      this.enviarImagen(imagen, this.texto.trim())
    } catch (error) {
      console.log('Camara: fallo al compartir la imagen', error)
      this.avisar('No se pudo compartir la imagen')
    } finally {
      this.ocupado = false
    }
  }

  compartirTexto(): void {
    if (this.ocupado || !this.hayTexto) {
      return
    }

    try {
      shareText(this.texto.trim(), ASUNTO)
    } catch (error) {
      console.log('Camara: fallo al compartir el texto', error)
      this.avisar('No se pudo compartir el texto')
    }
  }


  private enviarImagen(imagen: ImageSource, caption: string): void {
    const contexto = Utils.android.getApplicationContext()

    const archivo = new java.io.File(
      contexto.getExternalFilesDir(null),
      `compartir-${Date.now()}.jpg`
    )

    const salida = new java.io.FileOutputStream(archivo)

    try {
      imagen.android.compress(android.graphics.Bitmap.CompressFormat.JPEG, 100, salida)
      salida.flush()
    } finally {
      salida.close()
    }

    const uri = androidx.core.content.FileProvider.getUriForFile(
      contexto,
      `${contexto.getPackageName()}.provider`,
      archivo
    )

    const intent = new android.content.Intent(android.content.Intent.ACTION_SEND)

    intent.setType('image/jpeg')
    intent.putExtra(android.content.Intent.EXTRA_STREAM, uri)
    intent.putExtra(android.content.Intent.EXTRA_SUBJECT, ASUNTO)

    if (caption) {
      intent.putExtra(android.content.Intent.EXTRA_TEXT, caption)
    }

    intent.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)


    intent.setClipData(
      android.content.ClipData.newUri(contexto.getContentResolver(), 'imagen', uri)
    )

    const chooser = android.content.Intent.createChooser(intent, ASUNTO)

    
    chooser.addFlags(android.content.Intent.FLAG_GRANT_READ_URI_PERMISSION)
    chooser.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)

    contexto.startActivity(chooser)
  }

  descartarFoto(): void {
    this.foto = null
  }

  onDrawerButtonTap(): void {
    const sideDrawer = <RadSideDrawer>Application.getRootView()
    sideDrawer.showDrawer()
  }

  private avisar(texto: string): void {
    new Toasty({
      text: texto,
      duration: ToastDuration.SHORT,
      position: ToastPosition.BOTTOM,
    }).show()
  }
}
