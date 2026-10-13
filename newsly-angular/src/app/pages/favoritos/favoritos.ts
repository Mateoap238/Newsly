import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CATEGORIAS, Noticia, CLASE_CATEGORIA } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favoritos.html',
})
export class Favoritos implements OnInit {
  private readonly noticiasService = inject(NoticiasService);
  protected readonly storage = inject(StorageService);

  protected readonly CLASE_CATEGORIA = CLASE_CATEGORIA;
  protected readonly todas = signal<Noticia[]>([]);
  protected categoriaActiva = 'Todas';
  private readonly categoriaActivaSignal = signal('Todas');

  protected readonly favoritas = computed(() => {
    const ids = this.storage.favoritos();
    return this.todas().filter((n) => ids.includes(n.id));
  });

  protected readonly conteo = computed(() => this.noticiasService.contarPorCategoria(this.favoritas()));
  protected readonly categoriasConFavoritos = computed(() => CATEGORIAS.filter((c) => (this.conteo()[c] ?? 0) > 0));

  protected readonly visibles = computed(() => {
    const cat = this.categoriaActivaSignal();
    return cat === 'Todas' ? this.favoritas() : this.favoritas().filter((n) => n.categoria === cat);
  });

  protected readonly minutosTotales = computed(() => this.favoritas().reduce((total, n) => total + (n.tiempoLectura || 0), 0));

  ngOnInit(): void {
    this.noticiasService.obtenerNoticias().subscribe((noticias) => this.todas.set(noticias));
  }

  seleccionarCategoria(categoria: string): void {
    this.categoriaActiva = categoria;
    this.categoriaActivaSignal.set(categoria);
  }

  eliminar(id: number): void {
    this.storage.eliminarFavorito(id);
  }

  limpiarLista(): void {
    const confirmado = window.confirm('¿Seguro que deseas eliminar todas las noticias de tu lista de favoritos? Esta acción no se puede deshacer.');
    if (!confirmado) return;
    this.storage.limpiarFavoritos();
    this.categoriaActiva = 'Todas';
    this.categoriaActivaSignal.set('Todas');
  }

  formatearFecha(fecha: string): string {
    return this.noticiasService.formatearFecha(fecha);
  }
}
