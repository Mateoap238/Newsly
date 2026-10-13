import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.html',
})
export class Footer {
  protected correo = '';
  protected mensaje = '';
  protected esError = false;

  suscribir(): void {
    if (!REGEX_EMAIL.test(this.correo.trim())) {
      this.mensaje = 'Ingresa un correo electrónico válido.';
      this.esError = true;
      return;
    }
    this.mensaje = '¡Listo! Te suscribiste al newsletter semanal.';
    this.esError = false;
    this.correo = '';
  }
}
