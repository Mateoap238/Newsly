import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Noticia, CLASE_CATEGORIA } from '../../core/models/noticia.model';
import { NoticiasService } from '../../core/services/noticias.service';
import { StorageService } from '../../core/services/storage.service';
import { TarjetaNoticia } from '../../shared/tarjeta-noticia/tarjeta-noticia';

@Component({
  selector: 'app-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, TarjetaNoticia],
  templateUrl: './detalle.html',
})
export class Detalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly noticiasService = inject(NoticiasService);
  protected readonly storage = inject(StorageService);

  protected readonly CLASE_CATEGORIA = CLASE_CATEGORIA;
  protected readonly cargando = signal(true);
  protected readonly noticia = signal<Noticia | null>(null);
  protected readonly relacionadas = signal<Noticia[]>([]);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      this.cargando.set(true);
      this.noticiasService.obtenerNoticias().subscribe((todas) => {
        const encontrada = todas.find((n) => n.id === id) ?? null;
        this.noticia.set(encontrada);
        if (encontrada) {
          this.relacionadas.set(
            todas
              .filter((n) => n.id !== encontrada.id && n.categoria === encontrada.categoria && n.estado !== 'borrador')
              .slice(0, 3),
          );
        }
        this.cargando.set(false);
      });
    });
  }

  formatearFecha(fecha: string): string {
    return this.noticiasService.formatearFecha(fecha);
  }

  iniciales(nombre: string): string {
    return this.noticiasService.iniciales(nombre);
  }

  toggleFavorito(): void {
    const n = this.noticia();
    if (n) this.storage.alternarFavorito(n.id);
  }
}
