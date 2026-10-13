import { Component, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.html',
})
export class Header {
  protected readonly menuAbierto = signal(false);
  protected texto = '';

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.menuAbierto.update((v) => !v);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  buscar(): void {
    const q = this.texto.trim();
    this.router.navigate(['/noticias'], q ? { queryParams: { q } } : {});
    this.cerrarMenu();
  }
}
