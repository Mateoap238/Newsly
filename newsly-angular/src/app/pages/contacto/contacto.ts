import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './contacto.html',
})
export class Contacto {
  protected readonly enviado = signal(false);

  private readonly fb = new FormBuilder();

  protected readonly formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    correo: ['', [Validators.required, Validators.email]],
    asunto: ['', Validators.required],
    mensaje: ['', [Validators.required, Validators.minLength(20)]],
    aceptaPolitica: [false, Validators.requiredTrue],
  });

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.enviado.set(false);
      return;
    }
    this.enviado.set(true);
    this.formulario.reset({ nombre: '', correo: '', asunto: '', mensaje: '', aceptaPolitica: false });
  }

  invalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }
}
